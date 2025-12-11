'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Portfolio() {
  const [heartbeat, setHeartbeat] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [logoSlideProgress, setLogoSlideProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [skillBinaryParticles, setSkillBinaryParticles] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(768); // Default to mobile breakpoint, will update on mount
  const [mounted, setMounted] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [expandedExp, setExpandedExp] = useState({});
  const [expandedProject, setExpandedProject] = useState({});
  const canvasRef = useRef(null);
  const skillCanvasRef = useRef(null);

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

    // Heartbeat animation
    const heartbeatInterval = setInterval(() => {
      setHeartbeat(prev => (prev + 1) % 100);
    }, 20);

    // Mouse position tracker with proximity effects
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Check if mouse is in skills section
      const skillsSection = document.getElementById('skills');
      if (skillsSection) {
        const rect = skillsSection.getBoundingClientRect();
        const inSkillsSection = e.clientY >= rect.top && e.clientY <= rect.bottom;
        
        // Clear particles if not in skills section
        if (!inSkillsSection) {
          setSkillBinaryParticles([]);
          return;
        }
      }
      
      // Update skill items based on proximity
      const skillItems = document.querySelectorAll('.skill-item');
      
      if (skillItems.length === 0) {
        return;
      }
      
      skillItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + 
          Math.pow(e.clientY - centerY, 2)
        );
        
        const threshold = 100;
        const gradientSweep = item.querySelector('.gradient-sweep');
        
        // Magnifying glass effect with larger radius
        const magnifyRadius = 200;
        
        if (distance < magnifyRadius) {
          // Calculate magnification based on distance
          const strength = 1 - (distance / magnifyRadius);
          // Use exponential curve for more dramatic effect at center
          const magnification = Math.pow(strength, 2);
          const scale = 1 + (magnification * 0.3); // Max 1.3x at center
          
          item.style.setProperty('transform', `scale(${scale})`, 'important');
          item.style.setProperty('opacity', String(0.7 + (magnification * 0.3)), 'important');
          item.style.setProperty('z-index', String(Math.floor(magnification * 10)), 'important');
          item.style.setProperty('transition', 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease-out', 'important');
          
          // Gradient effect for items within gradient radius
          if (distance < 100 && gradientSweep) {
            item.classList.add('hovering');
            // Gradient position based on distance for smoother effect
            const gradientProgress = 1 - (distance / 100);
            const position = -150 + (250 * gradientProgress);
            gradientSweep.style.backgroundPosition = `${position}% 0`;
          }
          
          // Create binary particles when very close
          if (distance < 60) { // Reduced trigger distance
            if (Math.random() < 0.08) { // Further reduced to 8% chance
              // Create particle at a random position along the text
              const textWidth = rect.width;
              const particleX = rect.left + Math.random() * textWidth;
              
              setSkillBinaryParticles(prev => {
                // Limit maximum particles to prevent lag
                if (prev.length >= 15) return prev; // Reduced from 30 to 15
                
                const newParticle = {
                  id: Date.now() + Math.random(),
                  x: particleX,
                  y: rect.bottom,
                  value: Math.random() > 0.5 ? '1' : '0',
                  velocity: 1 + Math.random() * 2,
                  opacity: 1,
                  rotation: Math.random() * Math.PI * 2,
                  rotationSpeed: (Math.random() - 0.5) * 0.1,
                  size: 12 + Math.random() * 6, // Smaller particles
                  color: '#8B5CF6'
                };
                return [...prev, newParticle];
              });
            }
          } else {
            item.classList.remove('hovering');
            if (gradientSweep) {
              gradientSweep.style.backgroundPosition = '-150% 0';
            }
          }
        } else {
          item.style.setProperty('transform', 'scale(1)', 'important');
          item.style.setProperty('opacity', '0.7', 'important');
          item.style.setProperty('z-index', '0', 'important');
          item.classList.remove('hovering');
          
          if (gradientSweep) {
            gradientSweep.style.backgroundPosition = '-150% 0';
          }
        }
      });
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

      // Clear particles when scrolling away from skills section
      const skillsSection = document.getElementById('skills');
      if (skillsSection) {
        const rect = skillsSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) {
          setSkillBinaryParticles([]);
        }
      }

      // Track current section for navigation indicator
      const sections = ['experience', 'projects', 'skills', 'contact'];
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
    setTimeout(() => {
      let currentIndex = 0;
      const typewriterInterval = setInterval(() => {
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
      clearTimeout(timer);
      clearInterval(heartbeatInterval);
      clearInterval(typewriterInterval);
      clearInterval(cursorInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
        return this.opacity > 0 && this.y < canvas.height;
      }
      
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px monospace`;
        ctx.fillStyle = '#8B5CF6';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#8B5CF6';
        ctx.fillText(this.value, 0, 0);
        ctx.restore();
      }
    }
    
    const animate = (currentTime) => {
      // Calculate delta time in seconds
      if (!lastFrameTime) {
        lastFrameTime = currentTime;
      }
      const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
      lastFrameTime = currentTime;

      // Clear canvas
      ctx.fillStyle = '#0a0118';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(138, 43, 226, 0.2)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      
      const centerY = canvas.height / 2 + 30; // Moved down by 30 pixels total
      
      // Draw the ECG line
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#8B5CF6';
      ctx.beginPath();
      
      // Only draw the visible portion of the line
      const startX = Math.max(0, Math.floor(trailStart));
      const endX = Math.floor(xPos);

      if (startX < endX - 1) { // Add small gap to prevent flicker
        ctx.moveTo(startX, centerY);

        // Draw the line from start to current position
        for (let x = startX; x <= endX; x++) {
          let y = centerY;
          
          // Check for heartbeat positions (every 500 pixels)
          // Shift pattern back by 25 pixels (half grid square) for perfect alignment
          const beatPosition = (x + 25) % 500;
          
          // Start spikes at position 100 instead of 0
          if (beatPosition > 100 && beatPosition < 180) {
            const progress = (beatPosition - 100) / 80;
            
            // Simple heartbeat pattern
            if (progress < 0.3) {
              // Quick up
              y = centerY - (progress / 0.3) * 250;
            } else if (progress < 0.5) {
              // Quick down past baseline
              y = centerY - 250 + ((progress - 0.3) / 0.2) * 280;
            } else if (progress < 0.6) {
              // Small return
              y = centerY + 30 - ((progress - 0.5) / 0.1) * 30;
            } else {
              // Flat
              y = centerY;
            }
          }
          
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      }
      
      // Draw glowing dot at current position (only when drawing forward)
      if (!isRetracting && startX < endX) {
        let currentY = centerY;
        
        // Use exact same calculation as line drawing
        const beatPosition = (xPos + 25) % 500;
        
        if (beatPosition > 100 && beatPosition < 180) {
          const progress = (beatPosition - 100) / 80;
          
          // Exact same heartbeat pattern as the line
          if (progress < 0.3) {
            // Quick up
            currentY = centerY - (progress / 0.3) * 250;
          } else if (progress < 0.5) {
            // Quick down past baseline
            currentY = centerY - 250 + ((progress - 0.3) / 0.2) * 280;
          } else if (progress < 0.6) {
            // Small return
            currentY = centerY + 30 - ((progress - 0.5) / 0.1) * 30;
          } else {
            // Flat
            currentY = centerY;
          }
        }
        
        ctx.fillStyle = '#8B5CF6';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(xPos, currentY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Update position based on current phase and delta time
      // Using fixed pixels per second for consistent visual speed
      if (!isRetracting) {
        // Moving forward
        xPos += pixelsPerSecond * deltaTime;

        // When we reach the end, start retracting
        if (xPos > canvas.width) {
          isRetracting = true;
        }
      } else {
        // Retracting - move the trail start forward with smooth acceleration
        const retractSpeed = pixelsPerSecond * deltaTime * 1.8; // Slightly slower for smoother effect
        trailStart += retractSpeed;

        // Create binary particles at the retracting edge
        if (Math.random() < 0.3) { // 30% chance each frame
          // Get the Y position at the current trail start
          let particleY = centerY;
          const beatPos = (trailStart + 25) % 500;
          if (beatPos > 100 && beatPos < 180) {
            const progress = (beatPos - 100) / 80;
            if (progress < 0.3) {
              particleY = centerY - (progress / 0.3) * 250;
            } else if (progress < 0.5) {
              particleY = centerY - 250 + ((progress - 0.3) / 0.2) * 280;
            } else if (progress < 0.6) {
              particleY = centerY + 30 - ((progress - 0.5) / 0.1) * 30;
            }
          }

          // Add some randomness to particle spawn position
          binaryParticles.push(new BinaryParticle(
            trailStart + (Math.random() - 0.5) * 20,
            particleY + (Math.random() - 0.5) * 10
          ));
        }

        // When fully retracted, reset for next cycle with smooth transition
        if (trailStart >= xPos - 10) { // Start reset slightly before to avoid jump
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
      
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update particles physics separately
  useEffect(() => {
    const interval = setInterval(() => {
      setSkillBinaryParticles(prev => {
        // Get Skills section boundary
        const skillsSection = document.getElementById('skills');
        let maxY = window.innerHeight;
        
        if (skillsSection) {
          const rect = skillsSection.getBoundingClientRect();
          maxY = rect.bottom - 20; // Stop 20px before section ends
        }
        
        return prev.filter(particle => {
          particle.y += particle.velocity;
          particle.velocity += 0.05;
          particle.opacity -= 0.015; // Faster fade out (was 0.008)
          particle.rotation += particle.rotationSpeed;
          
          // Remove particles that go below Skills section or fade out
          return particle.opacity > 0 && particle.y < maxY;
        });
      });
    }, 33); // ~30fps (reduced from 60fps)

    return () => clearInterval(interval);
  }, []);

  // Skill binary particles animation
  useEffect(() => {
    const canvas = skillCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let animationId;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get Skills section boundary for clipping
      const skillsSection = document.getElementById('skills');
      if (skillsSection) {
        const rect = skillsSection.getBoundingClientRect();
        
        // Set clipping region to Skills section
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, rect.top, canvas.width, rect.height);
        ctx.clip();
      }
      
      // Draw all particles
      skillBinaryParticles.forEach((particle) => {
        // Draw the binary digit
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.font = `bold ${particle.size}px monospace`;
        ctx.fillStyle = particle.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Removed shadow for better performance
        ctx.fillText(particle.value, 0, 0);
        ctx.restore();
      });
      
      if (skillsSection) {
        ctx.restore(); // Restore clipping
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [skillBinaryParticles]);

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
    { name: 'Projects', href: '#projects', isExternal: false },
    { name: 'Skills', href: '#skills', isExternal: false }
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
      style.background = 'linear-gradient(90deg, #8B5CF6 0%, #06B6D4 50%, #10B981 100%)';
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0a0118;
          color: #ffffff;
          overflow-x: hidden;
          max-width: 100vw;
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
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.8);
          }
          100% {
            opacity: 0;
            filter: blur(15px);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0);
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
          background: #8B5CF6;
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
            background: rgba(10, 1, 24, 0.98);
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
            font-size: 24px !important;
          }

          .hero-subtitle {
            font-size: 18px !important;
          }

          .hero-description {
            font-size: 14px !important;
          }

          .section-padding {
            padding: 60px 24px !important;
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
          }
        }

        .vibey-gradient {
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        .heartbeat-glow {
          animation: pulse 1s ease-in-out infinite;
        }

        .skill-item {
          position: relative;
          overflow: hidden;
        }

        .skill-item {
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease-out, z-index 0s;
          position: relative;
          z-index: 0;
          transform-origin: center;
          will-change: transform;
        }

        .skill-item .gradient-sweep {
          background: linear-gradient(90deg, 
            transparent 0%, 
            #8B5CF6 25%, 
            #06B6D4 50%, 
            #10B981 75%, 
            transparent 100%
          );
          background-size: 300% 100%;
          background-position: -150% 0;
          transition: background-position 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s;
          opacity: 0;
        }
        
        .skill-item.hovering .gradient-sweep {
          opacity: 1;
        }
        
        .skill-item:hover .gradient-sweep {
          background-position: 100% 0 !important;
          opacity: 1 !important;
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

        /* Card hover effects - instant response, no delay */
        .hover-card {
          transition: transform 0.12s ease-out 0s,
                      box-shadow 0.12s ease-out 0s,
                      border-color 0.12s ease-out 0s !important;
          will-change: transform;
          backface-visibility: hidden;
        }

        .hover-card:hover {
          transform: translate3d(0, -6px, 0) !important;
          box-shadow: 0 8px 16px rgba(139, 92, 246, 0.35);
          border-color: rgba(139, 92, 246, 0.5) !important;
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
              rgba(139, 92, 246, ${scrollProgress * 0.1}),
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
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
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

      {/* ECG Background Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '10px',
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          filter: `blur(${scrollProgress * 15}px)`,
          opacity: 1 - (scrollProgress * 0.7),
          transition: 'filter 0.3s ease-out, opacity 0.3s ease-out'
        }}
      />
      
      {/* Skill Binary Particles Canvas */}
      <canvas 
        ref={skillCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
          pointerEvents: 'none'
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
        background: 'linear-gradient(to bottom, rgba(10, 1, 24, 0.9) 0%, transparent 100%)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.15s ease-in'
      }}>
        <div style={{
          fontSize: windowWidth > 768 ? '24px' : '20px',
          fontWeight: '600',
          color: '#8B5CF6',
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
            background: 'rgba(10, 1, 24, 0.95)',
            borderLeft: '2px solid rgba(139, 92, 246, 0.3)',
            borderTop: '2px solid rgba(139, 92, 246, 0.3)',
            borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
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
              stroke="#8B5CF6"
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
              background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.6), transparent)',
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
              background: 'linear-gradient(135deg, rgba(10, 1, 24, 0.98) 0%, rgba(30, 20, 50, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderLeft: '2px solid rgba(139, 92, 246, 0.3)',
              borderTop: '2px solid rgba(139, 92, 246, 0.3)',
              borderBottom: '2px solid rgba(139, 92, 246, 0.3)',
              borderTopLeftRadius: '16px',
              borderBottomLeftRadius: '16px',
              padding: '20px 20px 20px 30px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '-10px 0 40px rgba(139, 92, 246, 0.2)',
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
              borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
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
                      background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
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
                      background: isActive ? '#8B5CF6' : 'transparent',
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
                    background: isActive ? '#8B5CF6' : 'transparent',
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
        <div style={{
          textAlign: 'center',
          animation: 'fadeInUp 1s ease-out',
          maxWidth: '800px',
          padding: '0 24px',
          position: 'relative'
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
                  stroke="#8B5CF6"
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
                stroke="#3B82F6"
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
                stroke="#3B82F6"
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
                stroke="#3B82F6"
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
                stroke="#3B82F6"
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
                  <stop offset="0%" style={{stopColor: '#8B5CF6', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                </linearGradient>
              </defs>
            </svg>

            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              padding: '3px',
              opacity: 0,
              animation: 'fadeIn 0.5s ease-out forwards',
              animationDelay: '0.8s'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#0a0118',
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

          <h1 style={{
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
                color: '#8B5CF6',
                fontWeight: '300'
              }}>|</span>
            )}
          </h1>
          
          <p className="hero-subtitle" style={{
            fontSize: windowWidth > 768 ? '24px' : '18px',
            color: '#8B5CF6',
            marginBottom: '16px',
            opacity: showSubtitle ? 1 : 0,
            transform: showSubtitle ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out',
            fontWeight: '300'
          }}>
            Bridging Healthcare & Technology
          </p>
          
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
                fontSize: '24px',
                color: '#8B5CF6',
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
              fontSize: windowWidth > 768 ? '32px' : '24px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#8B5CF6',
              textAlign: 'center'
            }}>
              Professional Experience
            </h3>
            <p style={{
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '48px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto 48px'
            }}>
              A comprehensive overview of my professional journey from start to finish. I&apos;ve gotten to work in a variety of different environments - startups, non-profits, large tech companies, and even university positions!
            </p>

            {/* Timeline container */}
            <div style={{ position: 'relative', paddingLeft: windowWidth > 768 ? '32px' : '20px' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: windowWidth > 768 ? '6px' : '4px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                background: 'linear-gradient(180deg, #EF4444 0%, #8B5CF6 25%, #10B981 60%, #F59E0B 100%)'
              }} />

              {/* Knight Hacks */}
              <div
                className={`animate-on-scroll hover-card ${visibleElements.has('exp-card-kh') ? 'visible' : ''}`}
                data-animate-id="exp-card-kh"
                style={{
                  position: 'relative',
                  marginBottom: '32px',
                  '--stagger-delay': '0.02s'
                }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: windowWidth > 768 ? '-29px' : '-18px',
                  top: '12px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  border: '3px solid #0f172a',
                  boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)'
                }} />

                {/* Card */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.95)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '200px',
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
                    {/* Title overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px'
                    }}>
                      <h4 style={{ fontSize: windowWidth > 768 ? '24px' : '20px', fontWeight: '700', color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        Knight Hacks Member
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
                      Active member and Fall 2025 Mentee at UCF&apos;s premier software development organization. Won &quot;Best App Development Hack&quot; at Knight Hacks VIII with KINEXIS, a physical therapy tracking platform.
                    </p>

                    {/* Skills */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '16px'
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

                    {/* Show More Details Button */}
                    <button
                      onClick={() => setExpandedExp(prev => ({ ...prev, knighthacks: !prev.knighthacks }))}
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
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h5 style={{ color: '#EF4444', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#EF4444', borderRadius: '2px' }} />
                          Achievements & Activities
                        </h5>
                        <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '0' }}>
                          <li>Won &quot;Best App Development Hack&quot; at Knight Hacks VIII with KINEXIS</li>
                          <li>Fall 2025 Mentee - receiving guidance from experienced developers</li>
                          <li>Participating in workshops, hackathons, and networking events</li>
                          <li>Building skills in collaborative software development</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AJR Publishing */}
              <div
                className={`animate-on-scroll hover-card ${visibleElements.has('exp-card-0') ? 'visible' : ''}`}
                data-animate-id="exp-card-0"
                style={{
                  position: 'relative',
                  marginBottom: '32px',
                  '--stagger-delay': '0.05s'
                }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: windowWidth > 768 ? '-29px' : '-18px',
                  top: '12px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#8B5CF6',
                  border: '3px solid #0f172a',
                  boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.3)'
                }} />

                {/* Card */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.95)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '200px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(30, 41, 59, 1) 100%)',
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
                        <svg width="14" height="14" fill="none" stroke="#8B5CF6" viewBox="0 0 24 24">
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

                    {/* Skills */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      {['Data Analysis', 'A/B Testing', 'Tableau', 'Ad Optimization', 'ROI Tracking'].map(skill => (
                        <span key={skill} style={{
                          fontSize: '11px',
                          padding: '5px 12px',
                          background: 'rgba(139, 92, 246, 0.15)',
                          borderRadius: '16px',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          color: '#A78BFA'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Show More Details Button */}
                    <button
                      onClick={() => setExpandedExp(prev => ({ ...prev, ajr: !prev.ajr }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '8px',
                        color: '#A78BFA',
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
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <h5 style={{ color: '#8B5CF6', fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '3px', height: '16px', background: '#8B5CF6', borderRadius: '2px' }} />
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

              {/* Lacoste */}
              <div
                className={`animate-on-scroll hover-card ${visibleElements.has('exp-card-1') ? 'visible' : ''}`}
                data-animate-id="exp-card-1"
                style={{
                  position: 'relative',
                  marginBottom: '32px',
                  '--stagger-delay': '0.1s'
                }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: windowWidth > 768 ? '-29px' : '-18px',
                  top: '12px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '3px solid #0f172a',
                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)'
                }} />

                {/* Card */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.95)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '200px',
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

                    {/* Skills */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '16px'
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

                    {/* Show More Details Button */}
                    <button
                      onClick={() => setExpandedExp(prev => ({ ...prev, lacoste: !prev.lacoste }))}
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
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
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

              {/* Sharelife Vacation */}
              <div
                className={`animate-on-scroll hover-card ${visibleElements.has('exp-card-2') ? 'visible' : ''}`}
                data-animate-id="exp-card-2"
                style={{
                  position: 'relative',
                  marginBottom: '32px',
                  '--stagger-delay': '0.15s'
                }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: windowWidth > 768 ? '-29px' : '-18px',
                  top: '12px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#F59E0B',
                  border: '3px solid #0f172a',
                  boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.3)'
                }} />

                {/* Card */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.95)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  {/* Image area */}
                  <div style={{
                    width: '100%',
                    height: windowWidth > 768 ? '280px' : '200px',
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

                    {/* Skills */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '16px'
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

                    {/* Show More Details Button */}
                    <button
                      onClick={() => setExpandedExp(prev => ({ ...prev, sharelife: !prev.sharelife }))}
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
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
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
              color: '#8B5CF6',
              borderBottom: '2px solid rgba(139, 92, 246, 0.2)',
              paddingBottom: '12px'
            }}>
              Education
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                className={`animate-on-scroll hover-card ${visibleElements.has('edu-card-1') ? 'visible' : ''}`}
                data-animate-id="edu-card-1"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
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
                    background: '#fff'
                  }}>
                    <img
                      src="/ucf.png"
                      alt="UCF Logo"
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Bachelor&apos;s Degree in Health Informatics
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        University of Central Florida (UCF) • Orlando, FL
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
                        GPA: 3.6 • KnightHacks • Healthcare Case Club
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Jan 2024 - Present
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card ${visibleElements.has('edu-card-2') ? 'visible' : ''}`}
                data-animate-id="edu-card-2"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
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
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        Associate&apos;s Degree in General Studies
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                        Valencia College • Orlando, FL
                      </p>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px'
                    }}>
                      Aug 2021 - Aug 2023
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`animate-on-scroll hover-card ${visibleElements.has('edu-card-3') ? 'visible' : ''}`}
                data-animate-id="edu-card-3"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
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
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      padding: '4px 12px',
                      borderRadius: '4px'
                    }}>
                      Aug 2017 - May 2021
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 25%, rgba(139, 92, 246, 0.3) 75%, transparent 100%)',
        maxWidth: '600px',
        margin: '0 auto'
      }} />

      {/* Projects Section */}
      <section id="projects" style={{
        padding: windowWidth > 768 ? '140px 48px 120px' : '60px 12px 40px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.05) 10%, rgba(139, 92, 246, 0.05) 90%, transparent 100%)',
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
            boxSizing: 'border-box'
          }}>
            {/* KINEXIS Project */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-1') ? 'visible' : ''}`}
              data-animate-id="project-card-1"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.1s'
              }}>
              {/* Image with overlay title */}
              <div style={{ position: 'relative', width: '100%', height: windowWidth > 768 ? '180px' : '140px' }}>
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
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: windowWidth > 768 ? '18px' : '16px',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  KINEXIS
                </div>
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '20px' : '16px' }}>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F59E0B',
                  fontSize: '13px',
                  marginBottom: '12px'
                }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Knight Hacks VIII - Winner
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  marginBottom: '16px'
                }}>
                  Award-winning physical therapy tracking platform using computer vision for objective PT measurements.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {['JavaScript', 'OpenCV', 'Computer Vision'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: '#22D3EE'
                    }}>
                      {tech}
                    </span>
                  ))}
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#A78BFA'
                  }}>
                    +1
                  </span>
                </div>
                {/* View Details button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedProject(prev => ({ ...prev, kinexis: !prev.kinexis })); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#10B981',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    paddingTop: '12px',
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(139, 92, 246, 0.1)'
                  }}
                >
                  {expandedProject.kinexis ? 'Hide Details' : 'View Details'}
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ transform: expandedProject.kinexis ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Expanded Details */}
                {expandedProject.kinexis && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h5 style={{ color: '#10B981', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                      About This Project
                    </h5>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
                      KINEXIS is a physical therapy tracking platform that uses computer vision to provide objective measurements of patient movements. Built at Knight Hacks VIII, it won &quot;Best App Development Hack&quot;.
                    </p>
                    <ul style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '16px' }}>
                      <li>Real-time pose detection and angle measurement using OpenCV</li>
                      <li>Progress tracking dashboard for patients and therapists</li>
                      <li>Exportable reports for healthcare documentation</li>
                    </ul>
                    <a
                      href="https://devpost.com/software/kinexis"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#10B981',
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
                  </div>
                )}
              </div>
            </div>

            {/* Strike Chess Project */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-2') ? 'visible' : ''}`}
              data-animate-id="project-card-2"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.2s'
              }}>
              {/* Image with overlay title */}
              <div style={{ position: 'relative', width: '100%', height: windowWidth > 768 ? '180px' : '140px' }}>
                <img
                  src="/strike-chess.png"
                  alt="Strike Chess gameplay"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: windowWidth > 768 ? '18px' : '16px',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  Strike Chess
                </div>
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '20px' : '16px' }}>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#F59E0B',
                  fontSize: '13px',
                  marginBottom: '12px'
                }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  In Development
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  marginBottom: '16px'
                }}>
                  A simultaneous-action tactical strategy game combining classic chess with secret planning.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {['Godot', 'GDScript', 'Game Design'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: '#22D3EE'
                    }}>
                      {tech}
                    </span>
                  ))}
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#A78BFA'
                  }}>
                    +1
                  </span>
                </div>
                {/* View Details button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedProject(prev => ({ ...prev, strikechess: !prev.strikechess })); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#10B981',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    paddingTop: '12px',
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(139, 92, 246, 0.1)'
                  }}
                >
                  {expandedProject.strikechess ? 'Hide Details' : 'View Details'}
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ transform: expandedProject.strikechess ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Expanded Details */}
                {expandedProject.strikechess && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h5 style={{ color: '#10B981', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                      About This Project
                    </h5>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
                      Strike Chess is a unique twist on traditional chess where both players secretly plan their moves simultaneously, then watch them resolve at the same time. This creates exciting moments of strategy and anticipation.
                    </p>
                    <ul style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '16px' }}>
                      <li>Simultaneous turn-based gameplay with secret planning phase</li>
                      <li>Built with Godot Engine using GDScript</li>
                      <li>Custom game logic for move collision and resolution</li>
                    </ul>
                    <span style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
                      Currently in active development
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sentinel PHI Scanner */}
            <div
              className={`animate-on-scroll hover-card ${visibleElements.has('project-card-3') ? 'visible' : ''}`}
              data-animate-id="project-card-3"
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                overflow: 'hidden',
                '--stagger-delay': '0.3s'
              }}>
              {/* Image with overlay title */}
              <div style={{ position: 'relative', width: '100%', height: windowWidth > 768 ? '180px' : '140px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', overflow: 'hidden' }}>
                <img
                  src="/sentinel.png"
                  alt="Sentinel PHI Scanner Dashboard"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: windowWidth > 768 ? '18px' : '16px',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  Sentinel PHI Scanner
                </div>
              </div>
              {/* Card content */}
              <div style={{ padding: windowWidth > 768 ? '20px' : '16px' }}>
                {/* Event badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#10B981',
                  fontSize: '13px',
                  marginBottom: '12px'
                }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Healthcare Project
                </div>
                {/* Description */}
                <p style={{
                  color: '#cbd5e1',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  marginBottom: '16px'
                }}>
                  Python tool to identify Protected Health Information (PHI) in documents using pattern matching.
                </p>
                {/* Tech pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {['Python', 'Streamlit', 'HIPAA'].map(tech => (
                    <span key={tech} style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      color: '#22D3EE'
                    }}>
                      {tech}
                    </span>
                  ))}
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#A78BFA'
                  }}>
                    +1
                  </span>
                </div>
                {/* View Details button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedProject(prev => ({ ...prev, sentinel: !prev.sentinel })); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#10B981',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    paddingTop: '12px',
                    paddingBottom: '0',
                    borderTop: '1px solid rgba(139, 92, 246, 0.1)'
                  }}
                >
                  {expandedProject.sentinel ? 'Hide Details' : 'View Details'}
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ transform: expandedProject.sentinel ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Expanded Details */}
                {expandedProject.sentinel && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <h5 style={{ color: '#10B981', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                      About This Project
                    </h5>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
                      Sentinel is an AI-powered tool for identifying Protected Health Information (PHI) in documents to ensure HIPAA compliance. It uses Google&apos;s Gemini AI to detect all 18 HIPAA identifiers.
                    </p>
                    <ul style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '16px' }}>
                      <li>Detects all 18 HIPAA identifiers including subtle references</li>
                      <li>AI-powered contextual understanding (&quot;the patient&quot;, &quot;her daughter&quot;)</li>
                      <li>Dashboard with analytics and scan history</li>
                      <li>Supports TXT, PDF, DOC, and DOCX files</li>
                    </ul>
                    <a
                      href="https://github.com/CodingWithKantecki/sentinel-phi-scanner"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#10B981',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      View on GitHub
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 25%, rgba(16, 185, 129, 0.3) 75%, transparent 100%)',
        maxWidth: '600px',
        margin: '0 auto'
      }} />

      {/* Skills Section */}
      <section id="skills" className="section-padding" style={{
        padding: windowWidth > 768 ? '140px 48px 120px' : '80px 24px 60px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.05) 10%, rgba(16, 185, 129, 0.05) 90%, transparent 100%)',
        position: 'relative',
        zIndex: 10,
        marginTop: '60px',
        marginBottom: '60px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            className={`section-header ${visibleElements.has('skills-header') ? 'visible' : ''}`}
            data-animate-id="skills-header"
            style={{
              fontSize: windowWidth > 768 ? '36px' : '28px',
              fontWeight: '600',
              marginBottom: windowWidth > 768 ? '60px' : '40px',
              textAlign: 'center'
            }}>
            Skills
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 24px',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '40px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}>
            {[
              'Python',
              'MySQL',
              'Git',
              'Pygame',
              'Godot',
              'Linux',
              'Claude AI',
              'ChatGPT',
              'Tableau',
              'SOC 2',
              'HITRUST',
              'ICD-10',
              'CPT',
              'HCPCS',
              'SNOMED',
              'HL7 FHIR',
              'LOINC',
              'OpenCV',
              'Render',
              'SQLite',
              'ThreeJS',
              'MediaPipe'
            ].map((skill, index) => (
              <span
                key={skill}
                className="skill-item"
                data-index={index}
                style={{
                  fontSize: '18px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'inline-block',
                  color: '#ffffff',
                  opacity: 0.7,
                  animation: `fadeInUp 0.6s ease-out ${index * 0.03}s both`
                }}
              >
                <span style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'inline-block'
                }}>
                  {skill}
                </span>
                <span 
                  className="gradient-sweep"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    pointerEvents: 'none',
                    zIndex: 3
                  }}
                  data-text={skill}
                >
                  {skill}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 25%, rgba(139, 92, 246, 0.3) 75%, transparent 100%)',
        maxWidth: '600px',
        margin: '0 auto'
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
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
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
            <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
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
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </a>

          {/* Divider */}
          <div style={{
            width: windowWidth > 768 ? '1px' : '100%',
            height: windowWidth > 768 ? '28px' : '1px',
            background: 'rgba(255, 255, 255, 0.2)',
            margin: windowWidth > 768 ? '0 8px' : '8px 0'
          }} />

          {/* Download Resume Button */}
          <a href="/resume.pdf" download style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            borderRadius: '8px',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'transform 0.3s, box-shadow 0.3s',
            boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(139, 92, 246, 0.3)';
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
        borderTop: '1px solid rgba(139, 92, 246, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          opacity: 0.8
        }}>
          Made with <span style={{ color: '#A855F7' }}>♥</span> by Thomas
        </p>
      </footer>
    </>
  );
}