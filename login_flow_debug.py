#!/usr/bin/env python3
"""
Login Flow Debug Test
Simulates the exact user flow described in the issue:
1. User logs in with Google via Emergent
2. Gets redirected to homepage with session_id in URL fragment
3. Should be logged in but still sees login button
"""

import asyncio
import aiohttp
import json
from datetime import datetime

class LoginFlowDebugger:
    def __init__(self):
        self.base_url = "https://aee48b5e-99d1-410a-847d-57b3c8a1b8c9.preview.emergentagent.com"
        self.test_results = []
        
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
    
    async def test_emergent_session_simulation(self, session: aiohttp.ClientSession):
        """Simulate what happens when user comes back from Emergent with session_id"""
        print("\n🔍 Testing Emergent Session Simulation...")
        
        # Test 1: Simulate login with a realistic-looking session ID
        try:
            # This simulates what the frontend would send to the backend
            realistic_session_id = "60b77a6f-9458-4a4c-83d6-aa55a51af7c8"  # UUID format like Emergent uses
            payload = {"session_id": realistic_session_id}
            
            async with session.post(
                f"{self.base_url}/api/auth/login",
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Origin': 'https://aee48b5e-99d1-410a-847d-57b3c8a1b8c9.preview.emergentagent.com',
                    'Referer': 'https://auth.emergentagent.com/'
                }
            ) as response:
                # Check response
                if response.status == 401:
                    data = await response.json()
                    if 'Invalid session ID' in data.get('detail', ''):
                        self.log_test("Emergent Session Validation", True, "Backend properly validates Emergent session IDs")
                    else:
                        self.log_test("Emergent Session Validation", False, f"Unexpected error: {data}")
                elif response.status == 200:
                    data = await response.json()
                    self.log_test("Emergent Session Success", True, f"Login successful: {data.get('message', 'No message')}")
                    
                    # Check if session token is provided
                    if data.get('session_token'):
                        self.log_test("Session Token Generation", True, f"Session token generated: {data['session_token'][:10]}...")
                    else:
                        self.log_test("Session Token Generation", False, "No session token in response")
                    
                    # Check cookie setting
                    set_cookie = response.headers.get('Set-Cookie')
                    if set_cookie and 'session_token' in set_cookie:
                        self.log_test("Session Cookie Setting", True, f"Session cookie set: {set_cookie[:50]}...")
                    else:
                        self.log_test("Session Cookie Setting", False, f"No session cookie set: {set_cookie}")
                else:
                    self.log_test("Emergent Session Validation", False, f"Unexpected status: {response.status}")
        except Exception as e:
            self.log_test("Emergent Session Validation", False, f"Exception: {str(e)}")
    
    async def test_session_persistence_issue(self, session: aiohttp.ClientSession):
        """Test the specific session persistence issue"""
        print("\n🔍 Testing Session Persistence Issue...")
        
        # Test 1: Check if session verification works immediately after login
        try:
            # Simulate a successful login response (mock)
            mock_session_token = "mock-successful-session-token"
            
            # Test with Authorization header (how frontend might send it)
            headers = {"Authorization": f"Bearer {mock_session_token}"}
            async with session.get(f"{self.base_url}/api/auth/verify", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('valid') == False:
                        self.log_test("Session Verification After Login", True, "Session verification properly handles tokens")
                    else:
                        self.log_test("Session Verification After Login", False, f"Unexpected verification result: {data}")
                else:
                    self.log_test("Session Verification After Login", False, f"Verification failed: {response.status}")
        except Exception as e:
            self.log_test("Session Verification After Login", False, f"Exception: {str(e)}")
        
        # Test 2: Check cookie-based session verification
        try:
            # Create session with cookie
            cookie_jar = aiohttp.CookieJar()
            cookie_jar.update_cookies({'session_token': 'mock-cookie-session-token'})
            
            async with aiohttp.ClientSession(cookie_jar=cookie_jar) as cookie_session:
                async with cookie_session.get(f"{self.base_url}/api/auth/verify") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('valid') == False:
                            self.log_test("Cookie Session Verification", True, "Cookie-based session verification working")
                        else:
                            self.log_test("Cookie Session Verification", False, f"Unexpected cookie verification: {data}")
                    else:
                        self.log_test("Cookie Session Verification", False, f"Cookie verification failed: {response.status}")
        except Exception as e:
            self.log_test("Cookie Session Verification", False, f"Exception: {str(e)}")
    
    async def test_profile_loading_issue(self, session: aiohttp.ClientSession):
        """Test the profile loading issue mentioned in the bug report"""
        print("\n🔍 Testing Profile Loading Issue...")
        
        # Test 1: Check if profile endpoint is accessible
        try:
            headers = {"Authorization": "Bearer test-profile-token"}
            async with session.get(f"{self.base_url}/api/auth/profile", headers=headers) as response:
                if response.status == 401:
                    data = await response.json()
                    if 'Invalid or expired session token' in data.get('detail', ''):
                        self.log_test("Profile Endpoint Access", True, "Profile endpoint properly validates tokens")
                    else:
                        self.log_test("Profile Endpoint Access", False, f"Unexpected profile error: {data}")
                elif response.status == 200:
                    data = await response.json()
                    if data.get('success') and 'user' in data:
                        self.log_test("Profile Endpoint Access", True, "Profile endpoint returns user data")
                    else:
                        self.log_test("Profile Endpoint Access", False, f"Invalid profile response: {data}")
                else:
                    self.log_test("Profile Endpoint Access", False, f"Profile endpoint error: {response.status}")
        except Exception as e:
            self.log_test("Profile Endpoint Access", False, f"Exception: {str(e)}")
        
        # Test 2: Check detailed profile endpoint (mentioned in the issue)
        try:
            headers = {"Authorization": "Bearer test-detailed-profile-token"}
            async with session.get(f"{self.base_url}/api/auth/profile/detailed", headers=headers) as response:
                if response.status == 401:
                    data = await response.json()
                    if 'Invalid or expired session token' in data.get('detail', ''):
                        self.log_test("Detailed Profile Endpoint", True, "Detailed profile endpoint properly validates tokens")
                    else:
                        self.log_test("Detailed Profile Endpoint", False, f"Unexpected detailed profile error: {data}")
                elif response.status == 200:
                    data = await response.json()
                    if data.get('success') and 'user' in data:
                        self.log_test("Detailed Profile Endpoint", True, "Detailed profile endpoint returns user data")
                    else:
                        self.log_test("Detailed Profile Endpoint", False, f"Invalid detailed profile response: {data}")
                else:
                    self.log_test("Detailed Profile Endpoint", False, f"Detailed profile endpoint error: {response.status}")
        except Exception as e:
            self.log_test("Detailed Profile Endpoint", False, f"Exception: {str(e)}")
    
    async def test_redirect_flow_issue(self, session: aiohttp.ClientSession):
        """Test the redirect flow issue"""
        print("\n🔍 Testing Redirect Flow Issue...")
        
        # Test 1: Check if the backend handles redirect scenarios properly
        try:
            # Simulate the redirect from Emergent auth
            headers = {
                'Content-Type': 'application/json',
                'Origin': 'https://aee48b5e-99d1-410a-847d-57b3c8a1b8c9.preview.emergentagent.com',
                'Referer': 'https://auth.emergentagent.com/',
                'User-Agent': 'Mozilla/5.0 (compatible; Frontend/1.0)'
            }
            
            payload = {"session_id": "redirect-test-session-id"}
            async with session.post(f"{self.base_url}/api/auth/login", json=payload, headers=headers) as response:
                # Check CORS headers
                cors_origin = response.headers.get('Access-Control-Allow-Origin')
                cors_credentials = response.headers.get('Access-Control-Allow-Credentials')
                
                if cors_origin and cors_credentials == 'true':
                    self.log_test("Redirect CORS Headers", True, f"CORS properly configured for redirects")
                else:
                    self.log_test("Redirect CORS Headers", False, f"CORS issue: Origin={cors_origin}, Credentials={cors_credentials}")
                
                # Check response status
                if response.status in [200, 401]:  # Both acceptable for this test
                    self.log_test("Redirect Request Handling", True, "Backend properly handles redirect requests")
                else:
                    self.log_test("Redirect Request Handling", False, f"Redirect handling issue: {response.status}")
        except Exception as e:
            self.log_test("Redirect Request Handling", False, f"Exception: {str(e)}")
    
    async def test_timing_issue(self, session: aiohttp.ClientSession):
        """Test for potential timing issues in the login flow"""
        print("\n🔍 Testing Timing Issues...")
        
        # Test 1: Check if there are any race conditions
        try:
            # Simulate rapid successive requests (like frontend might make)
            tasks = []
            for i in range(3):
                task = session.get(f"{self.base_url}/api/auth/verify")
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            success_count = 0
            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    continue
                async with response:
                    if response.status == 200:
                        success_count += 1
            
            if success_count == 3:
                self.log_test("Concurrent Request Handling", True, "Backend handles concurrent requests properly")
            else:
                self.log_test("Concurrent Request Handling", False, f"Only {success_count}/3 concurrent requests succeeded")
        except Exception as e:
            self.log_test("Concurrent Request Handling", False, f"Exception: {str(e)}")
    
    async def run_debug_tests(self):
        """Run all debug tests"""
        print(f"🔍 Starting Login Flow Debug Tests")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            await self.test_emergent_session_simulation(session)
            await self.test_session_persistence_issue(session)
            await self.test_profile_loading_issue(session)
            await self.test_redirect_flow_issue(session)
            await self.test_timing_issue(session)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 LOGIN FLOW DEBUG SUMMARY")
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
        
        print("\n🎯 LOGIN FLOW DIAGNOSIS:")
        if failed_tests == 0:
            print("✅ All login flow components are working correctly!")
            print("🔍 The issue might be in the frontend JavaScript logic or Emergent integration.")
        else:
            print(f"⚠️  {failed_tests} potential issues found in login flow")

async def main():
    """Main debug execution"""
    debugger = LoginFlowDebugger()
    await debugger.run_debug_tests()

if __name__ == "__main__":
    asyncio.run(main())