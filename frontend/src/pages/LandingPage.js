import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Zap, Heart, Star, Mail } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header-nav">
        <div className="logo">BeStyle.AI</div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={() => navigate('/quiz')}>
            Try Quiz
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-announcement">
            <Star size={14} />
            <span>AI-Powered Fashion Assistant</span>
          </div>
          
          <h1 className="heading-hero">
            Your Next Outfit,<br />Chosen by AI.
          </h1>
          
          <p className="body-large" style={{ marginBottom: '2rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Stop stressing about what to wear. Our AI learns your style, body type, and lifestyle to suggest perfect outfits that make you look and feel confident.
          </p>
          
          <button 
            className="btn-primary hover-scale" 
            onClick={() => navigate('/quiz')}
            style={{ fontSize: '1rem', padding: '1rem 2rem' }}
          >
            Try It Now <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="pad-2xl" style={{ background: var('--bg-section') }}>
        <div className="container">
          <h2 className="heading-1" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            How It Works
          </h2>
          
          <div className="voice-grid">
            <div className="voice-card accent-purple hover-lift">
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'var(--accent-purple-400)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem',
                  color: 'white'
                }}>
                  1
                </div>
                <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Take the Style Quiz</h3>
                <p className="body-small">
                  Tell us about your body type, lifestyle, preferences, and goals. Takes just 2 minutes.
                </p>
              </div>
            </div>

            <div className="voice-card accent-blue hover-lift">
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'var(--accent-blue-400)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem',
                  color: 'white'
                }}>
                  2
                </div>
                <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Get AI Suggestions</h3>
                <p className="body-small">
                  Our AI analyzes your profile and creates personalized outfit recommendations just for you.
                </p>
              </div>
            </div>

            <div className="voice-card accent-orange hover-lift">
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'var(--accent-orange-400)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem',
                  color: 'white'
                }}>
                  3
                </div>
                <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Save & Share</h3>
                <p className="body-small">
                  Love an outfit? Save it to your closet, share with friends, or get shopping links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="pad-2xl">
        <div className="container">
          <h2 className="heading-1" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Who It's For
          </h2>
          <p className="body-large" style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-muted)' }}>
            "For those who care how they show up."
          </p>
          
          <div className="voice-grid">
            <div className="voice-card accent-pink hover-lift">
              <Users size={24} style={{ color: 'var(--accent-purple-400)', marginBottom: '1rem' }} />
              <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Students</h3>
              <p className="body-small">
                Look confident for classes, presentations, and social events without breaking the bank.
              </p>
            </div>

            <div className="voice-card accent-green hover-lift">
              <Zap size={24} style={{ color: 'var(--accent-blue-400)', marginBottom: '1rem' }} />
              <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Creators</h3>
              <p className="body-small">
                Stand out in content, meetings, and networking events with outfits that reflect your brand.
              </p>
            </div>

            <div className="voice-card accent-grey-200 hover-lift">
              <Heart size={24} style={{ color: 'var(--accent-orange-400)', marginBottom: '1rem' }} />
              <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>Professionals</h3>
              <p className="body-small">
                Make the right impression at work, interviews, and important meetings with AI-curated looks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="pad-2xl" style={{ background: 'var(--bg-section)' }}>
        <div className="container">
          <h2 className="heading-1" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            See BeStyle.AI in Action
          </h2>
          
          <div className="voice-card hover-lift" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ 
              background: 'var(--gradient-hero-subtle)', 
              borderRadius: '1rem', 
              padding: '3rem 2rem', 
              textAlign: 'center',
              border: '2px dashed var(--border-light)'
            }}>
              <Zap size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 className="heading-2" style={{ marginBottom: '1rem' }}>Interactive Preview Coming Soon</h3>
              <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                We're crafting the perfect demo experience to show you how our AI creates personalized outfit recommendations. 
                Get early access to be the first to try it!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="pad-2xl">
        <div className="container">
          <div className="voice-card accent-purple hover-lift" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
            <h2 className="heading-1" style={{ marginBottom: '1rem' }}>
              Get Early Access
            </h2>
            <p className="body-medium" style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
              Be among the first to experience AI-powered styling. Join our waitlist and get notified when BeStyle.AI launches.
            </p>
            
            {isSubmitted ? (
              <div className="body-medium" style={{ 
                color: 'var(--accent-purple-400)', 
                background: 'rgba(152, 125, 156, 0.1)', 
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
                Thanks! You're on the list. We'll be in touch soon.
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-input)',
                    borderRadius: '2rem',
                    fontSize: '1rem',
                    flex: '1',
                    minWidth: '250px',
                    background: 'var(--bg-card)'
                  }}
                />
                <button type="submit" className="btn-primary hover-scale">
                  <Mail size={16} style={{ marginRight: '0.5rem' }} />
                  Get Early Access
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pad-lg" style={{ background: 'var(--text-primary)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <p className="body-small" style={{ color: 'rgba(255,255,255,0.7)' }}>
            © 2025 BeStyle.AI - Your Next Outfit, Chosen by AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;