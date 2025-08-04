#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for BeStyle.AI
Tests all backend endpoints including health checks, quiz flow, waitlist, and AI recommendations.
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional

# Add backend to path for imports
sys.path.append('/app/backend')

class BeStyleBackendTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.base_url = self._get_backend_url()
        self.session_id = None
        self.test_results = []
        
    def _get_backend_url(self) -> str:
        """Get backend URL from frontend .env file"""
        try:
            with open('/app/frontend/.env', 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        return line.split('=', 1)[1].strip()
        except Exception as e:
            print(f"Warning: Could not read frontend .env file: {e}")
        
        # Fallback to default
        return "https://1080f3a8-3d73-4b05-b7b3-727e56d6c9f2.preview.emergentagent.com"
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if response_data and not success:
            print(f"    Response: {response_data}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
    
    async def test_health_endpoints(self, session: aiohttp.ClientSession):
        """Test basic health check endpoints"""
        print("\n🔍 Testing Health Check Endpoints...")
        
        # Test root health endpoint
        try:
            async with session.get(f"{self.base_url}/api/") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('status') == 'healthy':
                        self.log_test("Root Health Check", True, f"Status: {data.get('status')}, Version: {data.get('version')}")
                    else:
                        self.log_test("Root Health Check", False, f"Unexpected response: {data}")
                else:
                    self.log_test("Root Health Check", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Root Health Check", False, f"Exception: {str(e)}")
        
        # Test dedicated health endpoint
        try:
            async with session.get(f"{self.base_url}/api/health") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('status') == 'healthy':
                        self.log_test("Dedicated Health Check", True, f"Service: {data.get('service')}")
                    else:
                        self.log_test("Dedicated Health Check", False, f"Unexpected response: {data}")
                else:
                    self.log_test("Dedicated Health Check", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Dedicated Health Check", False, f"Exception: {str(e)}")
    
    async def test_quiz_questions_endpoint(self, session: aiohttp.ClientSession):
        """Test quiz questions structure endpoint"""
        print("\n🔍 Testing Quiz Questions Endpoint...")
        
        try:
            async with session.get(f"{self.base_url}/api/quiz/questions") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate structure
                    if 'steps' in data and isinstance(data['steps'], list):
                        steps = data['steps']
                        if len(steps) == 6:  # Should have 6 steps
                            step_ids = [step.get('id') for step in steps]
                            expected_ids = ['basic_info', 'body_type', 'style_preferences', 'lifestyle', 'personality', 'visual_aid']
                            
                            if step_ids == expected_ids:
                                self.log_test("Quiz Questions Structure", True, f"All 6 steps present with correct IDs")
                                
                                # Validate first step has questions
                                first_step = steps[0]
                                if 'questions' in first_step and len(first_step['questions']) > 0:
                                    self.log_test("Quiz Questions Content", True, f"First step has {len(first_step['questions'])} questions")
                                else:
                                    self.log_test("Quiz Questions Content", False, "First step missing questions")
                            else:
                                self.log_test("Quiz Questions Structure", False, f"Step IDs mismatch. Got: {step_ids}")
                        else:
                            self.log_test("Quiz Questions Structure", False, f"Expected 6 steps, got {len(steps)}")
                    else:
                        self.log_test("Quiz Questions Structure", False, "Missing 'steps' array in response")
                else:
                    self.log_test("Quiz Questions Endpoint", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Questions Endpoint", False, f"Exception: {str(e)}")
    
    async def test_quiz_start(self, session: aiohttp.ClientSession):
        """Test quiz session creation"""
        print("\n🔍 Testing Quiz Start Endpoint...")
        
        try:
            async with session.post(f"{self.base_url}/api/quiz/start") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    if 'session_id' in data and 'current_step' in data and 'message' in data:
                        self.session_id = data['session_id']
                        if data['current_step'] == 0:
                            self.log_test("Quiz Start", True, f"Session created: {self.session_id[:8]}...")
                        else:
                            self.log_test("Quiz Start", False, f"Expected current_step=0, got {data['current_step']}")
                    else:
                        self.log_test("Quiz Start", False, f"Missing required fields in response: {data}")
                else:
                    self.log_test("Quiz Start", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Start", False, f"Exception: {str(e)}")
    
    async def test_quiz_step_submission(self, session: aiohttp.ClientSession):
        """Test quiz step submission with realistic data"""
        print("\n🔍 Testing Quiz Step Submission...")
        
        if not self.session_id:
            self.log_test("Quiz Step Submission", False, "No session_id available")
            return
        
        # Test data for each step
        test_steps = [
            {
                "step_number": 0,
                "answers": {
                    "full_name": "Sarah Johnson",
                    "gender_identity": "Female",
                    "date_of_birth": "03/15/1992",
                    "city": "San Francisco"
                }
            },
            {
                "step_number": 1,
                "answers": {
                    "height": "5'6\"",
                    "weight": "140 lbs",
                    "body_type": "Athletic",
                    "clothing_size": "M",
                    "fit_preferences": "Regular fit"
                }
            },
            {
                "step_number": 2,
                "answers": {
                    "current_style": ["Smart Casual", "Minimalist"],
                    "interested_styles": ["Trendy", "Smart Casual"],
                    "favorite_colors": ["Black", "Navy", "White", "Beige"],
                    "avoid_colors": ["Pink", "Yellow"]
                }
            }
        ]
        
        for step_data in test_steps:
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
                        data = await response.json()
                        
                        if 'message' in data and data.get('message') == 'Step submitted successfully':
                            expected_next_step = step_data['step_number'] + 1 if step_data['step_number'] < 5 else None
                            actual_next_step = data.get('next_step')
                            
                            if actual_next_step == expected_next_step:
                                self.log_test(f"Quiz Step {step_data['step_number']} Submission", True, 
                                            f"Next step: {actual_next_step}")
                            else:
                                self.log_test(f"Quiz Step {step_data['step_number']} Submission", False, 
                                            f"Expected next_step={expected_next_step}, got {actual_next_step}")
                        else:
                            self.log_test(f"Quiz Step {step_data['step_number']} Submission", False, 
                                        f"Unexpected response: {data}")
                    else:
                        self.log_test(f"Quiz Step {step_data['step_number']} Submission", False, 
                                    f"HTTP {response.status}")
            except Exception as e:
                self.log_test(f"Quiz Step {step_data['step_number']} Submission", False, f"Exception: {str(e)}")
    
    async def test_quiz_completion(self, session: aiohttp.ClientSession):
        """Test quiz completion and AI recommendation generation"""
        print("\n🔍 Testing Quiz Completion...")
        
        if not self.session_id:
            self.log_test("Quiz Completion", False, "No session_id available")
            return
        
        try:
            payload = {"session_id": self.session_id}
            
            async with session.post(
                f"{self.base_url}/api/quiz/complete",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate AI recommendation response
                    required_fields = ['recommendations', 'confidence_score', 'style_profile']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        recommendations = data['recommendations']
                        confidence_score = data['confidence_score']
                        style_profile = data['style_profile']
                        
                        # Validate recommendations
                        if isinstance(recommendations, list) and len(recommendations) > 0:
                            self.log_test("AI Recommendations Generation", True, 
                                        f"Generated {len(recommendations)} recommendations")
                            
                            # Check first recommendation structure
                            first_rec = recommendations[0]
                            if 'title' in first_rec and 'items' in first_rec and 'match_score' in first_rec:
                                self.log_test("Recommendation Structure", True, 
                                            f"First rec: '{first_rec['title']}' (score: {first_rec['match_score']})")
                            else:
                                self.log_test("Recommendation Structure", False, 
                                            f"Missing fields in recommendation: {first_rec}")
                        else:
                            self.log_test("AI Recommendations Generation", False, 
                                        f"Invalid recommendations: {recommendations}")
                        
                        # Validate confidence score
                        if isinstance(confidence_score, int) and 0 <= confidence_score <= 100:
                            self.log_test("AI Confidence Score", True, f"Score: {confidence_score}%")
                        else:
                            self.log_test("AI Confidence Score", False, f"Invalid score: {confidence_score}")
                        
                        # Validate style profile
                        if isinstance(style_profile, dict) and 'primary_style' in style_profile:
                            self.log_test("Style Profile Generation", True, 
                                        f"Primary styles: {style_profile['primary_style']}")
                        else:
                            self.log_test("Style Profile Generation", False, f"Invalid style profile: {style_profile}")
                    else:
                        self.log_test("Quiz Completion", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Quiz Completion", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Completion", False, f"Exception: {str(e)}")
    
    async def test_quiz_results_retrieval(self, session: aiohttp.ClientSession):
        """Test quiz results retrieval"""
        print("\n🔍 Testing Quiz Results Retrieval...")
        
        if not self.session_id:
            self.log_test("Quiz Results Retrieval", False, "No session_id available")
            return
        
        try:
            async with session.get(f"{self.base_url}/api/quiz/results/{self.session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate complete results structure
                    required_fields = ['session_id', 'quiz_answers', 'style_profile', 'recommendations', 'confidence_score']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        if data['session_id'] == self.session_id:
                            self.log_test("Quiz Results Retrieval", True, 
                                        f"Retrieved complete results for session {self.session_id[:8]}...")
                            
                            # Validate quiz answers are preserved
                            quiz_answers = data['quiz_answers']
                            if isinstance(quiz_answers, dict) and quiz_answers.get('full_name') == 'Sarah Johnson':
                                self.log_test("Quiz Data Persistence", True, "User answers correctly stored and retrieved")
                            else:
                                self.log_test("Quiz Data Persistence", False, f"Quiz answers not preserved: {quiz_answers}")
                        else:
                            self.log_test("Quiz Results Retrieval", False, f"Session ID mismatch")
                    else:
                        self.log_test("Quiz Results Retrieval", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Quiz Results Retrieval", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Results Retrieval", False, f"Exception: {str(e)}")
    
    async def test_waitlist_subscription(self, session: aiohttp.ClientSession):
        """Test waitlist email subscription"""
        print("\n🔍 Testing Waitlist Subscription...")
        
        test_email = f"test.user.{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
        
        try:
            payload = {
                "email": test_email,
                "source": "api_test",
                "metadata": {"test": True}
            }
            
            async with session.post(
                f"{self.base_url}/api/waitlist/subscribe",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get('success') and 'position' in data:
                        position = data['position']
                        self.log_test("Waitlist Subscription", True, 
                                    f"Email subscribed successfully, position: {position}")
                        
                        # Test duplicate subscription
                        async with session.post(
                            f"{self.base_url}/api/waitlist/subscribe",
                            json=payload,
                            headers={'Content-Type': 'application/json'}
                        ) as dup_response:
                            if dup_response.status == 200:
                                dup_data = await dup_response.json()
                                if dup_data.get('success') and 'already' in dup_data.get('message', '').lower():
                                    self.log_test("Duplicate Email Handling", True, 
                                                "Duplicate email properly handled")
                                else:
                                    self.log_test("Duplicate Email Handling", False, 
                                                f"Unexpected duplicate response: {dup_data}")
                    else:
                        self.log_test("Waitlist Subscription", False, f"Invalid response: {data}")
                else:
                    self.log_test("Waitlist Subscription", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Waitlist Subscription", False, f"Exception: {str(e)}")
    
    async def test_waitlist_stats(self, session: aiohttp.ClientSession):
        """Test waitlist statistics endpoint"""
        print("\n🔍 Testing Waitlist Statistics...")
        
        try:
            async with session.get(f"{self.base_url}/api/waitlist/stats") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    required_fields = ['total_subscribers', 'recent_signups', 'growth_rate']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        total = data['total_subscribers']
                        recent = data['recent_signups']
                        growth = data['growth_rate']
                        
                        if isinstance(total, int) and isinstance(recent, int) and isinstance(growth, (int, float)):
                            self.log_test("Waitlist Statistics", True, 
                                        f"Total: {total}, Recent: {recent}, Growth: {growth}%")
                        else:
                            self.log_test("Waitlist Statistics", False, 
                                        f"Invalid data types: {data}")
                    else:
                        self.log_test("Waitlist Statistics", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Waitlist Statistics", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Waitlist Statistics", False, f"Exception: {str(e)}")
    
    async def test_waitlist_health(self, session: aiohttp.ClientSession):
        """Test waitlist health check"""
        print("\n🔍 Testing Waitlist Health Check...")
        
        try:
            async with session.get(f"{self.base_url}/api/waitlist/health") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get('status') == 'healthy' and data.get('service') == 'waitlist':
                        self.log_test("Waitlist Health Check", True, "Service healthy")
                    else:
                        self.log_test("Waitlist Health Check", False, f"Unexpected response: {data}")
                else:
                    self.log_test("Waitlist Health Check", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Waitlist Health Check", False, f"Exception: {str(e)}")
    
    async def test_error_scenarios(self, session: aiohttp.ClientSession):
        """Test error handling scenarios"""
        print("\n🔍 Testing Error Scenarios...")
        
        # Test invalid session ID for quiz results
        try:
            async with session.get(f"{self.base_url}/api/quiz/results/invalid-session-id") as response:
                if response.status == 404:
                    self.log_test("Invalid Session ID Error", True, "Properly returns 404 for invalid session")
                else:
                    self.log_test("Invalid Session ID Error", False, f"Expected 404, got {response.status}")
        except Exception as e:
            self.log_test("Invalid Session ID Error", False, f"Exception: {str(e)}")
        
        # Test invalid email format
        try:
            payload = {"email": "invalid-email", "source": "test"}
            async with session.post(
                f"{self.base_url}/api/waitlist/subscribe",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 422:  # Validation error
                    self.log_test("Invalid Email Format Error", True, "Properly validates email format")
                else:
                    self.log_test("Invalid Email Format Error", False, f"Expected 422, got {response.status}")
        except Exception as e:
            self.log_test("Invalid Email Format Error", False, f"Exception: {str(e)}")
    
    async def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting BeStyle.AI Backend API Testing")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            # Health checks
            await self.test_health_endpoints(session)
            
            # Quiz API testing
            await self.test_quiz_questions_endpoint(session)
            await self.test_quiz_start(session)
            await self.test_quiz_step_submission(session)
            await self.test_quiz_completion(session)
            await self.test_quiz_results_retrieval(session)
            
            # Waitlist API testing
            await self.test_waitlist_subscription(session)
            await self.test_waitlist_stats(session)
            await self.test_waitlist_health(session)
            
            # Error scenarios
            await self.test_error_scenarios(session)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n🎯 CRITICAL FUNCTIONALITY STATUS:")
        
        # Check critical functionality
        critical_tests = [
            "Root Health Check",
            "Quiz Start", 
            "AI Recommendations Generation",
            "Waitlist Subscription"
        ]
        
        critical_passed = 0
        for test_name in critical_tests:
            test_result = next((r for r in self.test_results if r['test'] == test_name), None)
            if test_result and test_result['success']:
                print(f"  ✅ {test_name}")
                critical_passed += 1
            else:
                print(f"  ❌ {test_name}")
        
        if critical_passed == len(critical_tests):
            print(f"\n🎉 ALL CRITICAL BACKEND FUNCTIONALITY IS WORKING!")
        else:
            print(f"\n⚠️  {len(critical_tests) - critical_passed} critical issues need attention")

async def main():
    """Main test execution"""
    tester = BeStyleBackendTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())