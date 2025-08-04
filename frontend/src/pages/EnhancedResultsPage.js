import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Heart, ShoppingBag, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { quizAPI } from '../services/api';
import AnimatedSection from '../components/AnimatedSection';
import SocialShare from '../components/SocialShare';
import Avatar3D from '../components/Avatar3D';
import ParticleEffect from '../components/ParticleEffect';
import PerformanceOptimizer from '../components/PerformanceOptimizer';

const EnhancedResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizResults, setQuizResults] = useState(null);
  const [savedOutfits, setSavedOutfits] = useState(new Set());
  const [shareModalOutfit, setShareModalOutfit] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        
        // Get session ID from URL params
        const urlParams = new URLSearchParams(location.search);
        const sessionId = urlParams.get('session');
        
        if (!sessionId) {
          // No session ID, redirect to quiz
          navigate('/quiz');
          return;
        }
        
        // Fetch quiz results from backend
        const results = await quizAPI.getResults(sessionId);
        setQuizResults(results);
        
        // Animate confidence score
        if (results.confidence_score) {
          setTimeout(() => {
            let score = 0;
            const targetScore = results.confidence_score;
            const interval = setInterval(() => {
              score += 2;
              setConfidenceScore(score);
              if (score >= targetScore) {
                setConfidenceScore(targetScore);
                clearInterval(interval);
              }
            }, 50);
          }, 1000);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load quiz results:', err);
        setError('Failed to load your results. Please try taking the quiz again.');
        // Redirect to quiz after showing error briefly
        setTimeout(() => {
          navigate('/quiz');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [navigate, location.search]);

  const toggleSaveOutfit = (outfitId) => {
    const newSaved = new Set(savedOutfits);
    if (newSaved.has(outfitId)) {
      newSaved.delete(outfitId);
    } else {
      newSaved.add(outfitId);
    }
    setSavedOutfits(newSaved);
  };

  const handleShareOutfit = (outfit) => {
    setShareModalOutfit(outfit);
  };

  const handleOutfitSelect = (outfit) => {
    setSelectedOutfit(outfit);
  };

  const downloadResults = () => {
    if (!quizResults) return;
    
    // Create a comprehensive JSON with results
    const dataStr = JSON.stringify({
      profile: quizResults.quiz_answers,
      styleProfile: quizResults.style_profile,
      outfits: quizResults.recommendations,
      saved: Array.from(savedOutfits),
      confidence: quizResults.confidence_score
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bestyle-ai-results.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <PerformanceOptimizer>
        <div className="enhanced-results-page" style={{ 
          background: 'var(--bg-page)', 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              border: '4px solid var(--border-light)',
              borderTop: '4px solid var(--accent-purple-400)',
              borderRadius: '50%',
              animation: 'spin 1.5s linear infinite',
              margin: '0 auto 2rem'
            }} />
            <h2 className="heading-2">Generating Your Style Profile...</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              Our AI is analyzing your preferences and curating perfect outfits
            </p>
          </div>
        </div>
      </PerformanceOptimizer>
    );
  }

  // Error state
  if (error) {
    return (
      <PerformanceOptimizer>
        <div className="enhanced-results-page" style={{ 
          background: 'var(--bg-page)', 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
            <h2 className="heading-2">Oops! Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', marginTop: '1rem' }}>{error}</p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/quiz')}
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </PerformanceOptimizer>
    );
  }

  if (!quizResults) {
    return (
      <PerformanceOptimizer>
        <div className="enhanced-results-page" style={{ 
          background: 'var(--bg-page)', 
          minHeight: '100vh'
        }}>
          <p>No results found.</p>
        </div>
      </PerformanceOptimizer>
    );
  }

  // Extract data from API response
  const { quiz_answers, style_profile, recommendations, confidence_score } = quizResults;
  const outfitSuggestions = recommendations || [];

  return (
    <PerformanceOptimizer>
      <div className="enhanced-results-page" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <ParticleEffect particleCount={20} color="#987D9C" size={2} />
        
        {/* Enhanced Header */}
        <header className="header-nav" style={{
          background: 'rgba(255, 249, 242, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="logo" style={{
            background: 'linear-gradient(135deg, #987D9C 0%, #768597 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            BeStyle.AI
          </div>
          <div className="nav-actions">
            <button className="btn-secondary hover-scale" onClick={() => navigate('/quiz')}>
              Retake Quiz
            </button>
            <button className="btn-secondary hover-scale" onClick={() => navigate('/')}>
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
              Home
            </button>
          </div>
        </header>

        <div style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
          <div className="container">
            {/* Enhanced Results Header */}
            <AnimatedSection animationType="slideInUp">
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div className="hero-announcement" style={{ marginBottom: '1rem' }}>
                  <Sparkles size={14} />
                  <span>AI Analysis Complete</span>
                </div>
                
                <h1 className="heading-hero" style={{ 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #232323 0%, #987D9C 50%, #768597 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Your Personalized Style Profile
                </h1>
                
                {/* Confidence Score Animation */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(152, 125, 156, 0.1) 0%, rgba(118, 133, 151, 0.1) 100%)',
                  padding: '2rem',
                  borderRadius: '2rem',
                  marginBottom: '2rem',
                  maxWidth: '600px',
                  margin: '0 auto 2rem'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <TrendingUp size={24} style={{ color: 'var(--accent-purple-400)', marginBottom: '0.5rem' }} />
                    <h3 className="heading-3">AI Confidence Score</h3>
                  </div>
                  
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(152, 125, 156, 0.2)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      width: `${confidenceScore}%`,
                      height: '100%',
                      background: 'linear-gradient(135deg, var(--accent-purple-400) 0%, var(--accent-blue-400) 100%)',
                      borderRadius: '4px',
                      transition: 'width 2s cubic-bezier(0.25, 0.8, 0.25, 1)'
                    }} />
                  </div>
                  
                  <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                    <strong>{confidenceScore}%</strong> match - Our AI is highly confident in these recommendations
                  </p>
                </div>
                
                <p className="body-large" style={{ 
                  maxWidth: '700px', 
                  margin: '0 auto',
                  color: 'var(--text-muted)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  padding: '1.5rem 2rem',
                  borderRadius: '2rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  Based on your responses, our AI has analyzed over 1,000 style combinations to curate these perfect outfits for your unique profile.
                </p>
              </div>
            </AnimatedSection>

            {/* Interactive 3D Avatar Section */}
            <AnimatedSection animationType="slideInUp" delay={300}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '3rem', 
                marginBottom: '4rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <h3 className="heading-2" style={{ marginBottom: '1rem' }}>Your Style Avatar</h3>
                  <p className="body-medium" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    See how each outfit looks on your personalized avatar
                  </p>
                  <Avatar3D 
                    userProfile={quizAnswers}
                    selectedOutfit={selectedOutfit}
                    interactive={true}
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* Enhanced Style Summary */}
            <AnimatedSection animationType="slideInUp" delay={400}>
              <div className="voice-card accent-purple hover-lift" style={{ 
                marginBottom: '4rem', 
                padding: '3rem',
                background: 'linear-gradient(135deg, var(--accent-purple-200) 0%, rgba(249, 232, 250, 0.6) 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23987D9C' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E")`,
                  opacity: 0.3
                }} />
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h2 className="heading-2" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    Your Unique Style DNA
                  </h2>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '2rem',
                    marginTop: '2rem'
                  }}>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.3)',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center'
                    }}>
                      <Zap size={24} style={{ color: 'var(--accent-purple-400)', marginBottom: '0.5rem' }} />
                      <h4 className="heading-3">Primary Style</h4>
                      <p className="body-small">
                        {quizAnswers.current_style?.slice(0, 2).join(' • ') || 'Smart Casual • Minimalist'}
                      </p>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.3)',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center'
                    }}>
                      <Heart size={24} style={{ color: 'var(--accent-blue-400)', marginBottom: '0.5rem' }} />
                      <h4 className="heading-3">Body Profile</h4>
                      <p className="body-small">
                        {quizAnswers.body_type || 'Athletic'} • Size {quizAnswers.clothing_size || 'M'}
                      </p>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.3)',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center'
                    }}>
                      <Sparkles size={24} style={{ color: 'var(--accent-orange-400)', marginBottom: '0.5rem' }} />
                      <h4 className="heading-3">Style Goals</h4>
                      <p className="body-small">
                        {quizAnswers.goals?.slice(0, 2).join(' • ') || 'Look confident • Save time'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Enhanced Outfit Suggestions */}
            <AnimatedSection animationType="slideInUp" delay={500}>
              <h2 className="heading-1" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Your AI-Curated Wardrobe
              </h2>
            </AnimatedSection>
            
            <div className="ai-grid" style={{ gap: '2rem' }}>
              {mockOutfitSuggestions.map((outfit, index) => (
                <AnimatedSection key={outfit.id} animationType="slideInUp" delay={600 + (index * 100)}>
                  <div 
                    className="voice-card hover-lift" 
                    style={{ 
                      padding: '2rem',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleOutfitSelect(outfit)}
                  >
                    {/* Enhanced Outfit Visualization */}
                    <div style={{
                      height: '240px',
                      background: `linear-gradient(135deg, ${outfit.color} 0%, ${outfit.color}80 100%)`,
                      borderRadius: '1rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* 3D Effect Layers */}
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.9)',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                      }}>
                        {outfit.occasion}
                      </div>
                      
                      {/* Confidence Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(35, 35, 35, 0.9)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <TrendingUp size={12} />
                        {outfit.confidence}%
                      </div>
                      
                      {/* Save Button */}
                      <button
                        className="btn-nav"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveOutfit(outfit.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '20px',
                          right: '70px',
                          background: savedOutfits.has(outfit.id) ? 'var(--accent-purple-400)' : 'rgba(255,255,255,0.9)',
                          color: savedOutfits.has(outfit.id) ? 'white' : 'var(--text-primary)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <Heart size={16} fill={savedOutfits.has(outfit.id) ? 'currentColor' : 'none'} />
                      </button>

                      {/* Central Icon */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Sparkles size={32} style={{ color: 'white' }} />
                      </div>
                    </div>

                    {/* Enhanced Outfit Details */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 className="heading-3" style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {outfit.title}
                        <span style={{
                          background: 'var(--accent-purple-200)',
                          color: 'var(--accent-purple-400)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.6rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          AI Pick
                        </span>
                      </h3>
                      
                      <p className="body-small" style={{ 
                        marginBottom: '1rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.6'
                      }}>
                        {outfit.description}
                      </p>
                    </div>

                    {/* Outfit Items with Enhanced Styling */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                        Complete Look:
                      </h4>
                      {outfit.items.map((item, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          marginBottom: '0.5rem',
                          background: 'rgba(152, 125, 156, 0.05)',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(152, 125, 156, 0.1)',
                          transition: 'all 0.3s ease'
                        }}>
                          <span className="body-small" style={{ fontWeight: '500' }}>{item.name}</span>
                          <span className="caption" style={{ 
                            background: 'var(--accent-purple-400)',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '1rem',
                            fontSize: '0.7rem'
                          }}>
                            {item.brand}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        className="btn-secondary hover-scale" 
                        style={{ flex: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareOutfit(outfit);
                        }}
                      >
                        <Share2 size={14} style={{ marginRight: '0.5rem' }} />
                        Share
                      </button>
                      <button 
                        className="btn-primary hover-scale" 
                        style={{ 
                          flex: 1,
                          background: 'linear-gradient(135deg, var(--accent-purple-400) 0%, var(--accent-blue-400) 100%)'
                        }}
                      >
                        <ShoppingBag size={14} style={{ marginRight: '0.5rem' }} />
                        Shop Look
                      </button>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            {/* Enhanced Call to Action */}
            <AnimatedSection animationType="slideInUp" delay={800}>
              <div style={{ 
                textAlign: 'center', 
                marginTop: '4rem',
                padding: '3rem',
                background: 'linear-gradient(135deg, rgba(152, 125, 156, 0.1) 0%, rgba(118, 133, 151, 0.1) 100%)',
                borderRadius: '2rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background Animation */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `conic-gradient(from 0deg, transparent, rgba(152, 125, 156, 0.1), transparent)`,
                  animation: 'spin 20s linear infinite'
                }} />
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <Sparkles size={40} style={{ color: 'var(--accent-purple-400)', marginBottom: '1rem' }} className="floating-element" />
                  <h3 className="heading-1" style={{ marginBottom: '1rem' }}>
                    Love Your AI-Styled Look?
                  </h3>
                  <p className="body-medium" style={{ 
                    marginBottom: '2rem',
                    color: 'var(--text-muted)',
                    maxWidth: '600px',
                    margin: '0 auto 2rem'
                  }}>
                    Get daily personalized outfit suggestions, save unlimited looks, and discover new styles that match your evolving taste with BeStyle.AI Pro.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button 
                      className="btn-primary hover-scale"
                      onClick={downloadResults}
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-purple-400) 0%, var(--accent-blue-400) 100%)',
                        padding: '1rem 2rem'
                      }}
                    >
                      <Download size={18} style={{ marginRight: '0.5rem' }} />
                      Download Style Profile
                    </button>
                    <button 
                      className="btn-secondary hover-scale" 
                      onClick={() => navigate('/')}
                      style={{ padding: '1rem 2rem' }}
                    >
                      Join Waitlist for Pro
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Social Share Modal */}
        {shareModalOutfit && (
          <SocialShare 
            outfit={shareModalOutfit}
            onClose={() => setShareModalOutfit(null)}
          />
        )}
      </div>
    </PerformanceOptimizer>
  );
};

export default EnhancedResultsPage;