// Mock data for the BeStyle.AI quiz and results

export const mockQuizData = {
  basicInfo: [
    {
      id: 'full_name',
      question: 'What is your full name or nickname you\'d like us to use?',
      type: 'text',
      placeholder: 'Enter your name'
    },
    {
      id: 'gender_identity',
      question: 'What\'s your gender identity?',
      type: 'multiple-choice',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other']
    },
    {
      id: 'date_of_birth',
      question: 'What\'s your date of birth?',
      type: 'text',
      placeholder: 'MM/DD/YYYY'
    },
    {
      id: 'city',
      question: 'Which city are you currently based in?',
      type: 'text',
      placeholder: 'Enter your city'
    }
  ],
  
  bodyType: [
    {
      id: 'height',
      question: 'What is your height?',
      type: 'text',
      placeholder: 'e.g., 6\'1" or 185 cm'
    },
    {
      id: 'weight',
      question: 'What is your weight?',
      type: 'text',
      placeholder: 'e.g., 83 kg or 180 lbs'
    },
    {
      id: 'body_type',
      question: 'What\'s your body type?',
      type: 'multiple-choice',
      options: ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus-size', 'Other']
    },
    {
      id: 'clothing_size',
      question: 'What\'s your usual clothing size?',
      type: 'multiple-choice',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'fit_preferences',
      question: 'Any fit preferences?',
      type: 'multiple-choice',
      options: ['Slim fit', 'Regular fit', 'Loose fit', 'Depends on occasion']
    }
  ],
  
  stylePreferences: [
    {
      id: 'current_style',
      question: 'How would you describe your current style? (Choose all that apply)',
      type: 'multi-select',
      options: ['Minimalist', 'Casual', 'Smart Casual', 'Formal', 'Streetwear', 'Sporty', 'Bohemian', 'Trendy', 'Don\'t know yet']
    },
    {
      id: 'interested_styles',
      question: 'What styles are you interested in exploring?',
      type: 'multi-select',
      options: ['Minimalist', 'Casual', 'Smart Casual', 'Formal', 'Streetwear', 'Sporty', 'Bohemian', 'Trendy', 'Vintage', 'Preppy']
    },
    {
      id: 'favorite_colors',
      question: 'Which colors do you love wearing?',
      type: 'multi-select',
      options: ['Black', 'White', 'Gray', 'Navy', 'Beige', 'Brown', 'Red', 'Blue', 'Green', 'Pink', 'Yellow', 'Purple']
    },
    {
      id: 'avoid_colors',
      question: 'Which colors do you avoid?',
      type: 'multi-select',
      options: ['Black', 'White', 'Gray', 'Navy', 'Beige', 'Brown', 'Red', 'Blue', 'Green', 'Pink', 'Yellow', 'Purple', 'None']
    }
  ],
  
  lifestyle: [
    {
      id: 'occupation',
      question: 'What do you do for a living?',
      type: 'text',
      placeholder: 'Job title or student, etc.'
    },
    {
      id: 'typical_week',
      question: 'What does your typical week look like?',
      type: 'multi-select',
      options: ['Mostly work', 'Gym & sports', 'Social outings', 'Travel', 'Home-based']
    },
    {
      id: 'help_occasions',
      question: 'Where do you need help dressing better? (Pick 2–3)',
      type: 'multi-select',
      options: ['Work/office', 'Casual daily wear', 'Dates', 'Gym', 'Events/parties', 'Travel looks', 'Social media outfits']
    }
  ],
  
  personality: [
    {
      id: 'personality_words',
      question: 'What three words best describe your personality?',
      type: 'textarea',
      placeholder: 'e.g., Creative, confident, adventurous'
    },
    {
      id: 'style_inspiration',
      question: 'Who\'s your style inspiration?',
      type: 'text',
      placeholder: 'Celebrity, influencer, or even a friend'
    },
    {
      id: 'fashion_struggle',
      question: 'What\'s your biggest fashion struggle?',
      type: 'textarea',
      placeholder: 'Share your biggest challenge with styling'
    },
    {
      id: 'goals',
      question: 'What is your goal with BeStyle.ai?',
      type: 'multi-select',
      options: ['Look more confident', 'Discover my style', 'Save time', 'Impress someone 😉', 'Upgrade my wardrobe']
    }
  ],
  
  visualAid: [
    {
      id: 'photo_upload',
      question: 'Upload a photo of yourself (Optional)',
      type: 'file',
      placeholder: 'Choose file'
    },
    {
      id: 'ai_photo_suggestions',
      question: 'Would you like to get AI-generated outfit suggestions on your own photo?',
      type: 'multiple-choice',
      options: ['Yes', 'No', 'Maybe later']
    },
    {
      id: 'daily_suggestions',
      question: 'Would you like daily outfit suggestions?',
      type: 'multiple-choice',
      options: ['Yes', 'No', 'Only on special occasions']
    },
    {
      id: 'delivery_preference',
      question: 'How would you like to receive your looks?',
      type: 'multiple-choice',
      options: ['In-app', 'Email', 'WhatsApp']
    }
  ]
};

export const mockOutfitSuggestions = [
  {
    id: 1,
    title: 'Smart Casual Monday',
    occasion: 'Work',
    description: 'Perfect for office meetings with a relaxed vibe. This outfit balances professionalism with comfort.',
    color: 'var(--accent-blue-200)',
    items: [
      { name: 'Tailored blazer', brand: 'Uniqlo' },
      { name: 'White button shirt', brand: 'Everlane' },
      { name: 'Dark jeans', brand: 'Levi\'s' },
      { name: 'Leather loafers', brand: 'Cole Haan' }
    ],
    confidence: 95
  },
  {
    id: 2,
    title: 'Weekend Casual',
    occasion: 'Casual',
    description: 'Effortlessly stylish for weekend outings, coffee dates, or casual hangouts with friends.',
    color: 'var(--accent-green-200)',
    items: [
      { name: 'Crew neck sweater', brand: 'J.Crew' },
      { name: 'Chino pants', brand: 'Bonobos' },
      { name: 'White sneakers', brand: 'Adidas' },
      { name: 'Canvas backpack', brand: 'Herschel' }
    ],
    confidence: 92
  },
  {
    id: 3,
    title: 'Date Night Special',
    occasion: 'Date',
    description: 'Make a great first impression with this sophisticated yet approachable date night look.',
    color: 'var(--accent-pink-200)',
    items: [
      { name: 'Silk blouse', brand: 'Equipment' },
      { name: 'High-waisted jeans', brand: 'Madewell' },
      { name: 'Statement earrings', brand: 'Mejuri' },
      { name: 'Ankle boots', brand: 'Sam Edelman' }
    ],
    confidence: 89
  },
  {
    id: 4,
    title: 'Gym Ready',
    occasion: 'Workout',
    description: 'Functional and stylish activewear that transitions from gym to street effortlessly.',
    color: 'var(--accent-orange-200)',
    items: [
      { name: 'Sports bra', brand: 'Lululemon' },
      { name: 'High-waisted leggings', brand: 'Alo' },
      { name: 'Lightweight jacket', brand: 'Nike' },
      { name: 'Training shoes', brand: 'APL' }
    ],
    confidence: 96
  },
  {
    id: 5,
    title: 'Event Ready',
    occasion: 'Party',
    description: 'Stand out at your next event with this eye-catching yet tasteful party outfit.',
    color: 'var(--accent-purple-200)',
    items: [
      { name: 'Midi dress', brand: 'Reformation' },
      { name: 'Strappy heels', brand: 'Stuart Weitzman' },
      { name: 'Clutch bag', brand: 'Mansur Gavriel' },
      { name: 'Delicate jewelry', brand: 'Mejuri' }
    ],
    confidence: 94
  },
  {
    id: 6,
    title: 'Travel Comfort',
    occasion: 'Travel',
    description: 'Comfortable yet put-together for long flights and exploring new destinations.',
    color: 'var(--accent-grey-200)',
    items: [
      { name: 'Cozy cardigan', brand: 'Everlane' },
      { name: 'Comfortable jeans', brand: 'Athleta' },
      { name: 'Slip-on sneakers', brand: 'Veja' },
      { name: 'Crossbody bag', brand: 'Away' }
    ],
    confidence: 91
  }
];

export const mockUserProfile = {
  name: 'Alex Johnson',
  stylePersonality: 'Minimalist Creative',
  bodyType: 'Athletic',
  primaryGoals: ['Look more confident', 'Save time'],
  favoriteColors: ['Black', 'White', 'Navy', 'Beige'],
  avoidColors: ['Yellow', 'Pink'],
  lifestyle: 'Professional with active social life'
};