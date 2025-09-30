'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Portfolio() {
  const [heartbeat, setHeartbeat] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [skillBinaryParticles, setSkillBinaryParticles] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const canvasRef = useRef(null);
  const skillCanvasRef = useRef(null);
  
  const fullText = "Thomas Kantecki";

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial width

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

    // Scroll listener for background effects
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(scrollY / windowHeight, 1);
      setScrollProgress(progress);
      
      // Clear particles when scrolling away from skills section
      const skillsSection = document.getElementById('skills');
      if (skillsSection) {
        const rect = skillsSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) {
          setSkillBinaryParticles([]);
        }
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
    const speed = 8; // pixels per frame
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
      
      update() {
        this.y += this.velocity;
        this.velocity += 0.1; // Gravity
        this.opacity -= 0.01;
        this.rotation += this.rotationSpeed;
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
      const startX = Math.max(0, trailStart);
      const endX = xPos;
      
      if (startX < endX) {
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
      
      // Update position based on current phase
      if (!isRetracting) {
        // Moving forward
        xPos += speed;
        
        // When we reach the end, start retracting
        if (xPos > canvas.width) {
          isRetracting = true;
        }
      } else {
        // Retracting - move the trail start forward
        const oldTrailStart = trailStart;
        trailStart += speed * 2; // Retract faster for visual effect
        
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
        
        // When fully retracted, reset for next cycle
        if (trailStart >= xPos) {
          xPos = 0;
          trailStart = 0;
          isRetracting = false;
        }
      }
      
      // Update and draw binary particles
      binaryParticles = binaryParticles.filter(particle => {
        const alive = particle.update();
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

  const navItems = ['Experience', 'Projects', 'Skills', 'Contact'];

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

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
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
          position: relative;
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
          left: 0,
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
        background: 'linear-gradient(to bottom, rgba(10, 1, 24, 0.9) 0%, transparent 100%)'
      }}>
        <div style={{
          fontSize: windowWidth > 768 ? '24px' : '20px',
          fontWeight: '600',
          color: '#8B5CF6'
        }}>
          kantecki.dev
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-nav" style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'center'
        }}>
          {navItems.map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '400',
                opacity: 0.8,
                transition: 'opacity 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              {item}
            </a>
          ))}
          <div style={{
            display: 'flex',
            gap: '20px'
          }}>
            <a href="https://github.com/CodingWithKantecki" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', opacity: 0.8 }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/thomas-kantecki-836b39271/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', opacity: 0.8 }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://linktr.ee/CodingWithKantecki" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', opacity: 0.8 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </a>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', opacity: 0.8 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`} style={{
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)'
        }}>
          {navItems.map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div style={{
            display: 'flex',
            gap: '32px',
            marginTop: '32px'
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
            <a href="https://linktr.ee/CodingWithKantecki" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
          padding: '0 24px'
        }}>
          {/* Profile Image */}
          <div className="profile-image" style={{
            width: windowWidth > 768 ? '200px' : '150px',
            height: windowWidth > 768 ? '200px' : '150px',
            margin: '0 auto 32px',
            position: 'relative'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              padding: '3px'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#0a0118',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {/* Replace 'headshot.jpg' with your actual image filename */}
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
            Health Informatics • AI Engineer • Full-Stack Developer
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
        padding: windowWidth > 768 ? '120px 48px' : '60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '600',
          marginBottom: '60px',
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
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '32px',
              color: '#8B5CF6',
              borderBottom: '2px solid rgba(139, 92, 246, 0.2)',
              paddingBottom: '12px'
            }}>
              Professional Experience
            </h3>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              marginBottom: '24px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                    Sales Associate
                  </h4>
                  <p style={{ color: '#8B5CF6', fontSize: '16px' }}>
                    Lacoste • Orlando, FL
                  </p>
                </div>
                <span style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '4px'
                }}>
                  Mar 2023 - Jul 2023
                </span>
              </div>
              <ul style={{ 
                color: '#cbd5e1', 
                fontSize: '14px', 
                lineHeight: '1.8',
                paddingLeft: '20px',
                marginTop: '12px'
              }}>
                <li>Provided exceptional customer service in luxury retail environment</li>
                <li>Achieved sales targets through product knowledge and client relationships</li>
                <li>Maintained visual merchandising standards and inventory management</li>
                <li>Collaborated with team to enhance store performance and customer experience</li>
              </ul>
            </div>
            
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              marginBottom: '24px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                    Administrative Assistant
                  </h4>
                  <p style={{ color: '#8B5CF6', fontSize: '16px' }}>
                    Sharelife Vacation • Orlando, FL
                  </p>
                </div>
                <span style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '4px'
                }}>
                  Apr 2021 - Aug 2022
                </span>
              </div>
              <ul style={{ 
                color: '#cbd5e1', 
                fontSize: '14px', 
                lineHeight: '1.8',
                paddingLeft: '20px',
                marginTop: '12px'
              }}>
                <li>Processed and checked in approximately 100 guests daily</li>
                <li>Drafted contracts and handled payments using Authorize.net system</li>
                <li>Welcomed virtual guests, collected sensitive information, and ran credit checks using Experian</li>
                <li>Maintained office supplies, handled payroll, and distributed weekly sales reports</li>
                <li>Managed office administrative duties and supported overall business operations</li>
              </ul>
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
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                      Bachelor&apos;s Degree in Health Informatics
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                      University of Central Florida (UCF) • Orlando, FL
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

              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
      </section>

      {/* Projects Section */}
      <section id="projects" className="section-padding" style={{
          padding: windowWidth > 768 ? '120px 48px' : '60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '600',
          marginBottom: '60px',
          textAlign: 'center'
        }}>
          Featured Projects
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: windowWidth > 768 ? '48px' : '32px',
          maxWidth: windowWidth > 768 ? '1000px' : '100%',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Board of War Project */}
          <div className="project-card" style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '16px',
            padding: windowWidth > 768 ? '48px' : '24px',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            animation: `fadeInUp 0.8s ease-out both`,
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              display: 'flex',
              alignItems: windowWidth > 768 ? 'center' : 'flex-start',
              flexDirection: windowWidth > 768 ? 'row' : 'column',
              marginBottom: windowWidth > 768 ? '24px' : '20px',
              gap: windowWidth > 768 ? '16px' : '12px'
            }}>
              <h3 style={{
                fontSize: windowWidth > 768 ? '32px' : '24px',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2'
              }}>
                Board of War™
              </h3>
              <span style={{
                fontSize: '12px',
                padding: '4px 10px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                borderRadius: '4px',
                color: '#ffffff',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                alignSelf: windowWidth > 768 ? 'auto' : 'flex-start'
              }}>
                FEATURED
              </span>
            </div>
            
            <p style={{
              color: '#ffffff',
              fontSize: windowWidth > 768 ? '18px' : '16px',
              marginBottom: windowWidth > 768 ? '24px' : '20px',
              lineHeight: '1.6'
            }}>
              A military-themed strategic chess game featuring advanced AI opponents, 
              powerup systems, and an immersive story campaign mode.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
              gap: windowWidth > 768 ? '24px' : '20px',
              marginBottom: windowWidth > 768 ? '32px' : '24px'
            }}>
              <div>
                <h4 style={{
                  fontSize: windowWidth > 768 ? '16px' : '15px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#8B5CF6'
                }}>
                  Key Features
                </h4>
                <ul style={{
                  color: '#94a3b8',
                  fontSize: windowWidth > 768 ? '14px' : '13px',
                  lineHeight: windowWidth > 768 ? '1.8' : '1.7',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li>9-zone story campaign with unique AI personalities</li>
                  <li>14 military-themed powerups (airstrikes, shields, etc.)</li>
                  <li>Arasan chess engine (800-2800 ELO difficulty)</li>
                  <li>Cinematic cutscenes and dialogue system</li>
                  <li>Multiple game modes: Story, Sandbox, Classic</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{
                  fontSize: windowWidth > 768 ? '16px' : '15px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#8B5CF6'
                }}>
                  Technical Highlights
                </h4>
                <ul style={{
                  color: '#94a3b8',
                  fontSize: windowWidth > 768 ? '14px' : '13px',
                  lineHeight: windowWidth > 768 ? '1.8' : '1.7',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li>Custom game engine built with Pygame</li>
                  <li>Advanced AI with adjustable difficulty</li>
                  <li>Particle effects and animations</li>
                  <li>Save/load system with progress tracking</li>
                  <li>Original soundtracks and SFX</li>
                </ul>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: windowWidth > 768 ? '8px' : '6px'
            }}>
              {['Python', 'Pygame', 'AI/ML', 'Game Design', 'Chess Engine', 'State Management', 'Audio Engineering'].map(tech => (
                <span key={tech} style={{
                  fontSize: windowWidth > 768 ? '12px' : '11px',
                  padding: windowWidth > 768 ? '6px 14px' : '4px 10px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  whiteSpace: 'nowrap'
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Sentinel PHI Scanner Project */}
          <div className="project-card" style={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '16px',
            padding: windowWidth > 768 ? '48px' : '24px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            animation: `fadeInUp 0.8s ease-out 0.2s both`,
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              display: 'flex',
              alignItems: windowWidth > 768 ? 'center' : 'flex-start',
              flexDirection: windowWidth > 768 ? 'row' : 'column',
              marginBottom: windowWidth > 768 ? '24px' : '20px',
              gap: windowWidth > 768 ? '16px' : '12px'
            }}>
              <h3 style={{
                fontSize: windowWidth > 768 ? '32px' : '24px',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2'
              }}>
                Sentinel PHI Scanner
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  borderRadius: '4px',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  HEALTHCARE
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                  borderRadius: '4px',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  HACKATHON
                </span>
                <a 
                  href="https://github.com/CodingWithKantecki/sentinel-phi-scanner" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '14px',
                    padding: '4px 12px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  VIEW CODE
                </a>
              </div>
            </div>
            
            <p style={{
              color: '#ffffff',
              fontSize: windowWidth > 768 ? '18px' : '16px',
              marginBottom: windowWidth > 768 ? '24px' : '20px',
              lineHeight: '1.6'
            }}>
              A Python-based tool designed to identify potential Protected Health Information (PHI) 
              in text documents using pattern matching and regular expressions.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth > 768 ? 'repeat(2, 1fr)' : '1fr',
              gap: windowWidth > 768 ? '24px' : '20px',
              marginBottom: windowWidth > 768 ? '32px' : '24px'
            }}>
              <div>
                <h4 style={{
                  fontSize: windowWidth > 768 ? '16px' : '15px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#10B981'
                }}>
                  Key Learning Outcomes
                </h4>
                <ul style={{
                  color: '#94a3b8',
                  fontSize: windowWidth > 768 ? '14px' : '13px',
                  lineHeight: windowWidth > 768 ? '1.8' : '1.7',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li>Hands-on experience with healthcare data standards</li>
                  <li>Understanding of HIPAA requirements and compliance</li>
                  <li>Challenges in automated sensitive data detection</li>
                  <li>Enterprise-grade DLP solution requirements</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{
                  fontSize: windowWidth > 768 ? '16px' : '15px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#10B981'
                }}>
                  Technical Skills
                </h4>
                <ul style={{
                  color: '#94a3b8',
                  fontSize: windowWidth > 768 ? '14px' : '13px',
                  lineHeight: windowWidth > 768 ? '1.8' : '1.7',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  <li>Python development for text processing</li>
                  <li>Regular expression pattern design</li>
                  <li>Healthcare domain knowledge application</li>
                  <li>Git version control and documentation</li>
                </ul>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: windowWidth > 768 ? '8px' : '6px'
            }}>
              {['Python', 'Streamlit', 'Regex', 'HIPAA', 'PHI Detection', 'Healthcare IT', 'Text Processing', 'Data Security'].map(tech => (
                <span key={tech} style={{
                  fontSize: windowWidth > 768 ? '12px' : '11px',
                  padding: windowWidth > 768 ? '6px 14px' : '4px 10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  whiteSpace: 'nowrap'
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section-padding" style={{
        padding: windowWidth > 768 ? '120px 48px' : '60px 24px',
        background: 'rgba(30, 41, 59, 0.3)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '600',
            marginBottom: '60px',
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
              'Linux',
              'SOC 2',
              'HITRUST',
              'ICD-10',
              'CPT',
              'HCPCS',
              'SNOMED',
              'HL7 FHIR',
              'LOINC'
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


      {/* Contact Section */}
      <section id="contact" className="section-padding" style={{
        padding: windowWidth > 768 ? '120px 48px' : '60px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '600',
          marginBottom: '24px'
        }}>
          Let&apos;s Build Something Amazing
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          marginBottom: '48px',
          maxWidth: '600px',
          margin: '0 auto 48px'
        }}>
          I&apos;m always excited to collaborate on innovative healthcare technology projects.
          Let&apos;s discuss how we can improve patient care together.
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: windowWidth > 768 ? 'row' : 'column',
          gap: windowWidth > 768 ? '24px' : '16px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <a href="mailto:thomaskantecki2003@gmail.com" style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            borderRadius: '8px',
            color: '#0a0118',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'transform 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            Get In Touch
          </a>
          <a href="/resume.pdf" style={{
            padding: '14px 32px',
            background: 'transparent',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#8B5CF6';
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            e.currentTarget.style.background = 'transparent';
          }}>
            Download Resume
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
          made with <span style={{ color: '#EF4444' }}>♥</span> and vibes by thomas
        </p>
      </footer>
    </>
  );
}