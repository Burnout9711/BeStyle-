/**
 * Profile page for authenticated users
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authApi';
import { ArrowLeft, User, Mail, Calendar, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login, logout, checkAuthStatus } = useAuth();
  const [authError, setAuthError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Check if we have a session ID in the URL from Emergent redirect
    const sessionId = authAPI.parseSessionIdFromUrl();
    
    if (sessionId) {
      // Clear the URL fragment
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Login with the session ID
      handleSocialLogin(sessionId);
    } else if (!isLoading && !isAuthenticated) {
      // No session ID and not authenticated, redirect to home
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSocialLogin = async (sessionId) => {
    setProcessing(true);
    setAuthError('');
    
    try {
      const result = await login(sessionId);
      if (!result.success) {
        setAuthError(result.error || 'Login failed');
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    setProcessing(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Show loading state
  if (isLoading || processing) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(79, 127, 255, 0.3)',
            borderTop: '3px solid #4F7FFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '18px', opacity: 0.8 }}>
            {processing ? 'Setting up your account...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (authError && !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Login Error</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.8 }}>{authError}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#4F7FFF',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Show authenticated profile
  if (isAuthenticated && user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        color: 'white'
      }}>
        {/* Header */}
        <header style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </div>
          
          <div style={{ fontSize: '20px', fontWeight: '600' }}>
            BeStyle.AI Profile
          </div>
          
          <button
            onClick={handleLogout}
            disabled={processing}
            style={{
              background: 'rgba(255, 107, 107, 0.2)',
              border: '1px solid #ff6b6b',
              color: '#ff6b6b',
              cursor: processing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              opacity: processing ? 0.5 : 1
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {/* Profile Content */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '4rem 2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            {/* Profile Picture */}
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 2rem',
                  border: '4px solid #4F7FFF',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                margin: '0 auto 2rem',
                border: '4px solid #4F7FFF',
                background: 'linear-gradient(135deg, #4F7FFF 0%, #B084F7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={48} color="white" />
              </div>
            )}

            {/* User Info */}
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: 'white'
            }}>
              Welcome, {user.name}!
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '3rem',
              opacity: 0.8
            }}>
              <Mail size={16} />
              {user.email}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '3rem',
              opacity: 0.6
            }}>
              <Calendar size={16} />
              Member since {new Date(user.created_at).toLocaleDateString()}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => navigate('/quiz')}
                style={{
                  background: 'linear-gradient(135deg, #4F7FFF 0%, #B084F7 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'transform 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Take Style Quiz
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#4F7FFF';
                  e.target.style.background = 'rgba(79, 127, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.background = 'transparent';
                }}
              >
                Explore BeStyle.AI
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};

// Add CSS animation for spinner
const styles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ProfilePage;