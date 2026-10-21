const USERNAME = "KentuckyToThe";

// Khan Academy shut down its public API in 2020. Its own site reads profiles from an internal
// GraphQL endpoint that only runs queries it already knows, picked by `hash`. If Khan Academy
// changes this query the hash stops working and the card on the page hides itself; the new hash
// is on the getFullUserProfile request in the browser's Network tab on any Khan Academy profile.
// The profile also has to stay public: a private one reports 0 points and no badges.
const ENDPOINT =
  "https://www.khanacademy.org/api/internal/graphql/getFullUserProfile?hash=4674001&lang=en&app=khanacademy&variables=" +
  encodeURIComponent(JSON.stringify({ username: USERNAME }));

// badgeCounts arrives as a JSON string keyed by badge category: '{"0":9,"1":0,...}'
function countBadges(badgeCounts) {
  try {
    const counts = typeof badgeCounts === "string" ? JSON.parse(badgeCounts) : badgeCounts;
    return Object.values(counts || {}).reduce((sum, count) => sum + (Number(count) || 0), 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const response = await fetch(ENDPOINT, {
      headers: {
        "User-Agent": "thomas-portfolio-khan-academy-widget",
        Accept: "application/json",
      },
      // Revalidate hourly so the stats stay fresh without spamming Khan Academy.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return Response.json(
        { error: "Unable to fetch Khan Academy data." },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const user = payload?.data?.user;

    if (!user) {
      return Response.json(
        { error: "No Khan Academy profile found for this user." },
        { status: 404 }
      );
    }

    // A private profile still answers, just with 0 points and no badge counts. Hide the card
    // instead of showing zeros.
    if (!user.points && user.badgeCounts == null) {
      return Response.json(
        { error: "This Khan Academy profile is private." },
        { status: 403 }
      );
    }

    return Response.json({
      username: user.username || USERNAME,
      points: Number(user.points) || 0,
      videos: Number(user.countVideosCompleted) || 0,
      badges: countBadges(user.badgeCounts),
      joined: user.joined || null,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "Could not load Khan Academy data right now." },
      { status: 500 }
    );
  }
}
