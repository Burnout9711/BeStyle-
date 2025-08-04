import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const QuizIntroSection = ({ onStartQuiz }) => {
  const [selectedOptions, setSelectedOptions] = useState(new Set());

  const quickStyleOptions = [
    { id: 'work', label: 'A Work Meeting', icon: '💼' },
    { id: 'casual', label: 'A Casual Day Out', icon: '☕' },
    { id: 'date', label: 'A Date Night', icon: '✨' },
    { id: 'special', label: 'A Special Event', icon: '🎉' },
    { id: 'general', label: 'I Just Want to Look Good 😎', icon: '🔥' }
  ];

  const toggleOption = (optionId) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  return (
    <section className="quiz-intro-section" style={{
      background: 'linear-gradient(135deg, rgba(79, 127, 255, 0.05) 0%, rgba(0, 0, 0, 1) 50%, rgba(242, 84, 109, 0.05) 100%)',
      padding: '5rem 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Spotlight Effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(79, 127, 255, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        animation: 'pulse3d 6s ease-in-out infinite'
      }} />

      <div className="container">
        <div style={{ 
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Section Title */}
          <AnimatedSection animationType="slideInUp">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(79, 127, 255, 0.1)',
              border: '1px solid rgba(79, 127, 255, 0.2)',
              borderRadius: '2rem',
              padding: '0.5rem 1rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
              <span className="caption" style={{ 
                color: 'var(--accent-primary)', 
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.05em'
              }}>
                AI Style Discovery
              </span>
            </div>

            <h2 className="heading-hero" style={{ 
              marginBottom: '1.5rem',
              background: 'var(--gradient-primary)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Discover Your Perfect Look<br />in 60 Seconds
            </h2>
            
            <p className="body-large" style={{ 
              marginBottom: '3rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto 3rem'
            }}>
              Not sure what to wear? Let our AI stylist learn your preferences and suggest outfits tailored just for you.
            </p>
          </AnimatedSection>

          {/* Interactive Quick Style Check */}
          <AnimatedSection animationType="slideInUp" delay={300}>
            <div className="voice-card" style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(26, 26, 26, 0.9) 100%)',
              border: '1px solid rgba(79, 127, 255, 0.2)',
              maxWidth: '700px',
              margin: '0 auto 3rem',
              padding: '2.5rem',
              position: 'relative'
            }}>
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F7FFF' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.5
              }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 className="heading-2" style={{ 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🧠</span>
                  Quick Style Check: What are you dressing for today?
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  {quickStyleOptions.map((option, index) => (
                    <AnimatedSection key={option.id} animationType="slideInUp" delay={400 + (index * 100)}>
                      <button
                        onClick={() => toggleOption(option.id)}
                        className="hover-lift"
                        style={{
                          background: selectedOptions.has(option.id) 
                            ? 'var(--gradient-primary)' 
                            : 'rgba(79, 127, 255, 0.05)',
                          border: selectedOptions.has(option.id) 
                            ? '1px solid var(--accent-primary)' 
                            : '1px solid rgba(79, 127, 255, 0.2)',
                          borderRadius: '1rem',
                          padding: '1rem 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          transform: 'perspective(1000px) translateZ(0px)',
                          color: selectedOptions.has(option.id) ? 'white' : 'var(--text-primary)',
                          width: '100%',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedOptions.has(option.id)) {
                            e.target.style.background = 'rgba(79, 127, 255, 0.1)';
                            e.target.style.transform = 'perspective(1000px) translateZ(5px) scale(1.02)';
                            e.target.style.borderColor = 'var(--accent-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedOptions.has(option.id)) {
                            e.target.style.background = 'rgba(79, 127, 255, 0.05)';
                            e.target.style.transform = 'perspective(1000px) translateZ(0px) scale(1)';
                            e.target.style.borderColor = 'rgba(79, 127, 255, 0.2)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{option.icon}</span>
                          <span className="body-medium" style={{ fontWeight: '500' }}>
                            {option.label}
                          </span>
                        </div>
                        
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: selectedOptions.has(option.id) 
                            ? '2px solid white' 
                            : '2px solid var(--border-primary)',
                          background: selectedOptions.has(option.id) 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}>
                          {selectedOptions.has(option.id) && (
                            <Check size={16} style={{ color: 'white' }} />
                          )}
                        </div>
                      </button>
                    </AnimatedSection>
                  ))}
                </div>

                {selectedOptions.size > 0 && (
                  <AnimatedSection animationType="slideInUp" delay={900}>
                    <div style={{
                      background: 'rgba(79, 127, 255, 0.1)',
                      border: '1px solid rgba(79, 127, 255, 0.3)',
                      borderRadius: '1rem',
                      padding: '1rem',
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      <p className="body-small" style={{ color: 'var(--accent-primary)' }}>
                        ✨ Perfect! Our AI will focus on <strong>{selectedOptions.size === 1 ? 'this occasion' : 'these occasions'}</strong> when creating your style profile.
                      </p>
                    </div>
                  </AnimatedSection>
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* CTA Button */}
          <AnimatedSection animationType="slideInUp" delay={600}>
            <button
              className="btn-primary hover-scale pulse-element"
              onClick={() => {
                // Pass selected preferences to the quiz
                onStartQuiz({ selectedOccasions: Array.from(selectedOptions) });
              }}
              style={{
                fontSize: '1.1rem',
                padding: '1.2rem 2.5rem',
                background: 'var(--gradient-primary)',
                boxShadow: '0 10px 30px rgba(79, 127, 255, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', position: 'relative', zIndex: 2 }}>
                <ArrowRight 
                  size={20} 
                  style={{ 
                    transition: 'transform 0.3s ease',
                    animation: 'float 2s ease-in-out infinite'
                  }} 
                />
                Start the Style Quiz
                <ArrowRight 
                  size={20} 
                  style={{ 
                    transition: 'transform 0.3s ease',
                    animation: 'float 2s ease-in-out infinite reverse'
                  }} 
                />
              </span>
              
              {/* Animated background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                animation: 'shimmer 3s ease-in-out infinite'
              }} />
            </button>
          </AnimatedSection>

          {/* Trust Indicators */}
          <AnimatedSection animationType="slideInUp" delay={800}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem',
              marginTop: '2rem',
              flexWrap: 'wrap'
            }}>
              {[
                { icon: '⚡', text: '60 seconds', subtext: 'Quick & Easy' },
                { icon: '🧠', text: 'AI Powered', subtext: 'Smart Analysis' },
                { icon: '🎯', text: '100% Free', subtext: 'No Hidden Costs' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(245, 245, 245, 0.03)',
                  padding: '0.75rem 1rem',
                  borderRadius: '2rem',
                  border: '1px solid rgba(245, 245, 245, 0.1)'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <div>
                    <div className="body-small" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {item.text}
                    </div>
                    <div className="caption" style={{ color: 'var(--text-muted)' }}>
                      {item.subtext}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Additional animations are handled via CSS classes */}
    </section>
  );
};

export default QuizIntroSection;