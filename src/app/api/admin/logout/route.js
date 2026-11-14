import { NextResponse } from "next/server";
import { SESSION_COOKIE, databaseConfigured, endSession, sessionCookie } from "@/lib/adminDb";

export async function POST(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (databaseConfigured()) {
    await endSession(token).catch((error) => console.error("admin logout failed", error));
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie("", 0));
  return response;
}
