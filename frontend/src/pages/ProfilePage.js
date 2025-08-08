/**
 * Enhanced Profile page for authenticated users with comprehensive profile overview
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authApi';
import { ArrowLeft, User, Mail, Calendar, LogOut, Shield, Activity, Clock, Users, ArrowRight, Settings, CheckCircle } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login, logout, checkAuthStatus } = useAuth();
  const [authError, setAuthError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [detailedProfile, setDetailedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // Prevent premature redirects

  useEffect(() => {
    // Check if we have a session ID in the URL from Emergent redirect
    const sessionId = authAPI.parseSessionIdFromUrl();
    
    if (sessionId) {
      // Clear the URL fragment
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Login with the session ID
      handleSocialLogin(sessionId);
    } else {
      // No session ID, allow authentication state checks
      setIsInitializing(false);
    }
  }, []); // Remove dependencies to prevent race condition

  useEffect(() => {
    // Handle authentication state changes
    if (!isInitializing && !isLoading && !isAuthenticated) {
      // Only redirect if not initializing, not loading, not authenticated
      navigate('/');
    } else if (isAuthenticated && user) {
      // Load detailed profile information when authenticated
      loadDetailedProfile();
    }
  }, [isAuthenticated, isLoading, navigate, user, isInitializing]);

  const handleSocialLogin = async (sessionId) => {
    setProcessing(true);
    setIsInitializing(false); // Allow authentication state changes now
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

  const loadDetailedProfile = async () => {
    setProfileLoading(true);
    try {
      const result = await authAPI.getUserProfile();
      if (result.success) {
        // Also get detailed profile information
        const detailedResult = await authAPI.getDetailedProfile();
        if (detailedResult.success) {
          setDetailedProfile(detailedResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading detailed profile:', error);
    } finally {
      setProfileLoading(false);
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

  const getProviderIcon = (provider) => {
    switch (provider?.toLowerCase()) {
      case 'google':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      default:
        return <Users size={20} />;
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
            {processing ? 'Setting up your profile...' : 'Loading your profile...'}
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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
        }}>
          {/* Main Profile Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '2rem',
            gridColumn: 'span 2'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* Profile Picture */}
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: '3px solid #4F7FFF',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '3px solid #4F7FFF',
                  background: 'linear-gradient(135deg, #4F7FFF 0%, #B084F7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={40} color="white" />
                </div>
              )}

              {/* User Info */}
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'white'
                }}>
                  {user.name}
                </h1>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  opacity: 0.8
                }}>
                  <Mail size={16} />
                  {user.email}
                  {user.email_verified && (
                    <CheckCircle size={16} style={{ color: '#4ade80' }} />
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: 0.6
                }}>
                  <Calendar size={16} />
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Profile Completion */}
              <div style={{
                background: 'rgba(79, 127, 255, 0.1)',
                borderRadius: '15px',
                padding: '1.5rem',
                textAlign: 'center',
                minWidth: '150px'
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#4F7FFF',
                  marginBottom: '0.5rem'
                }}>
                  {detailedProfile?.profile_completion || 0}%
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Profile Complete
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
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

          {/* Social Accounts Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Shield size={24} />
              Connected Accounts
            </h3>

            {user.social_profiles && user.social_profiles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {user.social_profiles.map((profile, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ color: '#4F7FFF' }}>
                      {getProviderIcon(profile.provider)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                        {profile.provider}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                        Connected {new Date(profile.connected_at).toLocaleDateString()}
                      </div>
                    </div>
                    {user.primary_provider === profile.provider && (
                      <div style={{
                        background: 'rgba(79, 127, 255, 0.2)',
                        color: '#4F7FFF',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ opacity: 0.7 }}>No connected social accounts</p>
            )}
          </div>

          {/* Activity Stats Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            padding: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Activity size={24} />
              Account Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px'
              }}>
                <span>Total Logins</span>
                <span style={{ fontWeight: '600' }}>{user.login_count || 0}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px'
              }}>
                <span>Last Login</span>
                <span style={{ fontWeight: '600' }}>
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px'
              }}>
                <span>Account Age</span>
                <span style={{ fontWeight: '600' }}>
                  {detailedProfile?.login_stats?.account_age_days || 0} days
                </span>
              </div>
            </div>
          </div>

          {/* Recent Login History */}
          {detailedProfile?.recent_logins && detailedProfile.recent_logins.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '2rem',
              gridColumn: 'span 2'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Clock size={24} />
                Recent Login History
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {detailedProfile.recent_logins.slice(0, 5).map((login, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: '#4F7FFF' }}>
                        {getProviderIcon(login.provider)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                          {login.provider}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                          {new Date(login.login_time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {login.ip_address && (
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        {login.ip_address}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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