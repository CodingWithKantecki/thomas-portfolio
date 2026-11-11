'use client';

import { useEffect, useState } from 'react';

// The NeetCode card and the bookshelf stay hidden behind a countdown until midnight Eastern on
// February 11, 2027, three months after they were locked, and come back on their own after that.
export const UNLOCK_AT = Date.parse('2027-02-11T00:00:00-05:00');

// Milliseconds left until `until`, or 0 once it has passed. Null until the page mounts: the server
// render can't know the visitor's clock, so it and the first browser render show blanks.
export function useCountdown(until) {
  const [left, setLeft] = useState(null);

  useEffect(() => {
    let timer;

    function tick() {
      const ms = Math.max(until - Date.now(), 0);
      setLeft(ms);
      if (ms > 0) {
        // Wake just after the next whole second, so no second is skipped or shown twice.
        timer = setTimeout(tick, (ms % 1000) + 20);
      }
    }

    tick();

    return () => clearTimeout(timer);
  }, [until]);

  return left;
}

// The time left as four stat boxes: days, hours, minutes and seconds.
export function countdownStats(left) {
  const seconds = left === null ? null : Math.ceil(left / 1000);
  const units = [
    ['days', 86400, Infinity],
    ['hours', 3600, 24],
    ['minutes', 60, 60],
    ['seconds', 1, 60],
  ];

  return units.map(([label, size, wrap]) => ({
    label,
    value: seconds === null ? '--' : String(Math.floor(seconds / size) % wrap).padStart(2, '0'),
  }));
}
