#!/usr/bin/env python3
"""
Focused test to verify quiz API data structure matches frontend expectations
"""

import asyncio
import aiohttp
import json
import sys

class QuizStructureTest:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.base_url = self._get_backend_url()
        
    def _get_backend_url(self) -> str:
        """Get backend URL from frontend .env file"""
        try:
            with open('/app/frontend/.env', 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        return line.split('=', 1)[1].strip()
        except Exception as e:
            print(f"Warning: Could not read frontend .env file: {e}")
        
        return "https://aee48b5e-99d1-410a-847d-57b3c8a1b8c9.preview.emergentagent.com"
    
    async def test_quiz_questions_structure(self):
        """Test the exact structure returned by /api/quiz/questions"""
        print("🔍 Testing Quiz Questions API Structure...")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            try:
                async with session.get(f"{self.base_url}/api/quiz/questions") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        print("✅ API Response received successfully")
                        print(f"📊 Response keys: {list(data.keys())}")
                        
                        # Check if it has 'steps' array (backend format)
                        if 'steps' in data:
                            print(f"✅ Found 'steps' array with {len(data['steps'])} steps")
                            
                            # Show structure of each step
                            for i, step in enumerate(data['steps']):
                                step_id = step.get('id', 'unknown')
                                questions_count = len(step.get('questions', []))
                                print(f"   Step {i}: id='{step_id}', questions={questions_count}")
                                
                                # Show first question structure if available
                                if questions_count > 0:
                                    first_q = step['questions'][0]
                                    print(f"      First question: id='{first_q.get('id')}', type='{first_q.get('type')}', question='{first_q.get('question', '')[:50]}...'")
                        
                        # Check if it has individual step properties (frontend expected format)
                        expected_step_ids = ['basic_info', 'body_type', 'style_preferences', 'lifestyle', 'personality', 'visual_aid']
                        print(f"\n🔍 Checking for frontend expected format...")
                        
                        frontend_format_found = False
                        for step_id in expected_step_ids:
                            if step_id in data:
                                print(f"   ✅ Found '{step_id}' property")
                                frontend_format_found = True
                            else:
                                print(f"   ❌ Missing '{step_id}' property")
                        
                        if not frontend_format_found:
                            print(f"\n❌ ISSUE IDENTIFIED: Frontend expects individual step properties, but backend returns 'steps' array")
                            print(f"   Frontend code tries to access: questionsResponse.basic_info")
                            print(f"   But backend returns: questionsResponse.steps[0] where steps[0].id === 'basic_info'")
                            
                            print(f"\n💡 SOLUTION: Either:")
                            print(f"   1. Update backend to return individual step properties")
                            print(f"   2. Update frontend to use the 'steps' array format")
                        else:
                            print(f"\n✅ Frontend expected format found")
                        
                        # Show raw response structure for debugging
                        print(f"\n📋 Raw Response Structure:")
                        print(json.dumps(data, indent=2)[:1000] + "..." if len(json.dumps(data, indent=2)) > 1000 else json.dumps(data, indent=2))
                        
                    else:
                        print(f"❌ API request failed with status: {response.status}")
                        
            except Exception as e:
                print(f"❌ Exception occurred: {str(e)}")

async def main():
    """Main test execution"""
    tester = QuizStructureTest()
    await tester.test_quiz_questions_structure()

if __name__ == "__main__":
    asyncio.run(main())