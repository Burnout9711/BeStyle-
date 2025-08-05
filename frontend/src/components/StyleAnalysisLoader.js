import React, { useState, useEffect } from 'react';

const StyleAnalysisLoader = ({ isVisible, onComplete, duration = 3000 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentSubText, setCurrentSubText] = useState('');
  const [dotCount, setDotCount] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  const mainText = "Analyzing your style";
  const subText = "Generating your personalized lookbook.";

  useEffect(() => {
    if (!isVisible) return;

    let timeouts = [];
    setShowLoader(true);

    // Typewriter effect for main text
    let mainIndex = 0;
    const typeMainText = () => {
      if (mainIndex < mainText.length) {
        setCurrentText(mainText.slice(0, mainIndex + 1));
        mainIndex++;
        timeouts.push(setTimeout(typeMainText, 60));
      } else {
        // Start typing subtext after main text is complete
        setTimeout(() => {
          let subIndex = 0;
          const typeSubText = () => {
            if (subIndex < subText.length) {
              setCurrentSubText(subText.slice(0, subIndex + 1));
              subIndex++;
              timeouts.push(setTimeout(typeSubText, 40));
            }
          };
          typeSubText();
        }, 300);
      }
    };

    // Start typewriter effect after a brief delay
    timeouts.push(setTimeout(typeMainText, 500));

    // Pulsing dots animation
    const dotInterval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 500);

    // Complete loading after specified duration
    const completeTimeout = setTimeout(() => {
      setShowLoader(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // Allow fade out animation to complete
    }, duration);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(dotInterval);
      clearTimeout(completeTimeout);
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: showLoader ? 1 : 0,
      transition: 'opacity 0.5s ease-in-out'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 50% 50%, rgba(79, 127, 255, 0.08) 0%, transparent 70%),
          radial-gradient(circle at 30% 70%, rgba(242, 84, 109, 0.05) 0%, transparent 50%)
        `,
        animation: 'breathePulse 4s ease-in-out infinite'
      }} />

      {/* Shimmer Background Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(
          90deg, 
          transparent 0%, 
          rgba(255, 255, 255, 0.03) 50%, 
          transparent 100%
        )`,
        animation: 'horizontalShimmer 8s ease-in-out infinite'
      }} />

      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.02'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='80' cy='40' r='0.5'/%3E%3Ccircle cx='40' cy='80' r='1'/%3E%3Ccircle cx='90' cy='90' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
        animation: 'particleFloat 20s linear infinite'
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        maxWidth: '600px',
        padding: '0 2rem'
      }}>
        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: '1.5rem',
          lineHeight: '1.2',
          textShadow: '0 0 40px rgba(255, 255, 255, 0.2)',
          minHeight: '1.2em' // Prevent layout shift
        }}>
          {currentText}
          {currentText.length > 0 && (
            <span style={{
              display: 'inline-block',
              width: '3px',
              height: '1em',
              backgroundColor: '#4F7FFF',
              marginLeft: '4px',
              animation: 'cursorBlink 1s infinite'
            }} />
          )}
          {dotCount > 0 && '.'.repeat(dotCount)}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          fontWeight: '300',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '3rem',
          lineHeight: '1.4',
          minHeight: '1.4em' // Prevent layout shift
        }}>
          {currentSubText}
        </p>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginTop: '2rem'
        }}>
          {/* Glowing Progress Bar */}
          <div style={{
            width: '200px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '1px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              backgroundColor: '#4F7FFF',
              borderRadius: '1px',
              animation: 'progressGlow 3s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(79, 127, 255, 0.5)',
              width: '100%',
              transform: 'translateX(-100%)',
              animationDelay: '1s'
            }} />
          </div>
        </div>

        {/* Alternative: Pulsing Dots (commented out) */}
        {/* <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '2rem'
        }}>
          {[0, 1, 2].map(index => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index < dotCount ? '#4F7FFF' : 'rgba(255, 255, 255, 0.2)',
                transition: 'background-color 0.3s ease',
                boxShadow: index < dotCount ? '0 0 10px rgba(79, 127, 255, 0.6)' : 'none'
              }}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default StyleAnalysisLoader;