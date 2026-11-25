const USERNAME = "Kentuckytothe";

// Duolingo has no public API. This is the unofficial endpoint its own site uses,
// so it can change without notice; the card on the page hides itself when it fails.
const ENDPOINT = `https://www.duolingo.com/2017-06-30/users?username=${USERNAME}`;

function pickCourse(user) {
  const courses = Array.isArray(user.courses) ? user.courses : [];
  const course =
    courses.find((item) => item.id === user.currentCourseId) ||
    [...courses].sort((a, b) => (b.xp || 0) - (a.xp || 0))[0];

  if (!course) {
    return null;
  }

  return {
    // "Norwegian (Bokmål)" -> "Norwegian"
    name: String(course.title || "").replace(/\s*\(.*\)\s*$/, ""),
    language: String(course.learningLanguage || ""),
    xp: Number(course.xp) || 0,
  };
}

export async function GET() {
  try {
    const response = await fetch(ENDPOINT, {
      headers: {
        "User-Agent": "thomas-portfolio-duolingo-widget",
        Accept: "application/json",
      },
      // Revalidate hourly so the stats stay fresh without spamming Duolingo.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return Response.json(
        { error: "Unable to fetch Duolingo data." },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const user = payload?.users?.[0];

    if (!user) {
      return Response.json(
        { error: "No Duolingo profile found for this user." },
        { status: 404 }
      );
    }

    return Response.json({
      username: user.username || USERNAME,
      streak: Number(user.streak) || 0,
      totalXp: Number(user.totalXp) || 0,
      course: pickCourse(user),
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "Could not load Duolingo data right now." },
      { status: 500 }
    );
  }
}
