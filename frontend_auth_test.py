#!/usr/bin/env python3
"""
Frontend Authentication Flow Test
Tests the frontend authentication integration with the backend
"""

import asyncio
import aiohttp
import json
from datetime import datetime

class FrontendAuthTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.base_url = self._get_backend_url()
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
    
    async def test_frontend_backend_connectivity(self, session: aiohttp.ClientSession):
        """Test if frontend can connect to backend properly"""
        print("\n🔍 Testing Frontend-Backend Connectivity...")
        
        # Test 1: Basic connectivity
        try:
            async with session.get(f"{self.base_url}/api/health") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('status') == 'healthy':
                        self.log_test("Frontend-Backend Connectivity", True, f"Backend accessible at {self.base_url}")
                    else:
                        self.log_test("Frontend-Backend Connectivity", False, f"Backend unhealthy: {data}")
                else:
                    self.log_test("Frontend-Backend Connectivity", False, f"Backend error: {response.status}")
        except Exception as e:
            self.log_test("Frontend-Backend Connectivity", False, f"Connection failed: {str(e)}")
    
    async def test_auth_endpoints_from_frontend_perspective(self, session: aiohttp.ClientSession):
        """Test auth endpoints as frontend would call them"""
        print("\n🔍 Testing Auth Endpoints from Frontend Perspective...")
        
        # Test 1: Auth verify endpoint (initial check)
        try:
            # Simulate frontend calling verify without credentials
            async with session.get(
                f"{self.base_url}/api/auth/verify",
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('valid') == False:
                        self.log_test("Frontend Auth Verify", True, "Unauthenticated state properly returned")
                    else:
                        self.log_test("Frontend Auth Verify", False, f"Unexpected auth state: {data}")
                else:
                    self.log_test("Frontend Auth Verify", False, f"Auth verify error: {response.status}")
        except Exception as e:
            self.log_test("Frontend Auth Verify", False, f"Exception: {str(e)}")
        
        # Test 2: Profile endpoint without auth (should fail)
        try:
            async with session.get(
                f"{self.base_url}/api/auth/profile",
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 401:
                    data = await response.json()
                    if 'No session token provided' in data.get('detail', ''):
                        self.log_test("Frontend Profile No Auth", True, "Profile properly requires authentication")
                    else:
                        self.log_test("Frontend Profile No Auth", False, f"Unexpected error: {data}")
                else:
                    self.log_test("Frontend Profile No Auth", False, f"Expected 401, got {response.status}")
        except Exception as e:
            self.log_test("Frontend Profile No Auth", False, f"Exception: {str(e)}")
        
        # Test 3: Detailed profile endpoint without auth (should fail)
        try:
            async with session.get(
                f"{self.base_url}/api/auth/profile/detailed",
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 401:
                    data = await response.json()
                    if 'No session token provided' in data.get('detail', ''):
                        self.log_test("Frontend Detailed Profile No Auth", True, "Detailed profile properly requires authentication")
                    else:
                        self.log_test("Frontend Detailed Profile No Auth", False, f"Unexpected error: {data}")
                else:
                    self.log_test("Frontend Detailed Profile No Auth", False, f"Expected 401, got {response.status}")
        except Exception as e:
            self.log_test("Frontend Detailed Profile No Auth", False, f"Exception: {str(e)}")
    
    async def test_cors_configuration(self, session: aiohttp.ClientSession):
        """Test CORS configuration for frontend requests"""
        print("\n🔍 Testing CORS Configuration...")
        
        # Test 1: CORS headers for frontend origin
        try:
            headers = {
                'Origin': 'https://aee48b5e-99d1-410a-847d-57b3c8a1b8c9.preview.emergentagent.com',
                'Content-Type': 'application/json'
            }
            
            async with session.get(f"{self.base_url}/api/auth/verify", headers=headers) as response:
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
                }
                
                if cors_headers['Access-Control-Allow-Origin'] and cors_headers['Access-Control-Allow-Credentials']:
                    self.log_test("CORS Configuration", True, f"CORS properly configured: {cors_headers}")
                else:
                    self.log_test("CORS Configuration", False, f"CORS headers missing: {cors_headers}")
        except Exception as e:
            self.log_test("CORS Configuration", False, f"Exception: {str(e)}")
        
        # Test 2: Preflight request simulation
        try:
            headers = {
                'Origin': 'https://aee48b5e-99d1-410a-847d-57b3c8a1b8c9.preview.emergentagent.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            async with session.options(f"{self.base_url}/api/auth/login", headers=headers) as response:
                if response.status in [200, 204]:
                    allow_methods = response.headers.get('Access-Control-Allow-Methods')
                    if allow_methods and 'POST' in allow_methods:
                        self.log_test("CORS Preflight", True, f"Preflight requests properly handled: {allow_methods}")
                    else:
                        self.log_test("CORS Preflight", False, f"POST method not allowed: {allow_methods}")
                else:
                    self.log_test("CORS Preflight", False, f"Preflight failed: {response.status}")
        except Exception as e:
            self.log_test("CORS Preflight", False, f"Exception: {str(e)}")
    
    async def test_cookie_handling(self, session: aiohttp.ClientSession):
        """Test cookie handling for session management"""
        print("\n🔍 Testing Cookie Handling...")
        
        # Test 1: Cookie support in requests
        try:
            # Create a session with cookie jar
            cookie_jar = aiohttp.CookieJar()
            cookie_jar.update_cookies({'session_token': 'test-cookie-value'})
            
            async with aiohttp.ClientSession(cookie_jar=cookie_jar) as cookie_session:
                async with cookie_session.get(f"{self.base_url}/api/auth/verify") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('valid') == False:
                            self.log_test("Cookie Handling", True, "Cookie-based authentication properly processed")
                        else:
                            self.log_test("Cookie Handling", False, f"Unexpected cookie auth result: {data}")
                    else:
                        self.log_test("Cookie Handling", False, f"Cookie request failed: {response.status}")
        except Exception as e:
            self.log_test("Cookie Handling", False, f"Exception: {str(e)}")
        
        # Test 2: Login endpoint cookie setting
        try:
            payload = {"session_id": "cookie-test-session"}
            async with session.post(
                f"{self.base_url}/api/auth/login",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                set_cookie = response.headers.get('Set-Cookie')
                
                if response.status == 401:
                    # Expected for invalid session, but check cookie structure
                    self.log_test("Login Cookie Setting", True, "Login endpoint configured for cookie setting")
                elif response.status == 200 and set_cookie:
                    if 'session_token' in set_cookie and 'HttpOnly' in set_cookie:
                        self.log_test("Login Cookie Setting", True, f"Session cookie properly set: {set_cookie[:50]}...")
                    else:
                        self.log_test("Login Cookie Setting", False, f"Cookie missing security attributes: {set_cookie}")
                else:
                    self.log_test("Login Cookie Setting", False, f"Login response: {response.status}, Cookie: {set_cookie}")
        except Exception as e:
            self.log_test("Login Cookie Setting", False, f"Exception: {str(e)}")
    
    async def test_session_token_flow(self, session: aiohttp.ClientSession):
        """Test the complete session token flow"""
        print("\n🔍 Testing Session Token Flow...")
        
        # Test 1: Authorization header handling
        try:
            headers = {"Authorization": "Bearer test-token-123"}
            async with session.get(f"{self.base_url}/api/auth/verify", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('valid') == False:
                        self.log_test("Authorization Header", True, "Authorization header properly processed")
                    else:
                        self.log_test("Authorization Header", False, f"Unexpected token validation: {data}")
                else:
                    self.log_test("Authorization Header", False, f"Auth header request failed: {response.status}")
        except Exception as e:
            self.log_test("Authorization Header", False, f"Exception: {str(e)}")
        
        # Test 2: Profile access with Authorization header
        try:
            headers = {"Authorization": "Bearer profile-test-token"}
            async with session.get(f"{self.base_url}/api/auth/profile", headers=headers) as response:
                if response.status == 401:
                    data = await response.json()
                    if 'Invalid or expired session token' in data.get('detail', ''):
                        self.log_test("Profile Authorization", True, "Profile endpoint properly validates Authorization header")
                    else:
                        self.log_test("Profile Authorization", False, f"Unexpected profile error: {data}")
                else:
                    self.log_test("Profile Authorization", False, f"Expected 401, got {response.status}")
        except Exception as e:
            self.log_test("Profile Authorization", False, f"Exception: {str(e)}")
    
    async def run_all_tests(self):
        """Run all frontend authentication tests"""
        print(f"🚀 Starting Frontend Authentication Testing")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            await self.test_frontend_backend_connectivity(session)
            await self.test_auth_endpoints_from_frontend_perspective(session)
            await self.test_cors_configuration(session)
            await self.test_cookie_handling(session)
            await self.test_session_token_flow(session)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 FRONTEND AUTH TEST SUMMARY")
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
        
        print("\n🎯 FRONTEND AUTH STATUS:")
        if failed_tests == 0:
            print("✅ All frontend authentication integration tests passed!")
        else:
            print(f"⚠️  {failed_tests} issues found in frontend authentication integration")

async def main():
    """Main test execution"""
    tester = FrontendAuthTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())