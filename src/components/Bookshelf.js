'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Books read, in shelf order. Covers are Open Library scans saved in public/books; `color` is the
// cover's binding-side color, used for the back cover's edge.
const BOOKS = [
  { title: 'Diary of a Wimpy Kid', author: 'Jeff Kinney', cover: '/books/diary-of-a-wimpy-kid.jpg', color: '#A32526' },
  { title: 'Rodrick Rules', author: 'Jeff Kinney', cover: '/books/rodrick-rules.jpg', color: '#2F467F' },
  { title: 'The Last Straw', author: 'Jeff Kinney', cover: '/books/the-last-straw.jpg', color: '#4B7D31' },
  { title: 'Dog Days', author: 'Jeff Kinney', cover: '/books/dog-days.jpg', color: '#EEC727' },
  { title: 'The Ugly Truth', author: 'Jeff Kinney', cover: '/books/the-ugly-truth.jpg', color: '#5E2B66' },
  { title: 'Hatchet', author: 'Gary Paulsen', cover: '/books/hatchet.jpg', color: '#81914D' },
  { title: 'Holes', author: 'Louis Sachar', cover: '/books/holes.jpg', color: '#051A8F' },
];

// Pixel wood: the shelf's top surface, its front edge highlight, front face, underside and brackets.
const WOOD = { top: '#B87A42', edge: '#E0A465', face: '#9A5B2C', under: '#6B3B17', bracket: '#4A2810' };

// Page edges: the top of the page block is lit, its side is in shade.
const PAGES = { top: '#F4ECD6', topLine: '#D9CBA6', side: '#DCCFAE', sideLine: '#B9A983' };

// How far a book rises off the shelf while it is hovered, focused or tapped.
const LIFT = 8;

export default function Bookshelf({ windowWidth = 1200 }) {
  const [active, setActive] = useState(null);
  const [tip, setTip] = useState(null);
  const [shelfWidth, setShelfWidth] = useState(null);
  const bookRefs = useRef([]);
  const shelfRef = useRef(null);
  const tipRef = useRef(null);

  const small = windowWidth <= 768;
  // Each book is a block: the cover, with its page block receding up and to the right by `depth`.
  const depth = small ? 10 : 16;
  const gap = depth + (small ? 8 : 12);
  // Covers are sized so a row of books spans the full content width.
  const room = (shelfWidth ?? (small ? 320 : 1150)) - depth;
  const perRow = Math.max(1, Math.min(BOOKS.length, Math.floor((room + gap) / ((small ? 90 : 130) + gap))));
  const coverWidth = Math.min(small ? 140 : 240, Math.floor((room - gap * (perRow - 1)) / perRow));
  const coverHeight = Math.round(coverWidth * 1.5);
  const headroom = depth + LIFT + 8;
  const plank = small ? 12 : 16;
  const brackets = small ? 10 : 12;
  const plankTop = headroom + coverHeight;
  const plankBottom = plankTop + plank;
  const row = plankBottom + brackets;

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setShelfWidth(entry.contentRect.width));
    observer.observe(shelfRef.current);
    return () => observer.disconnect();
  }, []);

  // Center the tooltip over the raised book without letting it hang past the shelf's ends.
  useLayoutEffect(() => {
    if (active === null) {
      return;
    }
    const book = bookRefs.current[active];
    const { offsetWidth: width, offsetHeight: height } = tipRef.current;
    const left = book.offsetLeft + (book.offsetWidth + depth) / 2 - width / 2;
    setTip({
      left: Math.min(Math.max(left, 0), shelfRef.current.clientWidth - width),
      top: book.offsetTop + headroom - LIFT - depth - height - 8
    });
  }, [active, headroom, depth, coverWidth]);

  return (
    <div
      ref={shelfRef}
      style={{
        position: 'relative',
        padding: small ? '0 8px' : '0 24px',
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: `${gap}px`,
        // Each row of books stands on its own plank: the wood bands repeat once per row height. They
        // are a border image pushed out 100vw on both sides, so the planks run to the edges of the
        // window; a border image's outset doesn't make the page scroll sideways.
        borderImage: `repeating-linear-gradient(transparent 0 ${plankTop - depth}px, ${WOOD.top} ${plankTop - depth}px ${plankTop}px, ${WOOD.edge} ${plankTop}px ${plankTop + 2}px, ${WOOD.face} ${plankTop + 2}px ${plankBottom - 4}px, ${WOOD.under} ${plankBottom - 4}px ${plankBottom}px, transparent ${plankBottom}px ${row}px) fill 0 / 0 / 0 100vw`,
        // Under every plank, a bracket near each end of the row of books.
        backgroundImage: [
          `linear-gradient(transparent ${plankBottom}px, ${WOOD.bracket} ${plankBottom}px)`,
          `linear-gradient(transparent ${plankBottom}px, ${WOOD.bracket} ${plankBottom}px)`
        ].join(', '),
        backgroundSize: `16px ${row}px`,
        backgroundPosition: `left ${small ? 16 : 40}px top, right ${small ? 16 : 40}px top`,
        backgroundRepeat: 'repeat-y'
      }}
    >
      {BOOKS.map((book, i) => (
        <button
          key={book.title}
          ref={(el) => { bookRefs.current[i] = el; }}
          type="button"
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(null)}
          onClick={() => setActive(i)}
          style={{
            height: `${row}px`,
            padding: `${headroom}px 0 ${plank + brackets}px`,
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{
            position: 'relative',
            display: 'block',
            transform: active === i ? `translateY(-${LIFT}px)` : 'none'
          }}>
            <img
              src={book.cover}
              alt={`${book.title} by ${book.author}`}
              width={coverWidth}
              height={coverHeight}
              loading="lazy"
              style={{ display: 'block', width: `${coverWidth}px`, height: `${coverHeight}px`, objectFit: 'cover' }}
            />
            {/* Top of the page block, with the back cover's edge along its far side */}
            <span aria-hidden="true" style={{
              position: 'absolute',
              left: 0,
              bottom: '100%',
              width: '100%',
              height: `${depth}px`,
              background: `repeating-linear-gradient(${PAGES.top} 0 3px, ${PAGES.topLine} 3px 4px)`,
              borderTop: `3px solid ${book.color}`,
              transform: 'skewX(-45deg)',
              transformOrigin: '0 100%'
            }} />
            {/* Side of the page block */}
            <span aria-hidden="true" style={{
              position: 'absolute',
              top: 0,
              left: '100%',
              width: `${depth}px`,
              height: '100%',
              background: `repeating-linear-gradient(to right, ${PAGES.side} 0 3px, ${PAGES.sideLine} 3px 4px)`,
              borderRight: `3px solid ${book.color}`,
              transform: 'skewY(-45deg)',
              transformOrigin: '0 0'
            }} />
          </span>
        </button>
      ))}

      {active !== null && (
        <div
          ref={tipRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: tip ? `${tip.left}px` : 0,
            top: tip ? `${tip.top}px` : 0,
            width: 'max-content',
            maxWidth: '100%',
            padding: '8px 12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '3px solid #3B82F6',
            boxShadow: '4px 4px 0px #000',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          <span style={{ display: 'block', color: '#fff', fontSize: small ? '10px' : '12px', lineHeight: 1.5 }}>
            {BOOKS[active].title}
          </span>
          <span style={{ display: 'block', color: '#94a3b8', fontSize: small ? '8px' : '10px', lineHeight: 1.5, marginTop: '4px' }}>
            {BOOKS[active].author}
          </span>
        </div>
      )}
    </div>
  );
}
