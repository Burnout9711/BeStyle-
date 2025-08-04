import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const LaunchTeaserSection = ({ onTakeQuiz }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "Powered by AI. Designed for You.";

  useEffect(() => {
    let currentIndex = 0;
    const typeText = () => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, 80); // Typing speed
      } else {
        setIsTyping(false);
        // Restart typing after pause
        setTimeout(() => {
          currentIndex = 0;
          setDisplayText('');
          setIsTyping(true);
          typeText();
        }, 3000); // Pause before restart
      }
    };

    const timer = setTimeout(() => {
      typeText();
    }, 1500); // Initial delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="launch-teaser-section" style={{
      background: '#000000',
      color: '#FFFFFF',
      padding: '6rem 0',
      textAlign: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Cinematic Spotlight Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '1000px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 30%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'pulse3d 8s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Additional subtle light rays */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(ellipse 200px 100px at 20% 30%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          radial-gradient(ellipse 300px 150px at 80% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          radial-gradient(ellipse 250px 120px at 60% 20%, rgba(255, 255, 255, 0.015) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <AnimatedSection animationType="slideInUp">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Main Headline */}
            <h2 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: '700',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Your Personal Stylist<br />is Almost Here.
            </h2>

            {/* Subheading */}
            <p style={{
              fontSize: '1.3rem',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6',
              marginBottom: '3rem',
              fontWeight: '400',
              maxWidth: '650px',
              margin: '0 auto 3rem'
            }}>
              We're not launching a brand. We're launching a revolution<br />
              in how you get dressed.
            </p>

            {/* Animated Typing Effect */}
            <div style={{
              marginBottom: '3rem',
              height: '60px', // Fixed height to prevent layout shift
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #4F7FFF 0%, #F2546D 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                padding: '1rem 2rem',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.02)',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #4F7FFF 0%, #F2546D 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {displayText}
                </span>
                {isTyping && (
                  <span style={{
                    marginLeft: '4px',
                    animation: 'blink 1s infinite',
                    color: '#4F7FFF',
                    fontWeight: '300'
                  }}>
                    |
                  </span>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onTakeQuiz}
              style={{
                background: '#FFFFFF',
                color: '#000000',
                border: 'none',
                padding: '18px 36px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
                boxShadow: '0 10px 40px rgba(255, 255, 255, 0.15)',
                transform: 'perspective(1000px) translateZ(0px) scale(1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#000000';
                e.target.style.color = '#FFFFFF';
                e.target.style.transform = 'perspective(1000px) translateZ(10px) scale(1.05)';
                e.target.style.boxShadow = '0 20px 60px rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#FFFFFF';
                e.target.style.color = '#000000';
                e.target.style.transform = 'perspective(1000px) translateZ(0px) scale(1)';
                e.target.style.boxShadow = '0 10px 40px rgba(255, 255, 255, 0.15)';
              }}
            >
              <ArrowRight size={20} />
              Take the Style Quiz
            </button>
          </div>
        </AnimatedSection>
      </div>

      {/* CSS for blinking cursor */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default LaunchTeaserSection;