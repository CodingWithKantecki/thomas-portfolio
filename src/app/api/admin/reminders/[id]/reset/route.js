import { NextResponse } from "next/server";
import { SESSION_COOKIE, databaseConfigured, markReminderDone, sessionValid } from "@/lib/adminDb";

// Marks a reminder as done right now, which starts its countdown over.
export async function POST(request, { params }) {
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "Admin isn't set up yet." }, { status: 503 });
  }
  try {
    if (!(await sessionValid(request.cookies.get(SESSION_COOKIE)?.value))) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const { id } = await params;
    const reminder = await markReminderDone(id);
    if (!reminder) {
      return NextResponse.json({ error: "No such reminder." }, { status: 404 });
    }
    return NextResponse.json({ reminder });
  } catch (error) {
    console.error("admin reminder reset failed", error);
    return NextResponse.json({ error: "Couldn't save that. Try again." }, { status: 500 });
  }
}
