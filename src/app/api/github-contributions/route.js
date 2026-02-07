function safeUsername(input) {
  if (!input) {
    return "CodingWithKantecki";
  }

  const value = String(input).trim();
  const valid = /^[A-Za-z0-9-]{1,39}$/.test(value);
  return valid ? value : "CodingWithKantecki";
}

function getAttribute(tag, attributeName) {
  const regex = new RegExp(`${attributeName}="([^"]*)"`);
  const match = tag.match(regex);
  return match ? match[1] : "";
}

function parseTotalContributions(markup) {
  const headingMatch = markup.match(
    /<h2[^>]*id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/i
  );

  if (!headingMatch) {
    return null;
  }

  const text = headingMatch[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const totalMatch = text.match(/([\d,]+)\s+contributions?\s+in the last year/i);

  if (!totalMatch) {
    return null;
  }

  return Number.parseInt(totalMatch[1].replace(/,/g, ""), 10);
}

function parseContributionCount(tooltipText) {
  const clean = tooltipText.replace(/\s+/g, " ").trim();

  if (/^No contributions on /i.test(clean)) {
    return 0;
  }

  const countMatch = clean.match(/^(\d+)\s+contributions?\s+on /i);
  if (!countMatch) {
    return 0;
  }

  return Number.parseInt(countMatch[1], 10);
}

function parseContributionDays(markup) {
  const dayPattern = /<td[^>]*class="ContributionCalendar-day"[^>]*><\/td>/g;
  const matches = markup.match(dayPattern) || [];
  const days = [];
  const dayIndexById = new Map();

  for (const dayCell of matches) {
    const date = getAttribute(dayCell, "data-date");
    const id = getAttribute(dayCell, "id");
    const level = Number.parseInt(getAttribute(dayCell, "data-level"), 10);

    if (!date) {
      continue;
    }

    if (id) {
      dayIndexById.set(id, days.length);
    }

    days.push({
      date,
      count: 0,
      level: Number.isFinite(level) ? level : 0,
    });
  }

  const tooltipPattern = /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
  for (const tooltipMatch of markup.matchAll(tooltipPattern)) {
    const targetId = tooltipMatch[1];
    const tooltipText = tooltipMatch[2];
    const dayIndex = dayIndexById.get(targetId);

    if (dayIndex === undefined) {
      continue;
    }

    days[dayIndex].count = parseContributionCount(tooltipText);
  }

  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = safeUsername(searchParams.get("username"));
  const endpoint = `https://github.com/users/${username}/contributions`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "thomas-portfolio-contrib-widget",
        Accept: "image/svg+xml,text/plain,*/*",
      },
      // Revalidate hourly so the heatmap stays fresh without spamming GitHub.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return Response.json(
        { error: "Unable to fetch GitHub contribution data." },
        { status: 502 }
      );
    }

    const markup = await response.text();
    const days = parseContributionDays(markup);
    const parsedTotal = parseTotalContributions(markup);
    const fallbackTotal = days.reduce((sum, day) => sum + day.count, 0);
    const total = Number.isFinite(parsedTotal) ? parsedTotal : fallbackTotal;

    if (days.length === 0) {
      return Response.json(
        { error: "No contribution data found for this user." },
        { status: 404 }
      );
    }

    return Response.json({
      username,
      total,
      days,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "Could not load contribution data right now." },
      { status: 500 }
    );
  }
}
