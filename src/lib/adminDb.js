import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

// Data for the password-protected /admin page: home maintenance reminders, login sessions and
// failed login attempts, kept in the Neon Postgres database connected through Vercel.

export const SESSION_COOKIE = "admin_session";
export const SESSION_DAYS = 30;

// A 4-digit password is easy to guess, so wrong guesses are capped per visitor and site-wide.
const IP_LIMIT = 5; // wrong guesses per IP address in 15 minutes
const IP_WINDOW_MINUTES = 15;
const GLOBAL_LIMIT = 30; // wrong guesses from everyone together in an hour
const GLOBAL_WINDOW_MINUTES = 60;

// The reminders the page starts with. New ones can be added here; existing rows are never overwritten.
const STARTING_REMINDERS = [
  { id: "fountain", title: "Check fountain", intervalDays: 14 },
  { id: "water-softener", title: "Refill water softener", intervalDays: 28 },
  { id: "dishwasher-filter", title: "Clean dishwasher filter", intervalDays: 30 },
  { id: "garbage-disposal", title: "Clean garbage disposal", intervalDays: 30 },
  { id: "ac-filter", title: "Change AC filter", intervalDays: 60 },
  { id: "ac-drain-line", title: "Flush AC drain line with vinegar", intervalDays: 90 },
  { id: "fridge-coils", title: "Vacuum fridge coils", intervalDays: 180 },
  { id: "dryer-vent", title: "Clean dryer vent duct", intervalDays: 365 },
  { id: "water-heater", title: "Flush water heater", intervalDays: 365 },
  { id: "washer-filter", title: "Clean washing machine filter", intervalDays: 30 },
  { id: "window-ac-filters", title: "Clean window AC filters", intervalDays: 14 },
  { id: "whole-home-filter", title: "Replace whole home water filter", intervalDays: 90 },
  { id: "three-stage-filter", title: "Replace 3-stage water filter cartridges", intervalDays: 180 },
  { id: "garage-door", title: "Lube garage door", intervalDays: 180 },
  { id: "roomba", title: "Deep clean Roomba", intervalDays: 30 },
  { id: "mini-fridge", title: "Clean mini fridge coils and door seal", intervalDays: 180 },
  { id: "fridge-water-filter", title: "Replace fridge water filter", intervalDays: 180 },
  { id: "fan-blades", title: "Clean ceiling fan blades", intervalDays: 90 },
];

let sqlClient = null;
let schemaReady = null;

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

function sql() {
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  }
  return sqlClient;
}

// Creates the tables on first use, so the site needs no separate migration step.
async function ready() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db`CREATE TABLE IF NOT EXISTS admin_reminders (
        id text PRIMARY KEY,
        title text NOT NULL,
        interval_days integer NOT NULL CHECK (interval_days > 0),
        last_done timestamptz NOT NULL DEFAULT now(),
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await db`CREATE TABLE IF NOT EXISTS admin_sessions (
        token_hash text PRIMARY KEY,
        expires_at timestamptz NOT NULL
      )`;
      await db`CREATE TABLE IF NOT EXISTS admin_login_attempts (
        ip text NOT NULL,
        attempted_at timestamptz NOT NULL DEFAULT now()
      )`;
      await db`CREATE INDEX IF NOT EXISTS admin_login_attempts_time ON admin_login_attempts (attempted_at)`;
      for (const r of STARTING_REMINDERS) {
        await db`INSERT INTO admin_reminders (id, title, interval_days)
          VALUES (${r.id}, ${r.title}, ${r.intervalDays})
          ON CONFLICT (id) DO NOTHING`;
      }
    })().catch((error) => {
      schemaReady = null; // try again on the next request
      throw error;
    });
  }
  return schemaReady;
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest();
}

export function passwordMatches(attempt) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }
  // Compare fixed-length digests so the check takes the same time however close the guess is.
  return timingSafeEqual(sha256(attempt), sha256(expected));
}

export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return request.headers.get("x-real-ip") || (forwarded ? forwarded.split(",")[0].trim() : "") || "unknown";
}

// Returns how many minutes this visitor has to wait before guessing again, or 0 when they may try.
export async function loginWaitMinutes(ip) {
  await ready();
  const db = sql();
  const [mine] = await db`SELECT count(*)::int AS n, min(attempted_at) AS oldest
    FROM admin_login_attempts
    WHERE ip = ${ip} AND attempted_at > now() - make_interval(mins => ${IP_WINDOW_MINUTES}::int)`;
  if (mine.n >= IP_LIMIT) {
    const freeAt = new Date(mine.oldest).getTime() + IP_WINDOW_MINUTES * 60000;
    return Math.max(1, Math.ceil((freeAt - Date.now()) / 60000));
  }
  const [all] = await db`SELECT count(*)::int AS n, min(attempted_at) AS oldest
    FROM admin_login_attempts
    WHERE attempted_at > now() - make_interval(mins => ${GLOBAL_WINDOW_MINUTES}::int)`;
  if (all.n >= GLOBAL_LIMIT) {
    const freeAt = new Date(all.oldest).getTime() + GLOBAL_WINDOW_MINUTES * 60000;
    return Math.max(1, Math.ceil((freeAt - Date.now()) / 60000));
  }
  return 0;
}

export async function recordFailedLogin(ip) {
  await ready();
  const db = sql();
  await db`INSERT INTO admin_login_attempts (ip) VALUES (${ip})`;
  await db`DELETE FROM admin_login_attempts WHERE attempted_at < now() - interval '1 day'`;
}

export async function clearFailedLogins(ip) {
  await ready();
  await sql()`DELETE FROM admin_login_attempts WHERE ip = ${ip}`;
}

// Sessions are random tokens. Only their SHA-256 hash is stored, so the database alone can't sign anyone in.
export async function createSession() {
  await ready();
  const db = sql();
  const token = randomBytes(32).toString("base64url");
  await db`INSERT INTO admin_sessions (token_hash, expires_at)
    VALUES (${sha256(token).toString("hex")}, now() + make_interval(days => ${SESSION_DAYS}::int))`;
  await db`DELETE FROM admin_sessions WHERE expires_at < now()`;
  return token;
}

export async function sessionValid(token) {
  if (!token) {
    return false;
  }
  await ready();
  const rows = await sql()`SELECT 1 FROM admin_sessions
    WHERE token_hash = ${sha256(token).toString("hex")} AND expires_at > now()`;
  return rows.length > 0;
}

export async function endSession(token) {
  if (!token) {
    return;
  }
  await ready();
  await sql()`DELETE FROM admin_sessions WHERE token_hash = ${sha256(token).toString("hex")}`;
}

function toReminder(row) {
  return {
    id: row.id,
    title: row.title,
    intervalDays: row.interval_days,
    lastDone: new Date(row.last_done).toISOString(),
  };
}

export async function listReminders() {
  await ready();
  const rows = await sql()`SELECT id, title, interval_days, last_done FROM admin_reminders ORDER BY created_at, id`;
  return rows.map(toReminder);
}

export async function markReminderDone(id) {
  await ready();
  const rows = await sql()`UPDATE admin_reminders SET last_done = now() WHERE id = ${id}
    RETURNING id, title, interval_days, last_done`;
  return rows.length ? toReminder(rows[0]) : null;
}

// The session cookie only goes to the admin API, never to the rest of the site.
export function sessionCookie(token, maxAgeSeconds) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/admin",
    maxAge: maxAgeSeconds,
  };
}
