import React, { useRef, useEffect, useState } from 'react';

const Enhanced3DCard = ({ 
  children, 
  className = '', 
  intensity = 1.0, 
  enableMouseTracking = true,
  enableScrollAnimation = true,
  ...props 
}) => {
  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [scrollDepth, setScrollDepth] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Mouse tracking for 3D tilt effect
    const handleMouseMove = (e) => {
      if (!enableMouseTracking) return;
      
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      const rotateX = deltaY * -8 * intensity; // Invert Y for natural feel
      const rotateY = deltaX * 12 * intensity;
      const translateZ = Math.min(Math.abs(deltaX) + Math.abs(deltaY), 1) * 15 * intensity;
      
      card.style.transform = `
        perspective(1200px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateZ(${translateZ}px)
        scale(${1 + (translateZ / 200)})
      `;
      
      // Add dynamic lighting effect
      const lightX = 50 + deltaX * 20;
      const lightY = 50 + deltaY * 20;
      
      const beforeElement = window.getComputedStyle(card, '::before');
      if (beforeElement) {
        card.style.setProperty('--light-x', `${lightX}%`);
        card.style.setProperty('--light-y', `${lightY}%`);
      }
    };

    const handleMouseLeave = () => {
      if (!enableMouseTracking) return;
      
      card.style.transform = `
        perspective(1200px) 
        rotateX(0deg) 
        rotateY(0deg) 
        translateZ(0px)
        scale(1)
      `;
      card.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      
      setTimeout(() => {
        card.style.transition = 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)';
      }, 600);
    };

    const handleMouseEnter = () => {
      if (!enableMouseTracking) return;
      card.style.transition = 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)';
    };

    // Scroll-based animations
    const handleScroll = () => {
      if (!enableScrollAnimation || !card) return;
      
      const rect = card.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if element is in view
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
      
      // Calculate scroll depth for layered effect
      if (isVisible) {
        const viewportProgress = Math.max(0, Math.min(1, 
          (windowHeight - elementTop) / (windowHeight + rect.height)
        ));
        
        const depth = Math.floor(viewportProgress * 3) + 1;
        if (depth !== scrollDepth) {
          setScrollDepth(depth);
          
          // Remove previous depth classes
          card.classList.remove('scroll-depth-1', 'scroll-depth-2', 'scroll-depth-3');
          card.classList.add(`scroll-depth-${depth}`);
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
      // Initial check
      handleScroll();
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
  }, [intensity, enableMouseTracking, enableScrollAnimation, isInView, scrollDepth]);

  return (
    <div
      ref={cardRef}
      className={`voice-card ${className}`}
      style={{
        '--light-x': '50%',
        '--light-y': '50%'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Enhanced3DCard;