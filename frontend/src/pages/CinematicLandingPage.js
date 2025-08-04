import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowDown, Brain, Calendar, Shirt, ChevronDown, Instagram, Linkedin } from 'lucide-react';
import { waitlistAPI } from '../services/api';

const CinematicLandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const heroRef = useRef(null);
  const storyRefs = useRef([]);
  const quizRef = useRef(null);
  const aiRef = useRef(null);
  const waitlistRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Determine current section for animations
      const sections = [heroRef, ...storyRefs.current, quizRef, aiRef, waitlistRef];
      const windowHeight = window.innerHeight;
      
      sections.forEach((ref, index) => {
        if (ref?.current) {
          const rect = ref.current.getBoundingClientRect();
          const isInView = rect.top < windowHeight * 0.7 && rect.bottom > windowHeight * 0.3;
          
          if (isInView && index !== currentSection) {
            setCurrentSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSection]);

  const scrollToQuiz = () => {
    navigate('/quiz');
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{
      backgroundColor: '#000000',
      color: '#FFFFFF',
      fontFamily: '"Inter Tight", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden auto'
    }}>
      {/* Cinematic Background Effects */}
      <CinematicBackground scrollY={scrollY} currentSection={currentSection} />
      
      {/* Section 1: Hero */}
      <section 
        ref={heroRef}
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          transition: 'transform 0.1s ease-out'
        }}>
          <h1 style={{
            fontSize: 'clamp(3.5rem, 8vw, 8rem)',
            fontWeight: '800',
            lineHeight: '0.9',
            marginBottom: '2rem',
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            textShadow: '0 0 60px rgba(255, 255, 255, 0.3)',
            animation: 'heroGlow 6s ease-in-out infinite'
          }}>
            AI Meets<br />Your Closet.
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontWeight: '400',
            lineHeight: '1.4',
            marginBottom: '4rem',
            opacity: 0.9,
            color: '#FFFFFF',
            maxWidth: '800px',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
            animation: 'fadeInUp 1s ease-out 0.5s both'
          }}>
            BeStyle.ai suggests what to wear based on your personality, mood, and occasion.
          </p>
          
          <button
            onClick={scrollToQuiz}
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 100%)',
              color: '#000000',
              border: 'none',
              padding: '18px 36px',
              fontSize: '1.2rem',
              fontWeight: '600',
              borderRadius: '50px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 40px rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              animation: 'fadeInUp 1s ease-out 0.8s both'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.05)';
              e.target.style.boxShadow = '0 20px 60px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px) scale(1)';
              e.target.style.boxShadow = '0 10px 40px rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)';
            }}
          >
            <ArrowRight size={20} />
            Take the Quiz
          </button>
        </div>
        
        {/* Scroll Down Arrow */}
        <div 
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'bounce 2s infinite',
            cursor: 'pointer',
            opacity: Math.max(0, 1 - scrollY / 300)
          }}
          onClick={() => scrollToSection({ current: storyRefs.current[0] })}
        >
          <ChevronDown size={32} style={{ opacity: 0.6 }} />
        </div>
      </section>

      {/* Section 2: Scroll Story */}
      <ScrollStorySection 
        storyRefs={storyRefs}
        scrollY={scrollY}
      />

      {/* Section 3: Interactive Quiz Teaser */}
      <section 
        ref={quizRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8rem 2rem',
          position: 'relative'
        }}
      >
        <div style={{ 
          maxWidth: '1000px', 
          textAlign: 'center',
          transform: `translateY(${Math.max(0, (scrollY - window.innerHeight * 2.5) * 0.1)}px)`
        }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '700',
            marginBottom: '2rem',
            lineHeight: '1.1',
            color: '#FFFFFF',
            textShadow: '0 0 40px rgba(255, 255, 255, 0.3)'
          }}>
            ✨ Discover Your Look<br />in 60 Seconds
          </h2>
          
          <QuizTeaser onStartQuiz={scrollToQuiz} />
        </div>
      </section>

      {/* Section 4: AI-Powered Results */}
      <section 
        ref={aiRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8rem 2rem',
          position: 'relative'
        }}
      >
        <div style={{ 
          maxWidth: '1200px', 
          textAlign: 'center',
          transform: `translateY(${Math.max(0, (scrollY - window.innerHeight * 3.5) * 0.1)}px)`
        }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '400',
            marginBottom: '1rem',
            lineHeight: '1.1',
            color: '#FFFFFF',
            textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
            letterSpacing: '-0.02em'
          }}>
            Smarter Than a Stylist
          </h2>
          
          <p style={{
            fontSize: '1.3rem',
            opacity: 0.7,
            marginBottom: '5rem',
            maxWidth: '600px',
            margin: '0 auto 5rem',
            color: '#FFFFFF',
            fontWeight: '300'
          }}>
            Our AI blends your vibe, goals, and occasion to deliver daily outfit suggestions.
          </p>
          
          <AIFeatures />
        </div>
      </section>

      {/* Section 5: Waitlist */}
      <section 
        ref={waitlistRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8rem 2rem',
          position: 'relative'
        }}
      >
        <CinematicWaitlist />
      </section>

      {/* Section 6: Footer */}
      <CinematicFooter />
    </div>
  );
};

// Cinematic Background Component
const CinematicBackground = ({ scrollY, currentSection }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 1
    }}>
      {/* Central Spotlight */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: `radial-gradient(circle, rgba(255, 255, 255, ${0.03 + currentSection * 0.005}) 0%, transparent 70%)`,
        borderRadius: '50%',
        animation: 'spotlightPulse 8s ease-in-out infinite',
        opacity: Math.max(0.3, 1 - scrollY / 2000)
      }} />
      
      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.02'%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3Ccircle cx='25' cy='25' r='0.5'/%3E%3Ccircle cx='75' cy='75' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
        animation: 'particleFloat 20s linear infinite',
        transform: `translateY(${scrollY * -0.1}px)`
      }} />
      
      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
        transform: `translateY(${scrollY * 0.05}px)`
      }} />
    </div>
  );
};

// Scroll Story Component
const ScrollStorySection = ({ storyRefs, scrollY }) => {
  const stories = [
    "Tired of outfit confusion?",
    "AI learns your style — and evolves with you.",
    "Less guessing. More confidence."
  ];

  return (
    <div style={{ position: 'relative' }}>
      {stories.map((story, index) => (
        <section
          key={index}
          ref={el => storyRefs.current[index] = el}
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            padding: '0 2rem'
          }}
        >
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '400',
            lineHeight: '1.1',
            maxWidth: '900px',
            color: '#FFFFFF',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
            opacity: Math.max(0, Math.min(1, 1 - Math.abs(scrollY - window.innerHeight * (index + 1.5)) / 400)),
            transform: `translateY(${Math.max(-100, Math.min(100, (scrollY - window.innerHeight * (index + 1.5)) * 0.3))}px)`,
            transition: 'opacity 0.3s ease-out',
            letterSpacing: '-0.02em'
          }}>
            {story}
          </h2>
        </section>
      ))}
    </div>
  );
};

// Quiz Teaser Component with Mobile Mockup
const QuizTeaser = ({ onStartQuiz }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '6rem',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto'
    }} className="quiz-teaser-grid">
      {/* Left side - Text and CTA */}
      <div style={{ textAlign: 'left' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '2rem' }}>✨</span>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: '400',
            lineHeight: '1.1',
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Discover<br />Your Look<br />in 60 Seconds
          </h2>
        </div>
        
        <button
          onClick={onStartQuiz}
          style={{
            background: 'transparent',
            color: '#FFFFFF',
            border: 'none',
            padding: '0',
            fontSize: '1.3rem',
            fontWeight: '400',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.8
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateX(8px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '0.8';
            e.target.style.transform = 'translateX(0px)';
          }}
        >
          <ArrowRight size={20} />
          Start the Style Quiz
        </button>
      </div>
      
      {/* Right side - Mobile Mockup */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)'
      }} className="mobile-mockup">
        <MobileMockup />
      </div>
    </div>
  );
};

// Mobile Mockup Component
const MobileMockup = () => {
  return (
    <div style={{
      width: '320px',
      height: '640px',
      background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
      borderRadius: '40px',
      padding: '20px',
      boxShadow: `
        0 25px 50px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.05)
      `,
      position: 'relative'
    }}>
      {/* Screen */}
      <div style={{
        width: '100%',
        height: '100%',
        background: '#000000',
        borderRadius: '30px',
        padding: '40px 24px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Status bar */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '24px',
          right: '24px',
          height: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#FFFFFF'
          }}>9:41</div>
          <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '18px',
              height: '10px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '2px',
              position: 'relative'
            }}>
              <div style={{
                width: '12px',
                height: '6px',
                background: '#FFFFFF',
                borderRadius: '1px',
                position: 'absolute',
                top: '1px',
                left: '1px'
              }} />
            </div>
          </div>
        </div>
        
        {/* Quiz content */}
        <div style={{ paddingTop: '20px', color: '#FFFFFF' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '32px',
            textAlign: 'center',
            color: '#FFFFFF'
          }}>
            What are you<br />dressing for<br />today?
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {[
              'A Work Meeting',
              'A Casual Day Out',
              'A Date Night',
              'A Special Event'
            ].map((option, index) => (
              <div
                key={index}
                style={{
                  background: index === 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  border: index === 0 ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '400',
                  color: '#FFFFFF',
                  transition: 'all 0.3s ease'
                }}
              >
                {option}
              </div>
            ))}
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '24px',
            right: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '16px'
            }}>
              1/6 Questions Complete
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '16.67%',
                height: '100%',
                background: 'linear-gradient(90deg, #4F7FFF, #F2546D)',
                borderRadius: '2px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Features Component
const AIFeatures = () => {
  const features = [
    { icon: Brain, title: "🧠 Personalized suggestions", desc: "AI learns your unique style" },
    { icon: Calendar, title: "📅 Based on your day", desc: "Perfect fits for every occasion" },
    { icon: Shirt, title: "👗 Outfit visuals (coming soon)", desc: "See before you wear" }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2rem',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {features.map((feature, index) => (
        <div
          key={index}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.06)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.target.style.transform = 'translateY(-8px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.03)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.target.style.transform = 'translateY(0px)';
          }}
        >
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '500',
            marginBottom: '1rem',
            color: '#FFFFFF',
            letterSpacing: '-0.01em'
          }}>
            {feature.title}
          </h3>
          <p style={{
            opacity: 0.6,
            fontSize: '1rem',
            color: '#FFFFFF',
            fontWeight: '300',
            lineHeight: '1.5'
          }}>
            {feature.desc}
          </p>
        </div>
      ))}
    </div>
  );
};

// Cinematic Waitlist Component
const CinematicWaitlist = () => {
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
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '2rem',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          🎉
        </div>
        <h2 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '700',
          marginBottom: '2rem',
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          You're In!
        </h2>
        <p style={{
          fontSize: '1.4rem',
          opacity: 0.8,
          animation: 'fadeInUp 0.8s ease-out 0.4s both'
        }}>
          We'll notify you as soon as BeStyle.ai is ready for you.
        </p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
      <h2 style={{
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        fontWeight: '700',
        marginBottom: '1rem'
      }}>
        🔒 Join the Waitlist
      </h2>
      
      <p style={{
        fontSize: '1.4rem',
        opacity: 0.8,
        marginBottom: '3rem'
      }}>
        Be one of the first to access BeStyle.ai before the world does.
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
              padding: '18px 24px',
              fontSize: '1.1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#FFFFFF',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box'
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
              padding: '18px 24px',
              fontSize: '1.1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#FFFFFF',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.agree}
              onChange={(e) => setFormData(prev => ({ ...prev, agree: e.target.checked }))}
              required
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.95rem', opacity: 0.8 }}>
              I agree to receive style updates from BeStyle.ai
            </span>
          </label>
        </div>
        
        {error && (
          <div style={{
            color: '#F2546D',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          style={{
            background: isLoading ? 'rgba(255, 255, 255, 0.6)' : '#FFFFFF',
            color: '#000000',
            border: 'none',
            padding: '18px 36px',
            fontSize: '1.2rem',
            fontWeight: '600',
            borderRadius: '50px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isLoading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.background = '#f5f5f5';
              e.target.style.transform = 'translateY(-3px) scale(1.05)';
              e.target.style.boxShadow = '0 20px 60px rgba(255, 255, 255, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.background = '#FFFFFF';
              e.target.style.transform = 'translateY(0px) scale(1)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <ArrowRight size={20} />
          {isLoading ? 'Joining...' : 'Join Now'}
        </button>
      </form>
    </div>
  );
};

// Cinematic Footer Component
const CinematicFooter = () => {
  return (
    <footer style={{
      padding: '4rem 2rem 2rem',
      textAlign: 'center',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <Instagram 
          size={24} 
          style={{ 
            opacity: 0.6, 
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = 1;
            e.target.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = 0.6;
            e.target.style.transform = 'scale(1)';
          }}
        />
        <Linkedin 
          size={24} 
          style={{ 
            opacity: 0.6, 
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = 1;
            e.target.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = 0.6;
            e.target.style.transform = 'scale(1)';
          }}
        />
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        opacity: 0.6
      }}>
        <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
        <span style={{ cursor: 'pointer' }}>Terms</span>
      </div>
      
      <p style={{
        fontSize: '0.9rem',
        opacity: 0.4,
        margin: 0
      }}>
        © 2025 BeStyle.ai
      </p>
    </footer>
  );
};

export default CinematicLandingPage;