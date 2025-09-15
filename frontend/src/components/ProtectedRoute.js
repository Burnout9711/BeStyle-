import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authAPI from '../lib/authApi';

const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing, oauthInFlight } = useAuth();
  
  const sessionInUrl = !!authAPI.parseSessionIdFromUrl();
  const holdRedirect = isInitializing || oauthInFlight || sessionInUrl;

  console.log('ProtectedRoute: Guard check', {
    isInitializing,
    oauthInFlight,
    sessionInUrl,
    holdRedirect,
    isAuthenticated,
    currentRoute: window.location.pathname
  });

  if (holdRedirect) {
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
    console.log('ProtectedRoute: Redirecting to home - user not authenticated');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: Allowing access - user authenticated');
  return <Outlet />;
};

export default ProtectedRoute;