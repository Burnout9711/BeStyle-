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

  // Show loading screen during OAuth processing or initialization
  if (isInitializing || oauthInFlight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {oauthInFlight ? 'Finalizing sign-in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if OAuth failed
  if (authError && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-red-500/20 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">Login Error</h2>
            <p className="text-gray-300 mb-6">{authError}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show login required state if not authenticated and no OAuth in progress
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">Access Required</h2>
            <p className="text-gray-300 mb-6">Please log in to view your profile.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render authenticated profile page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>
          
          {user && (
            <div className="space-y-6">
              {/* Basic Profile Info */}
              <div className="bg-white/5 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm">Name</label>
                    <p className="text-white font-medium">{user.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Email</label>
                    <p className="text-white font-medium">{user.email || 'Not provided'}</p>
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