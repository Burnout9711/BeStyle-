import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authApi';

const ProfilePage = () => {
  const { user, isAuthenticated, isInitializing, oauthInFlight, setOauthInFlight, login } = useAuth();
  const [authError, setAuthError] = useState('');
  const [detailedProfile, setDetailedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Handle OAuth redirect from Emergent
  useEffect(() => {
    const sessionId = authAPI.parseSessionIdFromUrl();
    console.log('ProfilePage: useEffect triggered', { 
      sessionId, 
      isInitializing, 
      oauthInFlight,
      currentPath: window.location.pathname,
      currentHash: window.location.hash,
      currentSearch: window.location.search
    });
    
    if (!sessionId) {
      console.log('ProfilePage: No session ID found in URL');
      return;
    }

    let cancelled = false;
    console.log('ProfilePage: Starting OAuth flow, setting oauthInFlight to true');
    setOauthInFlight(true);

    (async () => {
      try {
        console.log('ProfilePage: Calling login() with sessionId:', sessionId);
        const result = await login(sessionId);
        
        if (cancelled) {
          console.log('ProfilePage: OAuth flow was cancelled');
          return;
        }
        
        if (result?.success) {
          console.log('ProfilePage: OAuth login successful, cleaning URL');
          // Remove session_id from URL
          window.history.replaceState({}, document.title, "/profile");
          setAuthError('');
        } else {
          console.error('ProfilePage: OAuth login failed:', result?.error);
          setAuthError(result?.error || 'Login failed');
          // Stay on page, show error UI; do NOT navigate away
        }
      } catch (error) {
        console.error('ProfilePage: OAuth login exception:', error);
        if (!cancelled) {
          setAuthError('Login failed. Please try again.');
          // Stay on page, show error UI
        }
      } finally {
        if (!cancelled) {
          console.log('ProfilePage: Setting oauthInFlight to false');
          setOauthInFlight(false);
        }
      }
    })();

    return () => {
      console.log('ProfilePage: Cleanup - setting cancelled to true');
      cancelled = true;
    };
  }, []); // Empty dependency array to run only once

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

  // Load detailed profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !oauthInFlight) {
      console.log('ProfilePage: User authenticated, loading detailed profile');
      loadDetailedProfile();
    }
  }, [isAuthenticated, user, oauthInFlight]);

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