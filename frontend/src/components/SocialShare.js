import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Instagram, Copy, Check } from 'lucide-react';

const SocialShare = ({ outfit, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl] = useState(window.location.href);

  const shareText = `Check out this ${outfit.occasion} outfit styled by BeStyle.AI! ${outfit.description}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BeStyle.AI ${outfit.occasion} Outfit`,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      color: '#1877f2'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: '#1da1f2'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: '#',
      color: '#e4405f',
      action: () => alert('Copy the link and share on Instagram!')
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div 
        className="voice-card"
        style={{
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Share2 size={24} style={{ marginRight: '0.5rem', color: 'var(--accent-purple-400)' }} />
          <h3 className="heading-3">Share Your Style</h3>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p className="body-small" style={{ color: 'var(--text-muted)' }}>
            Share this amazing {outfit.occasion.toLowerCase()} outfit with your friends!
          </p>
        </div>

        {/* Social Media Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          {socialLinks.map((social) => (
            <button
              key={social.name}
              onClick={social.action || (() => window.open(social.url, '_blank'))}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: 'none',
                background: social.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: 'perspective(1000px) translateZ(0px)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'perspective(1000px) translateZ(10px) scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'perspective(1000px) translateZ(0px) scale(1)';
              }}
            >
              <social.icon size={20} />
            </button>
          ))}
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="btn-secondary"
          style={{
            width: '100%',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {/* Native Share Button (if supported) */}
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="btn-primary"
            style={{
              width: '100%',
              marginBottom: '1rem'
            }}
          >
            <Share2 size={16} style={{ marginRight: '0.5rem' }} />
            Share
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-secondary"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SocialShare;