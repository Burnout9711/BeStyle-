import React, { useState, useEffect } from 'react';
import { User, Shirt, Palette, Sparkles } from 'lucide-react';

const Avatar3D = ({ userProfile = {}, selectedOutfit = null, interactive = true }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [currentOutfit, setCurrentOutfit] = useState(selectedOutfit);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMouseMove = (e) => {
    if (!interactive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotation({
      x: (y - centerY) / 10,
      y: (x - centerX) / 10
    });
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setRotation({ x: 0, y: 0 });
  };

  const changeOutfit = (outfit) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentOutfit(outfit);
      setIsAnimating(false);
    }, 300);
  };

  const getAvatarStyle = () => {
    const baseStyle = {
      transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      transition: 'transform 0.3s ease-out',
    };

    if (isAnimating) {
      baseStyle.transform += ' scale(1.1)';
      baseStyle.filter = 'blur(2px)';
    }

    return baseStyle;
  };

  return (
    <div 
      className="avatar-3d-container"
      style={{
        width: '300px',
        height: '400px',
        perspective: '1000px',
        position: 'relative',
        margin: '0 auto',
        cursor: interactive ? 'pointer' : 'default'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar Base */}
      <div 
        className="avatar-base"
        style={{
          ...getAvatarStyle(),
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
          borderRadius: '20px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Avatar Head */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #fdbcb4 0%, #f8a299 100%)',
          borderRadius: '50%',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
        }}>
          <User size={40} style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666'
          }} />
        </div>

        {/* Avatar Body */}
        <div style={{
          position: 'absolute',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '180px',
          background: currentOutfit?.color || 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.5s ease'
        }}>
          <Shirt size={60} style={{ color: 'white', opacity: 0.8 }} />
        </div>

        {/* Avatar Legs */}
        <div style={{
          position: 'absolute',
          top: '280px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '80px',
          background: 'linear-gradient(135deg, #2c5282 0%, #2a4365 100%)',
          borderRadius: '10px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
        }} />

        {/* Floating Style Indicators */}
        {currentOutfit && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#333',
            animation: 'float 3s ease-in-out infinite'
          }}>
            {currentOutfit.occasion}
          </div>
        )}

        {/* AI Sparkles Effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}>
          <Sparkles 
            size={24} 
            style={{ 
              color: '#fbbf24',
              opacity: isAnimating ? 1 : 0,
              transition: 'opacity 0.3s ease',
              animation: isAnimating ? 'spin 1s linear infinite' : 'none'
            }} 
          />
        </div>
      </div>

      {/* Interactive Controls */}
      {interactive && (
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px'
        }}>
          <button 
            className="btn-secondary"
            onClick={() => changeOutfit({ color: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)', occasion: 'Casual' })}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Palette size={14} style={{ marginRight: '4px' }} />
            Casual
          </button>
          <button 
            className="btn-secondary"
            onClick={() => changeOutfit({ color: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)', occasion: 'Work' })}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Shirt size={14} style={{ marginRight: '4px' }} />
            Work
          </button>
        </div>
      )}
    </div>
  );
};

export default Avatar3D;