import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Zap, Heart, Star, Mail, Sparkles, Play } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import FloatingBackground from '../components/FloatingBackground';
import ParallaxScrolling from '../components/ParallaxScrolling';
import Avatar3D from '../components/Avatar3D';
import ParticleEffect from '../components/ParticleEffect';
import PerformanceOptimizer from '../components/PerformanceOptimizer';

const EnhancedLandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    // Mock submission with advanced feedback
    setIsSubmitted(true);
    // Analytics tracking would go here
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const handleDemoClick = () => {
    setShowDemo(true);
    // Could trigger a more complex demo flow
  };

  return (
    <PerformanceOptimizer>
      <div className="enhanced-landing-page">
        {/* Particle Background */}
        <ParticleEffect particleCount={30} color="#4F7FFF" size={3} />
        
        {/* Advanced Header */}
        <header className="header-nav">
          <div className="logo">
            BeStyle.AI
          </div>
          <div className="nav-actions">
            <button 
              className="btn-secondary hover-scale" 
              onClick={handleDemoClick}
              style={{ marginRight: '1rem' }}
            >
              <Play size={16} style={{ marginRight: '0.5rem' }} />
              Demo
            </button>
            <button className="btn-secondary hover-scale" onClick={() => navigate('/quiz')}>
              Try Quiz
            </button>
          </div>
        </header>

        {/* Enhanced Hero Section */}
        <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
          <FloatingBackground />
          
          {/* Interactive cursor effect */}
          <div 
            style={{
              position: 'absolute',
              left: mousePosition.x - 100,
              top: mousePosition.y - 100,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(152, 125, 156, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              transition: 'all 0.3s ease',
              zIndex: 1
            }}
          />
          
          <div className="hero-content">
            <ParallaxScrolling speed={-0.2}>
              <div className="hero-announcement floating-element">
                <Sparkles size={14} />
                <span>AI-Powered Fashion Revolution</span>
              </div>
            </ParallaxScrolling>
            
            <AnimatedSection animationType="slideInUp" delay={200}>
              <h1 className="heading-hero" style={{ marginBottom: '1rem' }}>
                Your Next Outfit,<br />Chosen by AI.
              </h1>
            </AnimatedSection>
            
            <AnimatedSection animationType="slideInUp" delay={400}>
              <p className="body-large" style={{ 
                marginBottom: '3rem', 
                maxWidth: '600px', 
                marginLeft: 'auto', 
                marginRight: 'auto',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1rem 2rem',
                borderRadius: '2rem',
                backdropFilter: 'blur(10px)'
              }}>
                Experience the future of fashion with our advanced AI that understands your unique style, body type, and lifestyle to create perfect outfit combinations that boost your confidence.
              </p>
            </AnimatedSection>
            
            <AnimatedSection animationType="slideInUp" delay={600}>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  className="btn-primary hover-scale pulse-element" 
                  onClick={() => navigate('/quiz')}
                  style={{ 
                    fontSize: '1.1rem', 
                    padding: '1.2rem 2.5rem'
                  }}
                >
                  Start Your Style Journey <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                </button>
                
                <button 
                  className="btn-secondary hover-scale" 
                  onClick={handleDemoClick}
                  style={{ 
                    fontSize: '1.1rem', 
                    padding: '1.2rem 2.5rem'
                  }}
                >
                  <Play size={18} style={{ marginRight: '0.5rem' }} />
                  Watch Demo
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Interactive Avatar Demo Section */}
        <section className="pad-2xl" style={{ 
          background: 'linear-gradient(135deg, rgba(152, 125, 156, 0.05) 0%, rgba(118, 133, 151, 0.05) 100%)',
          position: 'relative'
        }}>
          <div className="container">
            <AnimatedSection animationType="slideInUp">
              <h2 className="heading-1" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                See Yourself in AI-Styled Outfits
              </h2>
              <p className="body-large" style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-muted)' }}>
                Our 3D avatar system shows you exactly how each outfit will look
              </p>
            </AnimatedSection>
            
            <AnimatedSection animationType="slideInUp" delay={300}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <Avatar3D 
                  interactive={true}
                  selectedOutfit={{ color: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)', occasion: 'Work' }}
                />
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Enhanced How It Works with Parallax */}
        <section className="pad-2xl" style={{ background: 'var(--bg-section)' }}>
          <div className="container">
            <ParallaxScrolling speed={0.1}>
              <AnimatedSection animationType="slideInUp">
                <h2 className="heading-1" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                  How Our AI Works Its Magic
                </h2>
              </AnimatedSection>
            </ParallaxScrolling>
            
            <div className="voice-grid">
              <AnimatedSection animationType="slideInLeft" delay={200}>
                <div className="voice-card accent-purple hover-lift" style={{ 
                  background: 'linear-gradient(135deg, var(--accent-purple-200) 0%, rgba(249, 232, 250, 0.6) 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Floating elements inside cards */}
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '60px',
                    height: '60px',
                    background: 'rgba(152, 125, 156, 0.1)',
                    borderRadius: '50%',
                    animation: 'float 4s ease-in-out infinite'
                  }} />
                  
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div 
                      className="step-circle pulse-element"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--accent-purple-400) 0%, #b08fb5 100%)',
                        boxShadow: '0 15px 35px rgba(152, 125, 156, 0.3)'
                      }}
                    >
                      1
                    </div>
                    <h3 className="heading-3" style={{ marginBottom: '0.8rem' }}>AI Style Analysis</h3>
                    <p className="body-small">
                      Our advanced AI analyzes 50+ style parameters including body type, lifestyle, preferences, and fashion trends to create your unique style profile.
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animationType="slideInUp" delay={400}>
                <div className="voice-card accent-blue hover-lift" style={{
                  background: 'linear-gradient(135deg, var(--accent-blue-200) 0%, rgba(228, 237, 248, 0.6) 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '-20px',
                    width: '80px',
                    height: '80px',
                    background: 'rgba(118, 133, 151, 0.1)',
                    borderRadius: '50%',
                    animation: 'float 5s ease-in-out infinite reverse'
                  }} />
                  
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div 
                      className="step-circle pulse-element"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--accent-blue-400) 0%, #8fa0b3 100%)',
                        boxShadow: '0 15px 35px rgba(118, 133, 151, 0.3)'
                      }}
                    >
                      2
                    </div>
                    <h3 className="heading-3" style={{ marginBottom: '0.8rem' }}>Smart Curation</h3>
                    <p className="body-small">
                      Machine learning algorithms curate millions of outfit combinations from top brands, filtering for your budget, occasion, and style preferences.
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animationType="slideInRight" delay={600}>
                <div className="voice-card accent-orange hover-lift" style={{
                  background: 'linear-gradient(135deg, var(--accent-orange-200) 0%, rgba(254, 239, 220, 0.6) 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-30px',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(188, 161, 130, 0.1)',
                    borderRadius: '50%',
                    animation: 'float 6s ease-in-out infinite'
                  }} />
                  
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div 
                      className="step-circle pulse-element"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--accent-orange-400) 0%, #d4b298 100%)',
                        boxShadow: '0 15px 35px rgba(188, 161, 130, 0.3)'
                      }}
                    >
                      3
                    </div>
                    <h3 className="heading-3" style={{ marginBottom: '0.8rem' }}>Personalized Delivery</h3>
                    <p className="body-small">
                      Get outfit recommendations delivered through your preferred channel - app notifications, email, or WhatsApp - with shopping links and styling tips.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Rest of the sections... */}
        {/* Enhanced Waitlist with Social Proof */}
        <section className="pad-2xl">
          <div className="container">
            <AnimatedSection animationType="slideInUp">
              <div className="voice-card accent-purple hover-lift" style={{ 
                maxWidth: '700px', 
                margin: '0 auto', 
                textAlign: 'center', 
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, var(--accent-purple-200) 0%, rgba(249, 232, 250, 0.8) 100%)',
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
                  background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23987D9C' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  opacity: 0.3
                }} />
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <Sparkles size={32} style={{ color: 'var(--accent-purple-400)', marginBottom: '1rem' }} className="floating-element" />
                  <h2 className="heading-1" style={{ marginBottom: '1rem' }}>
                    Join 10,000+ Fashion Enthusiasts
                  </h2>
                  <p className="body-medium" style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Be among the first to experience the future of AI-powered styling. Early access members get exclusive features and lifetime discounts.
                  </p>
                  
                  {/* Social proof */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '1rem', 
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                  }}>
                    {['Students', 'Professionals', 'Creators'].map((group, index) => (
                      <div key={group} style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        backdropFilter: 'blur(10px)',
                        animation: `float ${3 + index}s ease-in-out infinite`
                      }}>
                        <strong>{Math.floor(Math.random() * 3000) + 1000}+</strong> {group}
                      </div>
                    ))}
                  </div>
                  
                  {isSubmitted ? (
                    <div className="body-medium floating-element" style={{ 
                      color: 'var(--accent-purple-400)', 
                      background: 'rgba(152, 125, 156, 0.2)', 
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Sparkles size={20} style={{ marginBottom: '0.5rem' }} />
                      <br />
                      🎉 Welcome to the future of fashion! Check your email for exclusive early access perks.
                    </div>
                  ) : (
                    <form onSubmit={handleWaitlistSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <input
                        type="email"
                        placeholder="Enter your email for early access"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          padding: '1rem 1.5rem',
                          border: '2px solid transparent',
                          borderRadius: '2rem',
                          fontSize: '1rem',
                          flex: '1',
                          minWidth: '300px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--accent-purple-400)';
                          e.target.style.transform = 'perspective(1000px) translateZ(5px) scale(1.02)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'transparent';
                          e.target.style.transform = 'perspective(1000px) translateZ(0px) scale(1)';
                        }}
                      />
                      <button type="submit" className="btn-primary hover-scale" style={{
                        background: 'linear-gradient(135deg, var(--accent-purple-400) 0%, #b08fb5 100%)',
                        padding: '1rem 2rem'
                      }}>
                        <Mail size={18} style={{ marginRight: '0.5rem' }} />
                        Get Early Access
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="pad-lg" style={{ 
          background: 'linear-gradient(135deg, var(--text-primary) 0%, #404040 100%)', 
          color: 'white', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                BeStyle.AI
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
                Revolutionizing fashion with artificial intelligence
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem', 
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              {['Privacy Policy', 'Terms of Service', 'Contact', 'Blog'].map((link, index) => (
                <a 
                  key={link}
                  href="#" 
                  style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    padding: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.7)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
            
            <p className="body-small" style={{ color: 'rgba(255,255,255,0.6)' }}>
              © 2025 BeStyle.AI - Your Next Outfit, Chosen by AI
            </p>
          </div>
        </footer>
      </div>
    </PerformanceOptimizer>
  );
};

export default EnhancedLandingPage;