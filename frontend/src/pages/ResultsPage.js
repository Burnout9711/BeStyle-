import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { quizAPI } from '../services/api';

const ResultsPage = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [savedOutfits, setSavedOutfits] = useState(new Set());

  useEffect(() => {
    const savedAnswers = localStorage.getItem('quizAnswers');
    if (savedAnswers) {
      setQuizAnswers(JSON.parse(savedAnswers));
    } else {
      // If no quiz answers, redirect to quiz
      navigate('/quiz');
    }
  }, [navigate]);

  const toggleSaveOutfit = (outfitId) => {
    const newSaved = new Set(savedOutfits);
    if (newSaved.has(outfitId)) {
      newSaved.delete(outfitId);
    } else {
      newSaved.add(outfitId);
    }
    setSavedOutfits(newSaved);
  };

  const shareOutfit = (outfit) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out this ${outfit.occasion} outfit from BeStyle.AI`,
        text: outfit.description,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${outfit.description} - Styled by BeStyle.AI`);
      alert('Outfit details copied to clipboard!');
    }
  };

  if (!quizAnswers) {
    return <div>Loading...</div>;
  }

  return (
    <div className="results-page" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Header */}
      <header className="header-nav">
        <div className="logo">BeStyle.AI</div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={() => navigate('/quiz')}>
            Retake Quiz
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Home
          </button>
        </div>
      </header>

      <div style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
        <div className="container">
          {/* Results Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="hero-announcement" style={{ marginBottom: '1rem' }}>
              <Sparkles size={14} />
              <span>AI-Generated Style Profile</span>
            </div>
            
            <h1 className="heading-hero" style={{ marginBottom: '1rem' }}>
              Your Personalized Style Guide
            </h1>
            
            <p className="body-large" style={{ 
              maxWidth: '600px', 
              margin: '0 auto',
              color: 'var(--text-muted)'
            }}>
              Based on your quiz responses, our AI has curated these outfits that match your style, body type, and lifestyle.
            </p>
          </div>

          {/* Style Summary */}
          <div className="voice-card accent-purple" style={{ 
            marginBottom: '3rem', 
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h2 className="heading-2" style={{ marginBottom: '1rem' }}>Your Style Profile</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <div>
                <h4 className="heading-3">Primary Style</h4>
                <p className="body-small">
                  {quizAnswers.current_style?.slice(0, 2).join(', ') || 'Smart Casual, Minimalist'}
                </p>
              </div>
              <div>
                <h4 className="heading-3">Body Type</h4>
                <p className="body-small">
                  {quizAnswers.body_type || 'Athletic'} • {quizAnswers.clothing_size || 'M'}
                </p>
              </div>
              <div>
                <h4 className="heading-3">Main Goals</h4>
                <p className="body-small">
                  {quizAnswers.goals?.join(', ') || 'Look confident, Save time'}
                </p>
              </div>
            </div>
          </div>

          {/* Outfit Suggestions */}
          <h2 className="heading-1" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Your AI-Curated Outfits
          </h2>
          
          <div className="ai-grid">
            {mockOutfitSuggestions.map((outfit) => (
              <div key={outfit.id} className="voice-card hover-lift" style={{ padding: '1.5rem' }}>
                {/* Outfit Image Placeholder */}
                <div style={{
                  height: '200px',
                  background: outfit.color,
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.9)',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}>
                    {outfit.occasion}
                  </div>
                  
                  {/* Save Button */}
                  <button
                    className="btn-nav"
                    onClick={() => toggleSaveOutfit(outfit.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: savedOutfits.has(outfit.id) ? 'var(--accent-purple-400)' : 'rgba(255,255,255,0.9)',
                      color: savedOutfits.has(outfit.id) ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    <Heart size={16} fill={savedOutfits.has(outfit.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Outfit Details */}
                <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>
                  {outfit.title}
                </h3>
                
                <p className="body-small" style={{ 
                  marginBottom: '1rem',
                  color: 'var(--text-muted)'
                }}>
                  {outfit.description}
                </p>

                {/* Outfit Items */}
                <div style={{ marginBottom: '1.5rem' }}>
                  {outfit.items.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.5rem 0',
                      borderBottom: index < outfit.items.length - 1 ? '1px solid var(--border-light)' : 'none'
                    }}>
                      <span className="body-small">{item.name}</span>
                      <span className="caption">{item.brand}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => shareOutfit(outfit)}
                  >
                    <Share2 size={14} style={{ marginRight: '0.25rem' }} />
                    Share
                  </button>
                  <button className="btn-primary" style={{ flex: 1 }}>
                    <ShoppingBag size={14} style={{ marginRight: '0.25rem' }} />
                    Shop
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '3rem',
            padding: '2rem',
            background: 'var(--bg-section)',
            borderRadius: '1rem'
          }}>
            <h3 className="heading-2" style={{ marginBottom: '1rem' }}>
              Love Your Results?
            </h3>
            <p className="body-medium" style={{ 
              marginBottom: '2rem',
              color: 'var(--text-muted)'
            }}>
              Get daily outfit suggestions, save your favorites, and discover new styles with BeStyle.AI.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary">
                <Download size={16} style={{ marginRight: '0.5rem' }} />
                Download Results
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;