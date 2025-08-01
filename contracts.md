# BeStyle.AI Backend API Contracts

## Overview
This document defines the API contracts for BeStyle.AI backend integration with the existing frontend. The frontend currently uses mock data that needs to be replaced with real backend endpoints.

## Current Mock Data Analysis

### Frontend Mock Data (src/data/mock.js):
- **Quiz Data**: 6-section quiz with 25+ questions
- **Outfit Suggestions**: 6 curated outfits with brand details
- **User Profiles**: Style analysis and preferences

## Required Backend Implementation

### 1. Database Models

#### User Quiz Response Model
```json
{
  "_id": "ObjectId",
  "sessionId": "string (UUID)",
  "userId": "string (optional for guests)",
  "responses": {
    "full_name": "string",
    "gender_identity": "string",
    "date_of_birth": "string",
    "city": "string",
    "height": "string",
    "weight": "string",
    "body_type": "string",
    "clothing_size": "string",
    "fit_preferences": "string",
    "current_style": ["string"],
    "interested_styles": ["string"],
    "favorite_colors": ["string"],
    "avoid_colors": ["string"],
    "occupation": "string",
    "typical_week": ["string"],
    "help_occasions": ["string"],
    "personality_words": "string",
    "style_inspiration": "string",
    "fashion_struggle": "string",
    "goals": ["string"],
    "photo_upload": "string (optional)",
    "ai_photo_suggestions": "string",
    "daily_suggestions": "string",
    "delivery_preference": "string"
  },
  "completedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Waitlist Model
```json
{
  "_id": "ObjectId", 
  "email": "string (unique)",
  "source": "string (landing_page, quiz_complete, etc.)",
  "userAgent": "string",
  "ipAddress": "string",
  "createdAt": "Date"
}
```

#### Outfit Suggestion Model
```json
{
  "_id": "ObjectId",
  "title": "string",
  "occasion": "string",
  "description": "string", 
  "confidence": "number",
  "color": "string (CSS gradient)",
  "items": [{
    "name": "string",
    "brand": "string", 
    "category": "string",
    "price": "number (optional)",
    "url": "string (optional)"
  }],
  "styleTypes": ["string"],
  "bodyTypes": ["string"],
  "seasons": ["string"],
  "isActive": "boolean",
  "createdAt": "Date"
}
```

### 2. API Endpoints

#### Quiz Management
```
POST /api/quiz/start
- Creates new quiz session
- Returns: { sessionId, currentStep: 0 }

POST /api/quiz/submit-step
- Body: { sessionId, stepNumber, answers }
- Returns: { nextStep, isComplete, validationErrors }

POST /api/quiz/complete
- Body: { sessionId }
- Processes completed quiz and generates recommendations
- Returns: { recommendations, confidenceScore, styleProfile }

GET /api/quiz/results/:sessionId
- Returns: { quizAnswers, recommendations, styleProfile, confidenceScore }
```

#### Outfit Recommendations  
```
POST /api/recommendations/generate
- Body: { quizAnswers } 
- Uses AI logic to match outfits based on user profile
- Returns: { outfits[], confidenceScore, styleProfile }

GET /api/outfits/:id
- Returns: Single outfit details

POST /api/outfits/save
- Body: { sessionId, outfitId }
- Saves outfit to user's favorites
- Returns: { success, message }
```

#### Waitlist Management
```
POST /api/waitlist/subscribe
- Body: { email, source?, metadata? }
- Returns: { success, message, position? }

GET /api/waitlist/stats
- Returns: { totalSubscribers, recentSignups }
```

### 3. AI Recommendation Engine

#### Style Analysis Algorithm
```python
def analyze_style_profile(quiz_answers):
    """
    Analyzes quiz responses to create user style profile
    """
    style_weights = calculate_style_weights(quiz_answers)
    body_type_analysis = analyze_body_type(quiz_answers)
    occasion_priorities = determine_occasions(quiz_answers)
    color_preferences = extract_color_preferences(quiz_answers)
    
    return {
        "primary_style": get_primary_styles(style_weights),
        "body_type_advice": body_type_analysis,
        "color_palette": color_preferences,
        "occasion_priority": occasion_priorities,
        "confidence_score": calculate_confidence(quiz_answers)
    }

def generate_recommendations(style_profile, limit=6):
    """
    Generates personalized outfit recommendations
    """
    # Filter outfits by style compatibility
    # Score based on body type, occasion, colors
    # Return top-rated recommendations with confidence scores
```

### 4. Frontend Integration Points

#### Replace Mock Data Usage:

**Current**: `mockQuizData` in QuizPage.js
**Replace with**: API call to `/api/quiz/start` and dynamic question loading

**Current**: `mockOutfitSuggestions` in ResultsPage.js  
**Replace with**: API call to `/api/quiz/results/:sessionId`

**Current**: localStorage quiz storage
**Replace with**: Session-based storage via sessionId

**Current**: Static waitlist form
**Replace with**: API call to `/api/waitlist/subscribe`

### 5. Integration Workflow

1. **Quiz Start**: 
   - Frontend calls `/api/quiz/start`
   - Receives sessionId and stores in state
   - Loads quiz questions dynamically

2. **Quiz Progress**:
   - Each step submission calls `/api/quiz/submit-step`
   - Backend validates and stores responses
   - Returns next step or completion status

3. **Results Generation**:
   - Quiz completion triggers `/api/quiz/complete`
   - AI engine processes responses
   - Generates personalized recommendations

4. **Results Display**:
   - Frontend fetches results via `/api/quiz/results/:sessionId`
   - Displays confidence scores, style profile, and outfit recommendations
   - Removes dependency on localStorage

5. **Waitlist Integration**:
   - Email form submits to `/api/waitlist/subscribe`
   - Backend stores with metadata and analytics
   - Returns success confirmation

### 6. Error Handling

```javascript
// Frontend error handling patterns
try {
  const response = await fetch(`${API_URL}/quiz/submit-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, stepNumber, answers })
  });
  
  if (!response.ok) {
    throw new Error(`Quiz submission failed: ${response.status}`);
  }
  
  const result = await response.json();
  // Handle success
} catch (error) {
  // Show user-friendly error message
  showErrorToast('Unable to save quiz progress. Please try again.');
}
```

### 7. Performance Considerations

- **Caching**: Cache outfit database queries
- **Validation**: Server-side input validation for all endpoints
- **Rate Limiting**: Protect waitlist endpoint from spam
- **Session Management**: Expire quiz sessions after 24 hours
- **Database Indexing**: Index on sessionId, email, createdAt

### 8. Security Requirements

- Input sanitization for all user data
- Email validation for waitlist
- CORS configuration for frontend domain
- Rate limiting on public endpoints  
- Session token validation
- No sensitive data in logs

## Implementation Priority

1. **Phase 1 (Core)**: Quiz models, quiz endpoints, basic recommendations
2. **Phase 2 (Features)**: AI recommendation engine, outfit matching
3. **Phase 3 (Enhancements)**: Waitlist, analytics, performance optimization

This contract ensures seamless integration between the existing frontend and new backend while maintaining the current user experience.