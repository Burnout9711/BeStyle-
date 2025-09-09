from typing import Dict, Any, List
from models.quiz import QuizResponses, StyleProfile
from models.outfit import Outfit, OutfitItem
import logging
import asyncio

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        self.style_weights = {
            'Minimalist': {'clean': 0.9, 'simple': 0.8, 'neutral': 0.9},
            'Smart Casual': {'versatile': 0.8, 'professional': 0.7, 'comfortable': 0.6},
            'Formal': {'professional': 0.9, 'elegant': 0.8, 'structured': 0.9},
            'Streetwear': {'trendy': 0.8, 'casual': 0.9, 'bold': 0.7},
            'Sporty': {'comfortable': 0.9, 'functional': 0.8, 'athletic': 0.9},
            'Bohemian': {'artistic': 0.8, 'flowing': 0.7, 'unique': 0.8},
            'Trendy': {'fashionable': 0.9, 'current': 0.8, 'bold': 0.6}
        }
        
        self.body_type_advice = {
            'Slim': 'Focus on structured pieces and layering to add dimension',
            'Athletic': 'Emphasize your strong silhouette with fitted cuts and tailored pieces',
            'Average': 'You have flexibility - experiment with different fits and styles',
            'Curvy': 'Highlight your curves with well-fitted pieces that flatter your shape',
            'Plus-size': 'Choose pieces that celebrate your body with confidence and style'
        }
    
    async def analyze_style_profile(self, quiz_responses: QuizResponses) -> StyleProfile:
        """Analyze quiz responses to create user style profile"""
        try:
            # Determine primary style
            primary_styles = quiz_responses.current_style or ['Smart Casual', 'Minimalist']
            
            # Get body type advice
            body_advice = self.body_type_advice.get(
                quiz_responses.body_type, 
                'Focus on pieces that make you feel confident and comfortable'
            )
            
            # Extract color palette
            color_palette = quiz_responses.favorite_colors or ['Black', 'White', 'Navy', 'Beige']
            
            # Determine occasion priority
            occasion_priority = quiz_responses.help_occasions or ['Work/office', 'Casual daily wear']
            
            # Calculate confidence score
            confidence = await self.calculate_confidence_score(quiz_responses)
            
            return StyleProfile(
                primary_style=primary_styles[:2],  # Top 2 styles
                body_type_advice=body_advice,
                color_palette=color_palette[:4],  # Top 4 colors
                occasion_priority=occasion_priority[:3],  # Top 3 occasions
                confidence_score=confidence
            )
            
        except Exception as e:
            logger.error(f"Error analyzing style profile: {str(e)}")
            # Return default profile
            return StyleProfile(
                primary_style=['Smart Casual', 'Minimalist'],
                body_type_advice='Focus on pieces that make you feel confident',
                color_palette=['Black', 'White', 'Navy', 'Beige'],
                occasion_priority=['Work', 'Casual', 'Social Events'],
                confidence_score=85
            )
    
    async def calculate_confidence_score(self, quiz_responses: QuizResponses) -> int:
        """Calculate AI confidence score based on completeness and consistency of responses"""
        try:
            score = 60  # Base score
            
            # Completeness bonus
            filled_fields = 0
            total_fields = 0
            
            for field_name, field_value in quiz_responses.dict().items():
                total_fields += 1
                if field_value is not None and field_value != []:
                    filled_fields += 1
            
            completeness_ratio = filled_fields / total_fields if total_fields > 0 else 0
            score += int(completeness_ratio * 30)  # Up to 30 points for completeness
            
            # Consistency bonus
            if quiz_responses.current_style and quiz_responses.interested_styles:
                # Check style consistency
                current_styles = set(quiz_responses.current_style)
                interested_styles = set(quiz_responses.interested_styles)
                overlap = len(current_styles.intersection(interested_styles))
                if overlap > 0:
                    score += 5  # Consistency bonus
            
            # Goals clarity bonus
            if quiz_responses.goals and len(quiz_responses.goals) >= 2:
                score += 5  # Clear goals bonus
            
            # Cap at 95 to seem realistic
            return min(score, 95)
            
        except Exception as e:
            logger.error(f"Error calculating confidence score: {str(e)}")
            return 85
    
    async def get_personalized_recommendations(self, user_preferences: Dict[str, Any], count: int = 3) -> List[Dict[str, Any]]:
        """Generate personalized outfit recommendations based on simple preferences"""
        try:
            # Get curated outfit database
            outfits = await self._get_outfit_database()
            
            # Score each outfit based on user preferences
            scored_outfits = []
            for outfit in outfits:
                score = await self._calculate_outfit_score_simple(outfit, user_preferences)
                if score > 50:  # Only include relevant outfits
                    scored_outfits.append({
                        **outfit,
                        'match_score': score
                    })
            
            # Sort by score and return top count
            scored_outfits.sort(key=lambda x: x['match_score'], reverse=True)
            return scored_outfits[:count]
            
        except Exception as e:
            logger.error(f"Error generating personalized recommendations: {str(e)}")
            return await self._get_default_recommendations()

    async def generate_recommendations(self, quiz_responses: QuizResponses) -> List[Dict[str, Any]]:
        """Generate personalized outfit recommendations"""
        try:
            # Get curated outfit database (this would normally be from DB)
            outfits = await self._get_outfit_database()
            
            # Score each outfit based on user preferences
            scored_outfits = []
            for outfit in outfits:
                score = await self._calculate_outfit_score(outfit, quiz_responses)
                if score > 50:  # Only include relevant outfits
                    scored_outfits.append({
                        **outfit,
                        'match_score': score
                    })
            
            # Sort by score and return top 6
            scored_outfits.sort(key=lambda x: x['match_score'], reverse=True)
            return scored_outfits[:6]
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return await self._get_default_recommendations()
    
    async def _calculate_outfit_score(self, outfit: Dict[str, Any], quiz_responses: QuizResponses) -> int:
        """Calculate how well an outfit matches user preferences"""
        score = 50  # Base score
        
        try:
            # Style matching
            if quiz_responses.current_style:
                user_styles = set(quiz_responses.current_style)
                outfit_styles = set(outfit.get('style_types', []))
                if user_styles.intersection(outfit_styles):
                    score += 20
            
            # Occasion matching
            if quiz_responses.help_occasions:
                user_occasions = set(quiz_responses.help_occasions)
                outfit_occasion = outfit.get('occasion', '')
                
                occasion_mapping = {
                    'Work/office': ['Work', 'Professional', 'Business'],
                    'Casual daily wear': ['Casual', 'Weekend', 'Daily'],
                    'Dates': ['Date', 'Evening', 'Romantic'],
                    'Events/parties': ['Party', 'Event', 'Social']
                }
                
                for user_occ in user_occasions:
                    if outfit_occasion in occasion_mapping.get(user_occ, []):
                        score += 15
                        break
            
            # Body type compatibility (simple heuristic)
            if quiz_responses.body_type:
                body_types = outfit.get('body_types', ['All'])
                if 'All' in body_types or quiz_responses.body_type in body_types:
                    score += 10
            
            # Goals alignment
            if quiz_responses.goals:
                if 'Look more confident' in quiz_responses.goals:
                    if outfit.get('confidence', 0) > 90:
                        score += 10
                
                if 'Save time' in quiz_responses.goals:
                    if 'versatile' in outfit.get('description', '').lower():
                        score += 5
            
            return min(score, 100)  # Cap at 100
            
        except Exception as e:
            logger.error(f"Error calculating outfit score: {str(e)}")
            return 50
    
    async def _get_outfit_database(self) -> List[Dict[str, Any]]:
        """Get curated outfit database (this would be from MongoDB in production)"""
        return [
            {
                'id': 1,
                'title': 'Smart Professional',
                'occasion': 'Work',
                'description': 'Perfect for office meetings with a confident, professional vibe.',
                'confidence': 95,
                'color': 'linear-gradient(135deg, #4F7FFF 0%, rgba(79, 127, 255, 0.8) 100%)',
                'items': [
                    {'name': 'Tailored blazer', 'brand': 'Theory'},
                    {'name': 'Crisp button shirt', 'brand': 'Everlane'},
                    {'name': 'Straight-leg trousers', 'brand': 'J.Crew'},
                    {'name': 'Leather loafers', 'brand': 'Cole Haan'}
                ],
                'style_types': ['Smart Casual', 'Formal', 'Minimalist'],
                'body_types': ['All'],
                'seasons': ['Spring', 'Fall', 'Winter']
            },
            {
                'id': 2,
                'title': 'Weekend Explorer',
                'occasion': 'Casual',
                'description': 'Effortlessly stylish for weekend adventures and casual hangouts.',
                'confidence': 88,
                'color': 'linear-gradient(135deg, #F2546D 0%, rgba(242, 84, 109, 0.8) 100%)',
                'items': [
                    {'name': 'Soft knit sweater', 'brand': 'Uniqlo'},
                    {'name': 'High-waisted jeans', 'brand': 'Levi\'s'},
                    {'name': 'White sneakers', 'brand': 'Adidas'},
                    {'name': 'Canvas tote bag', 'brand': 'Baggu'}
                ],
                'style_types': ['Casual', 'Minimalist', 'Trendy'],
                'body_types': ['All'],
                'seasons': ['Spring', 'Summer', 'Fall']
            },
            {
                'id': 3,
                'title': 'Date Night Elegance',
                'occasion': 'Date',
                'description': 'Make a lasting impression with this sophisticated yet approachable look.',
                'confidence': 92,
                'color': 'linear-gradient(135deg, #1A1A1A 0%, rgba(26, 26, 26, 0.9) 100%)',
                'items': [
                    {'name': 'Silk midi dress', 'brand': 'Reformation'},
                    {'name': 'Delicate jewelry set', 'brand': 'Mejuri'},
                    {'name': 'Block heel sandals', 'brand': 'Sam Edelman'},
                    {'name': 'Clutch purse', 'brand': 'Mansur Gavriel'}
                ],
                'style_types': ['Formal', 'Trendy', 'Minimalist'],
                'body_types': ['All'],
                'seasons': ['Spring', 'Summer']
            },
            {
                'id': 4,
                'title': 'Athletic Luxe',
                'occasion': 'Gym',
                'description': 'High-performance meets high-style for your workout sessions.',
                'confidence': 90,
                'color': 'linear-gradient(135deg, #4F7FFF 0%, rgba(79, 127, 255, 0.6) 100%)',
                'items': [
                    {'name': 'Performance sports bra', 'brand': 'Lululemon'},
                    {'name': 'High-waisted leggings', 'brand': 'Alo Yoga'},
                    {'name': 'Lightweight jacket', 'brand': 'Nike'},
                    {'name': 'Training shoes', 'brand': 'APL'}
                ],
                'style_types': ['Sporty', 'Athletic'],
                'body_types': ['Athletic', 'Slim', 'Average'],
                'seasons': ['All']
            },
            {
                'id': 5,
                'title': 'Creative Professional',
                'occasion': 'Work',
                'description': 'Express your creativity while maintaining professional polish.',
                'confidence': 87,
                'color': 'linear-gradient(135deg, #F2546D 0%, rgba(242, 84, 109, 0.7) 100%)',
                'items': [
                    {'name': 'Oversized blazer', 'brand': 'Zara'},
                    {'name': 'Graphic tee', 'brand': 'A.P.C.'},
                    {'name': 'Wide-leg trousers', 'brand': 'COS'},
                    {'name': 'Platform oxfords', 'brand': 'Dr. Martens'}
                ],
                'style_types': ['Trendy', 'Smart Casual', 'Bohemian'],
                'body_types': ['All'],
                'seasons': ['Spring', 'Fall']
            },
            {
                'id': 6,
                'title': 'Travel Ready',
                'occasion': 'Travel',
                'description': 'Comfort meets style for long journeys and city exploration.',
                'confidence': 85,
                'color': 'linear-gradient(135deg, #1A1A1A 0%, rgba(26, 26, 26, 0.8) 100%)',
                'items': [
                    {'name': 'Merino wool cardigan', 'brand': 'Everlane'},
                    {'name': 'Stretch travel pants', 'brand': 'Betabrand'},
                    {'name': 'Comfortable sneakers', 'brand': 'Allbirds'},
                    {'name': 'Convertible backpack', 'brand': 'Away'}
                ],
                'style_types': ['Casual', 'Minimalist'],
                'body_types': ['All'],
                'seasons': ['All']
            }
        ]
    
    async def _get_default_recommendations(self) -> List[Dict[str, Any]]:
        """Return default recommendations if algo fails"""
        outfits = await self._get_outfit_database()
        return [
            {**outfit, 'match_score': 85} for outfit in outfits[:6]
        ]