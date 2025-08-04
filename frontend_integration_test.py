#!/usr/bin/env python3
"""
Frontend-Backend Integration Testing for BeStyle.AI
Tests the specific integration patterns used by the frontend components.
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List, Optional

class FrontendIntegrationTester:
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
        return "https://41cc841f-6b92-436a-bc3b-4c3e3646b900.preview.emergentagent.com"
    
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
    
    async def test_quiz_page_integration_flow(self, session: aiohttp.ClientSession):
        """Test the complete QuizPage integration flow as used by frontend"""
        print("\n🔍 Testing QuizPage Integration Flow...")
        
        # Step 1: Frontend loads quiz questions on component mount
        try:
            async with session.get(f"{self.base_url}/api/quiz/questions") as response:
                if response.status == 200:
                    questions_data = await response.json()
                    
                    # Validate the structure that frontend expects
                    if 'steps' in questions_data:
                        steps = questions_data['steps']
                        expected_step_ids = ['basic_info', 'body_type', 'style_preferences', 'lifestyle', 'personality', 'visual_aid']
                        
                        # Check if frontend can map these correctly
                        step_mapping_success = True
                        for expected_id in expected_step_ids:
                            if not any(step.get('id') == expected_id for step in steps):
                                step_mapping_success = False
                                break
                        
                        if step_mapping_success:
                            self.log_test("QuizPage Questions Loading", True, f"Frontend can map all {len(expected_step_ids)} quiz steps")
                        else:
                            self.log_test("QuizPage Questions Loading", False, "Frontend step mapping would fail")
                    else:
                        self.log_test("QuizPage Questions Loading", False, "Missing 'steps' key for frontend mapping")
                else:
                    self.log_test("QuizPage Questions Loading", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("QuizPage Questions Loading", False, f"Exception: {str(e)}")
        
        # Step 2: Frontend starts quiz session on component mount
        try:
            async with session.post(f"{self.base_url}/api/quiz/start") as response:
                if response.status == 200:
                    session_data = await response.json()
                    
                    # Validate frontend expects these fields
                    if 'session_id' in session_data and 'current_step' in session_data:
                        self.session_id = session_data['session_id']
                        if session_data['current_step'] == 0:
                            self.log_test("QuizPage Session Start", True, f"Frontend receives session_id: {self.session_id[:8]}...")
                        else:
                            self.log_test("QuizPage Session Start", False, f"Frontend expects current_step=0, got {session_data['current_step']}")
                    else:
                        self.log_test("QuizPage Session Start", False, "Missing fields frontend expects")
                else:
                    self.log_test("QuizPage Session Start", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("QuizPage Session Start", False, f"Exception: {str(e)}")
    
    async def test_quiz_step_submission_integration(self, session: aiohttp.ClientSession):
        """Test quiz step submission as done by frontend handleNext function"""
        print("\n🔍 Testing QuizPage Step Submission Integration...")
        
        if not self.session_id:
            self.log_test("QuizPage Step Submission", False, "No session_id available")
            return
        
        # Simulate frontend step submission pattern (corrected to match backend API)
        frontend_step_data = {
            "session_id": self.session_id,
            "step_number": 0,  # Backend expects step_number
            "answers": {       # Backend expects answers
                "full_name": "Emma Thompson",
                "gender_identity": "Female", 
                "date_of_birth": "05/20/1990",
                "city": "New York"
            }
        }
        
        try:
            async with session.post(
                f"{self.base_url}/api/quiz/submit-step",
                json=frontend_step_data,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check if response matches what frontend expects
                    if 'message' in data and data.get('message') == 'Step submitted successfully':
                        if 'next_step' in data and data['next_step'] == 1:
                            self.log_test("QuizPage Step Submission", True, "Frontend step submission pattern works")
                        else:
                            self.log_test("QuizPage Step Submission", False, f"Frontend expects next_step=1, got {data.get('next_step')}")
                    else:
                        self.log_test("QuizPage Step Submission", False, f"Unexpected response format: {data}")
                else:
                    self.log_test("QuizPage Step Submission", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("QuizPage Step Submission", False, f"Exception: {str(e)}")
    
    async def test_quiz_completion_integration(self, session: aiohttp.ClientSession):
        """Test quiz completion as done by frontend final step"""
        print("\n🔍 Testing QuizPage Completion Integration...")
        
        if not self.session_id:
            self.log_test("QuizPage Completion", False, "No session_id available")
            return
        
        # Submit a few more steps to complete the quiz (corrected format)
        steps_data = [
            {
                "session_id": self.session_id,
                "step_number": 1,
                "answers": {
                    "height": "5'7\"",
                    "weight": "135 lbs",
                    "body_type": "Hourglass",
                    "clothing_size": "M"
                }
            },
            {
                "session_id": self.session_id,
                "step_number": 2,
                "answers": {
                    "current_style": ["Smart Casual", "Bohemian"],
                    "interested_styles": ["Trendy", "Elegant"],
                    "favorite_colors": ["Navy", "Cream", "Rose Gold"],
                    "avoid_colors": ["Neon Green", "Hot Pink"]
                }
            }
        ]
        
        # Submit remaining steps
        for step_data in steps_data:
            try:
                async with session.post(
                    f"{self.base_url}/api/quiz/submit-step",
                    json=step_data,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if response.status != 200:
                        self.log_test(f"QuizPage Step {step_data['step_number']} Prep", False, f"HTTP {response.status}")
                        return
            except Exception as e:
                self.log_test(f"QuizPage Step {step_data['step_number']} Prep", False, f"Exception: {str(e)}")
                return
        
        # Now test completion as frontend does
        try:
            completion_payload = {"session_id": self.session_id}
            
            async with session.post(
                f"{self.base_url}/api/quiz/complete",
                json=completion_payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate frontend expects these fields for navigation
                    required_fields = ['recommendations', 'confidence_score', 'style_profile']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_test("QuizPage Completion", True, "Frontend receives all required data for navigation to results")
                    else:
                        self.log_test("QuizPage Completion", False, f"Missing fields frontend needs: {missing_fields}")
                else:
                    self.log_test("QuizPage Completion", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("QuizPage Completion", False, f"Exception: {str(e)}")
    
    async def test_results_page_integration(self, session: aiohttp.ClientSession):
        """Test ResultsPage integration flow"""
        print("\n🔍 Testing ResultsPage Integration Flow...")
        
        if not self.session_id:
            self.log_test("ResultsPage Integration", False, "No session_id available")
            return
        
        # Test results retrieval as frontend does with URL params
        try:
            async with session.get(f"{self.base_url}/api/quiz/results/{self.session_id}") as response:
                if response.status == 200:
                    results_data = await response.json()
                    
                    # Validate structure that frontend expects for rendering
                    frontend_required_fields = ['quiz_answers', 'style_profile', 'recommendations', 'confidence_score']
                    missing_fields = [field for field in frontend_required_fields if field not in results_data]
                    
                    if not missing_fields:
                        # Check specific frontend usage patterns
                        quiz_answers = results_data['quiz_answers']
                        recommendations = results_data['recommendations']
                        confidence_score = results_data['confidence_score']
                        
                        # Validate confidence score animation data
                        if isinstance(confidence_score, int) and 0 <= confidence_score <= 100:
                            self.log_test("ResultsPage Confidence Animation", True, f"Frontend can animate score: {confidence_score}%")
                        else:
                            self.log_test("ResultsPage Confidence Animation", False, f"Invalid confidence score for animation: {confidence_score}")
                        
                        # Validate recommendations structure for frontend rendering
                        if isinstance(recommendations, list) and len(recommendations) > 0:
                            first_rec = recommendations[0]
                            if 'title' in first_rec and 'items' in first_rec:
                                self.log_test("ResultsPage Recommendations Rendering", True, f"Frontend can render {len(recommendations)} recommendations")
                            else:
                                self.log_test("ResultsPage Recommendations Rendering", False, "Missing fields for frontend rendering")
                        else:
                            self.log_test("ResultsPage Recommendations Rendering", False, "No recommendations for frontend to display")
                        
                        # Validate user profile data for avatar
                        if isinstance(quiz_answers, dict) and 'full_name' in quiz_answers:
                            self.log_test("ResultsPage Avatar Data", True, f"Frontend has user data for avatar: {quiz_answers.get('full_name')}")
                        else:
                            self.log_test("ResultsPage Avatar Data", False, "Missing user data for avatar rendering")
                        
                        self.log_test("ResultsPage Integration", True, "All frontend requirements met")
                    else:
                        self.log_test("ResultsPage Integration", False, f"Missing fields frontend needs: {missing_fields}")
                else:
                    self.log_test("ResultsPage Integration", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("ResultsPage Integration", False, f"Exception: {str(e)}")
    
    async def test_waitlist_integration(self, session: aiohttp.ClientSession):
        """Test WaitlistSection integration"""
        print("\n🔍 Testing WaitlistSection Integration...")
        
        # Test waitlist subscription as frontend does
        test_email = f"integration.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
        
        try:
            # Frontend payload structure
            frontend_payload = {
                "email": test_email,
                "instagram": "@testuser",
                "source": "waitlist_section"
            }
            
            async with session.post(
                f"{self.base_url}/api/waitlist/subscribe",
                json=frontend_payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate frontend expects these fields
                    if data.get('success') and 'position' in data:
                        self.log_test("WaitlistSection Subscription", True, f"Frontend receives success confirmation and position: {data['position']}")
                        
                        # Test duplicate email handling as frontend does
                        async with session.post(
                            f"{self.base_url}/api/waitlist/subscribe",
                            json=frontend_payload,
                            headers={'Content-Type': 'application/json'}
                        ) as dup_response:
                            if dup_response.status == 200:
                                dup_data = await dup_response.json()
                                if 'already' in dup_data.get('message', '').lower():
                                    self.log_test("WaitlistSection Duplicate Handling", True, "Frontend can handle duplicate email scenario")
                                else:
                                    self.log_test("WaitlistSection Duplicate Handling", False, f"Unexpected duplicate response: {dup_data}")
                            else:
                                self.log_test("WaitlistSection Duplicate Handling", False, f"HTTP {dup_response.status}")
                    else:
                        self.log_test("WaitlistSection Subscription", False, f"Missing fields frontend expects: {data}")
                else:
                    self.log_test("WaitlistSection Subscription", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("WaitlistSection Subscription", False, f"Exception: {str(e)}")
        
        # Test invalid email handling as frontend does
        try:
            invalid_payload = {
                "email": "invalid-email-format",
                "source": "waitlist_section"
            }
            
            async with session.post(
                f"{self.base_url}/api/waitlist/subscribe",
                json=invalid_payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 422:  # Frontend expects validation error
                    self.log_test("WaitlistSection Email Validation", True, "Frontend receives proper validation error")
                else:
                    self.log_test("WaitlistSection Email Validation", False, f"Expected 422, got {response.status}")
        except Exception as e:
            self.log_test("WaitlistSection Email Validation", False, f"Exception: {str(e)}")
    
    async def test_session_management_integration(self, session: aiohttp.ClientSession):
        """Test session management across frontend flow"""
        print("\n🔍 Testing Session Management Integration...")
        
        if not self.session_id:
            self.log_test("Session Management", False, "No session_id available")
            return
        
        # Test that session persists across multiple requests (as frontend does)
        try:
            # First request - submit step (corrected format)
            step_payload = {
                "session_id": self.session_id,
                "step_number": 3,
                "answers": {
                    "occupation": "Software Engineer",
                    "typical_week": ["Mostly work", "Gym & sports"],
                    "help_occasions": ["Work/office", "Casual daily wear", "Social media outfits"]
                }
            }
            
            async with session.post(
                f"{self.base_url}/api/quiz/submit-step",
                json=step_payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    # Second request - get results (simulating frontend navigation)
                    async with session.get(f"{self.base_url}/api/quiz/results/{self.session_id}") as results_response:
                        if results_response.status == 200:
                            results_data = await results_response.json()
                            
                            # Verify session data persists
                            if results_data.get('session_id') == self.session_id:
                                # Check if the step we just submitted is in the results
                                quiz_answers = results_data.get('quiz_answers', {})
                                if 'work_environment' in quiz_answers and quiz_answers['work_environment'] == 'Office':
                                    self.log_test("Session Management", True, "Session data persists across frontend requests")
                                else:
                                    self.log_test("Session Management", False, "Session data not properly persisted")
                            else:
                                self.log_test("Session Management", False, "Session ID mismatch")
                        else:
                            self.log_test("Session Management", False, f"Results retrieval failed: HTTP {results_response.status}")
                else:
                    self.log_test("Session Management", False, f"Step submission failed: HTTP {response.status}")
        except Exception as e:
            self.log_test("Session Management", False, f"Exception: {str(e)}")
    
    async def run_integration_tests(self):
        """Run all frontend integration tests"""
        print(f"🚀 Starting Frontend-Backend Integration Testing")
        print(f"📍 Backend URL: {self.base_url}")
        print(f"🎯 Focus: Testing exact frontend integration patterns")
        print("=" * 70)
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            # Test complete integration flows
            await self.test_quiz_page_integration_flow(session)
            await self.test_quiz_step_submission_integration(session)
            await self.test_quiz_completion_integration(session)
            await self.test_results_page_integration(session)
            await self.test_waitlist_integration(session)
            await self.test_session_management_integration(session)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print integration test summary"""
        print("\n" + "=" * 70)
        print("📊 FRONTEND INTEGRATION TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Integration Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED INTEGRATION TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n🎯 CRITICAL INTEGRATION STATUS:")
        
        # Check critical integration functionality
        critical_tests = [
            "QuizPage Questions Loading",
            "QuizPage Session Start", 
            "QuizPage Step Submission",
            "QuizPage Completion",
            "ResultsPage Integration",
            "WaitlistSection Subscription",
            "Session Management"
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
            print(f"\n🎉 ALL CRITICAL FRONTEND-BACKEND INTEGRATION IS WORKING!")
            print(f"✨ Frontend components can successfully communicate with backend APIs")
        else:
            print(f"\n⚠️  {len(critical_tests) - critical_passed} critical integration issues need attention")

async def main():
    """Main test execution"""
    tester = FrontendIntegrationTester()
    await tester.run_integration_tests()

if __name__ == "__main__":
    asyncio.run(main())