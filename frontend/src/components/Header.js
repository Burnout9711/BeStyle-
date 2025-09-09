import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Style Quiz', path: '/quiz', icon: '✨' },
    ...(isAuthenticated ? [
      { name: 'Profile', path: '/profile', icon: '👤' },
      { name: 'Outfits', path: '/outfits', icon: '👗' },
      { name: 'New Suggestions', path: '/outfit-suggestions', icon: '💡' }
    ] : [])
  ];

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all duration-200"
            >
              BeStyle.AI
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-purple-400/30"
                  />
                )}
                <span className="text-white text-sm font-medium">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-300 text-sm font-medium transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/40 backdrop-blur-md rounded-lg mt-2 border border-white/10">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              ))}
              
              {/* Mobile user menu */}
              {isAuthenticated ? (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex items-center px-3 py-2">
                    {user?.picture && (
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-purple-400/30 mr-3"
                      />
                    )}
                    <span className="text-white text-sm font-medium">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-300 hover:text-red-200 text-sm font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;