import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const OutfitSuggestionsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const questions = [
    {
      id: 'occasion',
      title: 'What\'s the occasion?',
      type: 'single',
      options: [
        { value: 'work', label: '💼 Work/Professional', description: 'Office meetings, presentations' },
        { value: 'date', label: '💕 Date Night', description: 'Romantic dinner, evening out' },
        { value: 'casual', label: '☕ Casual Hangout', description: 'Weekend, friends, relaxed' },
        { value: 'event', label: '🎉 Special Event', description: 'Party, celebration, gathering' },
        { value: 'travel', label: '✈️ Travel', description: 'Comfortable for long journeys' },
        { value: 'gym', label: '🏃‍♀️ Active/Gym', description: 'Workout, sports, active lifestyle' }
      ]
    },
    {
      id: 'mood',
      title: 'What mood are you going for?',
      type: 'single',
      options: [
        { value: 'confident', label: '💪 Confident & Bold', description: 'Make a statement' },
        { value: 'comfortable', label: '🌸 Comfortable & Relaxed', description: 'Ease and comfort first' },
        { value: 'elegant', label: '✨ Elegant & Sophisticated', description: 'Refined and polished' },
        { value: 'fun', label: '🌈 Fun & Playful', description: 'Express personality' },
        { value: 'minimalist', label: '⚪ Clean & Minimalist', description: 'Simple and sleek' }
      ]
    },
    {
      id: 'colors',
      title: 'Which colors are you drawn to today?',
      type: 'multiple',
      maxSelections: 3,
      options: [
        { value: 'black', label: 'Black', color: '#000000' },
        { value: 'white', label: 'White', color: '#FFFFFF' },
        { value: 'navy', label: 'Navy', color: '#1e3a8a' },
        { value: 'gray', label: 'Gray', color: '#6b7280' },
        { value: 'beige', label: 'Beige', color: '#f5f5dc' },
        { value: 'brown', label: 'Brown', color: '#8b4513' },
        { value: 'red', label: 'Red', color: '#dc2626' },
        { value: 'pink', label: 'Pink', color: '#ec4899' },
        { value: 'purple', label: 'Purple', color: '#7c3aed' },
        { value: 'blue', label: 'Blue', color: '#2563eb' },
        { value: 'green', label: 'Green', color: '#059669' },
        { value: 'yellow', label: 'Yellow', color: '#eab308' }
      ]
    },
    {
      id: 'style_preference',
      title: 'Any specific style preferences for this outfit?',
      type: 'multiple',
      maxSelections: 2,
      options: [
        { value: 'structured', label: '🏢 Structured & Tailored', description: 'Clean lines, fitted' },
        { value: 'flowy', label: '🌊 Flowy & Loose', description: 'Comfortable, relaxed fit' },
        { value: 'layered', label: '📚 Layered & Textured', description: 'Multiple pieces, depth' },
        { value: 'statement', label: '⚡ Statement Piece', description: 'One standout item' },
        { value: 'classic', label: '👑 Classic & Timeless', description: 'Traditional, elegant' },
        { value: 'trendy', label: '🔥 On-Trend', description: 'Current fashion forward' }
      ]
    },
    {
      id: 'budget',
      title: 'What\'s your budget range for this outfit?',
      type: 'single',
      options: [
        { value: 'budget', label: '💰 Budget-Friendly', description: 'Under $200 total' },
        { value: 'moderate', label: '💎 Moderate', description: '$200-500 total' },
        { value: 'premium', label: '👑 Premium', description: '$500+ total' },
        { value: 'no_limit', label: '🌟 No Budget Limit', description: 'Best recommendations regardless of price' }
      ]
    }
  ];

  const handleAnswer = (questionId, value) => {
    const question = questions[currentStep];
    
    if (question.type === 'single') {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    } else if (question.type === 'multiple') {
      setAnswers(prev => {
        const currentAnswers = prev[questionId] || [];
        const maxSelections = question.maxSelections || 3;
        
        if (currentAnswers.includes(value)) {
          // Remove if already selected
          return {
            ...prev,
            [questionId]: currentAnswers.filter(v => v !== value)
          };
        } else if (currentAnswers.length < maxSelections) {
          // Add if under limit
          return {
            ...prev,
            [questionId]: [...currentAnswers, value]
          };
        }
        return prev; // Don't add if at limit
      });
    }
  };

  const canProceed = () => {
    const question = questions[currentStep];
    const answer = answers[question.id];
    
    if (question.type === 'single') {
      return answer !== undefined;
    } else if (question.type === 'multiple') {
      return answer && answer.length > 0;
    }
    return false;
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateRecommendations();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock recommendations based on answers
      const mockRecommendations = generateMockOutfits(answers);
      setRecommendations(mockRecommendations);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockOutfits = (userAnswers) => {
    const outfitTemplates = {
      work: {
        title: 'Professional Power',
        description: 'Command attention in the boardroom with this polished ensemble.',
        items: [
          { name: 'Tailored blazer', brand: 'Theory', price: 295 },
          { name: 'Silk blouse', brand: 'Equipment', price: 158 },
          { name: 'Straight trousers', brand: 'J.Crew', price: 128 },
          { name: 'Leather pumps', brand: 'Cole Haan', price: 180 }
        ]
      },
      date: {
        title: 'Romantic Elegance',
        description: 'Strike the perfect balance between sophisticated and approachable.',
        items: [
          { name: 'Wrap dress', brand: 'Diane von Furstenberg', price: 268 },
          { name: 'Statement earrings', brand: 'Mejuri', price: 85 },
          { name: 'Block heels', brand: 'Sam Edelman', price: 130 },
          { name: 'Clutch bag', brand: 'Mansur Gavriel', price: 195 }
        ]
      },
      casual: {
        title: 'Effortless Chic',
        description: 'Look put-together without trying too hard.',
        items: [
          { name: 'Cashmere sweater', brand: 'Everlane', price: 118 },
          { name: 'High-rise jeans', brand: "Levi's", price: 89 },
          { name: 'White sneakers', brand: 'Veja', price: 120 },
          { name: 'Crossbody bag', brand: 'Polene', price: 290 }
        ]
      },
      event: {
        title: 'Show Stopper',
        description: 'Make an unforgettable entrance at any celebration.',
        items: [
          { name: 'Midi cocktail dress', brand: 'Reformation', price: 218 },
          { name: 'Statement necklace', brand: 'Jennifer Fisher', price: 165 },
          { name: 'Strappy heels', brand: 'Stuart Weitzman', price: 425 },
          { name: 'Beaded clutch', brand: 'Cult Gaia', price: 198 }
        ]
      },
      travel: {
        title: 'Jet Set Ready',
        description: 'Comfortable meets stylish for your next adventure.',
        items: [
          { name: 'Knit cardigan', brand: 'Uniqlo', price: 49 },
          { name: 'Travel leggings', brand: 'Athleta', price: 89 },
          { name: 'Slip-on sneakers', brand: 'Allbirds', price: 95 },
          { name: 'Convertible tote', brand: 'Away', price: 195 }
        ]
      },
      gym: {
        title: 'Athletic Luxe',
        description: 'Performance meets style for your active lifestyle.',
        items: [
          { name: 'Sports bra', brand: 'Lululemon', price: 58 },
          { name: 'High-waist leggings', brand: 'Alo Yoga', price: 88 },
          { name: 'Oversized hoodie', brand: 'Outdoor Voices', price: 75 },
          { name: 'Training shoes', brand: 'APL', price: 140 }
        ]
      }
    };

    const occasion = userAnswers.occasion || 'casual';
    const baseOutfit = outfitTemplates[occasion];
    
    // Generate color variations based on user preferences
    const colors = userAnswers.colors || ['black', 'white', 'navy'];
    const primaryColor = colors[0];
    
    const colorGradients = {
      black: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b69 100%)',
      white: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      navy: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      red: 'linear-gradient(135deg, #dc2626 0%, #be185d 100%)',
      pink: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      purple: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
      blue: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      green: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      yellow: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)',
      gray: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      beige: 'linear-gradient(135deg, #f5f5dc 0%, #d6d3d1 100%)',
      brown: 'linear-gradient(135deg, #8b4513 0%, #7c2d12 100%)'
    };

    return [
      {
        id: Date.now(),
        title: baseOutfit.title,
        occasion: occasion,
        description: baseOutfit.description,
        confidence: 95,
        color: colorGradients[primaryColor] || colorGradients.black,
        items: baseOutfit.items,
        match_score: 94,
        created_at: new Date().toISOString(),
        preferences: userAnswers
      },
      // Add 2 more variations
      {
        id: Date.now() + 1,
        title: baseOutfit.title + ' - Alternative',
        occasion: occasion,
        description: 'A fresh take on your perfect style match.',
        confidence: 92,
        color: colorGradients[colors[1]] || colorGradients.navy,
        items: baseOutfit.items.map(item => ({...item, price: Math.round(item.price * 0.8)})),
        match_score: 91,
        created_at: new Date().toISOString(),
        preferences: userAnswers
      },
      {
        id: Date.now() + 2,
        title: baseOutfit.title + ' - Budget',
        occasion: occasion,
        description: 'Great style doesn\'t have to break the bank.',
        confidence: 89,
        color: colorGradients[colors[2]] || colorGradients.gray,
        items: baseOutfit.items.map(item => ({...item, price: Math.round(item.price * 0.6), brand: 'Budget Option'})),
        match_score: 88,
        created_at: new Date().toISOString(),
        preferences: userAnswers
      }
    ];
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">✨</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Creating Your Perfect Outfits
            </h2>
            <p className="text-gray-300 mb-6">
              Our AI is analyzing your preferences and curating personalized recommendations just for you...
            </p>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-sm text-gray-400 space-y-1">
                <div>✓ Analyzing style preferences</div>
                <div>✓ Matching colors and occasions</div>
                <div>✓ Curating brand recommendations</div>
                <div className="text-purple-300">✨ Finalizing your perfect looks...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Your Perfect Outfits ✨
            </h1>
            <p className="text-gray-300 text-lg">
              Here are 3 personalized recommendations based on your preferences
            </p>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {recommendations.map((outfit, index) => (
              <div key={outfit.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
                <div 
                  className="h-40 p-6 flex items-center justify-center relative"
                  style={{ background: outfit.color }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {index === 0 ? '👑' : index === 1 ? '💎' : '💰'}
                    </div>
                    <h3 className="text-white text-xl font-bold mb-1">{outfit.title}</h3>
                    <p className="text-white/80 text-sm capitalize">{outfit.occasion}</p>
                    <div className="mt-2 flex items-center justify-center">
                      <span className="text-white/70 text-xs">Match: {outfit.match_score}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-300 text-sm mb-4">{outfit.description}</p>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium text-sm">Complete Look</h4>
                    {outfit.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{item.name}</span>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs">{item.brand}</div>
                          <div className="text-white font-medium">${item.price}</div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-white/10 pt-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Total</span>
                        <span className="text-white font-bold text-lg">
                          ${outfit.items.reduce((sum, item) => sum + item.price, 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-200">
                      ❤️ Save to Favorites
                    </button>
                    <button className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-medium border border-white/10 transition-all duration-200">
                      🛍️ Shop This Look
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setAnswers({});
                  setShowResults(false);
                  setRecommendations([]);
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                🔄 Get New Suggestions
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                👤 Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentStep];
  const currentAnswers = answers[question.id] || (question.type === 'multiple' ? [] : undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Get New Outfit Suggestions</h2>
            <span className="text-gray-400 text-sm">
              Step {currentStep + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {question.title}
          </h3>

          {question.type === 'single' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(question.id, option.value)}
                  className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                    currentAnswers === option.value
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.label.split(' ')[0]}</div>
                  <div className="font-medium text-lg mb-2">
                    {option.label.split(' ').slice(1).join(' ')}
                  </div>
                  {option.description && (
                    <div className="text-sm opacity-75">{option.description}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {question.type === 'multiple' && question.id === 'colors' && (
            <div>
              <p className="text-gray-400 text-center mb-6">
                Select up to {question.maxSelections} colors
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      currentAnswers.includes(option.value)
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/20"
                      style={{ backgroundColor: option.color }}
                    />
                    <div className="text-white text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {question.type === 'multiple' && question.id !== 'colors' && (
            <div>
              <p className="text-gray-400 text-center mb-6">
                Select up to {question.maxSelections} options
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                      currentAnswers.includes(option.value)
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium text-lg mb-2">{option.label}</div>
                    {option.description && (
                      <div className="text-sm opacity-75">{option.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 0
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            ← Previous
          </button>

          <div className="text-center">
            {question.type === 'multiple' && currentAnswers.length > 0 && (
              <p className="text-gray-400 text-sm">
                {currentAnswers.length} of {question.maxSelections} selected
              </p>
            )}
          </div>

          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              canProceed()
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep === questions.length - 1 ? '✨ Generate Outfits' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutfitSuggestionsPage;