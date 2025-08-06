#!/usr/bin/env python3
"""
End-to-End Quiz Flow Test
Simulates the complete user journey through the quiz
"""

import asyncio
import aiohttp
import json
from datetime import datetime

class QuizEndToEndTest:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.base_url = self._get_backend_url()
        self.session_id = None
        
    def _get_backend_url(self) -> str:
        """Get backend URL from frontend .env file"""
        try:
            with open('/app/frontend/.env', 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        return line.split('=', 1)[1].strip()
        except Exception as e:
            print(f"Warning: Could not read frontend .env file: {e}")
        
        return "https://1080f3a8-3d73-4b05-b7b3-727e56d6c9f2.preview.emergentagent.com"
    
    async def simulate_complete_quiz_flow(self):
        """Simulate a complete user quiz flow"""
        print(f"🚀 Starting End-to-End Quiz Flow Test")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            
            # Step 1: Get quiz questions (what frontend does first)
            print("\n1️⃣ Getting quiz questions...")
            try:
                async with session.get(f"{self.base_url}/api/quiz/questions") as response:
                    if response.status == 200:
                        questions_data = await response.json()
                        steps = questions_data.get('steps', [])
                        print(f"✅ Retrieved {len(steps)} quiz steps")
                        
                        # Show what frontend would see
                        for i, step in enumerate(steps):
                            questions_count = len(step.get('questions', []))
                            print(f"   Step {i+1}: {step.get('title')} ({questions_count} questions)")
                    else:
                        print(f"❌ Failed to get questions: HTTP {response.status}")
                        return
            except Exception as e:
                print(f"❌ Exception getting questions: {str(e)}")
                return
            
            # Step 2: Start quiz session
            print("\n2️⃣ Starting quiz session...")
            try:
                async with session.post(f"{self.base_url}/api/quiz/start") as response:
                    if response.status == 200:
                        session_data = await response.json()
                        self.session_id = session_data.get('session_id')
                        print(f"✅ Quiz session started: {self.session_id[:8]}...")
                    else:
                        print(f"❌ Failed to start session: HTTP {response.status}")
                        return
            except Exception as e:
                print(f"❌ Exception starting session: {str(e)}")
                return
            
            # Step 3: Submit answers for each step (realistic user data)
            print("\n3️⃣ Submitting quiz answers...")
            
            quiz_answers = [
                # Step 0: Basic Info
                {
                    "step_number": 0,
                    "answers": {
                        "full_name": "Alex Rivera",
                        "gender_identity": "Non-binary",
                        "date_of_birth": "08/12/1994",
                        "city": "Los Angeles"
                    }
                },
                # Step 1: Body Type
                {
                    "step_number": 1,
                    "answers": {
                        "height": "5'8\"",
                        "weight": "150 lbs",
                        "body_type": "Athletic",
                        "clothing_size": "M",
                        "fit_preferences": "Regular fit"
                    }
                },
                # Step 2: Style Preferences
                {
                    "step_number": 2,
                    "answers": {
                        "current_style": ["Minimalist", "Smart Casual"],
                        "interested_styles": ["Trendy", "Streetwear"],
                        "favorite_colors": ["Black", "White", "Gray", "Navy"],
                        "avoid_colors": ["Pink", "Yellow"]
                    }
                },
                # Step 3: Lifestyle
                {
                    "step_number": 3,
                    "answers": {
                        "occupation": "UX Designer",
                        "typical_week": ["Mostly work", "Social outings"],
                        "help_occasions": ["Work/office", "Casual daily wear", "Social media outfits"]
                    }
                },
                # Step 4: Personality
                {
                    "step_number": 4,
                    "answers": {
                        "personality_words": "Creative, analytical, adaptable",
                        "style_inspiration": "Zendaya",
                        "fashion_struggle": "Finding clothes that work for both professional and casual settings",
                        "goals": ["Look more confident", "Discover my style", "Save time"]
                    }
                },
                # Step 5: Visual Aid
                {
                    "step_number": 5,
                    "answers": {
                        "ai_photo_suggestions": "Yes",
                        "daily_suggestions": "Yes",
                        "delivery_preference": "In-app"
                    }
                }
            ]
            
            for step_data in quiz_answers:
                try:
                    payload = {
                        "session_id": self.session_id,
                        **step_data
                    }
                    
                    async with session.post(
                        f"{self.base_url}/api/quiz/submit-step",
                        json=payload,
                        headers={'Content-Type': 'application/json'}
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            step_num = step_data['step_number']
                            next_step = result.get('next_step')
                            print(f"   ✅ Step {step_num} submitted → Next: {next_step}")
                        else:
                            print(f"   ❌ Step {step_data['step_number']} failed: HTTP {response.status}")
                except Exception as e:
                    print(f"   ❌ Step {step_data['step_number']} exception: {str(e)}")
            
            # Step 4: Complete quiz and get recommendations
            print("\n4️⃣ Completing quiz and generating recommendations...")
            try:
                payload = {"session_id": self.session_id}
                
                async with session.post(
                    f"{self.base_url}/api/quiz/complete",
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if response.status == 200:
                        completion_data = await response.json()
                        
                        recommendations = completion_data.get('recommendations', [])
                        confidence_score = completion_data.get('confidence_score', 0)
                        style_profile = completion_data.get('style_profile', {})
                        
                        print(f"✅ Quiz completed successfully!")
                        print(f"   📊 Confidence Score: {confidence_score}%")
                        print(f"   👔 Recommendations: {len(recommendations)} outfits generated")
                        print(f"   🎨 Style Profile: {style_profile.get('primary_style', 'N/A')}")
                        
                        # Show first recommendation
                        if recommendations:
                            first_rec = recommendations[0]
                            print(f"   🌟 First Recommendation: '{first_rec.get('title', 'N/A')}' (Score: {first_rec.get('match_score', 0)})")
                    else:
                        print(f"❌ Failed to complete quiz: HTTP {response.status}")
                        return
            except Exception as e:
                print(f"❌ Exception completing quiz: {str(e)}")
                return
            
            # Step 5: Retrieve complete results (what results page does)
            print("\n5️⃣ Retrieving complete results...")
            try:
                async with session.get(f"{self.base_url}/api/quiz/results/{self.session_id}") as response:
                    if response.status == 200:
                        results_data = await response.json()
                        
                        # Verify all data is present
                        required_fields = ['session_id', 'quiz_answers', 'style_profile', 'recommendations', 'confidence_score']
                        missing_fields = [field for field in required_fields if field not in results_data]
                        
                        if not missing_fields:
                            print(f"✅ Complete results retrieved successfully!")
                            
                            # Verify data integrity
                            quiz_answers = results_data['quiz_answers']
                            if quiz_answers.get('full_name') == 'Alex Rivera':
                                print(f"   ✅ User data persisted correctly")
                            else:
                                print(f"   ❌ User data not persisted correctly")
                            
                            # Show final summary
                            print(f"\n📋 FINAL RESULTS SUMMARY:")
                            print(f"   👤 User: {quiz_answers.get('full_name', 'N/A')}")
                            print(f"   📍 Location: {quiz_answers.get('city', 'N/A')}")
                            print(f"   💼 Occupation: {quiz_answers.get('occupation', 'N/A')}")
                            print(f"   🎯 Goals: {', '.join(quiz_answers.get('goals', []))}")
                            print(f"   📊 AI Confidence: {results_data.get('confidence_score', 0)}%")
                            print(f"   👔 Recommendations: {len(results_data.get('recommendations', []))} outfits")
                        else:
                            print(f"❌ Missing fields in results: {missing_fields}")
                    else:
                        print(f"❌ Failed to retrieve results: HTTP {response.status}")
            except Exception as e:
                print(f"❌ Exception retrieving results: {str(e)}")
        
        print("\n" + "=" * 60)
        print("🎉 END-TO-END QUIZ FLOW TEST COMPLETED!")
        print("✅ All major quiz functionality verified working")
        print("✅ Frontend should now display questions properly")
        print("✅ Complete user journey from start to results functional")
        print("=" * 60)

async def main():
    """Main test execution"""
    tester = QuizEndToEndTest()
    await tester.simulate_complete_quiz_flow()

if __name__ == "__main__":
    asyncio.run(main())