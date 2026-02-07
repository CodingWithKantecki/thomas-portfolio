'use client';

import { useEffect, useMemo, useState } from 'react';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const CELL_SIZE = 14;
const CELL_GAP = 4;
const DAY_LABEL_WIDTH = 34;
const GRAPH_OFFSET_LEFT = DAY_LABEL_WIDTH + 10;

function parseDateUtc(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateUtc(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTooltipDate(dateString) {
  const date = parseDateUtc(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function getCountLabel(count) {
  return count === 1 ? '1 contribution' : `${count} contributions`;
}

export default function GitHubContributionGraph({ username = 'CodingWithKantecki' }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadContributions() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/github-contributions?username=${encodeURIComponent(username)}`);
        if (!response.ok) {
          throw new Error('Failed to load contributions');
        }

        const payload = await response.json();
        if (active) {
          setData(payload);
        }
      } catch {
        if (active) {
          setError('Unable to load GitHub contributions right now.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadContributions();

    return () => {
      active = false;
    };
  }, [username]);

  const weeks = useMemo(() => {
    if (!data?.days?.length) {
      return [];
    }

    const first = parseDateUtc(data.days[0].date);
    const last = parseDateUtc(data.days[data.days.length - 1].date);
    const firstSunday = new Date(first);
    firstSunday.setUTCDate(firstSunday.getUTCDate() - firstSunday.getUTCDay());

    const byDate = new Map(data.days.map((day) => [day.date, day]));
    const output = [];
    let currentWeek = [];

    for (let cursor = new Date(firstSunday); cursor <= last; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const dateKey = formatDateUtc(cursor);
      const dayData = byDate.get(dateKey) || { date: dateKey, count: 0, level: 0 };
      currentWeek.push(dayData);

      if (currentWeek.length === 7) {
        output.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const tail = parseDateUtc(currentWeek[currentWeek.length - 1].date);
        tail.setUTCDate(tail.getUTCDate() + 1);
        currentWeek.push({
          date: formatDateUtc(tail),
          count: 0,
          level: 0,
          placeholder: true,
        });
      }
      output.push(currentWeek);
    }

    return output;
  }, [data]);

  const monthMarkers = useMemo(() => {
    if (!weeks.length) {
      return [];
    }

    const seenMonths = new Set();
    const markers = [];

    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        const date = parseDateUtc(day.date);
        if (date.getUTCDate() !== 1) {
          return;
        }

        const monthIndex = date.getUTCMonth();
        if (seenMonths.has(monthIndex)) {
          return;
        }

        seenMonths.add(monthIndex);
        markers.push({
          weekIndex,
          label: MONTH_LABELS[monthIndex],
        });
      });
    });

    return markers;
  }, [weeks]);

  return (
    <div
      style={{
        marginTop: '56px',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '1120px',
        border: '1px solid rgba(110, 118, 129, 0.35)',
        borderRadius: '14px',
        background: 'linear-gradient(180deg, rgba(13, 17, 23, 0.96) 0%, rgba(1, 4, 9, 0.94) 100%)',
        padding: '32px',
      }}
    >
      <h3
        style={{
          fontSize: '26px',
          fontWeight: '600',
          color: '#f0f6fc',
          lineHeight: 1.05,
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        {isLoading ? 'Loading contributions...' : `${(data?.total || 0).toLocaleString()} contributions in the last year`}
      </h3>

      {error && (
        <p style={{ color: '#fda4af', fontSize: '14px', marginBottom: '10px' }}>
          {error}
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '940px', width: 'fit-content', margin: '0 auto' }}>
          <div style={{ display: 'flex', marginLeft: `${GRAPH_OFFSET_LEFT}px`, gap: `${CELL_GAP}px`, marginBottom: '10px', height: '20px' }}>
            {weeks.map((_, weekIndex) => {
              const marker = monthMarkers.find((item) => item.weekIndex === weekIndex);
              return (
                <div key={`month-${weekIndex}`} style={{ width: `${CELL_SIZE}px`, position: 'relative' }}>
                  {marker ? (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        color: '#8b949e',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {marker.label}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ width: `${DAY_LABEL_WIDTH}px`, display: 'grid', gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`, gap: `${CELL_GAP}px` }}>
              {DAY_LABELS.map((label, index) => (
                <span
                  key={`day-label-${index}`}
                  style={{
                    color: '#8b949e',
                    fontSize: '13px',
                    lineHeight: `${CELL_SIZE}px`,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: `${CELL_GAP}px` }}>
              {weeks.map((week, weekIndex) => (
                <div
                  key={`week-${weekIndex}`}
                  style={{ display: 'grid', gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`, gap: `${CELL_GAP}px` }}
                >
                  {week.map((day) => {
                    const level = Math.max(0, Math.min(4, Number(day.level) || 0));
                    const tooltip = `${getCountLabel(day.count || 0)} on ${formatTooltipDate(day.date)}`;
                    return (
                      <div
                        key={day.date}
                        title={tooltip}
                        style={{
                          width: `${CELL_SIZE}px`,
                          height: `${CELL_SIZE}px`,
                          borderRadius: '2px',
                          backgroundColor: LEVEL_COLORS[level],
                          border: '1px solid rgba(27, 31, 35, 0.25)',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#8b949e',
            fontSize: '15px',
            textDecoration: 'none',
          }}
        >
          View full activity on GitHub
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b949e', fontSize: '14px' }}>
          <span>Less</span>
          {LEVEL_COLORS.map((color, index) => (
            <span
              key={`legend-${index}`}
              style={{
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                borderRadius: '2px',
                backgroundColor: color,
                border: '1px solid rgba(27, 31, 35, 0.25)',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
