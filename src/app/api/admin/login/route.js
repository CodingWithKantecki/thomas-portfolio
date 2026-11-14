import { NextResponse } from "next/server";
import {
  SESSION_DAYS,
  clearFailedLogins,
  clientIp,
  createSession,
  databaseConfigured,
  loginWaitMinutes,
  passwordMatches,
  recordFailedLogin,
  sessionCookie,
} from "@/lib/adminDb";

export async function POST(request) {
  if (!databaseConfigured() || !process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin isn't set up yet." }, { status: 503 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    const ip = clientIp(request);
    const wait = await loginWaitMinutes(ip);
    if (wait > 0) {
      return NextResponse.json(
        { error: `Too many wrong tries. Try again in ${wait} min.` },
        { status: 429 }
      );
    }
    if (!passwordMatches(password)) {
      await recordFailedLogin(ip);
      return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }

    await clearFailedLogins(ip);
    const token = await createSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie(token, SESSION_DAYS * 24 * 60 * 60));
    return response;
  } catch (error) {
    console.error("admin login failed", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
