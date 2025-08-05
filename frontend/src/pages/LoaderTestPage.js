import React, { useState } from 'react';
import StyleAnalysisLoader from '../components/StyleAnalysisLoader';

const LoaderTestPage = () => {
  const [showLoader, setShowLoader] = useState(false);

  const startLoading = () => {
    setShowLoader(true);
  };

  const handleComplete = () => {
    setShowLoader(false);
    alert('Loading animation completed! This would normally navigate to results.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: '#fff'
    }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        StyleAnalysisLoader Test Page
      </h1>
      
      <p style={{ marginBottom: '2rem', textAlign: 'center', opacity: 0.7 }}>
        Click the button below to test the loading animation
      </p>
      
      <button
        onClick={startLoading}
        disabled={showLoader}
        style={{
          background: '#4F7FFF',
          border: 'none',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '25px',
          fontSize: '1.1rem',
          cursor: showLoader ? 'not-allowed' : 'pointer',
          opacity: showLoader ? 0.5 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        {showLoader ? 'Loading...' : 'Test Loading Animation'}
      </button>

      <StyleAnalysisLoader 
        isVisible={showLoader}
        onComplete={handleComplete}
        duration={4000}
      />
    </div>
  );
};

export default LoaderTestPage;