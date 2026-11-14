"use client";

import { useCallback, useEffect, useState } from "react";

const PIXEL = "'Press Start 2P', cursive";
const DAY = 24 * 60 * 60 * 1000;

const card = {
  background: "rgba(30, 41, 59, 0.9)",
  border: "6px solid #3B82F6",
  boxShadow: "8px 8px 0 #1E3A8A",
  padding: "20px",
};

// Reminder cards are smaller than the login card so many fit on one screen
const smallCard = {
  background: "rgba(30, 41, 59, 0.9)",
  border: "4px solid #3B82F6",
  boxShadow: "6px 6px 0 #1E3A8A",
  padding: "14px",
};

const titleBox = {
  alignSelf: "flex-start",
  background: "rgba(15, 23, 42, 0.95)",
  border: "3px solid #3B82F6",
  boxShadow: "4px 4px 0 #000",
  padding: "6px 10px",
  fontSize: "11px",
  lineHeight: 1.5,
  color: "#fff",
};

function dueAt(reminder) {
  return new Date(reminder.lastDone).getTime() + reminder.intervalDays * DAY;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function intervalLabel(days) {
  if (days % 7 === 0) {
    return days === 7 ? "Every week" : `Every ${days / 7} weeks`;
  }
  if (days === 365) return "Every year";
  if (days % 30 === 0) return days === 30 ? "Every month" : `Every ${days / 30} months`;
  return days === 1 ? "Every day" : `Every ${days} days`;
}

// Where a reminder stands right now: how full its bar is and what to say about it.
function reminderStatus(reminder, now) {
  const intervalMs = reminder.intervalDays * DAY;
  const elapsed = Math.max(0, now - new Date(reminder.lastDone).getTime());
  const fraction = Math.min(1, elapsed / intervalMs);
  let text;
  let color;
  if (elapsed >= intervalMs) {
    const late = Math.floor((elapsed - intervalMs) / DAY);
    text = late === 0 ? "Due today" : `Overdue by ${plural(late, "day")}`;
    color = "#EF4444";
  } else {
    const left = Math.ceil((intervalMs - elapsed) / DAY);
    text = `Due in ${plural(left, "day")}`;
    color = fraction >= 0.75 ? "#FFC800" : "#37E07E";
  }
  return { fraction, text, color };
}

function ProgressBar({ reminder, now }) {
  const { fraction, color } = reminderStatus(reminder, now);
  // One block per day for short intervals, so each day fills a block.
  const blocks = Math.min(reminder.intervalDays, 30);
  const filled = Math.round(fraction * blocks);
  return (
    <div
      role="progressbar"
      aria-label={`${reminder.title} progress`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fraction * 100)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${blocks}, 1fr)`,
        gap: "2px",
        padding: "3px",
        border: "3px solid #3B82F6",
        background: "#020617",
        height: "22px",
      }}
    >
      {Array.from({ length: blocks }, (_, i) => (
        <span key={i} style={{ background: i < filled ? color : "rgba(59, 130, 246, 0.12)" }} />
      ))}
    </div>
  );
}

function ReminderCard({ reminder, now, onReset, busy }) {
  const { text, color } = reminderStatus(reminder, now);
  const lastDone = new Date(reminder.lastDone).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return (
    <div style={{ ...smallCard, display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={titleBox}>{reminder.title}</div>
      <div style={{ color: "#94a3b8", fontSize: "9px", lineHeight: 1.9 }}>
        <p>{intervalLabel(reminder.intervalDays)}</p>
        <p>Last done {lastDone}</p>
      </div>
      <ProgressBar reminder={reminder} now={now} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ color, fontSize: "10px", lineHeight: 1.6 }}>{text}</span>
        <button type="button" className="admin-btn admin-btn-sm" onClick={() => onReset(reminder.id)} disabled={busy}>
          {busy ? "Saving" : "Reset"}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [view, setView] = useState("loading"); // loading | login | ready | setup | error
  const [reminders, setReminders] = useState([]);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reminders", { cache: "no-store" });
      if (res.status === 401) {
        setView("login");
        return;
      }
      if (res.status === 503) {
        setView("setup");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Couldn't load reminders.");
      }
      setReminders(data.reminders);
      setNow(Date.now());
      setView("ready");
    } catch (error) {
      setMessage(error.message);
      setView("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the bars current while the page stays open.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  async function signIn(event) {
    event.preventDefault();
    setSigningIn(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Couldn't sign in.");
        setPassword("");
        return;
      }
      setPassword("");
      await load();
    } finally {
      setSigningIn(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setReminders([]);
    setMessage("");
    setView("login");
  }

  async function reset(id) {
    setBusyId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reminders/${encodeURIComponent(id)}/reset`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setView("login");
        return;
      }
      if (!res.ok) {
        setMessage(data.error || "Couldn't save that.");
        return;
      }
      setReminders((list) => list.map((r) => (r.id === id ? data.reminder : r)));
      setNow(Date.now());
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main style={{ fontFamily: PIXEL, minHeight: "100vh", padding: "48px 16px 64px", background: "#020617" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <a href="/" className="admin-link">&lt; Back to site</a>
          {view === "ready" && (
            <button type="button" className="admin-link" onClick={signOut}>
              Log out
            </button>
          )}
        </div>

        <h1 style={{ fontSize: "28px", color: "#3B82F6", textShadow: "3px 3px 0 #000", lineHeight: 1.4 }}>Admin</h1>

        {view === "loading" && <p style={{ color: "#94a3b8", fontSize: "12px" }}>Loading...</p>}

        {view === "setup" && (
          <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.8 }}>
            The admin database isn&apos;t connected yet.
          </p>
        )}

        {view === "error" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <p style={{ color: "#EF4444", fontSize: "12px", lineHeight: 1.8 }}>{message}</p>
            <button type="button" className="admin-btn" onClick={() => { setView("loading"); load(); }}>
              Try again
            </button>
          </div>
        )}

        {view === "login" && (
          <form onSubmit={signIn} style={{ ...card, width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <label htmlFor="admin-password" style={{ fontSize: "14px", color: "#fff" }}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
            <p aria-live="polite" style={{ color: "#EF4444", fontSize: "11px", lineHeight: 1.6, minHeight: "18px" }}>
              {message}
            </p>
            <button type="submit" className="admin-btn" disabled={signingIn || !password} style={{ alignSelf: "flex-start" }}>
              {signingIn ? "Checking" : "Enter"}
            </button>
          </form>
        )}

        {view === "ready" && (
          <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontSize: "16px", color: "#fff", paddingBottom: "12px", borderBottom: "4px solid #1E3A8A" }}>
              Home Maintenance
            </h2>
            {message && <p aria-live="polite" style={{ color: "#EF4444", fontSize: "11px" }}>{message}</p>}
            {/* Soonest due first, several to a row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
              {[...reminders]
                .sort((a, b) => dueAt(a) - dueAt(b))
                .map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    now={now}
                    onReset={reset}
                    busy={busyId === reminder.id}
                  />
                ))}
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        .admin-btn {
          font-family: ${PIXEL};
          font-size: 12px;
          color: #fff;
          background: #1e293b;
          border: 4px solid #3b82f6;
          box-shadow: 6px 6px 0 #1e3a8a;
          padding: 12px 18px;
          cursor: pointer;
          transition: transform 0.1s step-end, box-shadow 0.1s step-end;
        }
        .admin-btn:hover:not(:disabled),
        .admin-btn:focus-visible {
          transform: translate(-3px, -3px);
          box-shadow: 9px 9px 0 #1e3a8a;
          border-color: #22d3ee;
          outline: none;
        }
        .admin-btn:active:not(:disabled) {
          transform: translate(3px, 3px);
          box-shadow: 3px 3px 0 #1e3a8a;
        }
        .admin-btn-sm {
          font-size: 10px;
          padding: 8px 12px;
          border-width: 3px;
          box-shadow: 4px 4px 0 #1e3a8a;
        }
        .admin-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .admin-input {
          font-family: ${PIXEL};
          font-size: 16px;
          letter-spacing: 6px;
          color: #fff;
          background: #020617;
          border: 3px solid #3b82f6;
          padding: 12px 14px;
          width: 100%;
          max-width: 240px;
        }
        .admin-input:focus {
          outline: none;
          border-color: #22d3ee;
        }
        .admin-link {
          font-family: ${PIXEL};
          font-size: 11px;
          color: #94a3b8;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
        }
        .admin-link:hover,
        .admin-link:focus-visible {
          color: #22d3ee;
          outline: none;
        }
      `}</style>
    </main>
  );
}
