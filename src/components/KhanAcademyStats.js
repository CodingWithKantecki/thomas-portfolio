'use client';

import StatsCard, { OutlineIcon, spritePaths, useStats } from './StatsCard';

// 8-bit Khan Academy logo, one character per pixel (colors in LOGO_COLORS, '.' is transparent).
const LOGO = [
  '........kkkk........',
  '......kkggddkk......',
  '....kkggggddddkk....',
  '..kkggggggddddddkk..',
  'kkggggggggddddddddkk',
  'kgggggggggdddddddddk',
  'kgggggggggdddddddddk',
  'kggggggggwwddddddddk',
  'kggwggggwwwwddddwddk',
  'kggwwgggwwwwdddwwddk',
  'kggwwwgggwwdddwwwddk',
  'kgggwwwgggdddwwwdddk',
  'kgggwwwwggddwwwwdddk',
  'kggggwwwwwwwwwwddddk',
  'kgggggwwwwwwwwdddddk',
  'kgggggggwwwwdddddddk',
  'kgggggggggdddddddddk',
  'kkggggggggddddddddkk',
  '..kkggggggddddddkk..',
  '....kkggggddddkk....',
  '......kkggddkk......',
  '........kkkk........',
];

const LOGO_COLORS = {
  k: '#0B5D47',
  g: '#14BF96',
  d: '#10A37F',
  w: '#FFFFFF',
};

const LOGO_PATHS = spritePaths(LOGO, LOGO_COLORS);

// Heroicons v1 outline paths (lightning-bolt, play, badge-check).
const BOLT_PATHS = ['M13 10V3L4 14h7v7l9-11h-7z'];
const PLAY_PATHS = [
  'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
  'M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
];
const BADGE_PATHS = ['M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'];

export default function KhanAcademyStats({ windowWidth = 1200 }) {
  const data = useStats('/api/khan-academy');

  if (!data) {
    return null;
  }

  return (
    <StatsCard
      windowWidth={windowWidth}
      heroColor="#DFF5EE"
      sprite={{ paths: LOGO_PATHS, width: 20, height: 22, label: '8-bit Khan Academy logo' }}
      title="Khan Academy"
      stats={[
        { icon: <OutlineIcon paths={BOLT_PATHS} color="#14BF96" />, value: data.points.toLocaleString(), label: 'energy points' },
        { icon: <OutlineIcon paths={PLAY_PATHS} color="#60A5FA" />, value: data.videos.toLocaleString(), label: 'videos watched' },
        { icon: <OutlineIcon paths={BADGE_PATHS} color="#F97316" />, value: data.badges.toLocaleString(), label: 'badges earned' },
      ]}
    />
  );
}
