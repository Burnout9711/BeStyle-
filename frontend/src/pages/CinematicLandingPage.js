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
            background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 60px rgba(255, 255, 255, 0.1)',
            animation: 'heroGlow 6s ease-in-out infinite'
          }}>
            AI Meets<br />Your Closet.
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontWeight: '400',
            lineHeight: '1.4',
            marginBottom: '4rem',
            opacity: 0.85,
            maxWidth: '800px',
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
            lineHeight: '1.1'
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
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            lineHeight: '1.1'
          }}>
            Smarter Than a Stylist
          </h2>
          
          <p style={{
            fontSize: '1.4rem',
            opacity: 0.8,
            marginBottom: '4rem',
            maxWidth: '700px',
            margin: '0 auto 4rem'
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
    "AI learns your style – and evolves with you.",
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
            position: 'relative'
          }}
        >
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '600',
            lineHeight: '1.2',
            maxWidth: '800px',
            opacity: Math.max(0, Math.min(1, 1 - Math.abs(scrollY - window.innerHeight * (index + 1.5)) / 400)),
            transform: `translateY(${Math.max(-100, Math.min(100, (scrollY - window.innerHeight * (index + 1.5)) * 0.3))}px)`,
            transition: 'opacity 0.3s ease-out'
          }}>
            {story}
          </h2>
        </section>
      ))}
    </div>
  );
};

// Quiz Teaser Component
const QuizTeaser = ({ onStartQuiz }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  
  const options = [
    "A Work Meeting",
    "A Casual Day Out", 
    "A Date Night",
    "A Special Event"
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '3rem',
      marginBottom: '3rem',
      backdropFilter: 'blur(10px)'
    }}>
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '2rem',
        fontWeight: '500'
      }}>
        What are you dressing for today?
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelectedOption(index)}
            style={{
              background: selectedOption === index ? 
                'rgba(255, 255, 255, 0.1)' : 
                'rgba(255, 255, 255, 0.03)',
              border: selectedOption === index ?
                '1px solid rgba(255, 255, 255, 0.3)' :
                '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              padding: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = selectedOption === index ? 
                'rgba(255, 255, 255, 0.1)' : 
                'rgba(255, 255, 255, 0.03)';
              e.target.style.borderColor = selectedOption === index ?
                'rgba(255, 255, 255, 0.3)' :
                'rgba(255, 255, 255, 0.1)';
            }}
          >
            {option}
          </button>
        ))}
      </div>
      
      <button
        onClick={onStartQuiz}
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 100%)',
          color: '#000000',
          border: 'none',
          padding: '16px 32px',
          fontSize: '1.1rem',
          fontWeight: '600',
          borderRadius: '50px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.05)';
          e.target.style.boxShadow = '0 15px 40px rgba(255, 255, 255, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0px) scale(1)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <ArrowRight size={18} />
        Start the Style Quiz
      </button>
    </div>
  );
};

// AI Features Component
const AIFeatures = () => {
  const features = [
    { icon: Brain, title: "Personalized suggestions", desc: "AI learns your unique style" },
    { icon: Calendar, title: "Based on your day", desc: "Perfect fits for every occasion" },
    { icon: Shirt, title: "Outfit visuals (coming soon)", desc: "See before you wear" }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {features.map((feature, index) => (
        <div
          key={index}
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.02)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'translateY(0px)';
          }}
        >
          <feature.icon size={48} style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            {feature.title}
          </h3>
          <p style={{
            opacity: 0.7,
            fontSize: '1rem'
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