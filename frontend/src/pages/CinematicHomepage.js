import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUp, Instagram, Linkedin, Brain, Calendar, Shirt, RefreshCw } from 'lucide-react';
import { waitlistAPI } from '../services/api';

const CinematicHomepage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [currentViewport, setCurrentViewport] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const sectionsRef = useRef([]);
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      setScrollY(newScrollY);
      
      // Show scroll to top after viewport 5
      setShowScrollTop(newScrollY > window.innerHeight * 4);
      
      // Update current viewport
      const newViewport = Math.floor(newScrollY / window.innerHeight);
      setCurrentViewport(newViewport);
    };

    // Intersection Observer for section animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px' }
    );

    // Observe all sections
    sectionsRef.current.forEach((section) => {
      if (section) observerRef.current.observe(section);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{
      backgroundColor: '#000000',
      color: '#FFFFFF',
      fontFamily: '"Inter Tight", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden auto',
      position: 'relative'
    }}>
      {/* Global Background Effects */}
      <CinematicBackground scrollY={scrollY} currentViewport={currentViewport} />
      
      {/* Section 1: Hero / Landing */}
      <HeroSection 
        ref={el => sectionsRef.current[0] = el}
        scrollY={scrollY}
        onTakeQuiz={() => navigate('/quiz')}
      />
      
      {/* Section 2-4: Storytelling */}
      <StorytellingSections 
        ref={el => sectionsRef.current[1] = el}
        scrollY={scrollY}
      />
      
      {/* Section 3: Interactive Quiz Preview */}
      <QuizPreviewSection 
        ref={el => sectionsRef.current[2] = el}
        scrollY={scrollY}
        onStartStyling={() => navigate('/quiz')}
      />
      
      {/* Section 4: Why BeStyle */}
      <WhyBeStyleSection 
        ref={el => sectionsRef.current[3] = el}
        scrollY={scrollY}
      />
      
      {/* Section 5: Waitlist */}
      <WaitlistSection 
        ref={el => sectionsRef.current[4] = el}
        scrollY={scrollY}
      />
      
      {/* Section 6: Footer */}
      <FooterSection 
        ref={el => sectionsRef.current[5] = el}
        scrollY={scrollY}
      />
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000,
            animation: showScrollTop ? 'fadeInUp 0.5s ease-out' : 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

// Cinematic Background Effects Component
const CinematicBackground = ({ scrollY, currentViewport }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {/* Hero Background Gradient - Restored */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        background: `
          radial-gradient(circle at 30% 40%, rgba(79, 127, 255, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(242, 84, 109, 0.10) 0%, transparent 50%),
          linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)
        `,
        transform: `translateY(${scrollY * 0.3}px)`,
        opacity: Math.max(0, 1 - scrollY / (window.innerHeight * 1.5)),
        zIndex: 1
      }} />
      
      {/* Dynamic Spotlight */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${800 + Math.sin(Date.now() / 3000) * 100}px`,
        height: `${600 + Math.cos(Date.now() / 2000) * 100}px`,
        background: `radial-gradient(ellipse, rgba(255, 255, 255, ${0.03 + currentViewport * 0.002}) 0%, transparent 70%)`,
        borderRadius: '50%',
        animation: 'spotlightPulse 8s ease-in-out infinite',
        transform: `translate(-50%, -50%) translateY(${scrollY * -0.1}px)`
      }} />
      
      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.02'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='80' cy='40' r='0.5'/%3E%3Ccircle cx='40' cy='80' r='1'/%3E%3Ccircle cx='90' cy='90' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
        animation: 'particleFloat 25s linear infinite',
        transform: `translateY(${scrollY * -0.2}px)`
      }} />
      
      {/* Shimmer Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(
          ${45 + scrollY * 0.1}deg, 
          transparent 30%, 
          rgba(255, 255, 255, 0.015) 50%, 
          transparent 70%
        )`,
        animation: 'shimmerSweep 15s ease-in-out infinite'
      }} />
    </div>
  );
};

// Section 1: Hero Component
const HeroSection = React.forwardRef(({ scrollY, onTakeQuiz }, ref) => {
  return (
    <section 
      ref={ref}
      className="cinematic-section hero-section"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        transform: `translateY(${scrollY * 0.2}px)`
      }}
    >
      <div style={{
        animation: 'heroFadeIn 2s ease-out 1.5s both'
      }}>
        <h1 style={{
          fontSize: 'clamp(4rem, 10vw, 8rem)',
          fontWeight: '800',
          lineHeight: '0.9',
          marginBottom: '2rem',
          letterSpacing: '-0.04em',
          color: '#FFFFFF',
          textShadow: '0 0 80px rgba(255, 255, 255, 0.3)',
          animation: 'heroGlow 6s ease-in-out infinite'
        }}>
          AI Meets<br />Your Closet.
        </h1>
        
        <p style={{
          fontSize: 'clamp(1.3rem, 3vw, 2rem)',
          fontWeight: '300',
          lineHeight: '1.4',
          marginBottom: '4rem',
          opacity: 0.9,
          color: '#FFFFFF',
          maxWidth: '800px',
          textShadow: '0 0 30px rgba(255, 255, 255, 0.2)'
        }}>
          Outfits chosen by your personality, mood, and the moment.
        </p>
        
        <button
          onClick={onTakeQuiz}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            padding: '20px 40px',
            fontSize: '1.3rem',
            fontWeight: '500',
            borderRadius: '50px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(20px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <ArrowRight size={24} />
          Take the Quiz
        </button>
      </div>
    </section>
  );
});

// Section 2-4: Storytelling Component
const StorytellingSections = React.forwardRef(({ scrollY }, ref) => {
  const stories = [
    "Tired of outfit confusion?",
    "AI learns your style — and evolves with you.",
    "Your closet now thinks with you."
  ];

  return (
    <div ref={ref}>
      {stories.map((story, index) => (
        <section
          key={index}
          className="cinematic-section story-section"
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            padding: '0 2rem'
          }}
        >
          <div style={{
            position: 'relative',
            zIndex: 2
          }}>
            {/* Glowing Ripple Behind Text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 60%)`,
              borderRadius: '50%',
              animation: `rippleGlow 4s ease-in-out infinite ${index * 0.5}s`
            }} />
            
            <h2 style={{
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              fontWeight: '400',
              lineHeight: '1.2',
              maxWidth: '900px',
              color: '#FFFFFF',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
              letterSpacing: '-0.02em',
              transform: `translateY(${Math.max(-50, Math.min(50, (scrollY - window.innerHeight * (index + 2)) * 0.3))}px)`,
              opacity: Math.max(0.2, Math.min(1, 1 - Math.abs(scrollY - window.innerHeight * (index + 2)) / 400)),
              transition: 'opacity 0.3s ease-out',
              animation: 'storyScaleIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}>
              {story}
            </h2>
          </div>
        </section>
      ))}
    </div>
  );
});

// Section 3: Quiz Preview Component
const QuizPreviewSection = React.forwardRef(({ scrollY, onStartStyling }, ref) => {
  return (
    <section 
      ref={ref}
      className="cinematic-section quiz-preview-section"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        padding: '0 4rem'
      }}
    >
      {/* Animated Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)`,
        animation: 'horizontalShimmer 8s ease-in-out infinite'
      }} />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8rem',
        alignItems: 'center',
        maxWidth: '1400px',
        width: '100%'
      }} className="quiz-grid">
        {/* Left Side */}
        <div style={{ textAlign: 'left' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '3rem' }}>✨</span>
            <h2 style={{
              fontSize: 'clamp(3rem, 5vw, 4.5rem)',
              fontWeight: '400',
              lineHeight: '1.1',
              color: '#FFFFFF',
              margin: 0,
              letterSpacing: '-0.03em'
            }}>
              Discover Your Look<br />in 60 Seconds
            </h2>
          </div>
          
          <p style={{
            fontSize: '1.4rem',
            opacity: 0.8,
            lineHeight: '1.5',
            marginBottom: '3rem',
            fontWeight: '300'
          }}>
            Your digital stylist learns your needs in just a few taps.
          </p>
          
          <button
            onClick={onStartStyling}
            style={{
              background: 'transparent',
              color: '#FFFFFF',
              border: 'none',
              padding: '0',
              fontSize: '1.4rem',
              fontWeight: '400',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: 0.9
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateX(12px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateX(0px)';
            }}
          >
            <ArrowRight size={24} />
            Start Styling Me
          </button>
        </div>
        
        {/* Right Side - Mobile Quiz Mockup */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center'
        }}>
          <MobileQuizMockup />
        </div>
      </div>
    </section>
  );
});

// Mobile Quiz Mockup Component
const MobileQuizMockup = () => {
  return (
    <div style={{
      width: '350px',
      height: '700px',
      background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
      borderRadius: '45px',
      padding: '25px',
      boxShadow: `
        0 30px 60px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.08)
      `,
      position: 'relative',
      animation: 'mobileFloat 6s ease-in-out infinite'
    }}>
      {/* Screen */}
      <div style={{
        width: '100%',
        height: '100%',
        background: '#000000',
        borderRadius: '35px',
        padding: '50px 30px 30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Status Bar */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '30px',
          right: '30px',
          height: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>9:41</div>
          <div style={{
            width: '24px',
            height: '12px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '3px',
            position: 'relative'
          }}>
            <div style={{
              width: '18px',
              height: '8px',
              background: '#FFFFFF',
              borderRadius: '2px',
              position: 'absolute',
              top: '1px',
              left: '1px'
            }} />
          </div>
        </div>
        
        {/* Quiz Content */}
        <div style={{ 
          paddingTop: '30px', 
          color: '#FFFFFF',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '40px',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            What's your<br />style vibe<br />today?
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1
          }}>
            {[
              'Effortlessly Chic',
              'Bold & Confident', 
              'Cozy Minimalist',
              'Creative Expression'
            ].map((option, index) => (
              <div
                key={index}
                style={{
                  background: index === 1 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  border: index === 1 ? '2px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '20px',
                  fontSize: '18px',
                  fontWeight: '400',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  animation: index === 1 ? 'selectedPulse 2s ease-in-out infinite' : 'none'
                }}
              >
                {option}
              </div>
            ))}
          </div>
          
          {/* Progress Indicator */}
          <div style={{
            textAlign: 'center',
            marginTop: '30px'
          }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '16px'
            }}>
              2/6 Questions Complete
            </div>
            <div style={{
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '33.33%',
                height: '100%',
                background: 'linear-gradient(90deg, #4F7FFF, #F2546D)',
                borderRadius: '3px',
                animation: 'progressGlow 3s ease-in-out infinite'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section 4: Why BeStyle Component
const WhyBeStyleSection = React.forwardRef(({ scrollY }, ref) => {
  const features = [
    { icon: Brain, title: "🧠 Personality-Based Matching", desc: "AI analyzes your style DNA" },
    { icon: Calendar, title: "📅 Plans-Based Suggestions", desc: "Perfect fits for every occasion" },
    { icon: Shirt, title: "👗 Closet Upload (coming soon)", desc: "Your wardrobe, digitized" },
    { icon: RefreshCw, title: "🔁 Daily New Styles", desc: "Fresh inspiration every day" }
  ];

  return (
    <section 
      ref={ref}
      className="cinematic-section why-section"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        padding: '8rem 4rem'
      }}
    >
      <div style={{ 
        maxWidth: '1200px', 
        textAlign: 'center',
        width: '100%'
      }}>
        <h2 style={{
          fontSize: 'clamp(3rem, 7vw, 5rem)',
          fontWeight: '400',
          marginBottom: '2rem',
          lineHeight: '1.1',
          color: '#FFFFFF',
          textShadow: '0 0 50px rgba(255, 255, 255, 0.3)',
          letterSpacing: '-0.03em'
        }}>
          Smarter Than a Stylist
        </h2>
        
        <p style={{
          fontSize: '1.4rem',
          opacity: 0.8,
          marginBottom: '6rem',
          maxWidth: '800px',
          margin: '0 auto 6rem',
          color: '#FFFFFF',
          fontWeight: '300',
          lineHeight: '1.6'
        }}>
          BeStyle blends AI, fashion psychology, and your preferences to build daily outfit suggestions — instantly.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-10px) scale(1.02)';
                e.target.style.boxShadow = '0 20px 60px rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.target.style.transform = 'translateY(0px) scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {/* Light Ripple on Hover */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '0',
                height: '0',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                transition: 'all 0.6s ease-out',
                pointerEvents: 'none'
              }} />
              
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '500',
                marginBottom: '1rem',
                color: '#FFFFFF',
                letterSpacing: '-0.01em'
              }}>
                {feature.title}
              </h3>
              <p style={{
                opacity: 0.7,
                fontSize: '1rem',
                color: '#FFFFFF',
                fontWeight: '300',
                lineHeight: '1.6'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Section 5: Waitlist Component
const WaitlistSection = React.forwardRef(({ scrollY }, ref) => {
  const [formData, setFormData] = useState({
    email: '',
    instagram: '',
    agree: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await waitlistAPI.subscribe(formData.email, formData.instagram);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Waitlist submission error:', err);
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('already')) {
        setError("You're already on our waitlist!");
      } else if (err.response?.status === 422) {
        setError('Please enter a valid email address');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section 
        ref={ref}
        className="cinematic-section waitlist-section"
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '2rem',
            animation: 'successBounce 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}>
            🎉
          </div>
          <h2 style={{
            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
            fontWeight: '400',
            marginBottom: '2rem',
            animation: 'fadeInUp 0.8s ease-out 0.3s both'
          }}>
            Welcome to the Future!
          </h2>
          <p style={{
            fontSize: '1.4rem',
            opacity: 0.8,
            animation: 'fadeInUp 0.8s ease-out 0.6s both'
          }}>
            You'll be among the first to experience AI-powered styling.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={ref}
      className="cinematic-section waitlist-section"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        padding: '0 2rem'
      }}
    >
      {/* Soft Vertical Shimmer Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        height: '100%',
        background: `linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)`,
        animation: 'verticalShimmer 12s ease-in-out infinite'
      }} />
      
      {/* Spotlight Behind Form */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '400px',
        background: `radial-gradient(ellipse, rgba(255, 255, 255, 0.05) 0%, transparent 70%)`,
        borderRadius: '50%'
      }} />
      
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '600px', 
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        <h2 style={{
          fontSize: 'clamp(3rem, 6vw, 4.5rem)',
          fontWeight: '400',
          marginBottom: '1rem',
          letterSpacing: '-0.03em'
        }}>
          🔒 Join the Early Access List
        </h2>
        
        <p style={{
          fontSize: '1.3rem',
          opacity: 0.8,
          marginBottom: '4rem',
          fontWeight: '300',
          lineHeight: '1.5'
        }}>
          Get exclusive access to the beta and first look at the AI wardrobe engine.
        </p>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="email"
              placeholder="Your email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '20px 28px',
                fontSize: '1.1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                color: '#FFFFFF',
                backdropFilter: 'blur(20px)',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Instagram handle (optional)"
              value={formData.instagram}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
              style={{
                width: '100%',
                padding: '20px 28px',
                fontSize: '1.1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                color: '#FFFFFF',
                backdropFilter: 'blur(20px)',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              <input
                type="checkbox"
                checked={formData.agree}
                onChange={(e) => setFormData(prev => ({ ...prev, agree: e.target.checked }))}
                required
                style={{ 
                  width: '20px', 
                  height: '20px',
                  accentColor: '#4F7FFF'
                }}
              />
              <span style={{ opacity: 0.9 }}>
                Yes, I want early access updates
              </span>
            </label>
          </div>
          
          {error && (
            <div style={{
              color: '#F2546D',
              fontSize: '1rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              padding: '20px 40px',
              fontSize: '1.3rem',
              fontWeight: '500',
              borderRadius: '50px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(20px)',
              opacity: isLoading ? 0.7 : 1,
              animation: 'buttonPulse 3s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            <ArrowRight size={20} />
            {isLoading ? 'Joining...' : 'Join Now'}
          </button>
        </form>
      </div>
    </section>
  );
});

// Section 6: Footer Component
const FooterSection = React.forwardRef(({ scrollY }, ref) => {
  return (
    <section 
      ref={ref}
      className="cinematic-section footer-section"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        padding: '4rem 2rem'
      }}
    >
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        width: '100%'
      }}>
        {/* Social Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          marginBottom: '4rem'
        }}>
          <Instagram 
            size={32} 
            style={{ 
              opacity: 0.6, 
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = 1;
              e.target.style.transform = 'scale(1.3)';
              e.target.style.filter = 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = 0.6;
              e.target.style.transform = 'scale(1)';
              e.target.style.filter = 'none';
            }}
          />
          <Linkedin 
            size={32} 
            style={{ 
              opacity: 0.6, 
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = 1;
              e.target.style.transform = 'scale(1.3)';
              e.target.style.filter = 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = 0.6;
              e.target.style.transform = 'scale(1)';
              e.target.style.filter = 'none';
            }}
          />
        </div>
        
        {/* Links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          marginBottom: '3rem',
          fontSize: '1.1rem'
        }}>
          {['Privacy', 'Terms', 'Contact'].map((link, index) => (
            <span
              key={index}
              style={{
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'all 0.3s ease',
                borderBottom: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = 1;
                e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = 0.7;
                e.target.style.borderBottomColor = 'transparent';
              }}
            >
              {link}
            </span>
          ))}
        </div>
        
        {/* Copyright */}
        <p style={{
          fontSize: '1rem',
          opacity: 0.4,
          margin: 0,
          fontWeight: '300'
        }}>
          © 2025 BeStyle.ai
        </p>
      </div>
    </section>
  );
});

export default CinematicHomepage;