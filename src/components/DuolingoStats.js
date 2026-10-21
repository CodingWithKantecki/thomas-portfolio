'use client';

import { useEffect, useState } from 'react';

// 8-bit Duo, one character per pixel (colors in OWL_COLORS, '.' is transparent).
const OWL = [
  '...k............k...',
  '..kgk..........kgk..',
  '..kggkkkkkkkkkkggk..',
  '.kggggggggggggggggk.',
  'kggggggggggggggggggk',
  'kggggwwwggggwwwggggk',
  'kgggwwwwwggwwwwwgggk',
  'kggwwwppwwwwppwwwggk',
  'kggwwpwppwwpwppwwggk',
  'kggwwppppwwppppwwggk',
  'kdggwwppwyywppwwggdk',
  'kddggwwwoooowwwggddk',
  'kddgggglloollggggddk',
  'kddgggllllllllgggddk',
  'kddgggllllllllgggddk',
  'kdggggllllllllggggdk',
  '.kdggggllllllggggdk.',
  '..kggggggggggggggk..',
  '...kkooookkooookk...',
  '....kooookkooook....',
  '.....kkkk..kkkk.....',
];

const OWL_COLORS = {
  k: '#1F3A06',
  g: '#58CC02',
  d: '#43A300',
  l: '#89E219',
  w: '#FFFFFF',
  p: '#2B2B2B',
  y: '#FFC800',
  o: '#FF9600',
};

const NORWAY_FLAG = [
  'rrrrwbbwrrrrrrrr',
  'rrrrwbbwrrrrrrrr',
  'rrrrwbbwrrrrrrrr',
  'rrrrwbbwrrrrrrrr',
  'wwwwwbbwwwwwwwww',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'wwwwwbbwwwwwwwww',
  'rrrrwbbwrrrrrrrr',
  'rrrrwbbwrrrrrrrr',
  'rrrrwbbwrrrrrrrr',
  'rrrrwbbwrrrrrrrr',
];

const FLAG_COLORS = { r: '#BA0C2F', w: '#FFFFFF', b: '#00205B' };

// One path per color, built from horizontal runs (same shape as the footer's pixel heart).
function spritePaths(rows, colors) {
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

const OWL_PATHS = spritePaths(OWL, OWL_COLORS);
const FLAG_PATHS = spritePaths(NORWAY_FLAG, FLAG_COLORS);

// Heroicons v1 outline paths (fire, lightning-bolt, translate).
const FIRE_PATHS = [
  'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  'M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z',
];
const BOLT_PATHS = ['M13 10V3L4 14h7v7l9-11h-7z'];
const TRANSLATE_PATHS = ['M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129'];

function OutlineIcon({ paths, color, size = 28 }) {
  return (
    <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      {paths.map((d) => (
        <path key={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
      ))}
    </svg>
  );
}

function Sprite({ paths, width, height, scale, label }) {
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

export default function DuolingoStats({ windowWidth = 1200 }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch('/api/duolingo');
        if (!response.ok) {
          throw new Error('Failed to load Duolingo stats');
        }

        const payload = await response.json();
        if (active) {
          setData(payload);
        }
      } catch {
        // Leave the card hidden; the Duolingo endpoint is unofficial and can break.
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return null;
  }

  const wide = windowWidth > 1024;
  const { course } = data;

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
      {/* Owl hero */}
      <div style={{
        flex: wide ? '0 0 260px' : '0 0 auto',
        width: wide ? '260px' : '100%',
        height: wide ? 'auto' : windowWidth > 768 ? '220px' : '180px',
        minHeight: wide ? '240px' : undefined,
        background: '#FFC800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Sprite paths={OWL_PATHS} width={20} height={21} scale={wide ? 8 : 6} label="8-bit Duolingo owl" />
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
          Duolingo
        </div>
        {course && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#58CC02',
            fontSize: '10px',
            fontFamily: "'Press Start 2P', cursive",
            marginBottom: '14px'
          }}>
            <OutlineIcon paths={TRANSLATE_PATHS} color="currentColor" size={14} />
            Learning {course.name}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <Stat icon={<OutlineIcon paths={FIRE_PATHS} color="#FF9600" />} value={data.streak.toLocaleString()} label="day streak" />
          <Stat icon={<OutlineIcon paths={BOLT_PATHS} color="#FFC800" />} value={data.totalXp.toLocaleString()} label="total XP" />
          {course && (
            <Stat
              icon={course.language === 'no-BO'
                ? <Sprite paths={FLAG_PATHS} width={16} height={12} scale={2} />
                : <OutlineIcon paths={TRANSLATE_PATHS} color="#58CC02" />}
              value={course.xp.toLocaleString()}
              label={`${course.name} XP`}
            />
          )}
        </div>

        <a
          href={`https://www.duolingo.com/profile/${encodeURIComponent(data.username)}`}
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
          View profile on Duolingo
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
