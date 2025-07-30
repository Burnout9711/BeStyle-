import React, { useState, useEffect } from 'react';

const PerformanceOptimizer = ({ children }) => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Performance monitoring
    const checkPerformance = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
        setIsLowPerformance(isSlowConnection);
      }

      // Check device memory (if available)
      if ('deviceMemory' in navigator) {
        const lowMemory = navigator.deviceMemory < 4; // Less than 4GB
        setIsLowPerformance(prev => prev || lowMemory);
      }

      // Check hardware concurrency (CPU cores)
      if ('hardwareConcurrency' in navigator) {
        const lowCPU = navigator.hardwareConcurrency < 4;
        setIsLowPerformance(prev => prev || lowCPU);
      }
    };

    checkPerformance();

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply performance optimizations
  useEffect(() => {
    const root = document.documentElement;
    
    if (isLowPerformance || reducedMotion) {
      // Disable heavy animations
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0.1s');
      root.classList.add('reduced-motion');
    } else {
      // Enable full animations
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
      root.classList.remove('reduced-motion');
    }
  }, [isLowPerformance, reducedMotion]);

  return (
    <div data-performance-mode={isLowPerformance ? 'low' : 'high'}>
      {children}
    </div>
  );
};

export default PerformanceOptimizer;