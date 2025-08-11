import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/authApi';

/**
 * Central RedirectGuard - blocks redirects during OAuth processing
 * Use this in any component that might redirect unauthenticated users
 */
const RedirectGuard = ({ children, onBlock, onAllow }) => {
  const { isInitializing, oauthInFlight, isAuthenticated } = useAuth();
  
  const sessionInUrl = !!authAPI.parseSessionIdFromUrl();
  const hold = isInitializing || oauthInFlight || sessionInUrl;
  
  const timestamp = performance.now();
  console.info('RedirectGuard check:', {
    route: window.location.pathname,
    isInitializing,
    oauthInFlight,
    isAuthenticated,
    sessionInUrl,
    hold,
    timestamp: Math.round(timestamp)
  });

  if (hold) {
    console.info('RedirectGuard: BLOCKING redirect - OAuth processing or session detected');
    if (onBlock) {
      return onBlock();
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Finalizing sign-in…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.info('RedirectGuard: ALLOWING redirect - user not authenticated and no OAuth in progress');
    if (onAllow) {
      return onAllow();
    }
  }

  console.info('RedirectGuard: PASSING through - user authenticated or no redirect needed');
  return children;
};

export default RedirectGuard;