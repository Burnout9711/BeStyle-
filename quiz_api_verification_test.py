#!/usr/bin/env python3
"""
Comprehensive Quiz API Verification Test
Tests all quiz endpoints to verify proper data structure and functionality
"""

import asyncio
import aiohttp
import json
import sys
from datetime import datetime

class QuizAPIVerificationTest:
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
        
        return "https://aee48b5e-99d1-410a-847d-57b3c8a1b8c9.preview.emergentagent.com"
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
    
    async def test_quiz_questions_structure(self, session: aiohttp.ClientSession):
        """Test GET /api/quiz/questions endpoint structure"""
        print("\n🔍 Testing Quiz Questions Structure...")
        
        try:
            async with session.get(f"{self.base_url}/api/quiz/questions") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify main structure
                    if 'steps' in data and isinstance(data['steps'], list):
                        steps = data['steps']
                        if len(steps) == 6:
                            self.log_test("Quiz Questions - Main Structure", True, f"Found {len(steps)} steps")
                            
                            # Verify each step has required fields
                            required_step_fields = ['id', 'title', 'description', 'questions']
                            all_steps_valid = True
                            
                            for i, step in enumerate(steps):
                                missing_fields = [field for field in required_step_fields if field not in step]
                                if missing_fields:
                                    self.log_test(f"Quiz Questions - Step {i} Structure", False, 
                                                f"Missing fields: {missing_fields}")
                                    all_steps_valid = False
                                else:
                                    # Verify questions structure
                                    questions = step['questions']
                                    if isinstance(questions, list) and len(questions) > 0:
                                        # Check first question structure
                                        first_q = questions[0]
                                        required_q_fields = ['id', 'question', 'type']
                                        missing_q_fields = [field for field in required_q_fields if field not in first_q]
                                        
                                        if not missing_q_fields:
                                            self.log_test(f"Quiz Questions - Step {i} ({step['id']})", True, 
                                                        f"{len(questions)} questions, first: '{first_q['question'][:40]}...'")
                                        else:
                                            self.log_test(f"Quiz Questions - Step {i} Questions", False, 
                                                        f"Missing question fields: {missing_q_fields}")
                                            all_steps_valid = False
                                    else:
                                        self.log_test(f"Quiz Questions - Step {i} Questions", False, 
                                                    "No questions found")
                                        all_steps_valid = False
                            
                            if all_steps_valid:
                                self.log_test("Quiz Questions - All Steps Valid", True, "All steps have proper structure")
                        else:
                            self.log_test("Quiz Questions - Main Structure", False, f"Expected 6 steps, got {len(steps)}")
                    else:
                        self.log_test("Quiz Questions - Main Structure", False, "Missing 'steps' array")
                else:
                    self.log_test("Quiz Questions - API Response", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Questions - API Response", False, f"Exception: {str(e)}")
    
    async def test_quiz_session_creation(self, session: aiohttp.ClientSession):
        """Test POST /api/quiz/start endpoint"""
        print("\n🔍 Testing Quiz Session Creation...")
        
        try:
            async with session.post(f"{self.base_url}/api/quiz/start") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify response structure
                    required_fields = ['session_id', 'current_step', 'message']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.session_id = data['session_id']
                        if data['current_step'] == 0:
                            self.log_test("Quiz Session Creation", True, 
                                        f"Session: {self.session_id[:8]}..., Step: {data['current_step']}")
                        else:
                            self.log_test("Quiz Session Creation", False, 
                                        f"Expected current_step=0, got {data['current_step']}")
                    else:
                        self.log_test("Quiz Session Creation", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Quiz Session Creation", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Session Creation", False, f"Exception: {str(e)}")
    
    async def test_quiz_step_submission(self, session: aiohttp.ClientSession):
        """Test POST /api/quiz/submit-step endpoint"""
        print("\n🔍 Testing Quiz Step Submission...")
        
        if not self.session_id:
            self.log_test("Quiz Step Submission", False, "No session_id available")
            return
        
        # Test realistic data for first step
        test_data = {
            "session_id": self.session_id,
            "step_number": 0,
            "answers": {
                "full_name": "Emma Thompson",
                "gender_identity": "Female",
                "date_of_birth": "05/20/1995",
                "city": "New York"
            }
        }
        
        try:
            async with session.post(
                f"{self.base_url}/api/quiz/submit-step",
                json=test_data,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get('message') == 'Step submitted successfully':
                        expected_next_step = 1
                        actual_next_step = data.get('next_step')
                        
                        if actual_next_step == expected_next_step:
                            self.log_test("Quiz Step Submission", True, 
                                        f"Step 0 submitted, next_step: {actual_next_step}")
                        else:
                            self.log_test("Quiz Step Submission", False, 
                                        f"Expected next_step={expected_next_step}, got {actual_next_step}")
                    else:
                        self.log_test("Quiz Step Submission", False, f"Unexpected response: {data}")
                else:
                    self.log_test("Quiz Step Submission", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Step Submission", False, f"Exception: {str(e)}")
    
    async def test_quiz_completion(self, session: aiohttp.ClientSession):
        """Test POST /api/quiz/complete endpoint"""
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
                    
                    # Verify AI recommendation response structure
                    required_fields = ['recommendations', 'confidence_score', 'style_profile']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        recommendations = data['recommendations']
                        confidence_score = data['confidence_score']
                        
                        # Verify recommendations structure
                        if isinstance(recommendations, list) and len(recommendations) > 0:
                            first_rec = recommendations[0]
                            if all(field in first_rec for field in ['title', 'items', 'match_score']):
                                self.log_test("Quiz Completion - Recommendations", True, 
                                            f"{len(recommendations)} recommendations generated")
                            else:
                                self.log_test("Quiz Completion - Recommendations", False, 
                                            "Invalid recommendation structure")
                        else:
                            self.log_test("Quiz Completion - Recommendations", False, 
                                        "No recommendations generated")
                        
                        # Verify confidence score
                        if isinstance(confidence_score, int) and 0 <= confidence_score <= 100:
                            self.log_test("Quiz Completion - Confidence Score", True, 
                                        f"Score: {confidence_score}%")
                        else:
                            self.log_test("Quiz Completion - Confidence Score", False, 
                                        f"Invalid confidence score: {confidence_score}")
                    else:
                        self.log_test("Quiz Completion", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Quiz Completion", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Completion", False, f"Exception: {str(e)}")
    
    async def test_quiz_results_retrieval(self, session: aiohttp.ClientSession):
        """Test GET /api/quiz/results/{session_id} endpoint"""
        print("\n🔍 Testing Quiz Results Retrieval...")
        
        if not self.session_id:
            self.log_test("Quiz Results Retrieval", False, "No session_id available")
            return
        
        try:
            async with session.get(f"{self.base_url}/api/quiz/results/{self.session_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify complete results structure
                    required_fields = ['session_id', 'quiz_answers', 'style_profile', 'recommendations', 'confidence_score']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        if data['session_id'] == self.session_id:
                            self.log_test("Quiz Results Retrieval", True, 
                                        f"Complete results retrieved for session {self.session_id[:8]}...")
                            
                            # Verify data persistence
                            quiz_answers = data['quiz_answers']
                            if isinstance(quiz_answers, dict) and quiz_answers.get('full_name') == 'Emma Thompson':
                                self.log_test("Quiz Results - Data Persistence", True, 
                                            "User answers correctly stored and retrieved")
                            else:
                                self.log_test("Quiz Results - Data Persistence", False, 
                                            "Quiz answers not properly persisted")
                        else:
                            self.log_test("Quiz Results Retrieval", False, "Session ID mismatch")
                    else:
                        self.log_test("Quiz Results Retrieval", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Quiz Results Retrieval", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Quiz Results Retrieval", False, f"Exception: {str(e)}")
    
    async def test_frontend_compatibility(self, session: aiohttp.ClientSession):
        """Test that the API structure matches frontend expectations"""
        print("\n🔍 Testing Frontend Compatibility...")
        
        try:
            # Test the exact flow that frontend uses
            async with session.get(f"{self.base_url}/api/quiz/questions") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Simulate frontend processing
                    if 'steps' in data:
                        steps = data['steps']
                        
                        # Check if we can map to frontend format
                        icon_map = {
                            'basic_info': 'User',
                            'body_type': 'Ruler', 
                            'style_preferences': 'Palette',
                            'lifestyle': 'Briefcase',
                            'personality': 'Heart',
                            'visual_aid': 'Camera'
                        }
                        
                        mapped_steps = []
                        for step in steps:
                            mapped_step = {
                                'id': step.get('id'),
                                'title': step.get('title'),
                                'icon': icon_map.get(step.get('id'), 'User'),
                                'description': step.get('description'),
                                'questions': step.get('questions', [])
                            }
                            mapped_steps.append(mapped_step)
                        
                        # Verify all steps have questions
                        steps_with_questions = sum(1 for step in mapped_steps if len(step['questions']) > 0)
                        
                        if steps_with_questions == 6:
                            self.log_test("Frontend Compatibility", True, 
                                        f"All {steps_with_questions} steps have questions and can be mapped correctly")
                        else:
                            self.log_test("Frontend Compatibility", False, 
                                        f"Only {steps_with_questions}/6 steps have questions")
                    else:
                        self.log_test("Frontend Compatibility", False, "Missing 'steps' array")
                else:
                    self.log_test("Frontend Compatibility", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Frontend Compatibility", False, f"Exception: {str(e)}")
    
    async def run_all_tests(self):
        """Run all quiz API verification tests"""
        print(f"🚀 Starting Quiz API Verification Tests")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            # Test quiz questions structure
            await self.test_quiz_questions_structure(session)
            
            # Test session creation
            await self.test_quiz_session_creation(session)
            
            # Test step submission
            await self.test_quiz_step_submission(session)
            
            # Test quiz completion
            await self.test_quiz_completion(session)
            
            # Test results retrieval
            await self.test_quiz_results_retrieval(session)
            
            # Test frontend compatibility
            await self.test_frontend_compatibility(session)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 QUIZ API VERIFICATION SUMMARY")
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
        
        print(f"\n🎯 QUIZ API STATUS:")
        critical_tests = [
            "Quiz Questions - Main Structure",
            "Quiz Session Creation", 
            "Quiz Step Submission",
            "Frontend Compatibility"
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
            print(f"\n🎉 QUIZ API IS FULLY FUNCTIONAL AND FRONTEND COMPATIBLE!")
        else:
            print(f"\n⚠️  {len(critical_tests) - critical_passed} critical issues need attention")

async def main():
    """Main test execution"""
    tester = QuizAPIVerificationTest()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())