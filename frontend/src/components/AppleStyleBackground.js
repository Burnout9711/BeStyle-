import React, { useEffect, useRef, useState } from 'react';

const SophisticatedBackground = ({ 
  intensity = 1.0,
  primaryColor = '#4F7FFF',
  secondaryColor = '#F2546D', 
  speed = 0.8
}) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationTime = 0;

    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };

    const animate = () => {
      animationTime += speed * 0.016; // ~60fps
      setTime(animationTime);
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
  }, [speed]);

  // Generate floating orbs with smooth animation
  const generateFloatingOrbs = () => {
    return Array.from({ length: 8 }, (_, i) => {
      const phase = (i * Math.PI * 2) / 8;
      const x = 50 + Math.sin(time * 0.3 + phase) * 20 + (mousePosition.x - 0.5) * 10;
      const y = 50 + Math.cos(time * 0.2 + phase) * 15 + (mousePosition.y - 0.5) * 8;
      const scale = 0.8 + Math.sin(time * 0.4 + phase) * 0.3;
      const opacity = 0.1 + Math.sin(time * 0.5 + phase) * 0.05;
      
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: `${120 * scale}px`,
            height: `${120 * scale}px`,
            background: `radial-gradient(circle, ${i % 2 === 0 ? primaryColor : secondaryColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            filter: 'blur(1px)'
          }}
        />
      );
    });
  };

  // Generate wave patterns
  const waveOffset1 = Math.sin(time * 0.2) * 20;
  const waveOffset2 = Math.cos(time * 0.15) * 15;
  const waveOffset3 = Math.sin(time * 0.25) * 25;

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      {/* Animated gradient background waves */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(
            ellipse ${600 + waveOffset1}px ${400 + waveOffset2}px at ${50 + (mousePosition.x - 0.5) * 20}% ${30 + (mousePosition.y - 0.5) * 15}%, 
            ${primaryColor}08 0%, 
            transparent 50%
          ),
          radial-gradient(
            ellipse ${500 + waveOffset2}px ${600 + waveOffset3}px at ${70 + (mousePosition.x - 0.5) * -15}% ${70 + (mousePosition.y - 0.5) * 20}%, 
            ${secondaryColor}06 0%, 
            transparent 50%
          )
        `,
        transition: 'background 0.3s ease'
      }} />

      {/* Floating orbs */}
      {generateFloatingOrbs()}

      {/* Interactive center glow */}
      <div style={{
        position: 'absolute',
        left: `${mousePosition.x * 100}%`,
        top: `${mousePosition.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        background: `radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 60%)`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '50%'
      }} />

      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'gridMove 20s linear infinite',
        opacity: 0.3
      }} />

      {/* Morphing background shapes */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: `linear-gradient(${time * 30}deg, ${primaryColor}05, ${secondaryColor}05)`,
        borderRadius: '50%',
        transform: `scale(${1 + Math.sin(time * 0.3) * 0.2}) rotate(${time * 10}deg)`,
        filter: 'blur(2px)',
        animation: 'float 6s ease-in-out infinite'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '30%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: `linear-gradient(${time * -20}deg, ${secondaryColor}04, ${primaryColor}04)`,
        borderRadius: '50%',
        transform: `scale(${1 + Math.cos(time * 0.4) * 0.3}) rotate(${time * -15}deg)`,
        filter: 'blur(1.5px)',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
    </div>
  );
};

export default SophisticatedBackground;