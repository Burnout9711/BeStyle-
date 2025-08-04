import React, { useState } from 'react';
import { ArrowRight, Check, Lock, Mail, Instagram } from 'lucide-react';
import { waitlistAPI } from '../services/api';
import AnimatedSection from './AnimatedSection';

const WaitlistSection = () => {
  const [formData, setFormData] = useState({
    email: '',
    instagram: '',
    agreeToUpdates: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Agreement validation
    if (!formData.agreeToUpdates) {
      newErrors.agreement = 'Please agree to receive updates';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would make the actual API call to your backend
      // const response = await fetch('/api/waitlist/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     instagram: formData.instagram,
      //     source: 'waitlist_section'
      //   })
      // });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Waitlist submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="waitlist-section" style={{
        background: '#000000',
        color: '#FFFFFF',
        padding: '6rem 0',
        textAlign: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div className="container">
          <AnimatedSection animationType="slideInUp">
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '3rem 2rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                animation: 'pulse3d 2s ease-in-out infinite'
              }}>
                <Check size={40} style={{ color: 'white' }} />
              </div>
              
              <h2 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: '600',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                🎉 You're officially on the waitlist!
              </h2>
              
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                We'll notify you when your AI stylist is ready.
              </p>
              
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.6)',
                fontStyle: 'italic'
              }}>
                Until then… stay stylish 👗✨
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  return (
    <section className="waitlist-section" style={{
      background: '#000000',
      color: '#FFFFFF',
      padding: '6rem 0',
      textAlign: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative'
    }}>
      {/* Subtle background gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <AnimatedSection animationType="slideInUp">
          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <Lock size={36} style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
              Join the BeStyle.ai Waitlist
            </h2>
            
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Get early access to your personal AI stylist. Be one of the first to experience a smarter way to dress.
            </p>
          </div>
        </AnimatedSection>

        {/* Form */}
        <AnimatedSection animationType="slideInUp" delay={200}>
          <form onSubmit={handleSubmit} style={{
            maxWidth: '500px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Email Field */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  zIndex: 1
                }} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 50px',
                    fontSize: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: errors.email 
                      ? '2px solid #ff4757' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                />
              </div>
              {errors.email && (
                <p style={{
                  color: '#ff4757',
                  fontSize: '14px',
                  marginTop: '8px',
                  marginLeft: '4px'
                }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Instagram Field */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ position: 'relative' }}>
                <Instagram size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  zIndex: 1
                }} />
                <input
                  type="text"
                  placeholder="@yourusername (optional)"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 50px',
                    fontSize: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                />
              </div>
            </div>

            {/* Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              textAlign: 'left',
              marginTop: '8px'
            }}>
              <button
                type="button"
                onClick={() => handleInputChange('agreeToUpdates', !formData.agreeToUpdates)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: errors.agreement 
                    ? '2px solid #ff4757' 
                    : '2px solid rgba(255, 255, 255, 0.3)',
                  background: formData.agreeToUpdates 
                    ? '#FFFFFF' 
                    : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  marginTop: '2px',
                  flexShrink: 0
                }}
              >
                {formData.agreeToUpdates && (
                  <Check size={14} style={{ color: '#000000' }} />
                )}
              </button>
              
              <label style={{
                fontSize: '15px',
                color: errors.agreement ? '#ff4757' : 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.5',
                cursor: 'pointer'
              }} onClick={() => handleInputChange('agreeToUpdates', !formData.agreeToUpdates)}>
                I want early access and agree to receive style updates from BeStyle.ai
              </label>
            </div>
            {errors.agreement && (
              <p style={{
                color: '#ff4757',
                fontSize: '14px',
                marginTop: '-8px',
                marginLeft: '32px'
              }}>
                {errors.agreement}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: '#FFFFFF',
                color: '#000000',
                border: 'none',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                fontFamily: 'inherit',
                opacity: isLoading ? 0.7 : 1,
                transform: 'perspective(1000px) translateZ(0px)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#000000';
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'perspective(1000px) translateZ(2px) scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.color = '#000000';
                  e.target.style.transform = 'perspective(1000px) translateZ(0px) scale(1)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    borderTopColor: '#000000',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Joining...
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  Join the Waitlist
                </>
              )}
            </button>
          </form>
        </AnimatedSection>

        {/* Trust Indicators */}
        <AnimatedSection animationType="slideInUp" delay={400}>
          <div style={{
            marginTop: '3rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            {[
              { text: 'No spam, ever', icon: '🔒' },
              { text: 'Exclusive access', icon: '⭐' },
              { text: 'Unsubscribe anytime', icon: '✌️' }
            ].map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default WaitlistSection;