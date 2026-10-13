'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GitHubContributionGraph from '@/components/GitHubContributionGraph';

export default function Portfolio() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [logoSlideProgress, setLogoSlideProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(768); // Default to mobile breakpoint, will update on mount
  const [mounted, setMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [expandedExp, setExpandedExp] = useState({});
  const [expandedProject, setExpandedProject] = useState({});
  const [closingExp, setClosingExp] = useState({});
  const [closingProject, setClosingProject] = useState({});

  // Handle closing animation for experience dropdowns
  const handleExpToggle = (key) => {
    if (expandedExp[key]) {
      // Start closing animation
      setClosingExp(prev => ({ ...prev, [key]: true }));
      // After animation completes, actually close
      setTimeout(() => {
        setExpandedExp(prev => ({ ...prev, [key]: false }));
        setClosingExp(prev => ({ ...prev, [key]: false }));
      }, 300);
    } else {
      setExpandedExp(prev => ({ ...prev, [key]: true }));
    }
  };

  // Handle closing animation for project dropdowns
  const handleProjectToggle = (key) => {
    if (expandedProject[key]) {
      // Start closing animation
      setClosingProject(prev => ({ ...prev, [key]: true }));
      // After animation completes, actually close
      setTimeout(() => {
        setExpandedProject(prev => ({ ...prev, [key]: false }));
        setClosingProject(prev => ({ ...prev, [key]: false }));
      }, 300);
    } else {
      setExpandedProject(prev => ({ ...prev, [key]: true }));
    }
  };
  const canvasRef = useRef(null); // fixed, site-wide grid
  const ecgRef = useRef(null); // scrolls with the hero, so the outline stays glued to the text
  const nameRef = useRef(null);
  const nameMeasureRef = useRef(null);

  const fullText = "Thomas Kantecki";

  useEffect(() => {
    // Set mounted state and initial width immediately
    setMounted(true);
    setWindowWidth(window.innerWidth);

    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Mouse position tracker with proximity effects
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

    };

    window.addEventListener('mousemove', handleMouseMove);

    // Scroll listener for background effects and section tracking
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(scrollY / windowHeight, 1);
      setScrollProgress(progress);

      // Calculate logo slide progress (starts sliding immediately, gone by experience section)
      const experienceSection = document.getElementById('experience');
      if (experienceSection) {
        const experienceTop = experienceSection.offsetTop;
        const startSlide = 0; // Start sliding immediately
        const endSlide = experienceTop - 100; // Fully gone before experience section

        if (scrollY <= startSlide) {
          setLogoSlideProgress(0);
        } else if (scrollY >= endSlide) {
          setLogoSlideProgress(1);
        } else {
          const slideRange = endSlide - startSlide;
          const slideProgress = scrollY / slideRange;
          setLogoSlideProgress(Math.min(Math.max(slideProgress, 0), 1));
        }
      }

      // Track current section for navigation indicator
      const sections = ['experience', 'projects', 'contact'];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setCurrentSection(sectionId);
            break;
          }
        }
      }

      // Clear section when at top of page
      if (window.scrollY < 100) {
        setCurrentSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Typewriter effect
    let typewriterInterval = null;
    const typewriterTimer = setTimeout(() => {
      let currentIndex = 0;
      typewriterInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setTypedText(fullText.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typewriterInterval);
          // Show subtitle after name is typed
          setTimeout(() => {
            setShowSubtitle(true);
          }, 500);
          // Hide cursor immediately after typing completes
          setShowCursor(false);
          clearInterval(cursorInterval);
        }
      }, 100); // Type speed: 100ms per character
    }, 500); // Small delay before starting typing

    // Cursor blink effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => {
      clearTimeout(typewriterTimer);
      clearInterval(typewriterInterval);
      clearInterval(cursorInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const gridCanvas = canvasRef.current;
    const ecg = ecgRef.current;
    if (!gridCanvas || !ecg) return;

    // Two canvases, both at device resolution so the pixel line stays crisp on retina screens.
    // The fixed one carries the site-wide grid and is painted once. The ECG is drawn on a
    // transparent canvas inside the hero that scrolls with the text, so nothing can lag behind it.
    const gridCtx = gridCanvas.getContext('2d');
    const ctx = ecg.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let viewW = 0;
    let viewH = 0;
    const drawGrid = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      gridCanvas.width = Math.round(w * dpr);
      gridCanvas.height = Math.round(h * dpr);
      gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gridCtx.fillStyle = '#020617';
      gridCtx.fillRect(0, 0, w, h);
      gridCtx.strokeStyle = 'rgba(59, 130, 246, 0.14)';
      gridCtx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 50) {
        gridCtx.beginPath();
        gridCtx.moveTo(i, 0);
        gridCtx.lineTo(i, h);
        gridCtx.stroke();
      }
      for (let i = 0; i < h; i += 50) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, i);
        gridCtx.lineTo(w, i);
        gridCtx.stroke();
      }
    };
    const sizeCanvas = () => {
      viewW = ecg.clientWidth;
      viewH = ecg.clientHeight;
      ecg.width = Math.round(viewW * dpr);
      ecg.height = Math.round(viewH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    drawGrid();
    sizeCanvas();

    let xPos = 0;
    let trailStart = 0; // Start position of the visible line
    // Use constant speed of 320 pixels per second (based on 1920px screen in 6 seconds)
    // This gives consistent visual speed across all screen sizes
    const pixelsPerSecond = 320;
    let lastFrameTime = 0;
    let lastBeat = 0;
    let isRetracting = false; // Track if we're in retraction phase
    let binaryParticles = []; // Array to store falling binary digits
    
    // Binary particle class
    class BinaryParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.value = Math.random() > 0.5 ? '1' : '0';
        this.velocity = 2 + Math.random() * 3; // Fall speed
        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.size = 12 + Math.random() * 8;
      }
      
      update(deltaTime) {
        this.y += this.velocity * deltaTime * 60; // Scale by 60 to maintain original speed at 60fps
        this.velocity += 6 * deltaTime; // Gravity scaled by deltaTime
        this.opacity -= 0.6 * deltaTime; // Fade rate scaled by deltaTime
        this.rotation += this.rotationSpeed * deltaTime * 60;
        return this.opacity > 0 && this.y < viewH;
      }
      
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px monospace`;
        ctx.fillStyle = '#3B82F6';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3B82F6';
        ctx.fillText(this.value, 0, 0);
        ctx.restore();
      }
    }
    
    // ECG geometry. One identical 8-bit spike per beat, defined per 8px column,
    // and a beat period that divides evenly into the pixel grid so every spike matches.
    const pixelSize = 8;
    const snap = (v) => Math.floor(v / pixelSize) * pixelSize;
    const spikeShape = [-80, -160, -240, -160, -80, 0, 40, 0, 0, 0];
    const spikeWidth = spikeShape.length * pixelSize;
    const beatPeriod = 480;
    const beatGap = 96; // space between the name and the nearest spike
    const wrapPadX = 24; // box wrap: clearance beside the letters
    const wrapPadY = 16; // box wrap: clearance above the letters
    const measureRange = document.createRange(); // measures the text itself, unaffected by box width rules

    // Letter outline. The name is rendered once offscreen in the same pixel font and read back on
    // its own pixel grid. The outline is the ring of background cells touching the letters, one
    // pixel-font pixel thick, so every letter is enclosed on its own; holes inside letters are left
    // alone. It is position-independent, so it is built once per font size and placed each frame.
    const glyphCanvas = document.createElement('canvas');
    const glyphCtx = glyphCanvas.getContext('2d', { willReadFrequently: true });
    const outlineCanvas = document.createElement('canvas');
    const outlineCtx = outlineCanvas.getContext('2d');
    const MID_ROW = 4; // the pixel row the ECG line runs through (rows count up from the baseline)
    // document.fonts.check() answers true before the stylesheet has even registered the face, so look for it
    const pixelFontLoaded = () => {
      let loaded = false;
      document.fonts.forEach((face) => { if (face.family.replace(/["']/g, '') === 'Press Start 2P' && face.status === 'loaded') loaded = true; });
      return loaded;
    };
    let outline = null;
    let firstFrameTime = 0;

    const buildOutline = (fontPx, advance) => {
      if (outline && outline.fontPx === fontPx && outline.advance === advance) return outline;
      const glyph = Math.max(2, Math.round(fontPx / 8));
      const n = fullText.length;
      const W = n * fontPx;
      const H = fontPx * 2;
      glyphCanvas.width = W;
      glyphCanvas.height = H;
      glyphCtx.font = `400 ${fontPx}px 'Press Start 2P', monospace`; // the font's real weight; 600 is synthesised
      glyphCtx.textBaseline = 'alphabetic';
      glyphCtx.fillStyle = '#fff';
      const metrics = glyphCtx.measureText(fullText);
      if (Math.abs(metrics.width - n * fontPx) > 1) return null; // not the pixel font yet
      const ascent = metrics.fontBoundingBoxAscent || fontPx;
      const baseline = Math.ceil(ascent) + glyph;
      glyphCtx.clearRect(0, 0, W, H);
      glyphCtx.fillText(fullText, 0, baseline);
      const px = glyphCtx.getImageData(0, 0, W, H).data;

      // Grid: 8 columns per letter, rows counted up from the baseline row, one margin cell around
      const cMin = -1, cMax = n * 8, kMin = -1, kMax = 9;
      const cols = cMax - cMin + 1;
      const rows = kMax - kMin + 1;
      const at = (k, c) => (k - kMin) * cols + (c - cMin);
      const ink = new Uint8Array(rows * cols);
      for (let k = 0; k <= 8; k++) {
        const y = baseline - k * glyph - (glyph >> 1);
        if (y < 0 || y >= H) continue;
        for (let c = 0; c < n * 8; c++) {
          if (px[(y * W + c * glyph + (glyph >> 1)) * 4 + 3] > 128) ink[at(k, c)] = 1;
        }
      }
      // Background that connects to the outside of the name (so counters inside letters stay clear)
      const outside = new Uint8Array(rows * cols);
      const stack = [];
      for (let k = kMin; k <= kMax; k++) {
        for (let c = cMin; c <= cMax; c++) {
          if ((k === kMin || k === kMax || c === cMin || c === cMax) && !ink[at(k, c)]) {
            outside[at(k, c)] = 1;
            stack.push(k, c);
          }
        }
      }
      while (stack.length) {
        const c = stack.pop();
        const k = stack.pop();
        for (const [dk, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nk = k + dk, nc = c + dc;
          if (nk < kMin || nk > kMax || nc < cMin || nc > cMax) continue;
          const j = at(nk, nc);
          if (!ink[j] && !outside[j]) { outside[j] = 1; stack.push(nk, nc); }
        }
      }
      // The ring: outside cells touching a letter (8 neighbours, so corners stay solid)
      const ring = new Uint8Array(rows * cols);
      const colTopK = new Int8Array(cols).fill(-100);
      const colBotK = new Int8Array(cols).fill(100);
      const colEmpty = new Uint8Array(cols).fill(1);
      for (let k = kMin; k <= kMax; k++) {
        for (let c = cMin; c <= cMax; c++) {
          const j = at(k, c);
          if (ink[j]) { colEmpty[c - cMin] = 0; continue; }
          if (!outside[j]) continue;
          let touches = false;
          for (let dk = -1; dk <= 1 && !touches; dk++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nk = k + dk, nc = c + dc;
              if ((dk || dc) && nk >= kMin && nk <= kMax && nc >= cMin && nc <= cMax && ink[at(nk, nc)]) { touches = true; break; }
            }
          }
          if (touches) {
            ring[j] = 1;
            colEmpty[c - cMin] = 0;
            colTopK[c - cMin] = Math.max(colTopK[c - cMin], k);
            colBotK[c - cMin] = Math.min(colBotK[c - cMin], k);
          }
        }
      }
      // The line itself runs along the middle row through every empty column (the ends and the
      // space between the words) and reaches in until it meets the nearest outline
      const mid = new Uint8Array(cols);
      const open = (c) => c >= cMin && c <= cMax && outside[at(MID_ROW, c)] && !ring[at(MID_ROW, c)] && !ink[at(MID_ROW, c)];
      for (let c = cMin; c <= cMax; c++) {
        if (!colEmpty[c - cMin]) continue;
        mid[c - cMin] = 1;
        for (let cc = c - 1; open(cc) && !colEmpty[cc - cMin]; cc--) mid[cc - cMin] = 1;
        for (let cc = c + 1; open(cc) && !colEmpty[cc - cMin]; cc++) mid[cc - cMin] = 1;
      }
      const midRuns = [];
      for (let i = 0; i < cols; i++) {
        if (!mid[i]) continue;
        let j = i;
        while (j + 1 < cols && mid[j + 1]) j++;
        midRuns.push([i + cMin, j + cMin]);
        i = j;
      }
      // On screen, letters sit one advance apart (font size plus letter-spacing) while cells within a
      // letter are one glyph pixel apart; the last cell of each letter absorbs the letter-spacing.
      const colX = (c) => (c < 0 ? c * glyph : Math.floor(c / 8) * advance + (c % 8) * glyph);
      const colW = (c) => (c >= 0 && c % 8 === 7 ? advance - 7 * glyph : glyph);
      const gridW = colX(cMax) + glyph * 2;
      // Paint the ring once, at device resolution
      outlineCanvas.width = Math.round(gridW * dpr);
      outlineCanvas.height = Math.round(rows * glyph * dpr);
      outlineCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      outlineCtx.clearRect(0, 0, gridW, rows * glyph);
      outlineCtx.fillStyle = '#3B82F6';
      for (let k = kMin; k <= kMax; k++) {
        for (let c = cMin; c <= cMax; c++) {
          if (ring[at(k, c)]) outlineCtx.fillRect(colX(c) + glyph, (kMax - k) * glyph, colW(c), glyph);
        }
      }
      outline = { fontPx, advance, glyph, ascent, gridW, rows, cMin, cMax, kMax, colTopK, colBotK, midRuns, colX, colW };
      return outline;
    };

    // Plain box around the name for when the letters can't be traced (two lines on mobile)
    const buildBoxTrace = (geom, baseY) => {
      if (geom.typedLen <= 0) return null;
      const left = snap(geom.contentLeft - wrapPadX);
      const right = snap(geom.contentRight + wrapPadX) + pixelSize;
      const top = Math.round(geom.contentTop - wrapPadY);
      const bot = Math.round(geom.contentBottom + wrapPadY);
      if (left < 0 || right <= left) return null;
      return {
        left, right,
        top: [[left, baseY], [left, top], [right, top], [right, baseY]],
        bottom: [[left, baseY], [left, bot], [right, bot], [right, baseY]]
      };
    };

    // The part of a polyline between two x positions (segments are all horizontal or vertical)
    const clipPolyline = (pts, fromX, toX) => {
      const out = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        if (x2 < fromX || x1 > toX) continue;
        if (x1 === x2) {
          if (!out.length) out.push([x1, y1]);
          out.push([x2, y2]);
        } else {
          const a = Math.max(x1, fromX);
          const b = Math.min(x2, toX);
          if (!out.length || out[out.length - 1][0] !== a || out[out.length - 1][1] !== y1) out.push([a, y1]);
          out.push([b, y2]);
        }
      }
      return out;
    };

    const polylineYAt = (pts, x) => {
      let y = pts[0][1];
      for (const p of pts) { if (p[0] <= x) y = p[1]; else break; }
      return y;
    };

    const animate = (currentTime) => {
      // Calculate delta time in seconds
      if (!lastFrameTime) {
        lastFrameTime = currentTime;
      }
      const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
      lastFrameTime = currentTime;

      // Keep the canvas matched to the hero and start from a clear frame
      if (ecg.clientWidth !== viewW || ecg.clientHeight !== viewH) sizeCanvas();
      ctx.clearRect(0, 0, viewW, viewH);
      // Everything measured from the DOM is in viewport coords; the canvas may be scrolled
      const off = ecg.getBoundingClientRect();
      
      // Where the name sits on screen. The canvas is fixed, so viewport coords are canvas coords.
      let geom = null;
      const nameEl = nameRef.current;
      const measureEl = nameMeasureRef.current;
      if (nameEl && measureEl) {
        const box = nameEl.getBoundingClientRect();
        measureRange.selectNodeContents(measureEl);
        const fullWidth = measureRange.getBoundingClientRect().width;
        measureRange.selectNodeContents(nameEl);
        const content = measureRange.getBoundingClientRect();
        if (box.width > 0 && fullWidth > 0 && content.height > 0) {
          const centerX = (box.left + box.right) / 2 - off.left;
          const style = window.getComputedStyle(nameEl);
          const fontPx = parseFloat(style.fontSize);
          const letterSpacing = parseFloat(style.letterSpacing) || 0;
          const totalWidth = fullWidth + letterSpacing * fullText.length;
          geom = {
            contentLeft: content.left - off.left,
            contentRight: content.right - off.left,
            contentTop: content.top - off.top,
            contentBottom: content.bottom - off.top,
            typedLen: nameEl.textContent.replace(/\|/g, '').length,
            fontPx,
            advance: fontPx + letterSpacing,
            singleLine: totalWidth <= box.width,
            // Where the finished name sits, so the spikes never move
            finalLeft: snap(centerX - totalWidth / 2 - wrapPadX),
            finalRight: snap(centerX + totalWidth / 2 + wrapPadX) + pixelSize
          };
        }
      }
      const fontReady = geom !== null && pixelFontLoaded();
      const typingDone = geom !== null && geom.typedLen >= fullText.length;

      // The line runs through the letters' middle row. Outline the letters when the name is on one
      // line and the pixel font is in; otherwise box it.
      let name = null;
      if (geom && geom.singleLine && fontReady) {
        const o = buildOutline(geom.fontPx, geom.advance);
        if (o) {
        const domBaseline = Math.round(geom.contentTop + o.ascent);
        const originX = Math.round(geom.contentLeft);
        name = {
          kind: 'outline',
          o,
          originX,
          domBaseline,
          baseY: domBaseline - MID_ROW * o.glyph - (o.glyph >> 1),
          left: originX - o.glyph,
          right: originX + o.colX(o.cMax) + o.glyph
        };
        }
      }
      if (!name && geom && geom.typedLen > 0) {
        const mid = Math.round((geom.contentTop + geom.contentBottom) / 2);
        const box = buildBoxTrace(geom, mid);
        if (box) name = { kind: 'box', ...box, baseY: mid };
      }
      const baseY = name ? name.baseY : snap(viewH / 2 + 30);
      const zone = geom ? { left: geom.finalLeft, right: geom.finalRight } : null;
      const inName = (x) => name !== null && x > name.left && x < name.right;

      // Nothing sweeps until the name has typed out and the pixel font is in, so the line never
      // meets letters that are still moving. Give up waiting after a few seconds regardless.
      if (!firstFrameTime) firstFrameTime = currentTime;
      const ready = (typingDone && fontReady) || currentTime - firstFrameTime > 4000;
      const holdSweep = !isRetracting && xPos < 1 && !ready;

      // Spike offset for a column. Spikes sit at matching distances on both sides of the name.
      const spikeOffset = (x) => {
        let m = -1;
        if (zone) {
          const fromLeftZone = (zone.left - beatGap) - x;
          const intoRightZone = x - (zone.right + beatGap);
          if (fromLeftZone > 0) {
            const r = fromLeftZone % beatPeriod;
            if (r > 0 && r <= spikeWidth) m = spikeWidth - r;
          } else if (intoRightZone >= 0) {
            const r = intoRightZone % beatPeriod;
            if (r < spikeWidth) m = r;
          }
        } else if (x >= beatGap) {
          const r = (x - beatGap) % beatPeriod;
          if (r < spikeWidth) m = r;
        }
        return m < 0 ? 0 : spikeShape[Math.floor(m / pixelSize)];
      };

      const sampleY = (x) => {
        if (!inName(x)) return baseY + spikeOffset(x);
        return name.kind === 'box' ? polylineYAt(name.top, x) : baseY;
      };

      // Draw the ECG line - 8-bit pixelated style
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 6; // Chunky pixel line
      ctx.shadowBlur = 0; // No glow for 8-bit
      ctx.shadowColor = 'transparent';
      ctx.imageSmoothingEnabled = false; // Pixelated rendering

      // Height of the drawn line at any x, interpolated between its 8px samples, so both ends of the
      // visible line (the head and the retracting tail) slide smoothly instead of hopping a column
      const yOnLine = (x) => {
        const x0 = snap(x);
        if (x0 === x) return sampleY(x0);
        const y0 = sampleY(x0);
        return y0 + (sampleY(x0 + pixelSize) - y0) * ((x - x0) / pixelSize);
      };

      const strokeSampled = (fromX, toX) => {
        if (fromX >= toX) return;
        ctx.beginPath();
        ctx.moveTo(fromX, yOnLine(fromX));
        for (let x = snap(fromX) + pixelSize; x < toX; x += pixelSize) ctx.lineTo(x, sampleY(x));
        ctx.lineTo(toX, yOnLine(toX));
        ctx.stroke();
      };

      const strokePolyline = (pts) => {
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
      };

      // The letter outline plus the line through its middle row, revealed between two x positions
      const drawOutline = (nm, fromX, toX) => {
        const { o, originX, domBaseline } = nm;
        const g = o.glyph;
        const x0 = Math.max(fromX, nm.left);
        const x1 = Math.min(toX, nm.right);
        if (x1 <= x0) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, 0, x1 - x0, viewH);
        ctx.clip();
        ctx.drawImage(outlineCanvas, originX - g, domBaseline - (o.kMax + 1) * g, o.gridW, o.rows * g);
        ctx.fillStyle = '#3B82F6';
        for (const [ca, cb] of o.midRuns) {
          const xa = originX + o.colX(ca);
          const xb = originX + o.colX(cb) + o.colW(cb);
          ctx.fillRect(xa, nm.baseY - (g >> 1), xb - xa, g);
        }
        ctx.restore();
      };

      // Only draw the visible portion of the line
      const startX = Math.max(0, Math.floor(trailStart));
      const endX = Math.floor(xPos);

      if (!holdSweep && startX < endX - 1) { // Add small gap to prevent flicker
        if (name) {
          // Baseline up to the name, the outline, then the baseline after it
          strokeSampled(startX, Math.min(endX, name.left));
          if (name.kind === 'outline') {
            drawOutline(name, startX, endX);
          } else {
            strokePolyline(clipPolyline(name.top, startX, endX));
            strokePolyline(clipPolyline(name.bottom, startX, endX));
          }
          strokeSampled(Math.max(startX, name.right), endX);
        } else {
          strokeSampled(startX, endX);
        }
      }

      // Draw pixelated square at current position (only when drawing forward)
      if (!holdSweep && !isRetracting && startX < endX) {
        ctx.fillStyle = '#22D3EE';
        ctx.shadowBlur = 0;
        if (name && xPos > name.left && xPos < name.right) {
          if (name.kind === 'outline') {
            // Two heads riding the top and bottom of the outline; they meet on the line in the gaps
            const { o, originX, domBaseline } = name;
            const rel = endX - originX;
            const ci = Math.floor(rel / o.advance);
            const within = Math.min(7, Math.max(0, Math.floor((rel - ci * o.advance) / o.glyph)));
            const i = (rel < 0 ? -1 : ci * 8 + within) - o.cMin;
            if (i >= 0 && i < o.cols && o.colTopK[i] > -100) {
              for (const k of [o.colTopK[i], o.colBotK[i]]) {
                ctx.fillRect(endX - 6, domBaseline - k * o.glyph - (o.glyph >> 1) - 6, 12, 12);
              }
            } else {
              ctx.fillRect(endX - 6, baseY - 6, 12, 12);
            }
          } else {
            for (const pts of [name.top, name.bottom]) ctx.fillRect(endX - 6, polylineYAt(pts, endX) - 6, 12, 12);
          }
        } else {
          ctx.fillRect(endX - 6, Math.round(yOnLine(endX)) - 6, 12, 12);
        }
      }
      
      // Update position based on current phase and delta time
      // Using fixed pixels per second for consistent visual speed
      if (!isRetracting) {
        // Moving forward
        if (!holdSweep) xPos += pixelsPerSecond * deltaTime;

        // When we reach the end, start retracting
        if (xPos > viewW) {
          isRetracting = true;
        }
      } else {
        // Retracting - move the trail start forward with smooth acceleration
        const retractSpeed = pixelsPerSecond * deltaTime * 1.8; // Slightly slower for smoother effect
        trailStart += retractSpeed;

        // Create binary particles at the retracting edge
        if (Math.random() < 0.3) { // 30% chance each frame
          const particleY = sampleY(snap(trailStart));

          // Add some randomness to particle spawn position
          binaryParticles.push(new BinaryParticle(
            trailStart + (Math.random() - 0.5) * 20,
            particleY + (Math.random() - 0.5) * 10
          ));
        }

        // When fully retracted, reset for next cycle with smooth transition
        if (trailStart >= xPos - 2) { // The tail has caught the head
          xPos = 0;
          trailStart = 0;
          isRetracting = false;
        }
      }
      
      // Update and draw binary particles
      binaryParticles = binaryParticles.filter(particle => {
        const alive = particle.update(deltaTime);
        if (alive) {
          particle.draw(ctx);
        }
        return alive;
      });
      
      rafId = requestAnimationFrame(animate);
    };

    let rafId = requestAnimationFrame(animate);

    const handleResize = () => {
      drawGrid();
      sizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set(prev).add(entry.target.dataset.animateId));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    // Observe all elements with data-animate-id
    const elements = document.querySelectorAll('[data-animate-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [mounted]);

  const navItems = [
    { name: 'Experience', href: '#experience', isExternal: false },
    { name: 'Projects', href: '#projects', isExternal: false }
  ];

  // Component for reactive skill items
  const SkillItem = ({ skill, index, mousePos }) => {
    const skillRef = useRef(null);
    const [isNear, setIsNear] = useState(false);
    const [scale, setScale] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted) return;
      
      const updateTransform = () => {
        if (!skillRef.current) return;

        const rect = skillRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from mouse to skill center
        const distance = Math.sqrt(
          Math.pow(mousePos.x - centerX, 2) + 
          Math.pow(mousePos.y - centerY, 2)
        );

        // Proximity threshold (pixels)
        const threshold = 100;
        
        if (distance < threshold) {
          const strength = 1 - (distance / threshold);
          setScale(1 + (strength * 0.3));
          setIsNear(true);
        } else {
          setScale(1);
          setIsNear(false);
        }
      };

      // Add a small delay to ensure element is rendered
      const timer = setTimeout(updateTransform, 50);
      
      return () => clearTimeout(timer);
    }, [mousePos, mounted]);

    const style = {
      fontSize: '18px',
      fontWeight: isNear ? '500' : '400',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      display: 'inline-block',
      opacity: isNear ? 1 : 0.7,
      transform: `scale(${scale})`,
      animation: `fadeInUp 0.6s ease-out ${index * 0.03}s both`
    };

    // Apply gradient or white color
    if (isNear) {
      style.background = 'linear-gradient(90deg, #3B82F6 0%, #22D3EE 50%, #10B981 100%)';
      style.WebkitBackgroundClip = 'text';
      style.backgroundClip = 'text';
      style.WebkitTextFillColor = 'transparent';
    } else {
      style.color = '#ffffff';
    }

    return (
      <span
        ref={skillRef}
        style={style}
      >
        {skill}
      </span>
    );
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          border-radius: 0 !important;
        }

        html, body {
          font-family: 'VT323', monospace;
          background: #020617;
          color: #ffffff;
          overflow-x: hidden;
          max-width: 100vw;
          image-rendering: pixelated;
        }

        /* 8-bit Scrollbar */
        ::-webkit-scrollbar {
          width: 16px;
          background: #172554;
        }

        ::-webkit-scrollbar-track {
          background: #172554;
          border-left: 4px solid #020617;
          border-right: 4px solid #020617;
        }

        ::-webkit-scrollbar-thumb {
          background: #3B82F6;
          border: 4px solid #172554;
          box-shadow:
            inset -2px -2px 0px #1E3A8A,
            inset 2px 2px 0px #93C5FD;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #93C5FD;
        }

        ::-webkit-scrollbar-button:single-button {
          background: #3B82F6;
          height: 16px;
          display: block;
        }

        ::-webkit-scrollbar-button:single-button:vertical:decrement {
          background: #3B82F6;
          border-left: 4px solid #172554;
          border-right: 4px solid #172554;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23ffffff' d='M4 2L1 5h6z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
        }

        ::-webkit-scrollbar-button:single-button:vertical:increment {
          background: #3B82F6;
          border-left: 4px solid #172554;
          border-right: 4px solid #172554;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23ffffff' d='M4 6L1 3h6z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: auto;
          scrollbar-color: #3B82F6 #172554;
        }

        /* 8-bit headings */
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Press Start 2P', cursive;
          letter-spacing: 1px;
          text-shadow: 3px 3px 0px #000000;
        }

        /* 8-bit paragraph/description text */
        p, span, li, a, button, label {
          font-family: 'Press Start 2P', cursive;
          font-size: 11px;
          line-height: 2;
          letter-spacing: 0.5px;
        }

        /* CRT Scanline overlay */
        .crt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
        }

        /* Pixel border style */
        .pixel-border {
          border: 4px solid;
          border-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Crect x='0' y='0' width='4' height='4' fill='%233B82F6'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2322D3EE'/%3E%3Crect x='8' y='0' width='4' height='4' fill='%233B82F6'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2322D3EE'/%3E%3Crect x='8' y='4' width='4' height='4' fill='%2322D3EE'/%3E%3Crect x='0' y='8' width='4' height='4' fill='%233B82F6'/%3E%3Crect x='4' y='8' width='4' height='4' fill='%2322D3EE'/%3E%3Crect x='8' y='8' width='4' height='4' fill='%233B82F6'/%3E%3C/svg%3E") 4 stretch;
        }

        /* 8-bit button style */
        .pixel-btn {
          font-family: 'Press Start 2P', cursive;
          font-size: 12px;
          padding: 12px 24px;
          background: #3B82F6;
          color: #fff;
          border: none;
          box-shadow:
            4px 4px 0px #1E3A8A,
            inset -2px -2px 0px rgba(0,0,0,0.3),
            inset 2px 2px 0px rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.1s;
          text-transform: uppercase;
        }

        .pixel-btn:hover {
          transform: translate(2px, 2px);
          box-shadow:
            2px 2px 0px #1E3A8A,
            inset -2px -2px 0px rgba(0,0,0,0.3),
            inset 2px 2px 0px rgba(255,255,255,0.2);
        }

        .pixel-btn:active {
          transform: translate(4px, 4px);
          box-shadow:
            0px 0px 0px #1E3A8A,
            inset -2px -2px 0px rgba(0,0,0,0.3),
            inset 2px 2px 0px rgba(255,255,255,0.2);
        }

        /* Pixel card style */
        .pixel-card {
          background: rgba(30, 41, 59, 0.95);
          border: 4px solid #3B82F6;
          box-shadow:
            8px 8px 0px rgba(59, 130, 246, 0.3),
            inset 0 0 20px rgba(59, 130, 246, 0.1);
        }

        /* Blinking cursor for retro feel */
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .retro-cursor {
          animation: blink 1s step-end infinite;
        }

        /* Glitch text effect */
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        .glitch-text:hover {
          animation: glitch 0.3s ease infinite;
        }

        /* Pixelated dropdown animation */
        @keyframes pixelReveal {
          0% {
            max-height: 0;
            opacity: 0;
            clip-path: inset(0 0 100% 0);
          }
          25% {
            max-height: 150px;
            opacity: 0.3;
            clip-path: inset(0 0 75% 0);
          }
          50% {
            max-height: 300px;
            opacity: 0.6;
            clip-path: inset(0 0 50% 0);
          }
          75% {
            max-height: 450px;
            opacity: 0.8;
            clip-path: inset(0 0 25% 0);
          }
          100% {
            max-height: 1000px;
            opacity: 1;
            clip-path: inset(0 0 0% 0);
          }
        }

        .pixel-dropdown {
          animation: pixelReveal 0.4s steps(4) forwards;
          overflow: hidden;
        }

        @keyframes pixelClose {
          0% {
            max-height: 1000px;
            opacity: 1;
            clip-path: inset(0 0 0% 0);
          }
          25% {
            max-height: 450px;
            opacity: 0.8;
            clip-path: inset(0 0 25% 0);
          }
          50% {
            max-height: 300px;
            opacity: 0.6;
            clip-path: inset(0 0 50% 0);
          }
          75% {
            max-height: 150px;
            opacity: 0.3;
            clip-path: inset(0 0 75% 0);
          }
          100% {
            max-height: 0;
            opacity: 0;
            clip-path: inset(0 0 100% 0);
          }
        }

        .pixel-dropdown-closing {
          animation: pixelClose 0.3s steps(4) forwards;
          overflow: hidden;
        }

        #__next {
          overflow-x: hidden;
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glowPulse {
          0% {
            opacity: 0;
            filter: blur(15px);
          }
          50% {
            opacity: 1;
            filter: blur(20px);
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
          }
          100% {
            opacity: 0;
            filter: blur(15px);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes drawCircle {
          from {
            strokeDashoffset: 660;
          }
          to {
            strokeDashoffset: 0;
          }
        }

        @keyframes drawLine {
          from {
            strokeDashoffset: 40;
          }
          to {
            strokeDashoffset: 0;
          }
        }

        @keyframes scanLine {
          from {
            opacity: 0;
            transform: scaleX(0);
            transformOrigin: center;
          }
          50% {
            opacity: 0.8;
          }
          to {
            opacity: 0;
            transform: scaleX(1);
            transformOrigin: center;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        /* Mobile Menu Styles */
        .mobile-menu-btn {
          display: none;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 1002;
        }

        .mobile-menu-btn span {
          display: block;
          width: 25px;
          height: 2px;
          background: #3B82F6;
          margin: 5px auto;
          transition: all 0.3s;
        }

        .mobile-menu-btn.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .mobile-menu-btn.open span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-btn.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        /* Desktop - hide mobile menu by default */
        .mobile-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }

          .desktop-nav {
            display: none !important;
          }

          .mobile-nav {
            display: flex;
            position: fixed;
            top: 0;
            right: 0;
            width: 100%;
            height: 100vh;
            background: rgba(2, 6, 23, 0.98);
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 32px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1001;
          }

          .mobile-nav.open {
            transform: translateX(0);
          }

          .mobile-nav a {
            font-size: 24px;
            color: #ffffff;
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.3s;
          }

          .mobile-nav a:hover {
            opacity: 1;
          }
        }

        /* Responsive typography and spacing */
        @media (max-width: 768px) {
          h1 {
            font-size: 32px !important;
          }

          h2 {
            font-size: 28px !important;
          }

          h3 {
            font-size: 20px !important;
          }

          .hero-subtitle {
            font-size: 18px !important;
          }

          .hero-description {
            font-size: 14px !important;
          }

          .section-padding {
            padding: 60px 16px !important;
          }

          .grid-responsive {
            grid-template-columns: 1fr !important;
          }

          .profile-image {
            width: 150px !important;
            height: 150px !important;
          }

          /* Fix project cards overflow */
          .project-card {
            max-width: 100%;
            overflow: hidden;
          }

          /* Ensure sections don't overflow */
          section {
            max-width: 100vw;
            overflow-x: hidden;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          /* Fix experience cards on mobile - full width, compact */
          .hover-card {
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            max-width: 100% !important;
            border-width: 2px !important;
          }

          .hover-card h4 {
            font-size: 16px !important;
          }

          .hover-card p {
            font-size: 12px !important;
            line-height: 1.5 !important;
            margin-bottom: 10px !important;
          }

          .hover-card > div {
            padding: 12px !important;
          }

          /* Reduce spacing between experience cards */
          .animate-on-scroll {
            margin-bottom: 24px !important;
          }

          /* Fix nav padding */
          nav {
            padding: 16px !important;
          }

          /* Fix any absolute positioned elements that might overflow */
          [style*="position: absolute"] {
            max-width: 100vw;
          }

          /* Ensure images don't overflow */
          img {
            max-width: 100%;
            height: auto;
          }

          /* Fix flex containers */
          [style*="display: flex"] {
            max-width: 100%;
          }

          /* Fix Education & Certification cards - stack vertically on mobile */
          .edu-cert-card > div {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 12px !important;
          }

          /* Make logos smaller on mobile */
          .edu-cert-card > div > div:first-child {
            width: 50px !important;
            height: 50px !important;
            min-width: 50px !important;
          }

          .edu-cert-card > div > div:first-child img {
            width: 50px !important;
            height: 50px !important;
          }

          /* Stack the content and date badge vertically */
          .edu-cert-card > div > div:last-child {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            width: 100% !important;
            gap: 8px !important;
          }

          /* Make text smaller in edu-cert cards */
          .edu-cert-card h4 {
            font-size: 14px !important;
          }

          .edu-cert-card p {
            font-size: 12px !important;
          }

          /* Make date badges centered */
          .edu-cert-card span {
            align-self: center !important;
            font-size: 11px !important;
          }
        }

        .vibey-gradient {
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        .heartbeat-glow {
          animation: pulse 1s ease-in-out infinite;
        }

        .pixel-divider {
          height: 11px;
          width: 100%;
          background-image:
            repeating-linear-gradient(90deg, var(--divider-color) 0px, var(--divider-color) 16px, transparent 16px, transparent 28px),
            repeating-linear-gradient(90deg, var(--divider-shadow) 0px, var(--divider-shadow) 16px, transparent 16px, transparent 28px);
          background-size: calc(100% + 28px) 8px, calc(100% + 28px) 8px;
          background-position: -28px 0, -25px 3px;
          background-repeat: no-repeat;
          animation: pixel-divider-scroll 1.2s linear infinite;
        }

        @keyframes pixel-divider-scroll {
          to {
            background-position: 0 0, 3px 3px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pixel-divider {
            animation: none;
          }
        }

        /* Scroll-triggered animations */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out var(--stagger-delay, 0s),
                      transform 0.6s ease-out var(--stagger-delay, 0s);
        }

        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Card hover effects - 8-bit style */
        .hover-card {
          transition: transform 0.1s step-end,
                      box-shadow 0.1s step-end !important;
          will-change: transform;
          backface-visibility: hidden;
          border: 6px solid #3B82F6 !important;
          border-radius: 0 !important;
          box-shadow: 8px 8px 0px #1E3A8A;
        }

        .hover-card:hover {
          transform: translate(-4px, -4px) !important;
          box-shadow: 12px 12px 0px #1E3A8A;
          border-color: #22D3EE !important;
        }

        /* Remove all border radius for 8-bit look */
        .hover-card *, .pixel-card *, div[style*="borderRadius"] {
          border-radius: 0 !important;
        }

        /* Section header slide-in */
        .section-header {
          opacity: 0;
          transform: translateX(-50px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .section-header.visible {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>

      {/* CRT Scanline Overlay for 8-bit effect */}
      <div className="crt-overlay" />

      {/* Color-shifting background that appears on scroll */}
      <div 
        className="vibey-gradient"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            linear-gradient(
              -45deg, 
              rgba(59, 130, 246, ${scrollProgress * 0.1}),
              rgba(6, 182, 212, ${scrollProgress * 0.1}),
              rgba(249, 115, 22, ${scrollProgress * 0.1}),
              rgba(236, 72, 153, ${scrollProgress * 0.1})
            )
          `,
          opacity: scrollProgress,
          transition: 'opacity 0.6s ease-out',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      
      {/* Soft gradient orbs for depth */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: scrollProgress * 0.6,
          transition: 'opacity 0.6s ease-out',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 12s ease-in-out infinite'
        }} />
      </div>

      {/* Site-wide grid background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          zIndex: 1,
          pointerEvents: 'none',
          filter: `blur(${scrollProgress * 15}px)`,
          opacity: 1 - (scrollProgress * 0.7),
          transition: 'filter 0.3s ease-out, opacity 0.3s ease-out'
        }}
      />
      

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: windowWidth > 768 ? '32px 48px' : '20px 24px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.9) 0%, transparent 100%)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.15s ease-in'
      }}>
        <div style={{
          fontSize: windowWidth > 768 ? '16px' : '12px',
          fontWeight: '600',
          fontFamily: "'Press Start 2P', cursive",
          color: '#3B82F6',
          textShadow: '2px 2px 0px #000',
          transform: `translateX(-${logoSlideProgress * 150}%)`,
          opacity: 1 - (logoSlideProgress * 0.5),
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          willChange: 'transform, opacity'
        }}>
          kantecki.com
        </div>

        {/* Desktop Side Menu */}
        <div
          className="desktop-nav"
          style={{
            display: !mounted ? 'none' : (windowWidth > 768 ? 'block' : 'none'),
            position: 'fixed',
            top: '32px',
            right: '0',
            zIndex: 999,
            width: '250px',
            height: '45px'
          }}
          onMouseEnter={(e) => {
            const panel = e.currentTarget.querySelector('.side-panel');
            const arrow = e.currentTarget.querySelector('.arrow-icon');
            const menuIcon = e.currentTarget.querySelector('.menu-icon');
            const glowEffect = e.currentTarget.querySelector('.glow-effect');

            if (panel) {
              panel.style.right = '0';
            }
            if (arrow) {
              arrow.style.transform = 'rotate(180deg)';
            }
            if (menuIcon) {
              menuIcon.style.opacity = '0';
            }
            if (glowEffect) {
              glowEffect.style.opacity = '0';
              glowEffect.style.animation = 'none';
            }
          }}
          onMouseLeave={(e) => {
            const panel = e.currentTarget.querySelector('.side-panel');
            const arrow = e.currentTarget.querySelector('.arrow-icon');
            const menuIcon = e.currentTarget.querySelector('.menu-icon');
            const glowEffect = e.currentTarget.querySelector('.glow-effect');

            if (panel) {
              panel.style.right = '-220px';
            }
            if (arrow) {
              arrow.style.transform = 'rotate(0deg)';
            }
            if (menuIcon) {
              menuIcon.style.opacity = '1';
            }
            if (glowEffect) {
              // Trigger glow animation when menu closes
              glowEffect.style.opacity = '1';
              glowEffect.style.animation = 'glowPulse 1.5s ease-out forwards';
            }
          }}
        >
          {/* Menu Icon */}
          <div className="menu-icon" style={{
            cursor: 'pointer',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(2, 6, 23, 0.95)',
            borderLeft: '2px solid rgba(59, 130, 246, 0.3)',
            borderTop: '2px solid rgba(59, 130, 246, 0.3)',
            borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
            transition: 'opacity 0.3s ease, border-color 0.3s ease',
            position: 'fixed',
            right: '0',
            top: '32px',
            zIndex: 1001,
            width: '45px',
            height: '45px',
            opacity: 1
          }}>
            <svg
              className="arrow-icon"
              width="24"
              height="24"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              viewBox="0 0 24 24"
              style={{
                transition: 'all 0.3s ease',
                transform: 'rotate(0deg)'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>

          {/* Glow Effect */}
          <div
            className="glow-effect"
            style={{
              position: 'fixed',
              right: '0',
              top: '32px',
              width: '45px',
              height: '45px',
              borderTopLeftRadius: '12px',
              borderBottomLeftRadius: '12px',
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.6), transparent)',
              filter: 'blur(15px)',
              opacity: 0,
              pointerEvents: 'none',
              zIndex: 1000
            }}
          />

          {/* Side Panel */}
          <div
            className="side-panel"
            style={{
              position: 'fixed',
              top: '32px',
              right: '-220px',
              width: '220px',
              background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderLeft: '2px solid rgba(59, 130, 246, 0.3)',
              borderTop: '2px solid rgba(59, 130, 246, 0.3)',
              borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
              borderTopLeftRadius: '16px',
              borderBottomLeftRadius: '16px',
              padding: '20px 20px 20px 30px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '-10px 0 40px rgba(59, 130, 246, 0.2)',
              zIndex: 998
            }}
          >

            {/* Navigation Links */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              {navItems.map(item => {
                const isActive = currentSection === item.href.slice(1);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    style={{
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '500',
                      opacity: isActive ? 1 : 0.7,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = isActive ? '1' : '0.8';
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {/* Active indicator dot */}
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isActive ? '#3B82F6' : 'transparent',
                      transition: 'all 0.3s'
                    }} />
                    {item.name}
                  </a>
                );
              })}
            </div>

            {/* Social Links */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <a
                href="https://github.com/CodingWithKantecki"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ffffff', opacity: 0.8, transition: 'opacity 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/thomas-kantecki-836b39271/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ffffff', opacity: 0.8, transition: 'opacity 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#ffffff', opacity: 0.8, transition: 'opacity 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          style={{
            display: !mounted ? 'none' : (windowWidth > 768 ? 'none' : 'block'),
            position: 'absolute',
            right: '24px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`} style={{
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          padding: '80px 24px'
        }}>
          {/* Navigation Links */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {navItems.map(item => {
              const isActive = currentSection === item.href.slice(1);
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: '20px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    opacity: isActive ? 1 : 0.8,
                    transition: 'opacity 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isActive ? '#3B82F6' : 'transparent',
                    transition: 'all 0.3s'
                  }} />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Social Links */}
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center'
          }}>
            <a href="https://github.com/CodingWithKantecki" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/thomas-kantecki-836b39271/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* ECG canvas: scrolls with the hero so the letter outline stays glued to the name */}
        <canvas
          ref={ecgRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            filter: `blur(${scrollProgress * 15}px)`,
            opacity: 1 - (scrollProgress * 0.7),
            transition: 'filter 0.3s ease-out, opacity 0.3s ease-out'
          }}
        />
        <div style={{
          textAlign: 'center',
          animation: 'fadeInUp 1s ease-out',
          maxWidth: '800px',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Profile Image with Wireframe Effect */}
          <div className="profile-image" style={{
            width: windowWidth > 768 ? '200px' : '150px',
            height: windowWidth > 768 ? '200px' : '150px',
            margin: '0 auto 32px',
            position: 'relative'
          }}>
            {/* Animated Wireframe SVG */}
            <svg
              style={{
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                width: 'calc(100% + 20px)',
                height: 'calc(100% + 20px)',
                zIndex: 2,
                pointerEvents: 'none'
              }}
              viewBox="0 0 220 220"
            >
              {/* Outer wireframe circles */}
              <circle
                cx="110"
                cy="110"
                r="105"
                fill="none"
                stroke="url(#wireframeGradient)"
                strokeWidth="2"
                strokeDasharray="660"
                strokeDashoffset="660"
                style={{
                  animation: 'drawCircle 1.5s ease-out forwards',
                  animationDelay: '0.3s'
                }}
              />
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke="url(#wireframeGradient)"
                strokeWidth="1"
                strokeDasharray="628"
                strokeDashoffset="628"
                opacity="0.6"
                style={{
                  animation: 'drawCircle 1.5s ease-out forwards',
                  animationDelay: '0.5s'
                }}
              />

              {/* Scan lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="10"
                  y1={45 + i * 30}
                  x2="210"
                  y2={45 + i * 30}
                  stroke="#3B82F6"
                  strokeWidth="0.5"
                  opacity="0"
                  style={{
                    animation: 'scanLine 0.3s ease-out forwards',
                    animationDelay: `${0.2 + i * 0.1}s`
                  }}
                />
              ))}

              {/* Corner brackets */}
              <path
                d="M 30 30 L 30 50 M 30 30 L 50 30"
                stroke="#22D3EE"
                strokeWidth="2"
                strokeDasharray="40"
                strokeDashoffset="40"
                style={{
                  animation: 'drawLine 0.6s ease-out forwards',
                  animationDelay: '0.1s'
                }}
              />
              <path
                d="M 190 30 L 190 50 M 190 30 L 170 30"
                stroke="#22D3EE"
                strokeWidth="2"
                strokeDasharray="40"
                strokeDashoffset="40"
                style={{
                  animation: 'drawLine 0.6s ease-out forwards',
                  animationDelay: '0.2s'
                }}
              />
              <path
                d="M 30 190 L 30 170 M 30 190 L 50 190"
                stroke="#22D3EE"
                strokeWidth="2"
                strokeDasharray="40"
                strokeDashoffset="40"
                style={{
                  animation: 'drawLine 0.6s ease-out forwards',
                  animationDelay: '0.15s'
                }}
              />
              <path
                d="M 190 190 L 190 170 M 190 190 L 170 190"
                stroke="#22D3EE"
                strokeWidth="2"
                strokeDasharray="40"
                strokeDashoffset="40"
                style={{
                  animation: 'drawLine 0.6s ease-out forwards',
                  animationDelay: '0.25s'
                }}
              />

              <defs>
                <linearGradient id="wireframeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#22D3EE', stopOpacity: 1}} />
                </linearGradient>
              </defs>
            </svg>

            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)',
              padding: '3px',
              opacity: 0,
              animation: 'fadeIn 0.5s ease-out forwards',
              animationDelay: '0.8s'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#020617',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Image
                  src="/me.jpeg"
                  alt="Thomas"
                  fill
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center 20%',
                    transform: 'scale(1.2)'
                  }}
                  priority
                />
              </div>
            </div>
          </div>

          <h1 ref={nameRef} style={{
            fontSize: windowWidth > 768 ? '48px' : '32px',
            fontWeight: '600',
            marginBottom: '16px',
            lineHeight: '1.2',
            color: '#ffffff',
            minHeight: windowWidth > 768 ? '58px' : '40px' // Prevent layout shift
          }}>
            {typedText}
            {typedText.length < fullText.length && (
              <span style={{
                opacity: showCursor ? 1 : 0,
                transition: 'opacity 0.1s',
                color: '#3B82F6',
                fontWeight: '300'
              }}>|</span>
            )}
          </h1>
          {/* Hidden copy of the full name so the ECG line can measure where the letters will sit */}
          <span ref={nameMeasureRef} aria-hidden="true" style={{
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontSize: windowWidth > 768 ? '48px' : '32px',
            fontWeight: '600'
          }}>{fullText}</span>
          
          <p className="hero-description" style={{
            fontSize: windowWidth > 768 ? '18px' : '14px',
            color: '#94a3b8',
            marginBottom: '8px',
            opacity: showSubtitle ? 1 : 0,
            transition: 'opacity 1s ease-out 0.3s'
          }}>
            Health Informatics Student • Full-Stack Developer
          </p>
          

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '60px'
          }}>
            <button
              onClick={() => {
                document.getElementById('experience').scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              style={{
                fontSize: windowWidth > 768 ? '40px' : '32px',
                color: '#3B82F6',
                animation: 'float 2s ease-in-out infinite',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Scroll to next section"
            >
              ↓
            </button>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section-padding" style={{
        padding: windowWidth > 768 ? '140px 48px 120px' : '80px 24px 60px',
        maxWidth: '1200px',
        margin: '0 auto 80px',
        position: 'relative',
        zIndex: 10
      }}>
        <h2
          className={`section-header ${visibleElements.has('exp-header') ? 'visible' : ''}`}
          data-animate-id="exp-header"
          style={{
            fontSize: windowWidth > 768 ? '36px' : '28px',
            fontWeight: '600',
            marginBottom: windowWidth > 768 ? '60px' : '40px',
            textAlign: 'center'
          }}>
          Experience & Education
        </h2>

        <div className="grid-responsive" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: windowWidth > 768 ? '48px' : '32px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* Work Experience */}
          <div>
            <h3 style={{
              fontSize: windowWidth > 768 ? '24px' : '16px',
              fontWeight: '700',
              marginBottom: '48px',
              color: '#3B82F6',
              textAlign: 'center'
            }}>
              Career Journey
            </h3>

            {/* Centered Timeline container */}
            <div style={{
              position: 'relative',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Center Timeline line */}
              <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: '0',
                bottom: '0',
                width: windowWidth > 768 ? '6px' : '4px',
                background: '#3B82F6',
                boxShadow: '4px 4px 0px #1E3A8A'
              }} />

              {/* AdventHealth - RIGHT SIDE */}
              <div
                className={`animate-on-scroll ${visibleElements.has('exp-card-adventhealth') ? 'visible' : ''}`}
                data-animate-id="exp-card-adventhealth"
                style={{
                  display: 'flex',
                  justifyContent: windowWidth > 768 ? 'flex-end' : 'center',
                  alignItems: 'center',
                  marginBottom: '60px',
                  position: 'relative',
                  '--stagger-delay': '0.01s'
                }}>
                {/* Date badge - on left for right cards */}
                {windowWidth > 768 && (
                  <div style={{
                    position: 'absolute',
                    right: '52%',
                    top: '34px',
                    transform: 'translateY(-50%)',
                    background: '#1BA8E1',
                    color: '#000',
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '4px 4px 0px #005C95'
                  }}>
                    Aug 2026 - Present
                  </div>
                )}
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '24px',
                  width: '20px',
                  height: '20px',
                  background: '#1BA8E1',
                  border: '4px solid #0f172a',
                  boxShadow: '3px 3px 0px #005C95',
                  zIndex: 10
                }} />

                {/* Card */}
                <div
                  className="hover-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    overflow: 'hidden',
                    border: '4px solid #1BA8E1',
                    width: windowWidth > 768 ? '45%' : '100%',
                    marginLeft: windowWidth > 768 ? '55%' : '0'
                  }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '140px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src="/adventhealth.svg"
                      alt="AdventHealth logo"
                      style={{
                        maxWidth: '70%',
                        maxHeight: '45%',
                        objectFit: 'contain',
                        marginBottom: windowWidth > 768 ? '120px' : '60px'
                      }}
                    />
                    {/* Title overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px'
                    }}>
                      <h4 style={{ fontSize: windowWidth > 768 ? '24px' : '20px', fontWeight: '700', color: '#1e293b', margin: 0, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                        Software Engineer Intern
                      </h4>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: windowWidth > 768 ? '24px' : '16px' }}>
                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="#1BA8E1" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        AdventHealth
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Aug 2026 - Present
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Altamonte Springs, FL
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      marginBottom: '16px'
                    }}>
                      Software engineering intern at AdventHealth, one of the largest nonprofit health systems in the United States, working with internal healthcare data in Snowflake.
                    </p>

                    {/* Show More Details Button */}
                    <button
                      onClick={() => handleExpToggle('adventhealth')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(27, 168, 225, 0.1)',
                        border: '1px solid rgba(27, 168, 225, 0.2)',
                        borderRadius: '8px',
                        color: '#BAE6FD',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                      }}
                    >
                      {expandedExp.adventhealth ? 'Show Less' : 'Show More Details'}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: expandedExp.adventhealth ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {expandedExp.adventhealth && (
                      <div className={closingExp.adventhealth ? 'pixel-dropdown-closing' : 'pixel-dropdown'} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(27, 168, 225, 0.2)' }}>
                        {/* Skills */}
                        <h5 style={{ color: '#1BA8E1', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#1BA8E1', borderRadius: '2px' }} />
                          Key Skills
                        </h5>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '20px'
                        }}>
                          {['Snowflake', 'Microsoft Fabric', 'Power BI', 'SQL', 'Healthcare Data'].map(skill => (
                            <span key={skill} style={{
                              fontSize: '11px',
                              padding: '5px 12px',
                              background: 'rgba(27, 168, 225, 0.15)',
                              borderRadius: '16px',
                              border: '1px solid rgba(27, 168, 225, 0.3)',
                              color: '#BAE6FD'
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h5 style={{ color: '#1BA8E1', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#1BA8E1', borderRadius: '2px' }} />
                          Key Responsibilities
                        </h5>
                        <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '0' }}>
                          <li>Work with internal healthcare data in Snowflake to support engineering projects</li>
                        </ul>

                        {/* Links */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
                          <a
                            href="https://www.adventhealth.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#BAE6FD',
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            Visit adventhealth.com
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statura - LEFT SIDE */}
              <div
                className={`animate-on-scroll ${visibleElements.has('exp-card-statura') ? 'visible' : ''}`}
                data-animate-id="exp-card-statura"
                style={{
                  display: 'flex',
                  justifyContent: windowWidth > 768 ? 'flex-start' : 'center',
                  alignItems: 'center',
                  marginBottom: '60px',
                  position: 'relative',
                  '--stagger-delay': '0.01s'
                }}>
                {/* Date badge - on right for left cards */}
                {windowWidth > 768 && (
                  <div style={{
                    position: 'absolute',
                    left: '52%',
                    top: '34px',
                    transform: 'translateY(-50%)',
                    background: '#C9954A',
                    color: '#000',
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '4px 4px 0px #8A6230'
                  }}>
                    May 2026 - Present
                  </div>
                )}
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '24px',
                  width: '20px',
                  height: '20px',
                  background: '#C9954A',
                  border: '4px solid #0f172a',
                  boxShadow: '3px 3px 0px #8A6230',
                  zIndex: 10
                }} />

                {/* Card */}
                <div
                  className="hover-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    overflow: 'hidden',
                    border: '4px solid #C9954A',
                    width: windowWidth > 768 ? '45%' : '100%',
                    marginRight: windowWidth > 768 ? '55%' : '0'
                  }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '140px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#14233E'
                  }}>
                    <img
                      src="/statura.png"
                      alt="Statura logo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    {/* Bottom gradient for title legibility */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0) 50%)'
                    }} />
                    {/* Title overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px'
                    }}>
                      <h4 style={{ fontSize: windowWidth > 768 ? '24px' : '20px', fontWeight: '700', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        Software Engineer
                      </h4>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: windowWidth > 768 ? '24px' : '16px' }}>
                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="#C9954A" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Statura
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        May 2026 - Present
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Miami, FL
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      marginBottom: '16px'
                    }}>
                      Building the frontend of Statura, an AI-native legislative intelligence platform that shows Florida businesses exactly how every bill, ordinance, and appropriation affects them — across federal, state, county, and municipal government.
                    </p>

                    {/* Show More Details Button */}
                    <button
                      onClick={() => handleExpToggle('statura')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(201, 149, 74, 0.1)',
                        border: '1px solid rgba(201, 149, 74, 0.2)',
                        borderRadius: '8px',
                        color: '#E8D49E',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                      }}
                    >
                      {expandedExp.statura ? 'Show Less' : 'Show More Details'}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: expandedExp.statura ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {expandedExp.statura && (
                      <div className={closingExp.statura ? 'pixel-dropdown-closing' : 'pixel-dropdown'} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(201, 149, 74, 0.2)' }}>
                        {/* Skills */}
                        <h5 style={{ color: '#C9954A', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#C9954A', borderRadius: '2px' }} />
                          Key Skills
                        </h5>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '20px'
                        }}>
                          {['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'AI Integration'].map(skill => (
                            <span key={skill} style={{
                              fontSize: '11px',
                              padding: '5px 12px',
                              background: 'rgba(201, 149, 74, 0.15)',
                              borderRadius: '16px',
                              border: '1px solid rgba(201, 149, 74, 0.3)',
                              color: '#E8D49E'
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h5 style={{ color: '#C9954A', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#C9954A', borderRadius: '2px' }} />
                          Key Responsibilities
                        </h5>
                        <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '0' }}>
                          <li>Build core product surfaces: the intelligence dashboard and county, state, and federal legislative pages</li>
                          <li>Develop the legislative news experience and relevance filtering so each workspace sees the bills that matter to it</li>
                          <li>Ship responsive UI and performance improvements across the marketing site and app</li>
                          <li>Work across a Next.js + Supabase monorepo with AI-powered bill analysis pipelines</li>
                        </ul>

                        {/* Links */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
                          <a
                            href="https://statura.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#E8D49E',
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            Visit statura.app
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SwampHacks XI - RIGHT SIDE */}
              <div
                className={`animate-on-scroll ${visibleElements.has('exp-card-sh') ? 'visible' : ''}`}
                data-animate-id="exp-card-sh"
                style={{
                  display: 'flex',
                  justifyContent: windowWidth > 768 ? 'flex-end' : 'center',
                  alignItems: 'center',
                  marginBottom: '60px',
                  position: 'relative',
                  '--stagger-delay': '0.01s'
                }}>
                {/* Date badge - on left for right cards */}
                {windowWidth > 768 && (
                  <div style={{
                    position: 'absolute',
                    right: '52%',
                    top: '34px',
                    transform: 'translateY(-50%)',
                    background: '#FFD700',
                    color: '#000',
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '4px 4px 0px #B8860B'
                  }}>
                    January 2026
                  </div>
                )}
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '24px',
                  width: '20px',
                  height: '20px',
                  background: '#FFD700',
                  border: '4px solid #0f172a',
                  boxShadow: '3px 3px 0px #B8860B',
                  zIndex: 10
                }} />

                {/* Card */}
                <div
                  className="hover-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    overflow: 'hidden',
                    border: '4px solid #FFD700',
                    width: windowWidth > 768 ? '45%' : '100%',
                    marginLeft: windowWidth > 768 ? '55%' : '0'
                  }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '140px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img
                      src="/neuroview.png"
                      alt="SwampHacks XI Winner"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Winner Ribbon */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '-35px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                      color: '#000',
                      padding: '6px 40px',
                      fontSize: '10px',
                      fontWeight: '700',
                      fontFamily: "'Press Start 2P', cursive",
                      transform: 'rotate(45deg)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      zIndex: 10,
                      letterSpacing: '1px'
                    }}>
                      WINNER
                    </div>
                    {/* Title overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px'
                    }}>
                      <h4 style={{ fontSize: windowWidth > 768 ? '24px' : '20px', fontWeight: '700', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        SwampHacks XI Winner
                      </h4>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: windowWidth > 768 ? '24px' : '16px' }}>
                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="#FFD700" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        Best User Design
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        January 2026
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Gainesville, FL
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      marginBottom: '16px'
                    }}>
                      Won "Best User Design" at SwampHacks XI with NeuroView, a free, open-source web-based 3D brain MRI viewer making neuroanatomy accessible through interactive visualization.
                    </p>

                    {/* Show More Details Button */}
                    <button
                      onClick={() => handleExpToggle('swamphacks')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 215, 0, 0.1)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#FFD700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                      }}
                    >
                      {expandedExp.swamphacks ? 'Show Less' : 'Show More Details'}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: expandedExp.swamphacks ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {expandedExp.swamphacks && (
                      <div className={closingExp.swamphacks ? 'pixel-dropdown-closing' : 'pixel-dropdown'} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        {/* Skills */}
                        <h5 style={{ color: '#FFD700', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#FFD700', borderRadius: '2px' }} />
                          Technologies Used
                        </h5>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '20px'
                        }}>
                          {['Three.js', 'WebGL', 'React', 'NIfTI', 'Real-time Collaboration'].map(skill => (
                            <span key={skill} style={{
                              fontSize: '11px',
                              padding: '5px 12px',
                              background: 'rgba(255, 215, 0, 0.15)',
                              borderRadius: '16px',
                              border: '1px solid rgba(255, 215, 0, 0.3)',
                              color: '#FFD700'
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h5 style={{ color: '#FFD700', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#FFD700', borderRadius: '2px' }} />
                          Project Highlights
                        </h5>
                        <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '20px' }}>
                          <li>Created UI art elements and visual design for the application</li>
                          <li>Helped contribute to landing page, presentation, and conducted research</li>
                          <li>Built interactive 3D brain visualization with NIfTI file support</li>
                          <li>Implemented real-time collaborative viewing features</li>
                        </ul>

                        {/* Links */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <a
                            href="https://devpost.com/software/neuroview"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#FFD700',
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            View on Devpost
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <a
                            href="https://www.youtube.com/watch?v=4fMkUkWLkVI"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#FF0000',
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            Watch Demo
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Knight Hacks - LEFT SIDE */}
              <div
                className={`animate-on-scroll ${visibleElements.has('exp-card-kh') ? 'visible' : ''}`}
                data-animate-id="exp-card-kh"
                style={{
                  display: 'flex',
                  justifyContent: windowWidth > 768 ? 'flex-start' : 'center',
                  alignItems: 'center',
                  marginBottom: '60px',
                  position: 'relative',
                  '--stagger-delay': '0.02s'
                }}>
                {/* Date badge - on right for left cards */}
                {windowWidth > 768 && (
                  <div style={{
                    position: 'absolute',
                    left: '52%',
                    top: '34px',
                    transform: 'translateY(-50%)',
                    background: '#EF4444',
                    color: '#fff',
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '4px 4px 0px #991B1B'
                  }}>
                    Fall 2025 - Present
                  </div>
                )}
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '24px',
                  width: '20px',
                  height: '20px',
                  background: '#EF4444',
                  border: '4px solid #0f172a',
                  boxShadow: '3px 3px 0px #991B1B',
                  zIndex: 10
                }} />

                {/* Card */}
                <div
                  className="hover-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    overflow: 'hidden',
                    border: '4px solid #EF4444',
                    width: windowWidth > 768 ? '45%' : '100%',
                    marginRight: windowWidth > 768 ? '55%' : '0'
                  }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '140px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img
                      src="/knighthacks.jpg"
                      alt="Knight Hacks VIII Winners"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Winner Ribbon */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '-35px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                      color: '#000',
                      padding: '6px 40px',
                      fontSize: '10px',
                      fontWeight: '700',
                      fontFamily: "'Press Start 2P', cursive",
                      transform: 'rotate(45deg)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      zIndex: 10,
                      letterSpacing: '1px'
                    }}>
                      WINNER
                    </div>
                    {/* Title overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px'
                    }}>
                      <h4 style={{ fontSize: windowWidth > 768 ? '24px' : '20px', fontWeight: '700', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        Knight Hacks VIII Winner
                      </h4>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: windowWidth > 768 ? '24px' : '16px' }}>
                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="#FFD700" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        Best App Development
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Knight Hacks @ UCF
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Fall 2025 - Present
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Orlando, FL
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      marginBottom: '16px'
                    }}>
                      Active member and Fall 2025 Mentee at UCF's premier software development organization. Won "Best App Development Hack" at Knight Hacks VIII with KINEXIS, a physical therapy tracking platform.
                    </p>

                    {/* Show More Details Button */}
                    <button
                      onClick={() => handleExpToggle('knighthacks')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        color: '#F87171',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                      }}
                    >
                      {expandedExp.knighthacks ? 'Show Less' : 'Show More Details'}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: expandedExp.knighthacks ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {expandedExp.knighthacks && (
                      <div className={closingExp.knighthacks ? 'pixel-dropdown-closing' : 'pixel-dropdown'} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {/* Skills */}
                        <h5 style={{ color: '#EF4444', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#EF4444', borderRadius: '2px' }} />
                          Key Skills
                        </h5>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '20px'
                        }}>
                          {['Hackathons', 'Software Development', 'Mentorship', 'Networking', 'Team Collaboration'].map(skill => (
                            <span key={skill} style={{
                              fontSize: '11px',
                              padding: '5px 12px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              borderRadius: '16px',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#F87171'
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h5 style={{ color: '#EF4444', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#EF4444', borderRadius: '2px' }} />
                          Achievements & Activities
                        </h5>
                        <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '0' }}>
                          <li>Won "Best App Development Hack" at Knight Hacks VIII with KINEXIS</li>
                          <li>Fall 2025 Mentee - receiving guidance from experienced developers</li>
                          <li>Participating in workshops, hackathons, and networking events</li>
                          <li>Building skills in collaborative software development</li>
                        </ul>

                        {/* Links */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px' }}>
                          <a
                            href="https://devpost.com/software/kinexis"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#EF4444',
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            View KINEXIS on Devpost
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <a
                            href="https://www.youtube.com/watch?v=HFNppbczE-M"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#FF0000',
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            Watch Demo
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AJR Publishing - RIGHT SIDE */}
              <div
                className={`animate-on-scroll ${visibleElements.has('exp-card-0') ? 'visible' : ''}`}
                data-animate-id="exp-card-0"
                style={{
                  display: 'flex',
                  justifyContent: windowWidth > 768 ? 'flex-end' : 'center',
                  alignItems: 'center',
                  marginBottom: '60px',
                  position: 'relative',
                  '--stagger-delay': '0.05s'
                }}>
                {/* Date badge - on left for right cards */}
                {windowWidth > 768 && (
                  <div style={{
                    position: 'absolute',
                    right: '52%',
                    top: '34px',
                    transform: 'translateY(-50%)',
                    background: '#3B82F6',
                    color: '#fff',
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '4px 4px 0px #1E3A8A'
                  }}>
                    Nov 2024 - Jul 2025
                  </div>
                )}
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '24px',
                  width: '20px',
                  height: '20px',
                  background: '#3B82F6',
                  border: '4px solid #0f172a',
                  boxShadow: '3px 3px 0px #1E3A8A',
                  zIndex: 10
                }} />

                {/* Card */}
                <div
                  className="hover-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    overflow: 'hidden',
                    border: '4px solid #3B82F6',
                    width: windowWidth > 768 ? '45%' : '100%',
                    marginLeft: windowWidth > 768 ? '55%' : '0'
                  }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '140px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 41, 59, 1) 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img
                      src="/ajr.png"
                      alt="Is Your Body Baby Friendly? - AJR Publishing"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Title overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      padding: '16px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                    }}>
                      <h4 style={{ fontSize: windowWidth > 768 ? '24px' : '20px', fontWeight: '700', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        Data & Ad Optimization Analyst
                      </h4>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: windowWidth > 768 ? '24px' : '16px' }}>
                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        AJR Publishing LLC
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Nov 2024 - Jul 2025
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Remote
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      marginBottom: '16px'
                    }}>
                      Analyzed sales data and optimized ad campaigns using keyword research and A/B testing. Tracked advertising ROI and created sales reports using Tableau.
                    </p>

                    {/* Show More Details Button */}
                    <button
                      onClick={() => handleExpToggle('ajr')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '8px',
                        color: '#93C5FD',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                      }}
                    >
                      {expandedExp.ajr ? 'Show Less' : 'Show More Details'}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: expandedExp.ajr ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {expandedExp.ajr && (
                      <div className={closingExp.ajr ? 'pixel-dropdown-closing' : 'pixel-dropdown'} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        {/* Skills */}
                        <h5 style={{ color: '#3B82F6', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#3B82F6', borderRadius: '2px' }} />
                          Key Skills
                        </h5>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '20px'
                        }}>
                          {['Data Analysis', 'A/B Testing', 'Tableau', 'Ad Optimization', 'ROI Tracking'].map(skill => (
                            <span key={skill} style={{
                              fontSize: '11px',
                              padding: '5px 12px',
                              background: 'rgba(59, 130, 246, 0.15)',
                              borderRadius: '16px',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#93C5FD'
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h5 style={{ color: '#3B82F6', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#3B82F6', borderRadius: '2px' }} />
                          Key Responsibilities
                        </h5>
                        <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '0' }}>
                          <li>Analyzed sales data and market trends to identify high-performing keywords</li>
                          <li>Conducted A/B testing to improve book discoverability and conversion rates</li>
                          <li>Tracked and reported on advertising ROI with data-driven budget recommendations</li>
                          <li>Created sales reports and ad budgeting visualizations using Tableau</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lacoste - LEFT SIDE */}
              <div
                className={`animate-on-scroll ${visibleElements.has('exp-card-1') ? 'visible' : ''}`}
                data-animate-id="exp-card-1"
                style={{
                  display: 'flex',
                  justifyContent: windowWidth > 768 ? 'flex-start' : 'center',
                  alignItems: 'center',
                  marginBottom: '60px',
                  position: 'relative',
                  '--stagger-delay': '0.1s'
                }}>
                {/* Date badge - on right for left cards */}
                {windowWidth > 768 && (
                  <div style={{
                    position: 'absolute',
                    left: '52%',
                    top: '34px',
                    transform: 'translateY(-50%)',
                    background: '#10B981',
                    color: '#fff',
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '4px 4px 0px #065F46'
                  }}>
                    Mar 2023 - Jul 2023
                  </div>
                )}
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '24px',
                  width: '20px',
                  height: '20px',
                  background: '#10B981',
                  border: '4px solid #0f172a',
                  boxShadow: '3px 3px 0px #065F46',
                  zIndex: 10
                }} />

                {/* Card */}
                <div
                  className="hover-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    overflow: 'hidden',
                    border: '4px solid #10B981',
                    width: windowWidth > 768 ? '45%' : '100%',
                    marginRight: windowWidth > 768 ? '55%' : '0'
                  }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '140px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img
                      src="/lacoste.gif"
                      alt="Lacoste"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Title overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px'
                    }}>
                      <h4 style={{ fontSize: windowWidth > 768 ? '24px' : '20px', fontWeight: '700', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        Sales Associate
                      </h4>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: windowWidth > 768 ? '24px' : '16px' }}>
                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="#10B981" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Lacoste
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Mar 2023 - Jul 2023
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Orlando, FL
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      marginBottom: '16px'
                    }}>
                      Achieved sales targets through product knowledge and client relationships in a luxury retail environment. Maintained visual merchandising standards and inventory management.
                    </p>

                    {/* Show More Details Button */}
                    <button
                      onClick={() => handleExpToggle('lacoste')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '8px',
                        color: '#34D399',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                      }}
                    >
                      {expandedExp.lacoste ? 'Show Less' : 'Show More Details'}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: expandedExp.lacoste ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {expandedExp.lacoste && (
                      <div className={closingExp.lacoste ? 'pixel-dropdown-closing' : 'pixel-dropdown'} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        {/* Skills */}
                        <h5 style={{ color: '#10B981', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#10B981', borderRadius: '2px' }} />
                          Key Skills
                        </h5>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '20px'
                        }}>
                          {['Sales', 'Customer Service', 'Luxury Retail', 'Inventory', 'Visual Merchandising'].map(skill => (
                            <span key={skill} style={{
                              fontSize: '11px',
                              padding: '5px 12px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              borderRadius: '16px',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#34D399'
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h5 style={{ color: '#10B981', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#10B981', borderRadius: '2px' }} />
                          Key Responsibilities
                        </h5>
                        <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '0' }}>
                          <li>Provided exceptional customer service in a luxury retail environment</li>
                          <li>Achieved sales targets through product knowledge and client relationships</li>
                          <li>Maintained visual merchandising standards and inventory management</li>
                          <li>Collaborated with team to enhance store performance</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sharelife Vacation - RIGHT SIDE */}
              <div
                className={`animate-on-scroll ${visibleElements.has('exp-card-2') ? 'visible' : ''}`}
                data-animate-id="exp-card-2"
                style={{
                  display: 'flex',
                  justifyContent: windowWidth > 768 ? 'flex-end' : 'center',
                  alignItems: 'center',
                  marginBottom: '60px',
                  position: 'relative',
                  '--stagger-delay': '0.15s'
                }}>
                {/* Date badge - on left for right cards */}
                {windowWidth > 768 && (
                  <div style={{
                    position: 'absolute',
                    right: '52%',
                    top: '34px',
                    transform: 'translateY(-50%)',
                    background: '#F59E0B',
                    color: '#fff',
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontFamily: "'Press Start 2P', cursive",
                    boxShadow: '4px 4px 0px #92400E'
                  }}>
                    Apr 2021 - Aug 2022
                  </div>
                )}
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: '24px',
                  width: '20px',
                  height: '20px',
                  background: '#F59E0B',
                  border: '4px solid #0f172a',
                  boxShadow: '3px 3px 0px #92400E',
                  zIndex: 10
                }} />

                {/* Card */}
                <div
                  className="hover-card"
                  style={{
                    background: 'rgba(30, 41, 59, 0.95)',
                    overflow: 'hidden',
                    border: '4px solid #F59E0B',
                    width: windowWidth > 768 ? '45%' : '100%',
                    marginLeft: windowWidth > 768 ? '55%' : '0'
                  }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '140px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src="/sharelife.png"
                      alt="Sharelife Vacation"
                      style={{
                        maxWidth: '70%',
                        maxHeight: '60%',
                        objectFit: 'contain'
                      }}
                    />
                    {/* Title overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px'
                    }}>
                      <h4 style={{ fontSize: windowWidth > 768 ? '24px' : '20px', fontWeight: '700', color: '#1e293b', margin: 0, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                        Administrative Assistant
                      </h4>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: windowWidth > 768 ? '24px' : '16px' }}>
                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px',
                      color: '#94a3b8',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Sharelife Vacation
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Apr 2021 - Aug 2022
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Orlando, FL
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      marginBottom: '16px'
                    }}>
                      Processed approximately 100 guests daily, handling contracts and payments via Authorize.net. Managed payroll, sales reports, and credit checks using Experian.
                    </p>

                    {/* Show More Details Button */}
                    <button
                      onClick={() => handleExpToggle('sharelife')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        borderRadius: '8px',
                        color: '#FBBF24',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                      }}
                    >
                      {expandedExp.sharelife ? 'Show Less' : 'Show More Details'}
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ transform: expandedExp.sharelife ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {expandedExp.sharelife && (
                      <div className={closingExp.sharelife ? 'pixel-dropdown-closing' : 'pixel-dropdown'} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        {/* Skills */}
                        <h5 style={{ color: '#F59E0B', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#F59E0B', borderRadius: '2px' }} />
                          Key Skills
                        </h5>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '20px'
                        }}>
                          {['Authorize.net', 'Experian', 'Payroll', 'Administration', 'Guest Services'].map(skill => (
                            <span key={skill} style={{
                              fontSize: '11px',
                              padding: '5px 12px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              borderRadius: '16px',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              color: '#FBBF24'
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h5 style={{ color: '#F59E0B', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#F59E0B', borderRadius: '2px' }} />
                          Key Responsibilities
                        </h5>
                        <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '16px' }}>
                          <li>Processed and checked in approximately 100 guests daily</li>
                          <li>Drafted contracts and handled payments using Authorize.net system</li>
                          <li>Collected sensitive information and ran credit checks using Experian</li>
                          <li>Maintained office supplies, handled payroll, and distributed weekly sales reports</li>
                        </ul>

                        {/* NASCAR Sponsorship */}
                        <h5 style={{ color: '#F59E0B', fontSize: '16px', fontWeight: '600', marginBottom: '12px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#F59E0B', borderRadius: '2px' }} />
                          2022 NASCAR Xfinity Series Sponsorship
                        </h5>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                          <img
                            src="/nascar.png"
                            alt="Sharelife Vacations NASCAR #66 Car"
                            style={{
                              width: '100%',
                              height: 'auto',
                              display: 'block'
                            }}
                          />
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
                          Sharelife Vacations sponsored the #66 car in the 2022 NASCAR Xfinity Series
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '32px',
              color: '#3B82F6',
              borderBottom: '2px solid rgba(59, 130, 246, 0.2)',
              paddingBottom: '12px'
            }}>
              Education
            </h3>
            
            <div style={{ display: 'grid', gridAutoRows: '1fr', gap: '20px' }}>
              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('edu-card-1') ? 'visible' : ''}`}
                data-animate-id="edu-card-1"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.1s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* UCF Logo */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/ucf.png"
                      alt="UCF Logo"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Bachelor's Degree in Health Informatics
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        University of Central Florida (UCF) • Orlando, FL
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
                        Major GPA: 3.5 • KnightHacks • Healthcare Case Club
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Jan 2024 - Present
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('edu-card-2') ? 'visible' : ''}`}
                data-animate-id="edu-card-2"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.2s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Valencia Logo */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/valencia.png"
                      alt="Valencia College Logo"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Associate's Degree in General Studies
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        Valencia College • Orlando, FL
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Aug 2021 - Aug 2023
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('edu-card-3') ? 'visible' : ''}`}
                data-animate-id="edu-card-3"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.3s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Windermere Logo */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/windermere.png"
                      alt="Windermere High School Logo"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        High School Diploma
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        Windermere High School • Windermere, FL
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Aug 2017 - May 2021
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div style={{ marginTop: '48px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '32px',
              color: '#3B82F6',
              borderBottom: '2px solid rgba(59, 130, 246, 0.2)',
              paddingBottom: '12px'
            }}>
              Licenses & Certifications
            </h3>

            <div style={{ display: 'grid', gridAutoRows: '1fr', gap: '20px' }}>
              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('cert-card-1') ? 'visible' : ''}`}
                data-animate-id="cert-card-1"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.1s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* HIMSS Logo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/himss.svg"
                      alt="HIMSS Logo"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Certified Associate in Healthcare Information and Management Systems (CAHIMS)
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        HIMSS
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Issued Jun 2026
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('cert-card-2') ? 'visible' : ''}`}
                data-animate-id="cert-card-2"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.2s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Stanford Logo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/stanford.png"
                      alt="Stanford University Logo"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Introduction to Clinical Data
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        Stanford University
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                        Credential ID: 30LFS303XXHV
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Issued Sep 2025
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('cert-card-3') ? 'visible' : ''}`}
                data-animate-id="cert-card-3"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.3s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Stanford Logo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/stanford.png"
                      alt="Stanford University Logo"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Introduction to Healthcare
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        Stanford University
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                        Credential ID: OFC9L64RNMCM
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Issued Jul 2025
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('cert-card-4') ? 'visible' : ''}`}
                data-animate-id="cert-card-4"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.4s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Stanford Logo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/stanford.png"
                      alt="Stanford University Logo"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Fundamentals of Machine Learning for Healthcare
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        Stanford University
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                        Credential ID: BVNF1MLRFEUN
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Issued Jan 2026
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('cert-card-5') ? 'visible' : ''}`}
                data-animate-id="cert-card-5"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.5s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Johns Hopkins Logo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/johnshopkins.png"
                      alt="Johns Hopkins University Logo"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        The Social and Technical Context of Health Informatics
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        The Johns Hopkins University
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                        Credential ID: SVZ3W1FTDS18
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Issued Oct 2025
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card edu-cert-card ${visibleElements.has('cert-card-6') ? 'visible' : ''}`}
                data-animate-id="cert-card-6"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '--stagger-delay': '0.6s'
                }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Stanford Logo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    <img
                      src="/stanford.png"
                      alt="Stanford University Logo"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Evaluations of AI Applications in Healthcare
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        Stanford University
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                        Credential ID: 0SRHE3F8YHFY
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      minWidth: '19ch',
                      textAlign: 'center',
                    }}>
                      Issued Mar 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="pixel-divider" style={{
        '--divider-color': 'rgba(59, 130, 246, 0.6)',
        '--divider-shadow': 'rgba(59, 130, 246, 0.25)'
      }} />

      {/* Projects Section */}
      <section id="projects" style={{
        padding: windowWidth > 768 ? '140px 48px 120px' : '60px 12px 40px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.05) 10%, rgba(59, 130, 246, 0.05) 90%, transparent 100%)',
        position: 'relative',
        zIndex: 10,
        marginTop: windowWidth > 768 ? '60px' : '30px',
        marginBottom: windowWidth > 768 ? '60px' : '30px',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        <div style={{
          maxWidth: windowWidth > 768 ? '1200px' : '100%',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h2
            className={`section-header ${visibleElements.has('projects-header') ? 'visible' : ''}`}
            data-animate-id="projects-header"
            style={{
              fontSize: windowWidth > 768 ? '36px' : '24px',
              fontWeight: '600',
              marginBottom: windowWidth > 768 ? '60px' : '30px',
              textAlign: 'center'
            }}>
            Projects
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth > 1024 ? 'repeat(3, 1fr)' : windowWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
            gap: windowWidth > 768 ? '24px' : '16px',
            width: '100%',
            boxSizing: 'border-box',
            alignItems: 'stretch'
          }}>
            {/* CardioView - newest project, featured across the full row */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-cardioview') ? 'visible' : ''}`}
              data-animate-id="project-card-cardioview"
              style={{
                gridColumn: windowWidth > 768 ? '1 / -1' : 'auto',
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.025s',
                display: 'flex',
                flexDirection: windowWidth > 1024 ? 'row' : 'column'
              }}>
              {/* Cover art - the Devpost cover, cropped to fill the left side */}
              <div style={{
                position: 'relative',
                flex: windowWidth > 1024 ? '0 0 46%' : '0 0 auto',
                width: windowWidth > 1024 ? '46%' : '100%',
                height: windowWidth > 1024 ? 'auto' : windowWidth > 768 ? '300px' : '200px',
                minHeight: windowWidth > 1024 ? '300px' : undefined,
                background: '#061218',
                overflow: 'hidden'
              }}>
                <img
                  src="/cardioview-cover.jpg"
                  alt="CardioView"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                />
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '20px 24px' : '14px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Project title box */}
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
                  CardioView
                </div>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F472B6',
                  fontSize: '10px',
                  fontFamily: "'Press Start 2P', cursive",
                  marginBottom: '10px'
                }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Knight Hacks IX
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: windowWidth > 1024 ? '14px' : '12px',
                  lineHeight: windowWidth > 1024 ? '1.6' : '1.5',
                  marginBottom: '12px'
                }}>
                  A 3D heart that beats with your real time ECG. A Polar H10 streams your heartbeat into the browser, every beat moves the heart, and Gemini turns any patient you describe into a rhythm.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {['Python', 'FastAPI', 'Three.js', 'Web Bluetooth', 'Gemini'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      background: 'rgba(55, 224, 126, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(55, 224, 126, 0.3)',
                      color: '#37E07E'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="https://devpost.com/software/cardioview-0qx9uc"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                    marginTop: 'auto'
                  }}
                >
                  View on Devpost
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Statura - legislative intelligence platform */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-statura') ? 'visible' : ''}`}
              data-animate-id="project-card-statura"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.05s',
                display: 'flex',
                flexDirection: 'column'
              }}>
              {/* Logo hero */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: windowWidth > 768 ? '140px' : '120px',
                background: '#14233E',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px'
              }}>
                <img
                  src="/statura.png"
                  alt="Statura"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '16px' : '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Project title box */}
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
                  Statura
                </div>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F472B6',
                  fontSize: '10px',
                  fontFamily: "'Press Start 2P', cursive",
                  marginBottom: '10px'
                }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  AI SaaS / Startup
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  marginBottom: '12px'
                }}>
                  Tells Florida businesses which new bills and local rules affect them. I build the frontend.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {['Next.js', 'TypeScript', 'React', 'Supabase', 'PostgreSQL'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      background: 'rgba(201, 149, 74, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(201, 149, 74, 0.3)',
                      color: '#E8D49E'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="https://statura.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                    marginTop: 'auto'
                  }}
                >
                  Visit statura.app
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* CapySynth - VST plugin */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-capysynth') ? 'visible' : ''}`}
              data-animate-id="project-card-capysynth"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.075s',
                display: 'flex',
                flexDirection: 'column'
              }}>
              {/* Logo hero */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: windowWidth > 768 ? '140px' : '120px',
                background: '#FA7241',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px'
              }}>
                <img
                  src="/capysynth.png"
                  alt="CapySynth"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                    display: 'block',
                    transform: 'scale(1.2)',
                    transformOrigin: 'center'
                  }}
                />
                {/* Downloads ribbon — drawn as SVG so it clips to its OWN viewport.
                    A CSS overflow/clip-path ribbon leaks past the card edge under the
                    card's :hover transform on GPU compositing; SVG clipping is immune. */}
                <svg width="168" height="168" viewBox="0 0 168 168" style={{ position: 'absolute', top: 0, right: 0, zIndex: 10, pointerEvents: 'none' }}>
                  <defs>
                    <linearGradient id="capyDlGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <line x1="26" y1="-50" x2="218" y2="142" stroke="url(#capyDlGrad)" strokeWidth="28" />
                  <text x="122" y="46" fill="#fff" fontFamily="'Press Start 2P', monospace" fontSize="8" fontWeight="700" textAnchor="middle" dominantBaseline="central" letterSpacing="0" transform="rotate(45 122 46)">10K+ DOWNLOADS</text>
                </svg>
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '16px' : '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Project title box */}
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
                  CapySynth
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F472B6',
                  fontSize: '10px',
                  fontFamily: "'Press Start 2P', cursive",
                  marginBottom: '10px'
                }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  VST3 / AU Plugin
                </div>
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  marginBottom: '12px'
                }}>
                  A pixel-art capybara synth plugin for lofi, house, and synthwave producers. Ships with over 1000 presets.
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {['JUCE 8', 'C++17', 'VST3', 'AU', 'DSP'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      background: 'rgba(244, 114, 182, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(244, 114, 182, 0.3)',
                      color: '#F472B6'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="https://www.capysynth.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                    marginTop: 'auto'
                  }}
                >
                  Visit CapySynth.com
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* NeuroView Project */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-1') ? 'visible' : ''}`}
              data-animate-id="project-card-1"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.1s',
                display: 'flex',
                flexDirection: 'column'
              }}>
              {/* Image with overlay title */}
              <div style={{ position: 'relative', width: '100%', height: windowWidth > 768 ? '140px' : '120px', overflow: 'hidden' }}>
                <img
                  src="/neuroview.png"
                  alt="NeuroView 3D Brain Visualization"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                {/* Winner Ribbon */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '-35px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                  color: '#000',
                  padding: '6px 40px',
                  fontSize: '10px',
                  fontWeight: '700',
                  fontFamily: "'Press Start 2P', cursive",
                  transform: 'rotate(45deg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  zIndex: 10,
                  letterSpacing: '1px'
                }}>
                  WINNER
                </div>
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '16px' : '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Project title box */}
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
                  NeuroView
                </div>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F59E0B',
                  fontSize: '10px',
                  fontFamily: "'Press Start 2P', cursive",
                  marginBottom: '10px'
                }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  SwampHacks XI - Best User Design
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  marginBottom: '12px'
                }}>
                  An interactive 3D brain you can explore and study with others in real time.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {['Three.js', 'WebGL', 'NIfTI', 'React'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: '#22D3EE'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="https://devpost.com/software/neuroview"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                    marginTop: 'auto'
                  }}
                >
                  View on Devpost
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Strike Chess - flagship project */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-strike') ? 'visible' : ''}`}
              data-animate-id="project-card-strike"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.125s',
                display: 'flex',
                flexDirection: 'column'
              }}>
              {/* Logo hero - same dimensions as other project cards */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: windowWidth > 768 ? '140px' : '120px',
                background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f3a 50%, #1b2d5e 100%)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px'
              }}>
                <img
                  src="/strike-chess-logo.png"
                  alt="Strike Chess"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                    display: 'block',
                    filter: 'drop-shadow(0 0 14px rgba(59, 130, 246, 0.7))',
                    transform: 'scale(1.55)',
                    transformOrigin: 'center'
                  }}
                />
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '16px' : '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Project title box */}
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
                  Strike Chess
                </div>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F472B6',
                  fontSize: '10px',
                  fontFamily: "'Press Start 2P', cursive",
                  marginBottom: '10px'
                }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  Indie Game / Steam
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  marginBottom: '12px'
                }}>
                  Chess where both players move at once, with strike cards, a story campaign, and online multiplayer on Steam.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {['Godot 4.5', 'GDScript', 'C', 'Steamworks', 'Pixel Art'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: '#22D3EE'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="https://store.steampowered.com/app/4026780/Strike_Chess/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                    marginTop: 'auto'
                  }}
                >
                  View on Steam
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* KINEXIS Project */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-2') ? 'visible' : ''}`}
              data-animate-id="project-card-2"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.15s',
                display: 'flex',
                flexDirection: 'column'
              }}>
              {/* Image with overlay title */}
              <div style={{ position: 'relative', width: '100%', height: windowWidth > 768 ? '140px' : '120px', overflow: 'hidden' }}>
                <img
                  src="/kinexis-demo.gif"
                  alt="KINEXIS demo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                {/* Winner Ribbon */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '-35px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                  color: '#000',
                  padding: '6px 40px',
                  fontSize: '10px',
                  fontWeight: '700',
                  fontFamily: "'Press Start 2P', cursive",
                  transform: 'rotate(45deg)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  zIndex: 10,
                  letterSpacing: '1px'
                }}>
                  WINNER
                </div>
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '16px' : '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Project title box */}
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
                  KINEXIS
                </div>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F59E0B',
                  fontSize: '10px',
                  fontFamily: "'Press Start 2P', cursive",
                  marginBottom: '10px'
                }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  Knight Hacks VIII - Best App
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  marginBottom: '12px'
                }}>
                  Uses a webcam to measure a patient's range of motion during physical therapy.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {['JavaScript', 'OpenCV', 'Computer Vision'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: '#22D3EE'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="https://devpost.com/software/kinexis"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                    marginTop: 'auto'
                  }}
                >
                  View on Devpost
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Sentinel PHI Scanner */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-4') ? 'visible' : ''}`}
              data-animate-id="project-card-4"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.175s',
                display: 'flex',
                flexDirection: 'column'
              }}>
              {/* Image with overlay title */}
              <div style={{ position: 'relative', width: '100%', height: windowWidth > 768 ? '140px' : '120px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', overflow: 'hidden' }}>
                <img
                  src="/sentinel.png"
                  alt="Sentinel PHI Scanner Dashboard"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '16px' : '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Project title box */}
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
                  Sentinel PHI
                </div>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#10B981',
                  fontSize: '10px',
                  fontFamily: "'Press Start 2P', cursive",
                  marginBottom: '10px'
                }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Healthcare Project
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  marginBottom: '12px'
                }}>
                  Scans documents and flags any protected health information inside them.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  {['Python', 'Streamlit', 'HIPAA'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: '#22D3EE'
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href="https://github.com/CodingWithKantecki/sentinel-phi-scanner"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(59, 130, 246, 0.1)',
                    marginTop: 'auto'
                  }}
                >
                  View on GitHub
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="pixel-divider" style={{
        '--divider-color': 'rgba(59, 130, 246, 0.6)',
        '--divider-shadow': 'rgba(59, 130, 246, 0.25)'
      }} />

      {/* GitHub Activity Section */}
      <section id="github" className="section-padding" style={{
        padding: windowWidth > 768 ? '140px 48px 120px' : '80px 24px 60px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.05) 10%, rgba(16, 185, 129, 0.05) 90%, transparent 100%)',
        position: 'relative',
        zIndex: 10,
        marginTop: '60px',
        marginBottom: '60px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <GitHubContributionGraph username="CodingWithKantecki" />
        </div>
      </section>

      {/* Section Separator */}
      <div className="pixel-divider" style={{
        '--divider-color': 'rgba(59, 130, 246, 0.6)',
        '--divider-shadow': 'rgba(59, 130, 246, 0.25)'
      }} />

      {/* Contact Section */}
      <section id="contact" className="section-padding" style={{
        padding: windowWidth > 768 ? '80px 48px 80px' : '60px 24px 60px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        marginTop: '20px'
      }}>
        {/* Social Icons and Contact Button */}
        <div style={{
          display: 'flex',
          gap: windowWidth > 768 ? '24px' : '16px',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <a
            href="https://github.com/CodingWithKantecki"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffffff',
              opacity: 0.7,
              transition: 'all 0.3s',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/thomas-kantecki-836b39271/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffffff',
              opacity: 0.7,
              transition: 'all 0.3s',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffffff',
              opacity: 0.7,
              transition: 'all 0.3s',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>

          {/* Divider */}
          <div style={{
            width: windowWidth > 768 ? '2px' : '100%',
            height: windowWidth > 768 ? '40px' : '2px',
            background: 'rgba(255, 255, 255, 0.2)',
            margin: windowWidth > 768 ? '0 8px' : '8px 0'
          }} />

          {/* Download Resume Button */}
          <a href="/resume.pdf" download style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #22D3EE 100%)',
            borderRadius: '8px',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '17px',
            fontWeight: '600',
            transition: 'transform 0.3s, box-shadow 0.3s',
            boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(59, 130, 246, 0.3)';
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Resume/CV
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 48px',
        textAlign: 'center',
        borderTop: '1px solid rgba(59, 130, 246, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          opacity: 0.8
        }}>
          Made with{' '}
          <svg role="img" aria-label="love" width="14" height="12" viewBox="0 0 7 6" shapeRendering="crispEdges" style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
            <path fill="#3B82F6" d="M1 0h2v1H1zM4 0h2v1H4zM0 1h7v2H0zM1 3h5v1H1zM2 4h3v1H2zM3 5h1v1H3z" />
          </svg>
          {' '}by Thomas
        </p>
      </footer>
    </>
  );
}
