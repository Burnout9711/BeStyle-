import React, { useEffect, useRef } from 'react';

const AppleStyleBackground = ({ 
  intensity = 0.6, 
  color = 'rgba(255, 255, 255, 0.03)', 
  speed = 0.5,
  spotlightIntensity = 0.8 
}) => {
  const backgroundRef = useRef(null);
  const spotlightRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let animationTime = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      animationTime += speed;
      
      if (backgroundRef.current && spotlightRef.current) {
        // Create subtle breathing/pulsing effect
        const breathe = Math.sin(animationTime * 0.01) * 0.1 + 0.9;
        
        // Create gentle rotation for the conic gradient
        const rotation = animationTime * 0.05;
        
        // Create parallax effect with mouse
        const parallaxX = (mouseX / window.innerWidth - 0.5) * 30;
        const parallaxY = (mouseY / window.innerHeight - 0.5) * 30;
        
        // Update the main background gradient
        backgroundRef.current.style.transform = `
          translate(${parallaxX}px, ${parallaxY}px) 
          scale(${breathe})
        `;
        
        // Update the rotating spotlight
        backgroundRef.current.style.background = `
          conic-gradient(
            from ${rotation}deg at 50% 50%, 
            transparent 0deg, 
            ${color} 45deg, 
            transparent 90deg, 
            transparent 180deg, 
            ${color} 225deg, 
            transparent 270deg, 
            transparent 360deg
          )
        `;
        
        // Update central spotlight based on mouse position
        const spotlightX = (mouseX / window.innerWidth) * 100;
        const spotlightY = (mouseY / window.innerHeight) * 100;
        
        spotlightRef.current.style.background = `
          radial-gradient(
            ellipse 400px 300px at ${spotlightX}% ${spotlightY}%, 
            rgba(255, 255, 255, ${spotlightIntensity * 0.08}) 0%, 
            rgba(255, 255, 255, ${spotlightIntensity * 0.04}) 25%, 
            transparent 50%
          )
        `;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity, color, speed, spotlightIntensity]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {/* Base gradient layer */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `
          radial-gradient(
            circle at center, 
            rgba(255, 255, 255, 0.02) 0%, 
            transparent 40%
          )
        `,
        animation: 'subtleRotate 60s linear infinite'
      }} />
      
      {/* Rotating conic gradient spotlight */}
      <div 
        ref={backgroundRef}
        style={{
          position: 'absolute',
          top: '-100%',
          left: '-100%',
          width: '300%',
          height: '300%',
          background: `
            conic-gradient(
              from 0deg at 50% 50%, 
              transparent 0deg, 
              ${color} 45deg, 
              transparent 90deg, 
              transparent 180deg, 
              ${color} 225deg, 
              transparent 270deg, 
              transparent 360deg
            )
          `,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-out'
        }}
      />
      
      {/* Interactive mouse spotlight */}
      <div 
        ref={spotlightRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(
              ellipse 400px 300px at 50% 50%, 
              rgba(255, 255, 255, ${spotlightIntensity * 0.08}) 0%, 
              rgba(255, 255, 255, ${spotlightIntensity * 0.04}) 25%, 
              transparent 50%
            )
          `,
          transition: 'background 0.3s ease-out'
        }}
      />
      
      {/* Subtle center glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '400px',
        background: `
          radial-gradient(
            ellipse, 
            rgba(255, 255, 255, 0.015) 0%, 
            transparent 60%
          )
        `,
        animation: 'gentlePulse 8s ease-in-out infinite'
      }} />
    </div>
  );
};

export default AppleStyleBackground;