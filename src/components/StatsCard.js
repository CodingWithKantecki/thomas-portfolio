'use client';

import { useEffect, useState } from 'react';

// Shared by the Duolingo and Khan Academy cards: a colored panel with a pixel sprite next to the
// project-card title box and a row of stat boxes.

// One path per color, built from horizontal runs (same shape as the footer's pixel heart).
export function spritePaths(rows, colors) {
  const paths = {};
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      let end = x;
      while (end < row.length && row[end] === row[x]) {
        end += 1;
      }
      if (colors[row[x]]) {
        paths[row[x]] = `${paths[row[x]] || ''}M${x} ${y}h${end - x}v1H${x}z`;
      }
      x = end;
    }
  });
  return Object.entries(paths).map(([key, d]) => ({ fill: colors[key], d }));
}

export function OutlineIcon({ paths, color, size = 28 }) {
  return (
    <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      {paths.map((d) => (
        <path key={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
      ))}
    </svg>
  );
}

export function Sprite({ paths, width, height, scale, label }) {
  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ flexShrink: 0, display: 'block' }}
    >
      {paths.map(({ fill, d }) => (
        <path key={fill} fill={fill} d={d} />
      ))}
    </svg>
  );
}

// Loads one of the stats routes. Stays null while loading or if the route fails, so the card
// can hide itself; the routes read unofficial endpoints that can break without notice.
export function useStats(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load ${url}`);
        }

        const payload = await response.json();
        if (active) {
          setData(payload);
        }
      } catch {
        // Leave the card hidden.
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, [url]);

  return data;
}

// `tile` stacks icon, value and label with larger text, for boxes stretched to the card's height.
function Stat({ icon, value, label, tile }) {
  return (
    <div style={{
      flex: '1 1 190px',
      display: 'flex',
      flexDirection: tile ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tile ? '10px' : '12px',
      padding: '12px 14px',
      textAlign: tile ? 'center' : undefined,
      background: 'rgba(15, 23, 42, 0.95)',
      border: '3px solid #3B82F6',
      boxShadow: '4px 4px 0px #000'
    }}>
      <div style={{ width: '32px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <span style={{ display: 'block', color: '#fff', fontSize: tile ? '24px' : '18px', lineHeight: 1.2 }}>
          {value}
        </span>
        <span style={{ display: 'block', color: '#94a3b8', fontSize: tile ? '12px' : '10px', lineHeight: 1.5, marginTop: '8px' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function StatsCard({ windowWidth = 1200, heroColor, sprite, title, stats }) {
  const wide = windowWidth > 1024;

  return (
    <div
      className="hover-card"
      style={{
        marginTop: '32px',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '1120px',
        background: 'rgba(30, 41, 59, 0.9)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: wide ? 'row' : 'column'
      }}
    >
      {/* Sprite panel */}
      <div style={{
        flex: wide ? '0 0 260px' : '0 0 auto',
        width: wide ? '260px' : '100%',
        height: wide ? 'auto' : windowWidth > 768 ? '220px' : '180px',
        minHeight: wide ? '240px' : undefined,
        background: heroColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Sprite {...sprite} scale={wide ? 8 : 6} />
      </div>

      {/* Card content */}
      <div style={{ padding: windowWidth > 768 ? '20px 24px' : '14px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Title box */}
        <div style={{
          alignSelf: 'flex-start',
          background: 'rgba(15, 23, 42, 0.95)',
          padding: '8px 14px',
          fontSize: windowWidth > 768 ? '14px' : '12px',
          fontFamily: "'Press Start 2P', cursive",
          color: '#fff',
          boxShadow: '4px 4px 0px #000',
          border: '3px solid #3B82F6',
          marginBottom: '12px'
        }}>
          {title}
        </div>

        {/* Stat boxes: next to the sprite panel they grow to fill the rest of its height */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flexGrow: 1 }}>
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} tile={wide} />
          ))}
        </div>
      </div>
    </div>
  );
}
