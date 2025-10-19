import json
import random
import time
from typing import Dict, Any, List
from models.quiz import QuizResponses, StyleProfile
from models.outfit import Outfit, OutfitItem
import logging
import asyncio
from google import genai
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables

client = genai.Client(api_key="AIzaSyCpHd796BqhFipMfhhKzAdnKSy1PFuR4sA")

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
            logger.debug(f"Calculating confidence score for quiz responses: {quiz_responses.dict()}")
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
    
    async def get_gemini_recommendations(self, style_profile: StyleProfile) -> Dict[str, Any]:
        """
        Interacts with the Gemini API to get personalized recommendations
        and advice based on the user's style profile.
        """
        try:
            logger.info("Generating recommendations using Gemini API...")
            
            # --- Prompt Engineering: This is crucial ---
            prompt = f"""
            You are a professional fashion stylist. Your goal is to provide personalized and stylish outfit recommendations based on a user's style profile.

            The user's profile is as follows:
            - Primary Styles: {', '.join(style_profile.primary_style)}
            - Body Type Advice: {style_profile.body_type_advice}
            - Color Palette: {', '.join(style_profile.color_palette)}
            - Occasion Priority: {', '.join(style_profile.occasion_priority)}
            - Confidence Score: {style_profile.confidence_score} (This score indicates how confident we are in the user's preferences. A higher score means more precise recommendations are possible.)

            Please generate a JSON object containing:
            1.  A "personal_advice" string: A brief, friendly paragraph of styling advice.
            2.  An "outfit_recommendations" list: A list of 3-5 distinct outfits. Each outfit object must have:
                - "title": A descriptive name for the outfit.
                - "occasion": The occasion for the outfit (e.g., "Work", "Casual", "Date").
                - "confidence": A confidence score (0-100) indicating how well this outfit matches the user's profile.
                - "description": A short description of the outfit and its vibe.
                - "items": A list of dicts, where each dict has "name" and "brand" keys for individual clothing items.
                - "color": A hex color code or gradient that represents the outfit's overall color scheme.
                - "style_types": A list of style tags that best describe the outfit (e.g., ["Smart Casual", "Minimalist"]).
                - "body_types": A list of body types this outfit is suitable for (e.g., ["All", "Curvy"]).
                - "seasons": A list of seasons this outfit is appropriate for (e.g., ["Spring", "Fall"]).
                
            Ensure the entire response is a single, valid JSON object. Do not include any text before or after the JSON.
            """
            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash", contents=prompt
                )
            logger.debug(f" we are caling Gemini API response: {response.text}")
            # Extract and parse the JSON content from the response
            # Note: The model may return a response object that needs careful handling.
            # You might need to check if the content exists and is properly formatted.
            response_text = response.text.replace('```json', '').replace('```', '').strip()
            
            return json.loads(response_text)

        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            # Fallback to a predefined or default recommendation
            return {
                "personal_advice": "I'm sorry, I couldn't generate a personalized recommendation right now. Here are some classic looks.",
                "outfit_recommendations": [
                    {
                        "title": "Default Smart Casual",
                        "occasion": "Casual daily wear",
                        "description": "A versatile and comfortable outfit for any day.",
                        "items": [
                            {"name": "Plain T-shirt", "brand": "Uniqlo"},
                            {"name": "Jeans", "brand": "Levi's"}
                        ]
                    }
                ]
            }
        

    async def generate_outfits_from_answers(
        self,
        answers: Dict[str, Any],
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Returns a list of outfit dicts (same shape you render in UI).
        Will try AI first (if API key present), else fallback.
        """
        api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                return await self.generate_from_answers_ai(answers, count)
            except Exception as e:
                # Log and fall back if AI errors out
                print(f"[Engine] AI generation failed, using fallback: {e}")

        return await self.generate_from_answers_fallback(answers, count)

    async def generate_from_answers_ai(self, answers: Dict[str, Any], count: int) -> List[Dict[str, Any]]:
        """
        Pseudo-code: call your LLM of choice with a prompt based on `answers`.
        Replace this stub with your actual OpenAI/Gemini SDK call.
        """
        logger.info("Generating outfits using AI...")
        logger.info(f"Answers received for generation: {answers.items()}")
        # ---- EXAMPLE PROMPT (pseudo) ----
        prompt = f"""
            You are a professional fashion stylist with deep knowledge of current trends, classic style principles, and outfit composition. Your goal is to provide personalized and stylish outfit recommendations based on a user's specific preferences.

            The user has provided the following preferences for their outfit:
            - **Occasion:** {answers.get('occasion')} (e.g., for a date, a work event, or casual wear)
            - **Desired Mood:** {answers.get('mood')} (e.g., confident, comfortable, elegant, or fun)
            - **Color Palette:** {','.join(answers.get('colors', []))}
            - **Style Preferences:** {','.join(answers.get('style_preference', []))} (e.g., minimalist, bohemian, trendy)
            - **Budget Range:** {answers.get('budget')} (e.g., budget-friendly, moderate, or premium)

            Based on these details, please generate a single JSON object. This object must contain two main parts:

            1.  A **"personal_advice"** key: A friendly and insightful paragraph of styling advice that summarizes the user's profile and gives them a general tip.
            2.  An **"outfit_recommendations"** key: A list of exactly **three** distinct outfit objects.

            Each outfit object in the list must have the following keys:
            - **"title"**: A creative, short name for the outfit.
            - **"occasion"**: The primary occasion this outfit is for (e.g., "Work", "Date Night").
            - **"description"**: A short, compelling description of the outfit's vibe.
            - **"confidence"**: A confidence score (0-100) indicating how well this outfit matches the user's preferences.
            - **"color"**: A color value representing the outfit's primary color or vibe (e.g., a hex code like "#000000" or a CSS gradient string).
            - **"items"**: A list of clothing items that make up the look. Each item in this list must be an object with **"name"** and **"brand"** keys. Ensure the brand suggestions are relevant to the specified budget.
            - **"match_score"**: A score from 1 to 100, indicating how well this outfit matches the user's preferences.
            
            Ensure the entire response is a single, valid JSON object. Do not include any text, notes, or explanations before or after the JSON object.
        """
        #
        # LLM call here -> parse JSON safely
        # return parsed_items
        try:
            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash", contents=prompt
                )
            logger.debug(f" we are caling Gemini API response: {response.text}")
            # Extract and parse the JSON content from the response
            # Note: The model may return a response object that needs careful handling.
            # You might need to check if the content exists and is properly formatted.
            response_text = response.text.replace('```json', '').replace('```', '').strip()
            logger.debug(f"Parsed response text: {response_text}")
            parsed_outfits = json.loads(response_text)
            return parsed_outfits['outfit_recommendations']
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
        # Temporary shim so you can deploy without AI now
            return await self.generate_from_answers_fallback(answers, count)
    
    async def generate_from_answers_ai_for_serp(self, answers: Dict[str, Any]) -> List[Dict[str, Any]]:
        
        logger.info("Generating outfits using gemini and then passing it to serpapi...")
        # k = max(3, min(count, 6))
        k = 1
        count = 1

        prompt = f"""
        You are a professional stylist for users in the UAE.

        Return ONLY JSON (no prose outside JSON) that conforms to the provided schema.
        STRICT requirements for each outfit item:
        - Use brands that sell in the UAE or ship reliably to the UAE (e.g., Zara, H&M, Namshi, 6thStreet, Noon, Amazon.ae, Nike UAE, Adidas AE, Ounass, Sun & Sand Sports, etc.).
        - Provide a realistic numeric "price_aed" in AED (no currency symbols).
        - Provide a concrete "name" (e.g., "White Oxford Shirt") and a brand (e.g., "H&M").
        - Optional but helpful: "color" and "category" (e.g., "white", "shirt").

        User preferences:
        - Occasion: {answers.get('occasion')}
        - Mood: {answers.get('mood')}
        - Colors: {', '.join(answers.get('colors', []))}
        - Style Preferences: {', '.join(answers.get('style_preference', []))}
        - Budget: {answers.get('budget')}

        Constraints:
        - Produce exactly {k} outfit objects in "outfit_recommendations".
        - Keep "confidence" and "match_score" between 0–100.
        """

        schema = _outfit_response_schema()
        data = await _generate_json_from_gemini(prompt, schema=schema)
        logger.debug(f"Gemini returned data that we will use: {data}")
        
        outfits = data.get("outfit_recommendations") or []
        now = int(time.time() * 1000)
        cards: List[Dict[str, Any]] = []

        for i, o in enumerate(outfits[:count]):
            norm_items = []
            for it in (o.get("items") or []):
                # Map price_aed -> price for your UI model
                price = it.get("price_aed")
                norm_items.append({
                    "name": it.get("name", "").strip() or "Item",
                    "brand": it.get("brand", "").strip() or "—",
                    "price": price if isinstance(price, (int, float)) else None
                })
            cards.append({
                "id": f"{now+i}",
                "title": o.get("title") or "Styled Look",
                "occasion": (o.get("occasion") or (answers.get("occasion") or "casual")).title(),
                "description": o.get("description") or "AI-curated look tailored to your preferences.",
                "confidence": max(0, min(int(o.get("confidence", 90)), 100)),
                "color": o.get("color") or "linear-gradient(135deg,#1a1a1a 0%,#2d1b69 100%)",
                "items": norm_items,
                "match_score": max(1, min(int(o.get("match_score", 90)), 100)),
            })

        if not cards:
            return await self.generate_from_answers_fallback(answers, count)
        return cards


    async def generate_from_answers_fallback(self, answers: Dict[str, Any], count: int) -> List[Dict[str, Any]]:
        """Deterministic mock using your demo logic so API works today."""
        occasion = (answers.get("occasion") or "casual").lower()
        colors = (answers.get("colors") or ["black","navy","gray"])[:3]
        title_map = {
            "work": "Professional Power",
            "date": "Romantic Elegance",
            "casual": "Effortless Chic",
            "event": "Show Stopper",
            "travel": "Jet Set Ready",
            "gym": "Athletic Luxe",
        }
        base_items = {
            "work": [
                {"name":"Tailored blazer","brand":"Theory","price":295},
                {"name":"Silk blouse","brand":"Equipment","price":158},
                {"name":"Straight trousers","brand":"J.Crew","price":128},
                {"name":"Leather pumps","brand":"Cole Haan","price":180},
            ],
            "date": [
                {"name":"Wrap dress","brand":"DVF","price":268},
                {"name":"Statement earrings","brand":"Mejuri","price":85},
                {"name":"Block heels","brand":"Sam Edelman","price":130},
                {"name":"Clutch bag","brand":"Mansur Gavriel","price":195},
            ],
            "casual": [
                {"name":"Cashmere sweater","brand":"Everlane","price":118},
                {"name":"High-rise jeans","brand":"Levi's","price":89},
                {"name":"White sneakers","brand":"Veja","price":120},
                {"name":"Crossbody bag","brand":"Polene","price":290},
            ],
            "event": [
                {"name":"Midi cocktail dress","brand":"Reformation","price":218},
                {"name":"Statement necklace","brand":"Jennifer Fisher","price":165},
                {"name":"Strappy heels","brand":"Stuart Weitzman","price":425},
                {"name":"Beaded clutch","brand":"Cult Gaia","price":198},
            ],
            "travel": [
                {"name":"Knit cardigan","brand":"Uniqlo","price":49},
                {"name":"Travel leggings","brand":"Athleta","price":89},
                {"name":"Slip-on sneakers","brand":"Allbirds","price":95},
                {"name":"Convertible tote","brand":"Away","price":195},
            ],
            "gym": [
                {"name":"Sports bra","brand":"Lululemon","price":58},
                {"name":"High-waist leggings","brand":"Alo Yoga","price":88},
                {"name":"Oversized hoodie","brand":"Outdoor Voices","price":75},
                {"name":"Training shoes","brand":"APL","price":140},
            ],
        }
        gradients = {
            "black": 'linear-gradient(135deg,#1a1a1a 0%,#2d1b69 100%)',
            "white": 'linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)',
            "navy": 'linear-gradient(135deg,#1e3a8a 0%,#3730a3 100%)',
            "red": 'linear-gradient(135deg,#dc2626 0%,#be185d 100%)',
            "pink": 'linear-gradient(135deg,#ec4899 0%,#be185d 100%)',
            "purple": 'linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%)',
            "blue": 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)',
            "green": 'linear-gradient(135deg,#059669 0%,#047857 100%)',
            "yellow": 'linear-gradient(135deg,#eab308 0%,#d97706 100%)',
            "gray": 'linear-gradient(135deg,#6b7280 0%,#4b5563 100%)',
            "beige": 'linear-gradient(135deg,#f5f5dc 0%,#d6d3d1 100%)',
            "brown": 'linear-gradient(135deg,#8b4513 0%,#7c2d12 100%)',
        }
        title = title_map.get(occasion, title_map["casual"])
        base = base_items.get(occasion, base_items["casual"])

        items: List[Dict[str, Any]] = []
        now = int(time.time() * 1000)
        for i in range(count):
            col = colors[i % len(colors)]
            factor = [1.0, 0.8, 0.6][i] if i < 3 else 1.0
            priced = [
                {**x, "price": round(x["price"] * factor), "brand": x.get("brand") or "—"}
                for x in base
            ]
            items.append({
                "id": f"{now+i}",
                "title": title if i == 0 else f"{title} - Variant {i}",
                "occasion": occasion,
                "description": "AI-curated look tailored to your preferences.",
                "confidence": random.randint(88, 96),
                "color": gradients.get(col, gradients["gray"]),
                "items": priced,
                "match_score": random.randint(88, 96),
            })
        return items
    
def _outfit_response_schema() -> dict:
    """
    Schema forces Gemini to output items we can pass straight into SerpAPI.
    We keep UI-compatible fields and add price_aed (we'll map -> price).
    """
    return {
    "type": "object",
    "properties": {
        "personal_advice": {"type": "string"},
        "outfit_recommendations": {
        "type": "array",
        "minItems": 3,
        "maxItems": 6,
        "items": {
            "type": "object",
            "required": ["title","occasion","description","confidence","color","items","match_score"],
            "properties": {
            "title": {"type": "string"},
            "occasion": {"type": "string"},
            "description": {"type": "string"},
            "confidence": {"type": "integer", "minimum": 0, "maximum": 100},
            "color": {"type": "string"},
            "match_score": {"type": "integer", "minimum": 1, "maximum": 100},
            "items": {
                "type": "array",
                "minItems": 3,
                "items": {
                "type": "object",
                "required": ["name", "brand", "price_aed"],
                "properties": {
                    "name": {"type": "string"},          # e.g., "White Oxford Shirt"
                    "brand": {"type": "string"},         # e.g., "H&M"
                    "price_aed": {"type": "number"},     # numeric, for price banding
                    "color": {"type": "string"},         # optional: "white"
                    "category": {"type": "string"}       # optional: "shirt"
                },
                "additionalProperties": False
                }
            },
            "style_types": {"type": "array", "items": {"type": "string"}},
            "body_types": {"type": "array", "items": {"type": "string"}},
            "seasons": {"type": "array", "items": {"type": "string"}}
            },
            "additionalProperties": False
        }
        }
    },
    "required": ["personal_advice","outfit_recommendations"],
    "additionalProperties": False
    }

def _strip_code_fences(s: str) -> str:
    s = s.strip()
    if s.startswith("```"):
        s = s.strip("`")
        if "\n" in s:
            s = s.split("\n", 1)[1]
    if s.endswith("```"):
        s = s[:-3]
    return s.strip()

async def _generate_json_from_gemini(prompt: str, *, schema: dict) -> dict:
    gen_cfg = {
        "response_mime_type": "application/json",
        "temperature": 0.6,
        "top_p": 0.9,
        "response_schema": schema,  # if your SDK supports it (latest google-genai does)
    }
    resp = await client.aio.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        # generation_config=gen_cfg,
    )
    raw = getattr(resp, "text", None)
    if not raw and getattr(resp, "candidates", None):
        parts = resp.candidates[0].content.parts
        raw = "".join(getattr(p, "text", "") for p in parts)
    if not raw:
        raise ValueError("Empty response from Gemini")
    raw = _strip_code_fences(raw)
    return json.loads(raw)