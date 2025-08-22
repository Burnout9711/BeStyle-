import React, { useEffect, useRef, useState } from 'react';

const AnimatedSection = ({ children, animationType = 'slideInUp', delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  const animationClass = isVisible ? `animate-in-${animationType.replace('slideIn', '').toLowerCase()}` : '';

  return (
    <div
      ref={ref}
      className={`${className} ${animationClass}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getInitialTransform(animationType)
      }}
    >
      {children}
    </div>
  );
};

const getInitialTransform = (type) => {
  switch (type) {
    case 'slideInUp':
      return 'translateY(40px)';  // simple slide up
    case 'slideInLeft':
      return 'translateX(-40px)'; // simple slide from left
    case 'slideInRight':
      return 'translateX(40px)';  // simple slide from right
    default:
      return 'translateY(40px)';
  }
};

export default AnimatedSection;