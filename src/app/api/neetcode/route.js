const HANDLE = "VengefulHaki546";

// NeetCode has no public API. Its own profile page (neetcode.io/user/<handle>) loads these stats
// with this request, which needs no login, so it can change without notice; the card on the page
// hides itself when it fails.
const ENDPOINT = "https://neetcode.io/api/callableFunctionHttp";

export async function GET() {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "User-Agent": "thomas-portfolio-neetcode-widget",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { functionId: "getProfileByHandle", handle: HANDLE } }),
      // Revalidate hourly so the stats stay fresh without spamming NeetCode.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return Response.json(
        { error: "Unable to fetch NeetCode data." },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const profile = payload?.data;

    if (!profile) {
      return Response.json(
        { error: "No NeetCode profile found for this user." },
        { status: 404 }
      );
    }

    // activityByDate maps "YYYY-MM-DD" to that day's submissions; NeetCode's heatmap adds them up
    // for its "N submissions" line.
    const submissions = Object.values(profile.activityByDate || {}).reduce(
      (sum, count) => sum + (Number(count) || 0),
      0
    );

    return Response.json({
      username: profile.anonUsername || HANDLE,
      solved: Number(profile.ranking?.userSolvedCount) || 0,
      streak: Number(profile.currentStreak) || 0,
      submissions,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "Could not load NeetCode data right now." },
      { status: 500 }
    );
  }
}
