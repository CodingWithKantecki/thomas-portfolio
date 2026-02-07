export async function GET() {
  try {
    const username = 'CodingWithKantecki';
    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: { 'Accept': 'text/html' },
      next: { revalidate: 3600 } // cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`GitHub returned ${res.status}`);
    }

    const html = await res.text();

    // Parse contribution data from the HTML table cells
    const contributions = [];
    const dayRegex = /<td[^>]*data-date="([^"]+)"[^>]*data-level="([^"]+)"[^>]*>/g;
    let match;

    while ((match = dayRegex.exec(html)) !== null) {
      contributions.push({
        date: match[1],
        level: parseInt(match[2])
      });
    }

    // Extract total count from the h2 text
    const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i);
    const total = totalMatch ? totalMatch[1] : '0';

    return Response.json({ contributions, total });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
