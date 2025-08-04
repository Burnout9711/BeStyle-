import React, { useRef, useEffect, useState } from 'react';

const Enhanced3DCard = ({ 
  children, 
  className = '', 
  intensity = 0.3, // Much lower default intensity for subtlety
  enableMouseTracking = false, // Disabled by default for smoother experience
  enableScrollAnimation = true,
  ...props 
}) => {
  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Subtle mouse tracking (only if enabled)
    const handleMouseMove = (e) => {
      if (!enableMouseTracking) return;
      
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      // Much more subtle rotation values
      const rotateX = deltaY * -2 * intensity; 
      const rotateY = deltaX * 3 * intensity;
      const translateY = Math.abs(deltaX + deltaY) * -2 * intensity;
      
      card.style.transform = `
        translateY(${translateY}px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        scale(${1 + (Math.abs(deltaX + deltaY) * 0.005 * intensity)})
      `;
    };

    const handleMouseLeave = () => {
      if (!enableMouseTracking) return;
      
      card.style.transform = 'translateY(0px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      
      setTimeout(() => {
        card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      }, 400);
    };

    const handleMouseEnter = () => {
      if (!enableMouseTracking) return;
      card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    };

    // Simplified scroll-based animations
    const handleScroll = () => {
      if (!enableScrollAnimation || !card) return;
      
      const rect = card.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const isVisible = elementTop < windowHeight && elementBottom > 0;
      
      if (isVisible !== isInView) {
        setIsInView(isVisible);
        
        if (isVisible) {
          card.classList.add('scroll-reveal', 'in-view');
        } else {
          card.classList.remove('in-view');
        }
      }
    };

    // Event listeners
    if (enableMouseTracking) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      card.addEventListener('mouseenter', handleMouseEnter);
      card.classList.add('mouse-tracking');
    }

    if (enableScrollAnimation) {
      card.classList.add('scroll-reveal');
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check
    }

    return () => {
      if (enableMouseTracking) {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('mouseenter', handleMouseEnter);
      }
      
      if (enableScrollAnimation) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [intensity, enableMouseTracking, enableScrollAnimation, isInView]);

  return (
    <div
      ref={cardRef}
      className={`voice-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Enhanced3DCard;