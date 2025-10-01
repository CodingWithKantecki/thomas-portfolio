'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Projects() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const projects = [
    {
      title: "Board of War™",
      description: "A military-themed strategic chess game featuring advanced AI opponents, powerup systems, and an immersive story campaign mode.",
      tags: ["FEATURED"],
      features: [
        "9-zone story campaign with unique AI personalities",
        "14 military-themed powerups (airstrikes, shields, etc.)",
        "Arasan chess engine (800-2800 ELO difficulty)",
        "Cinematic cutscenes and dialogue system",
        "Multiple game modes: Story, Sandbox, Classic"
      ],
      technical: [
        "Custom game engine built with Pygame",
        "Advanced AI with adjustable difficulty",
        "Particle effects and animations",
        "Save/load system with progress tracking",
        "Original soundtracks and SFX"
      ],
      technologies: ["Python", "Pygame", "AI/ML", "Game Design", "Chess Engine", "State Management", "Audio Engineering"],
      color: "#8B5CF6"
    },
    {
      title: "Sentinel PHI Scanner",
      description: "A Python-based tool designed to identify potential Protected Health Information (PHI) in text documents using pattern matching and regular expressions.",
      tags: ["HEALTHCARE", "HACKATHON"],
      features: [
        "Hands-on experience with healthcare data standards",
        "Understanding of HIPAA requirements and compliance",
        "Challenges in automated sensitive data detection",
        "Enterprise-grade DLP solution requirements"
      ],
      technical: [
        "Python development for text processing",
        "Regular expression pattern design",
        "Healthcare domain knowledge application",
        "Git version control and documentation"
      ],
      technologies: ["Python", "Streamlit", "Regex", "HIPAA", "PHI Detection", "Healthcare IT", "Text Processing", "Data Security"],
      link: "https://github.com/CodingWithKantecki/sentinel-phi-scanner",
      color: "#10B981"
    }
  ];

  if (!mounted) return null;

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
      `}</style>

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
        backdropFilter: 'blur(10px)'
      }}>
        <Link href="/" style={{
          fontSize: windowWidth > 768 ? '24px' : '20px',
          fontWeight: '600',
          color: '#8B5CF6',
          textDecoration: 'none'
        }}>
          kantecki.dev
        </Link>

        <div style={{
          display: 'flex',
          gap: '32px',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            color: '#ffffff',
            textDecoration: 'none',
            opacity: 0.8,
            transition: 'opacity 0.3s'
          }}>Home</Link>
          <Link href="/projects" style={{
            color: '#8B5CF6',
            textDecoration: 'none',
            fontWeight: '500'
          }}>Projects</Link>
          <Link href="/knowledge-hub" style={{
            color: '#ffffff',
            textDecoration: 'none',
            opacity: 0.8,
            transition: 'opacity 0.3s'
          }}>Knowledge Hub</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '140px',
        paddingBottom: '60px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
      }}>
        <h1 style={{
          fontSize: windowWidth > 768 ? '48px' : '36px',
          fontWeight: '700',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          Projects
        </h1>
        <p style={{
          fontSize: windowWidth > 768 ? '18px' : '16px',
          color: '#94a3b8',
          maxWidth: '600px',
          margin: '0 auto',
          animation: 'fadeInUp 0.8s ease-out 0.1s both'
        }}>
          Exploring the intersection of healthcare and technology through innovative solutions
        </p>
      </section>

      {/* Projects Grid */}
      <section style={{
        padding: windowWidth > 768 ? '80px 48px' : '60px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: windowWidth > 768 ? 'repeat(auto-fit, minmax(500px, 1fr))' : '1fr',
          gap: '32px'
        }}>
          {projects.map((project, index) => (
            <div
              key={project.title}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                borderRadius: '16px',
                padding: windowWidth > 768 ? '32px' : '24px',
                border: `1px solid ${project.color}33`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
                animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = `${project.color}66`;
                e.currentTarget.style.boxShadow = `0 20px 40px ${project.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = `${project.color}33`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Project Header */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  flexWrap: 'wrap'
                }}>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    {project.title}
                  </h3>
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        background: `linear-gradient(135deg, ${project.color} 0%, ${project.color}aa 100%)`,
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontWeight: '600'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p style={{
                  color: '#cbd5e1',
                  fontSize: '15px',
                  lineHeight: '1.6'
                }}>
                  {project.description}
                </p>
              </div>

              {/* Key Features */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: project.color,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Key Features
                </h4>
                <ul style={{
                  color: '#94a3b8',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  {project.features.slice(0, 3).map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {project.technologies.slice(0, 6).map(tech => (
                    <span
                      key={tech}
                      style={{
                        fontSize: '12px',
                        padding: '6px 12px',
                        background: `${project.color}1a`,
                        borderRadius: '4px',
                        border: `1px solid ${project.color}33`
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 6 && (
                    <span style={{
                      fontSize: '12px',
                      padding: '6px 12px',
                      color: '#94a3b8'
                    }}>
                      +{project.technologies.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Links */}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'transparent',
                    border: `1px solid ${project.color}66`,
                    borderRadius: '8px',
                    color: project.color,
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${project.color}1a`;
                    e.currentTarget.style.borderColor = project.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = `${project.color}66`;
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Add More Projects CTA */}
        <div style={{
          textAlign: 'center',
          marginTop: '80px',
          padding: '60px 24px',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '16px',
          border: '1px solid rgba(139, 92, 246, 0.1)'
        }}>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            More Projects Coming Soon
          </h3>
          <p style={{
            color: '#94a3b8',
            fontSize: '16px',
            marginBottom: '32px'
          }}>
            Currently working on exciting healthcare AI and data analysis projects
          </p>
          <a
            href="https://github.com/CodingWithKantecki"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            View All on GitHub
          </a>
        </div>
      </section>
    </>
  );
}