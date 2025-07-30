import React from 'react';

const FloatingBackground = () => {
  const shapes = [
    { id: 1, size: 60, left: '10%', top: '20%', color: 'rgba(152, 125, 156, 0.1)', delay: '0s' },
    { id: 2, size: 80, left: '80%', top: '15%', color: 'rgba(118, 133, 151, 0.1)', delay: '2s' },
    { id: 3, size: 40, left: '70%', top: '70%', color: 'rgba(188, 161, 130, 0.1)', delay: '4s' },
    { id: 4, size: 100, left: '15%', top: '80%', color: 'rgba(252, 201, 199, 0.1)', delay: '1s' },
    { id: 5, size: 50, left: '50%', top: '50%', color: 'rgba(184, 209, 186, 0.1)', delay: '3s' }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1
    }}>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="floating-element"
          style={{
            position: 'absolute',
            left: shape.left,
            top: shape.top,
            width: shape.size,
            height: shape.size,
            background: `linear-gradient(135deg, ${shape.color} 0%, transparent 70%)`,
            borderRadius: '50%',
            animation: `float 6s ease-in-out infinite`,
            animationDelay: shape.delay,
            filter: 'blur(1px)',
            transform: 'perspective(1000px) translateZ(0px)'
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBackground;