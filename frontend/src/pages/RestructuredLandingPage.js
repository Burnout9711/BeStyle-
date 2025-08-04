import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Instagram, Linkedin, Mail } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import ParticleEffect from '../components/ParticleEffect';
import PerformanceOptimizer from '../components/PerformanceOptimizer';
import LaunchTeaserSection from '../components/LaunchTeaserSection';
import QuizIntroSection from '../components/QuizIntroSection';
import WaitlistSection from '../components/WaitlistSection';
import FeatureHighlights from '../components/FeatureHighlights';

const RestructuredLandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleTryNow = () => {
    navigate('/quiz');
  };

  const handleTakeQuiz = () => {
    navigate('/quiz');
  };

  const handleStartQuiz = (preferences = {}) => {
    if (preferences.selectedOccasions && preferences.selectedOccasions.length > 0) {
      localStorage.setItem('preQuizPreferences', JSON.stringify(preferences));
    }
    navigate('/quiz');
  };

  const handleDemoClick = () => {
    // Demo functionality
    console.log('Demo clicked');
  };

  return (
    <PerformanceOptimizer>
      <div style={{ 
        background: '#000000', 
        color: '#FFFFFF',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        {/* Particle Background */}
        <ParticleEffect particleCount={25} color="#4F7FFF" size={2} />

        {/* Header Navigation */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          height: '80px',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #4F7FFF 0%, #F2546D 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            BeStyle.AI
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handleDemoClick}
              style={{
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '25px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <Play size={14} />
              Demo
            </button>
            
            <button 
              onClick={handleTakeQuiz}
              style={{
                background: '#FFFFFF',
                color: '#000000',
                border: 'none',
                borderRadius: '25px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#000000';
                e.target.style.color = '#FFFFFF';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#FFFFFF';
                e.target.style.color = '#000000';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Try Quiz
            </button>
          </div>
        </header>

        {/* 1. Hero Section */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '6rem 2rem 3rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Interactive cursor effect */}
          <div 
            style={{
              position: 'absolute',
              left: mousePosition.x - 150,
              top: mousePosition.y - 150,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(79, 127, 255, 0.08) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              transition: 'all 0.3s ease',
              zIndex: 1
            }}
          />

          <div style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
            <AnimatedSection animationType="slideInUp">
              <h1 style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                fontWeight: '700',
                lineHeight: '1.1',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                Your Personal<br />Style Genie
              </h1>
            </AnimatedSection>

            <AnimatedSection animationType="slideInUp" delay={200}>
              <p style={{
                fontSize: '1.4rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6',
                marginBottom: '3rem',
                maxWidth: '700px',
                margin: '0 auto 3rem'
              }}>
                BeStyle.ai helps you choose what to wear, based on your mood, occasion, and personality — all powered by AI.
              </p>
            </AnimatedSection>

            <AnimatedSection animationType="slideInUp" delay={400}>
              <button
                onClick={handleTryNow}
                style={{
                  background: '#FFFFFF',
                  color: '#000000',
                  border: 'none',
                  padding: '20px 40px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'inherit',
                  boxShadow: '0 10px 40px rgba(255, 255, 255, 0.2)',
                  transform: 'perspective(1000px) translateZ(0px) scale(1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#000000';
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'perspective(1000px) translateZ(10px) scale(1.05)';
                  e.target.style.boxShadow = '0 20px 60px rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.color = '#000000';
                  e.target.style.transform = 'perspective(1000px) translateZ(0px) scale(1)';
                  e.target.style.boxShadow = '0 10px 40px rgba(255, 255, 255, 0.2)';
                }}
              >
                <ArrowRight size={22} />
                Try It Now
              </button>
            </AnimatedSection>
          </div>
        </section>

        {/* 2. Launch Teaser Section */}
        <LaunchTeaserSection onTakeQuiz={handleTakeQuiz} />

        {/* 3. Quiz Section */}
        <QuizIntroSection onStartQuiz={handleStartQuiz} />

        {/* 4. Waitlist Email Capture Section */}
        <WaitlistSection />

        {/* 5. Feature Highlights Section */}
        <FeatureHighlights />

        {/* 6. Footer */}
        <footer style={{
          background: '#000000',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem 0 2rem',
          textAlign: 'center'
        }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            {/* Social Icons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <a href="#" style={{
                color: 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.3s ease',
                padding: '8px'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
              >
                <Instagram size={24} />
              </a>
              <a href="#" style={{
                color: 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.3s ease',
                padding: '8px'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
              >
                <Linkedin size={24} />
              </a>
              <a href="mailto:hello@bestyle.ai" style={{
                color: 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.3s ease',
                padding: '8px'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
              >
                <Mail size={24} />
              </a>
            </div>

            {/* Footer Links */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              {['Privacy Policy', 'Terms', 'Contact'].map((link) => (
                <a key={link} href="#" style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.9rem',
              margin: 0
            }}>
              © 2025 BeStyle.ai – Made with ❤️ in Dubai
            </p>
          </div>
        </footer>
      </div>
    </PerformanceOptimizer>
  );
};

export default RestructuredLandingPage;