import { NextResponse } from "next/server";
import { SESSION_COOKIE, databaseConfigured, listReminders, sessionValid } from "@/lib/adminDb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Admin isn't set up yet." }, { status: 503 });
  }
  try {
    if (!(await sessionValid(request.cookies.get(SESSION_COOKIE)?.value))) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const reminders = await listReminders();
    return NextResponse.json({ reminders }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin reminders failed", error);
    return NextResponse.json({ error: "Couldn't load reminders." }, { status: 500 });
  }
}
