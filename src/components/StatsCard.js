'use client';

import { useEffect, useState } from 'react';

// Shared by the Duolingo and Khan Academy cards: a colored panel with a pixel sprite next to the
// project-card title box, a one-line subtitle, a row of stat boxes and a profile link.

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

function Stat({ icon, value, label }) {
  return (
    <div style={{
      flex: '1 1 190px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '12px 14px',
      background: 'rgba(15, 23, 42, 0.95)',
      border: '3px solid #3B82F6',
      boxShadow: '4px 4px 0px #000'
    }}>
      <div style={{ width: '32px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <span style={{ display: 'block', color: '#fff', fontSize: '18px', lineHeight: 1.2 }}>
          {value}
        </span>
        <span style={{ display: 'block', color: '#94a3b8', fontSize: '10px', lineHeight: 1.5, marginTop: '8px' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function StatsCard({ windowWidth = 1200, heroColor, sprite, title, subtitle, stats, link }) {
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
          marginBottom: '10px'
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: subtitle.color,
            fontSize: '10px',
            fontFamily: "'Press Start 2P', cursive",
            marginBottom: '14px'
          }}>
            <OutlineIcon paths={subtitle.icon} color="currentColor" size={14} />
            {subtitle.text}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>

        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#10B981',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            paddingTop: '10px',
            borderTop: '1px solid rgba(59, 130, 246, 0.1)',
            marginTop: 'auto'
          }}
        >
          {link.text}
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
