'use client';

import StatsCard, { OutlineIcon, spritePaths, useStats } from './StatsCard';

// 8-bit NeetCode rocket, one character per pixel (colors in ROCKET_COLORS, '.' is transparent).
const ROCKET = [
  '.......kk.......',
  '......krRk......',
  '.....krrRRk.....',
  '....krrrRRRk....',
  '...krrrrRRRRk...',
  '...kwwwwgggGk...',
  '...kwwwwgggGk...',
  '...kwwkkkkgGk...',
  '...kwkSSsskGk...',
  '...kwkSssskGk...',
  '...kwksssskGk...',
  '..kkwksssskGkk..',
  '.kbkwwkkkkgGkbk.',
  'kbbkwwwwgggGkbbk',
  'kbbkwwwrRggGkbbk',
  'kbbkwwwrRggGkbbk',
  'kBbkwwwrRggGkbBk',
  'kBkkkkkkkkkkkkBk',
  '.k....kRRk....k.',
  '.....RoyyoR.....',
  '.....RoyyoR.....',
  '......RyyR......',
  '......RooR......',
  '.......RR.......',
];

const ROCKET_COLORS = {
  k: '#171314',
  r: '#EC4A43',
  R: '#B8352F',
  w: '#F7F7F5',
  g: '#DCDDDB',
  G: '#B9BCBA',
  s: '#5D8797',
  S: '#A9CBD6',
  b: '#3498E8',
  B: '#21567F',
  y: '#F9BB2D',
  o: '#F36A25',
};

const ROCKET_PATHS = spritePaths(ROCKET, ROCKET_COLORS);

// Heroicons v1 outline paths (check-circle, fire, code).
const CHECK_PATHS = ['M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'];
const FIRE_PATHS = [
  'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  'M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z',
];
const CODE_PATHS = ['M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'];

export default function NeetCodeStats({ windowWidth = 1200 }) {
  const data = useStats('/api/neetcode');

  if (!data) {
    return null;
  }

  return (
    <StatsCard
      windowWidth={windowWidth}
      heroColor="#DBE4FF"
      sprite={{ paths: ROCKET_PATHS, width: 16, height: 24, label: '8-bit NeetCode rocket' }}
      title="NeetCode"
      stats={[
        { icon: <OutlineIcon paths={CHECK_PATHS} color="#22C55E" />, value: data.solved.toLocaleString(), label: data.solved === 1 ? 'problem solved' : 'problems solved' },
        { icon: <OutlineIcon paths={FIRE_PATHS} color="#F97316" />, value: data.streak.toLocaleString(), label: 'day streak' },
        { icon: <OutlineIcon paths={CODE_PATHS} color="#748FFC" />, value: data.submissions.toLocaleString(), label: data.submissions === 1 ? 'submission' : 'submissions' },
      ]}
    />
  );
}
