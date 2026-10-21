'use client';

import StatsCard, { OutlineIcon, Sprite, spritePaths, useStats } from './StatsCard';

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

const OWL_PATHS = spritePaths(OWL, OWL_COLORS);
const FLAG_PATHS = spritePaths(NORWAY_FLAG, FLAG_COLORS);

// Heroicons v1 outline paths (fire, lightning-bolt, translate).
const FIRE_PATHS = [
  'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  'M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z',
];
const BOLT_PATHS = ['M13 10V3L4 14h7v7l9-11h-7z'];
const TRANSLATE_PATHS = ['M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129'];

export default function DuolingoStats({ windowWidth = 1200 }) {
  const data = useStats('/api/duolingo');

  if (!data) {
    return null;
  }

  const { course } = data;
  const stats = [
    { icon: <OutlineIcon paths={FIRE_PATHS} color="#FF9600" />, value: data.streak.toLocaleString(), label: 'day streak' },
    { icon: <OutlineIcon paths={BOLT_PATHS} color="#FFC800" />, value: data.totalXp.toLocaleString(), label: 'total XP' },
  ];
  if (course) {
    stats.push({
      icon: course.language === 'no-BO'
        ? <Sprite paths={FLAG_PATHS} width={16} height={12} scale={2} />
        : <OutlineIcon paths={TRANSLATE_PATHS} color="#58CC02" />,
      value: course.xp.toLocaleString(),
      label: `${course.name} XP`
    });
  }

  return (
    <StatsCard
      windowWidth={windowWidth}
      heroColor="#FFC800"
      sprite={{ paths: OWL_PATHS, width: 20, height: 21, label: '8-bit Duolingo owl' }}
      title="Duolingo"
      subtitle={course && { color: '#58CC02', icon: TRANSLATE_PATHS, text: `Learning ${course.name}` }}
      stats={stats}
      link={{
        href: `https://www.duolingo.com/profile/${encodeURIComponent(data.username)}`,
        text: 'View profile on Duolingo'
      }}
    />
  );
}
