'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KnowledgeHub() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sample content - you can expand this with your actual content
  const content = [
    {
      id: 1,
      title: "Health Informatics Roadmap",
      description: "A comprehensive guide to starting your journey in health informatics, covering essential skills, certifications, and career paths.",
      category: "roadmaps",
      type: "PDF Guide",
      date: "2024",
      tags: ["Health IT", "Career", "Education"],
      status: "available",
      icon: "📚",
      link: "/HI.pdf"
    },
    {
      id: 2,
      title: "Introduction to Clinical Data",
      description: "Study guide covering clinical data types, standards, and management systems used in healthcare.",
      category: "guides",
      type: "Study Guide",
      date: "2024",
      tags: ["Clinical Data", "Healthcare", "Standards"],
      status: "available",
      icon: "📊"
    },
    {
      id: 3,
      title: "HL7 FHIR Fundamentals",
      description: "Understanding the basics of HL7 FHIR and its implementation in modern healthcare systems.",
      category: "tutorials",
      type: "Tutorial",
      date: "Coming Soon",
      tags: ["FHIR", "Interoperability", "API"],
      status: "coming-soon",
      icon: "🔗"
    },
    {
      id: 4,
      title: "ICD-10 Coding Basics",
      description: "Essential knowledge for understanding and working with ICD-10 diagnostic codes.",
      category: "videos",
      type: "Video Series",
      date: "Coming Soon",
      tags: ["ICD-10", "Coding", "Billing"],
      status: "coming-soon",
      icon: "🎥"
    }
  ];

  const categories = [
    { id: 'all', label: 'All Content', icon: '📁' },
    { id: 'roadmaps', label: 'Roadmaps', icon: '🗺️' },
    { id: 'guides', label: 'Study Guides', icon: '📖' },
    { id: 'tutorials', label: 'Tutorials', icon: '💡' },
    { id: 'videos', label: 'Videos', icon: '🎬' },
    { id: 'articles', label: 'Articles', icon: '✍️' }
  ];

  const filteredContent = selectedCategory === 'all'
    ? content
    : content.filter(item => item.category === selectedCategory);

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

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .category-btn {
          transition: all 0.3s ease;
        }

        .category-btn:hover {
          transform: translateY(-2px);
        }

        .content-card {
          transition: all 0.3s ease;
        }

        .content-card:hover {
          transform: translateY(-4px);
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
            color: '#ffffff',
            textDecoration: 'none',
            opacity: 0.8,
            transition: 'opacity 0.3s'
          }}>Projects</Link>
          <Link href="/knowledge-hub" style={{
            color: '#8B5CF6',
            textDecoration: 'none',
            fontWeight: '500'
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
          background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          Knowledge Hub
        </h1>
        <p style={{
          fontSize: windowWidth > 768 ? '18px' : '16px',
          color: '#94a3b8',
          maxWidth: '700px',
          margin: '0 auto',
          animation: 'fadeInUp 0.8s ease-out 0.1s both',
          lineHeight: '1.6'
        }}>
          Educational resources, guides, and insights on health informatics, healthcare technology, and programming
        </p>
      </section>

      {/* Category Filter */}
      <section style={{
        padding: windowWidth > 768 ? '40px 48px' : '32px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          gap: windowWidth > 768 ? '16px' : '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '48px'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              className="category-btn"
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: windowWidth > 768 ? '12px 24px' : '10px 18px',
                background: selectedCategory === category.id
                  ? 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'
                  : 'rgba(30, 41, 59, 0.5)',
                border: selectedCategory === category.id
                  ? '1px solid transparent'
                  : '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: windowWidth > 768 ? '14px' : '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '16px' }}>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: windowWidth > 768 ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr',
          gap: '24px',
          marginBottom: '80px'
        }}>
          {filteredContent.map((item, index) => (
            <div
              key={item.id}
              className="content-card"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                borderRadius: '12px',
                padding: '24px',
                border: item.status === 'available'
                  ? '1px solid rgba(16, 185, 129, 0.2)'
                  : '1px solid rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(10px)',
                animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                cursor: item.status === 'available' ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (item.status === 'available') {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (item.status === 'available') {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Content Header */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {item.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}>
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{
                color: '#cbd5e1',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {item.description}
              </p>

              {/* Tags */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px'
              }}>
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '4px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: '#10B981'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Status Badge */}
              {item.status === 'coming-soon' && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '6px 12px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#8B5CF6',
                  animation: 'pulse 2s infinite'
                }}>
                  COMING SOON
                </div>
              )}

              {/* Action Button */}
              {item.status === 'available' && (
                <a
                  href={item.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s',
                    textAlign: 'center',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  View Resource
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '16px',
          border: '1px solid rgba(16, 185, 129, 0.1)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            More Content Coming Soon!
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '16px',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            I'm actively creating new educational resources on health informatics,
            clinical data standards, and healthcare technology. Check back regularly for updates!
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Subscribe for Updates
            </button>
            <Link href="/" style={{
              padding: '12px 28px',
              background: 'transparent',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10B981',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-block',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10B981';
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
              e.currentTarget.style.background = 'transparent';
            }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}