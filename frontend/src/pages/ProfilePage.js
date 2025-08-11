import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authApi';
import RedirectGuard from '../components/RedirectGuard';

const ProfilePage = () => {
  const { user, isAuthenticated, isInitializing, oauthInFlight, setOauthInFlight, login } = useAuth();
  const [authError, setAuthError] = useState('');
  const [detailedProfile, setDetailedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // OAuth landing logic - /profile is public OAuth landing page
  useEffect(() => {
    const sessionId = authAPI.parseSessionIdFromUrl();
    const timestamp = performance.now();
    
    console.info('ProfilePage: OAuth landing check', { 
      sessionId: sessionId ? '***' : null,
      hasSessionId: !!sessionId,
      isInitializing, 
      oauthInFlight,
      currentPath: window.location.pathname,
      currentHash: window.location.hash,
      currentSearch: window.location.search,
      timestamp: Math.round(timestamp)
    });
    
    if (!sessionId) {
      console.info('ProfilePage: No session ID found - not an OAuth landing');
      return;
    }

    let cancelled = false;
    console.info('ProfilePage: Starting OAuth processing - setting oauthInFlight=true');
    setOauthInFlight(true);

    (async () => {
      try {
        const startTime = performance.now();
        console.info('ProfilePage: Calling login() with sessionId', { 
          timestamp: Math.round(startTime) 
        });
        
        const result = await login(sessionId);
        const endTime = performance.now();
        
        if (cancelled) {
          console.info('ProfilePage: OAuth flow was cancelled');
          return;
        }
        
        console.info('ProfilePage: login() completed', {
          success: result?.success,
          duration: Math.round(endTime - startTime),
          timestamp: Math.round(endTime)
        });
        
        if (result?.success) {
          console.info('ProfilePage: OAuth login successful - cleaning URL');
          
          // Clean URL AFTER success
          window.history.replaceState({}, document.title, "/profile");
          setAuthError('');
          
          // Optional: implement postLoginRedirect from storage
          const postLoginRedirect = localStorage.getItem('post_login') || '/profile';
          console.info('ProfilePage: Post-login redirect target', { postLoginRedirect });
          
        } else {
          console.error('ProfilePage: OAuth login failed:', result?.error);
          setAuthError(result?.error || 'Login failed');
          // Show error UI; DO NOT navigate away
        }
      } catch (error) {
        console.error('ProfilePage: OAuth login exception:', error);
        if (!cancelled) {
          setAuthError('Login failed. Please try again.');
          // Show error UI; DO NOT navigate away
        }
      } finally {
        if (!cancelled) {
          const finalTime = performance.now();
          console.info('ProfilePage: Setting oauthInFlight=false', { 
            timestamp: Math.round(finalTime) 
          });
          setOauthInFlight(false);
        }
      }
    })();

    return () => {
      console.info('ProfilePage: OAuth cleanup - setting cancelled=true');
      cancelled = true;
    };
  }, []); // Empty dependency array - run only once

  const loadDetailedProfile = async () => {
    setProfileLoading(true);
    try {
      const result = await authAPI.getUserProfile();
      if (result.success) {
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
      console.info('ProfilePage: User authenticated - loading detailed profile');
      loadDetailedProfile();
    }
  }, [isAuthenticated, user, oauthInFlight]);

  // Show loading screen during OAuth processing or initialization
  if (isInitializing || oauthInFlight) {
    const timestamp = performance.now();
    console.info('ProfilePage: Showing loader', {
      isInitializing,
      oauthInFlight,
      timestamp: Math.round(timestamp)
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {oauthInFlight ? 'Finalizing sign-in…' : 'Loading…'}
          </p>
          <p className="text-white/60 text-sm mt-2">
            {oauthInFlight ? 'Processing OAuth authentication...' : 'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if OAuth failed (DO NOT redirect)
  if (authError && !isAuthenticated) {
    console.info('ProfilePage: Showing error state - staying on page');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-red-500/20 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">Authentication Error</h2>
            <p className="text-gray-300 mb-6">{authError}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setAuthError('');
                  window.location.href = '/';
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use RedirectGuard for unauthenticated access to profile
  if (!isAuthenticated) {
    console.info('ProfilePage: User not authenticated - using RedirectGuard');
    return (
      <RedirectGuard
        onAllow={() => {
          // Allow redirect to home if no OAuth in progress
          window.location.href = '/';
          return null;
        }}
      >
        {/* This should not render if RedirectGuard is working */}
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
          <div className="text-center text-white">
            <p>Access not authorized</p>
          </div>
        </div>
      </RedirectGuard>
    );
  }

  // Authenticated user - render profile
  console.info('ProfilePage: Rendering authenticated profile');
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
            <button
              onClick={() => {
                // Clear any stored redirect
                localStorage.removeItem('post_login');
                window.location.href = '/';
              }}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg border border-red-500/30 transition duration-200"
            >
              Sign Out
            </button>
          </div>
          
          {user && (
            <div className="space-y-6">
              {/* Basic Profile Info */}
              <div className="bg-white/5 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm">Name</label>
                    <p className="text-white font-medium">{user.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Email</label>
                    <p className="text-white font-medium">{user.email || 'Not provided'}</p>
                  </div>
                  {user.picture && (
                    <div className="md:col-span-2">
                      <label className="text-gray-300 text-sm">Profile Picture</label>
                      <div className="mt-2">
                        <img
                          src={user.picture}
                          alt="Profile"
                          className="w-16 h-16 rounded-full border-2 border-white/20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* OAuth Success Confirmation */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-green-400 font-semibold">Authentication Successful</h3>
                    <p className="text-green-300/80 text-sm">You have successfully signed in via Google OAuth</p>
                  </div>
                </div>
              </div>

              {/* Detailed Profile Info */}
              {profileLoading ? (
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded w-full"></div>
                      <div className="h-3 bg-white/10 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ) : detailedProfile ? (
                <div className="bg-white/5 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Profile Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-300 text-sm">Profile Completion</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${detailedProfile.profile_completion || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm">{detailedProfile.profile_completion || 0}%</span>
                      </div>
                    </div>
                    
                    {detailedProfile.social_profiles && detailedProfile.social_profiles.length > 0 && (
                      <div>
                        <label className="text-gray-300 text-sm">Connected Accounts</label>
                        <div className="mt-2 space-y-2">
                          {detailedProfile.social_profiles.map((profile, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="text-white capitalize">{profile.provider}</span>
                              <span className="text-gray-300 text-sm">
                                Connected on {new Date(profile.connected_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;