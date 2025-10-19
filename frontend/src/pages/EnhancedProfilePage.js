import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authAPI, {apiClient} from '../lib/authApi';
import Header from '../components/Header';
import RedirectGuard from '../components/RedirectGuard';

const EnhancedProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing, oauthInFlight, setOauthInFlight, login } = useAuth();
  const [authError, setAuthError] = useState('');
  const [detailedProfile, setDetailedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [productLinks, setProductLinks] = useState({}); // { [outfitId]: { [itemName]: ProductLink[] } }
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // OAuth landing logic - /profile is public OAuth landing page
  useEffect(() => {
    const sessionId = authAPI.parseSessionIdFromUrl();
    const timestamp = performance.now();
    console.info('useEffect 1');
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
          
        } else {
          console.error('ProfilePage: OAuth login failed:', result?.error);
          setAuthError(result?.error || 'Login failed');
        }
      } catch (error) {
        console.error('ProfilePage: OAuth login exception:', error);
        if (!cancelled) {
          setAuthError('Login failed. Please try again.');
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
  }, []);

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

  const loadUserRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      // Mock data for now - you can replace this with actual API call
      // const mockRecommendations = [
      //   {
      //     id: 1,
      //     title: 'Smart Professional',
      //     occasion: 'Work',
      //     description: 'Perfect for office meetings with a confident, professional vibe.',
      //     confidence: 95,
      //     color: 'linear-gradient(135deg, #4F7FFF 0%, rgba(79, 127, 255, 0.8) 100%)',
      //     items: [
      //       { name: 'Tailored blazer', brand: 'Theory', price: 295 },
      //       { name: 'Crisp button shirt', brand: 'Everlane', price: 78 },
      //       { name: 'Straight-leg trousers', brand: 'J.Crew', price: 128 },
      //       { name: 'Leather loafers', brand: 'Cole Haan', price: 180 }
      //     ],
      //     match_score: 92,
      //     created_at: new Date().toISOString()
      //   },
      //   {
      //     id: 2,
      //     title: 'Weekend Explorer',
      //     occasion: 'Casual',
      //     description: 'Effortlessly stylish for weekend adventures and casual hangouts.',
      //     confidence: 88,
      //     color: 'linear-gradient(135deg, #F2546D 0%, rgba(242, 84, 109, 0.8) 100%)',
      //     items: [
      //       { name: 'Soft knit sweater', brand: 'Uniqlo', price: 39 },
      //       { name: 'High-waisted jeans', brand: "Levi's", price: 89 },
      //       { name: 'White sneakers', brand: 'Adidas', price: 90 },
      //       { name: 'Canvas tote bag', brand: 'Baggu', price: 38 }
      //     ],
      //     match_score: 89,
      //     created_at: new Date().toISOString()
      //   },
      //   {
      //     id: 3,
      //     title: 'Date Night Elegance',
      //     occasion: 'Date',
      //     description: 'Make a lasting impression with this sophisticated yet approachable look.',
      //     confidence: 92,
      //     color: 'linear-gradient(135deg, #1A1A1A 0%, rgba(26, 26, 26, 0.9) 100%)',
      //     items: [
      //       { name: 'Silk midi dress', brand: 'Reformation', price: 218 },
      //       { name: 'Delicate jewelry set', brand: 'Mejuri', price: 125 },
      //       { name: 'Block heel sandals', brand: 'Sam Edelman', price: 130 },
      //       { name: 'Clutch purse', brand: 'Mansur Gavriel', price: 195 }
      //     ],
      //     match_score: 94,
      //     created_at: new Date().toISOString()
      //   }
      // ];
      
      // setRecommendations(mockRecommendations);
      
      // // Mock favorite outfits (subset of recommendations marked as favorites)
      // setFavoriteOutfits([mockRecommendations[0], mockRecommendations[2]]);
      console.info('Loading user outfit recommendations from API');
      const { data } = await apiClient.get('/api/user/outfits?limit=60');
      const items = (data?.items || []).map(d => ({
        id: d._id,
        title: d.title || d.outfit?.title,
        occasion: d.occasion || d.outfit?.occasion,
        description: d.outfit?.description || 'AI-curated look',
        confidence: d.confidence || d.outfit?.confidence || 90,
        color: d.color || d.outfit?.color || 'linear-gradient(135deg,#1a1a1a,#2d1b69)',
        items: d.outfit?.items || [],
        match_score: d.outfit?.match_score || 90,
        favorite: !!d.favorite,
      }));
      setRecommendations(items);
      setFavoriteOutfits(items.filter(i => i.favorite));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Load detailed profile when authenticated
  useEffect(() => {
    console.info('useEffect 2');
    if (isAuthenticated && user && !oauthInFlight) {
      console.info('ProfilePage: User authenticated - loading detailed profile');
      // loadDetailedProfile();
      loadUserRecommendations();
    }
  }, [isAuthenticated, user, oauthInFlight]);

  const handleGetNewSuggestions = () => {
    navigate('/outfit-suggestions');
  };

  const toggleFavorite = (outfitId) => {
    const outfit = recommendations.find(r => r.id === outfitId);
    if (!outfit) return;

    const isFavorite = favoriteOutfits.some(f => f.id === outfitId);
    
    if (isFavorite) {
      setFavoriteOutfits(favoriteOutfits.filter(f => f.id !== outfitId));
    } else {
      setFavoriteOutfits([...favoriteOutfits, outfit]);
    }
  };

  // Show loading screen during OAuth processing or initialization
  if (isInitializing || oauthInFlight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {oauthInFlight ? 'Finalizing sign-in…' : 'Loading…'}
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
            <h2 className="text-xl font-bold text-red-400 mb-4">Authentication Error</h2>
            <p className="text-gray-300 mb-6">{authError}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use RedirectGuard for unauthenticated access
  if (!isAuthenticated) {
    return (
      <RedirectGuard
        onAllow={() => {
          window.location.href = '/login';
          return null;
        }}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
          <div className="text-center text-white">
            <p>Access not authorized</p>
          </div>
        </div>
      </RedirectGuard>
    );
  }

  const OutfitCard = ({ outfit, showFavoriteButton = false }) => (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
      <div 
        className="h-32 p-6 flex items-center justify-center relative"
        style={{ background: outfit.color }}
      >
        <div className="text-center">
          <h3 className="text-white text-xl font-bold mb-1">{outfit.title}</h3>
          <p className="text-white/80 text-sm">{outfit.occasion}</p>
          <div className="mt-2 flex items-center justify-center">
            <span className="text-white/70 text-xs">Match: {outfit.match_score}%</span>
          </div>
        </div>
        
        {showFavoriteButton && (
          <button
            onClick={() => toggleFavorite(outfit.id)}
            className={`absolute top-4 right-4 p-2 rounded-full ${
              favoriteOutfits.some(f => f.id === outfit.id)
                ? 'text-red-400 bg-red-400/20'
                : 'text-white/60 bg-white/10'
            } hover:bg-white/20 transition-all duration-200`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-6">
        <p className="text-gray-300 text-sm mb-4">{outfit.description}</p>
        
        {/* <div className="space-y-2">
          <h4 className="text-white font-medium text-sm">Items ({outfit.items.length})</h4>
          {outfit.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">{item.name}</span>
              <div className="text-right">
                <div className="text-gray-400 text-xs">{item.brand}</div>
                {item.price && (
                  <div className="text-white font-medium">${item.price}</div>
                )}
              </div>
            </div>
          ))}
          {outfit.items.length > 3 && (
            <div className="text-center">
              <span className="text-purple-400 text-xs">+{outfit.items.length - 3} more items</span>
            </div>
          )}
        </div> */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm">Items ({outfit.items.length})</h4>
          {outfit.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">{item.name}</span>
              <div className="text-right">
                <div className="text-gray-400 text-xs">{item.brand}</div>
                {item.price && (
                  <div className="text-white font-medium">${item.price}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Authenticated user - render enhanced profile
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-purple-400/30"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-gray-300">{user?.email}</p>
                {detailedProfile && (
                  <div className="mt-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${detailedProfile.profile_completion || 0}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{detailedProfile.profile_completion || 0}% complete</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-6 md:mt-0">
              <button
                onClick={handleGetNewSuggestions}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
              >
                ✨ Get New Outfit Suggestion
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'outfits', name: 'My Outfits', icon: '👗' },
            { id: 'favorites', name: 'Favorites', icon: '❤️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Your Style Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Outfit Recommendations</span>
                    <span className="text-white font-bold">{recommendations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Favorite Outfits</span>
                    <span className="text-white font-bold">{favoriteOutfits.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average Match Score</span>
                    <span className="text-white font-bold">
                      {recommendations.length > 0 
                        ? Math.round(recommendations.reduce((acc, r) => acc + r.match_score, 0) / recommendations.length)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {detailedProfile?.social_profiles && detailedProfile.social_profiles.length > 0 && (
                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
                  <div className="space-y-3">
                    {detailedProfile.social_profiles.map((profile, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-white capitalize font-medium">{profile.provider}</span>
                          <span className="text-gray-300 text-sm">
                            Connected {new Date(profile.connected_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Recommendations */}
            <div className="lg:col-span-2">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Recent Recommendations</h3>
                  <button
                    onClick={() => setActiveTab('outfits')}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"
                  >
                    View all →
                  </button>
                </div>
                
                {recommendationsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                        <div className="h-32 bg-white/10 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-white/10 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.slice(0, 2).map((outfit) => (
                      <OutfitCard 
                        key={outfit.id} 
                        outfit={outfit} 
                        showFavoriteButton={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'outfits' && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Your Outfit Recommendations</h3>
              <span className="text-gray-400 text-sm">{recommendations.length} outfits</span>
            </div>
            
            {recommendationsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                    <div className="h-32 bg-white/10 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((outfit) => (
                  <OutfitCard 
                    key={outfit.id} 
                    outfit={outfit} 
                    showFavoriteButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👗</div>
                <h4 className="text-white text-lg font-medium mb-2">No Outfits Yet</h4>
                <p className="text-gray-400 mb-6">Get personalized outfit recommendations by taking our style quiz!</p>
                <button
                  onClick={() => navigate('/quiz')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Take Style Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Favorite Outfits</h3>
              <span className="text-gray-400 text-sm">{favoriteOutfits.length} favorites</span>
            </div>
            
            {favoriteOutfits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteOutfits.map((outfit) => (
                  <OutfitCard 
                    key={outfit.id} 
                    outfit={outfit} 
                    showFavoriteButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">❤️</div>
                <h4 className="text-white text-lg font-medium mb-2">No Favorites Yet</h4>
                <p className="text-gray-400 mb-6">Heart the outfits you love to keep them here for easy access!</p>
                <button
                  onClick={() => setActiveTab('outfits')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Browse Outfits
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProfilePage;