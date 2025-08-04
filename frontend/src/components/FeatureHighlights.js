import React from 'react';
import AnimatedSection from './AnimatedSection';

const FeatureHighlights = () => {
  const features = [
    {
      emoji: '👗',
      title: 'Outfit ideas for any occasion',
      description: 'From boardroom to brunch, get perfectly curated looks'
    },
    {
      emoji: '🧠',
      title: 'Powered by your personality',
      description: 'AI that learns your unique style and preferences'
    },
    {
      emoji: '🔁',
      title: 'Fresh styles daily',
      description: 'Never run out of inspiration with daily recommendations'
    },
    {
      emoji: '📸',
      title: 'Coming soon: upload your closet',
      description: 'Mix and match from your existing wardrobe'
    },
    {
      emoji: '📊',
      title: 'Data-safe & privacy-first',
      description: 'Your style data stays secure and private'
    }
  ];

  return (
    <section style={{
      background: '#000000',
      color: '#FFFFFF',
      padding: '6rem 0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div className="container">
        <AnimatedSection animationType="slideInUp">
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '3rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            What You'll Love About BeStyle.ai
          </h2>
        </AnimatedSection>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {features.map((feature, index) => (
            <AnimatedSection 
              key={index} 
              animationType="slideInUp" 
              delay={200 + (index * 100)}
            >
              <div style={{
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.02)';
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '1rem',
                  display: 'block'
                }}>
                  {feature.emoji}
                </div>
                
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#ffffff'
                }}>
                  {feature.title}
                </h3>
                
                <p style={{
                  fontSize: '0.95rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.5'
                }}>
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;