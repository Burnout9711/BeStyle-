/**
 * Social Media Login Component with Google, Facebook, LinkedIn support via Emergent Auth
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';

const SocialLogin = ({ buttonText = "Login", showText = true, compact = false }) => {
  const { redirectToLogin, isLoading } = useAuth();

  const handleSocialLogin = () => {
    if (!isLoading) {
      redirectToLogin();
    }
  };

  return (
    <div className="social-login-container">
      <button
        onClick={handleSocialLogin}
        disabled={isLoading}
        className="social-login-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? '8px' : '12px',
          padding: compact ? '12px 20px' : '14px 24px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '25px',
          color: 'white',
          fontSize: compact ? '14px' : '16px',
          fontWeight: '500',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          minWidth: compact ? '120px' : '180px',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          opacity: isLoading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.background = 'rgba(0, 0, 0, 0.85)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 25px rgba(79, 127, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.target.style.background = 'rgba(0, 0, 0, 0.6)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
          }
        }}
      >
        {/* Multi-provider Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          {/* Google Icon */}
          <svg width={compact ? "14" : "16"} height={compact ? "14" : "16"} viewBox="0 0 24 24" fill="white" opacity="0.9">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          
          {/* Facebook Icon */}
          <svg width={compact ? "14" : "16"} height={compact ? "14" : "16"} viewBox="0 0 24 24" fill="white" opacity="0.7">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>

        {showText && (
          <span>
            {isLoading ? 'Loading...' : buttonText}
          </span>
        )}

        {!isLoading && (
          <svg width={compact ? "12" : "14"} height={compact ? "12" : "14"} viewBox="0 0 24 24" fill="white" opacity="0.8">
            <path d="M5 12h14m-7-7l7 7-7 7"/>
          </svg>
        )}
      </button>

      {!compact && showText && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          textAlign: 'center'
        }}>
          Google • Facebook • LinkedIn
        </div>
      )}
    </div>
  );
};

export default SocialLogin;