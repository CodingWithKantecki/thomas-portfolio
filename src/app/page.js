'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Portfolio() {
  const [heartbeat, setHeartbeat] = useState(0);
  const [textGlow, setTextGlow] = useState(0);
  const [letterGlows, setLetterGlows] = useState({});
  const canvasRef = useRef(null);

  useEffect(() => {
    // Heartbeat animation
    const heartbeatInterval = setInterval(() => {
      setHeartbeat(prev => (prev + 1) % 100);
    }, 20);

    return () => clearInterval(heartbeatInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let xPos = 0;
    const speed = 8; // pixels per frame
    let lastBeat = 0;
    
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
      
      const centerY = canvas.height / 2;
      
      // Draw the ECG line from left to right
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#8B5CF6';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      // Draw the line up to current position
      for (let x = 0; x <= xPos; x++) {
        let y = centerY;
        
        // Check for heartbeat positions (every 500 pixels)
        const beatPosition = x % 500;
        
        if (beatPosition > 0 && beatPosition < 80) {
          const progress = beatPosition / 80;
          
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
      
      // Draw glowing dot at current position
      let currentY = centerY;
      const beatPos = xPos % 500;
      if (beatPos > 0 && beatPos < 80) {
        const progress = beatPos / 80;
        if (progress < 0.3) {
          currentY = centerY - (progress / 0.3) * 250;
        } else if (progress < 0.5) {
          currentY = centerY - 250 + ((progress - 0.3) / 0.2) * 280;
        } else if (progress < 0.6) {
          currentY = centerY + 30 - ((progress - 0.5) / 0.1) * 30;
        }
      }
      
      ctx.fillStyle = '#8B5CF6';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(xPos, currentY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Update position
      xPos += speed;
      if (xPos > canvas.width) {
        xPos = 0;
      }
      
      // Calculate glow for text
      const mainText = "Hey there, I'm Thomas!";
      const newLetterGlows = {};
      
      // Match text positioning to actual render (centered, ~48px font)
      // Assuming average character width of ~25px for 48px font
      const avgCharWidth = 25;
      const textWidth = mainText.length * avgCharWidth;
      const textStartX = (canvas.width - textWidth) / 2;
      
      // Track if ECG line is near text area
      const textCenterX = canvas.width / 2;
      const textAreaStart = textStartX - 100;
      const textAreaEnd = textStartX + textWidth + 100;
      
      for (let i = 0; i < mainText.length; i++) {
        // Calculate each letter's center position
        const letterX = textStartX + (i * avgCharWidth) + (avgCharWidth / 2);
        const distance = Math.abs(xPos - letterX);
        
        // Glow calculation with larger radius
        const glowRadius = 180;
        if (distance < glowRadius) {
          // Use cosine for smoother falloff
          const normalized = distance / glowRadius;
          newLetterGlows[i] = Math.cos(normalized * Math.PI / 2);
        } else {
          newLetterGlows[i] = 0;
        }
      }
      
      setLetterGlows(newLetterGlows);
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

  const navItems = ['Experience', 'Projects', 'Skills', 'Contact'];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0a0118;
          color: #ffffff;
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

        .heartbeat-glow {
          animation: pulse 1s ease-in-out infinite;
        }
      `}</style>

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
          pointerEvents: 'none'
        }}
      />

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '32px 48px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(10, 1, 24, 0.9) 0%, transparent 100%)'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#8B5CF6'
        }}>
          thomas.dev
        </div>
        
        <div style={{
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
            <a href="https://github.com" style={{ color: '#ffffff', opacity: 0.8 }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/thomas-kantecki-836b39271/" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', opacity: 0.8 }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="/blog" style={{ color: '#ffffff', opacity: 0.8 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"/>
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
          <div style={{
            width: '200px',
            height: '200px',
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
            {/* Status indicator */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              width: '40px',
              height: '40px',
              background: '#0a0118',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="heartbeat-glow" style={{
                width: '20px',
                height: '20px',
                background: '#8B5CF6',
                borderRadius: '50%'
              }} />
            </div>
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: '600',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            {"Hey there, I'm Thomas!".split('').map((letter, index) => {
              const glow = letterGlows[index] || 0;
              
              // Smooth color interpolation from white to purple
              const r = Math.round(255 - (116 * glow)); // 255 -> 139
              const g = Math.round(255 - (163 * glow)); // 255 -> 92
              const b = Math.round(255 - (9 * glow));   // 255 -> 246
              
              return (
                <span
                  key={index}
                  style={{
                    color: `rgb(${r}, ${g}, ${b})`,
                    textShadow: glow > 0 ? `0 0 ${40 * glow}px rgba(139, 92, 246, 1), 0 0 ${80 * glow}px rgba(139, 92, 246, 0.8), 0 0 ${120 * glow}px rgba(139, 92, 246, 0.5)` : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'inline-block',
                    transform: `scale(${1 + glow * 0.05})`
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              );
            })}
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#94a3b8',
            marginBottom: '8px'
          }}>
            Health Informatics Student, AI Developer, and Health Technology Architect
          </p>
          
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Passionate about the pursuit of knowledge and helping others
            break into the tech industry.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginBottom: '60px'
          }}>
            <button style={{
              padding: '12px 32px',
              background: 'transparent',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#8B5CF6';
              e.target.style.background = 'rgba(139, 92, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              e.target.style.background = 'transparent';
            }}>
              Care to learn more?
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '20px',
                animation: 'float 2s ease-in-out infinite'
              }}>↓</span>
            </button>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" style={{
        padding: '120px 48px',
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
          Experience & Projects
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {[
            {
              title: 'Sentinel PHI Scanner',
              description: 'HIPAA-compliant AI tool for detecting Protected Health Information',
              tech: ['Python', 'BERT', 'Docker'],
              metrics: '99.2% accuracy'
            },
            {
              title: 'ER Triage Simulator',
              description: 'ML-powered training platform for emergency department staff',
              tech: ['React', 'TensorFlow.js', 'FHIR'],
              metrics: '500+ users trained'
            },
            {
              title: 'Clinical Notes Analyzer',
              description: 'NLP pipeline for extracting structured data from medical records',
              tech: ['spaCy', 'PostgreSQL', 'FastAPI'],
              metrics: '10K+ notes processed'
            },
            {
              title: 'Epic EHR Plugin',
              description: 'Voice-to-SOAP notes automation for physician workflows',
              tech: ['Epic APIs', 'Claude API', 'Python'],
              metrics: '75% time saved'
            }
          ].map((project, index) => (
            <div key={project.title} style={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s',
              cursor: 'pointer',
              animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`
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
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                {project.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                {project.description}
              </p>
              <div style={{ 
                fontSize: '12px', 
                color: '#8B5CF6', 
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {project.metrics}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.tech.map(tech => (
                  <span key={tech} style={{
                    fontSize: '12px',
                    padding: '4px 12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '4px',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" style={{
        padding: '120px 48px',
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
            Technical Arsenal
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {[
              { category: 'AI & LLMs', skills: ['Claude API', 'GPT-4', 'LM Studio', 'Llama 2/3'], color: '#8B5CF6' },
              { category: 'Healthcare IT', skills: ['HL7 FHIR', 'ICD-10', 'Epic Systems', 'HIPAA'], color: '#3B82F6' },
              { category: 'Development', skills: ['Python', 'React', 'Next.js', 'FastAPI'], color: '#8B5CF6' },
              { category: 'Infrastructure', skills: ['Docker', 'AWS', 'PostgreSQL', 'Git'], color: '#3B82F6' }
            ].map((group, index) => (
              <div key={group.category} style={{
                animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: group.color
                }}>
                  {group.category}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.skills.map(skill => (
                    <div key={skill} style={{
                      padding: '12px 16px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      borderRadius: '8px',
                      border: `1px solid ${group.color}20`,
                      fontSize: '14px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = group.color;
                      e.currentTarget.style.background = `${group.color}10`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${group.color}20`;
                      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                    }}>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" style={{
        padding: '120px 48px',
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
          gap: '24px',
          justifyContent: 'center'
        }}>
          <a href="mailto:thomas@example.com" style={{
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
    </>
  );
}