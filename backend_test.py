#!/usr/bin/env python3
"""
FOTIVA Backend API Tester
Comprehensive testing for all backend endpoints
"""

import requests
import sys
from datetime import datetime
import json

class FotivaAPITester:
    def __init__(self, base_url="https://fotiva-sales.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_client_id = None
        self.created_event_id = None

    def log(self, message):
        """Log with timestamp"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ FAILED - {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error details: {error_detail}")
                except:
                    self.log(f"   Error text: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - {name} - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log(f"❌ FAILED - {name} - Connection error")
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - {name} - Error: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        self.log("🔐 Testing Authentication Flow")
        
        # Test registration
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@fotiva.app"
        register_data = {
            "email": test_email,
            "password": "123456",
            "name": "Test User",
            "brand_name": "Test Photography"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=register_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response.get('user', {})
            self.log(f"✅ Registration successful - Token received")
        else:
            self.log("❌ Registration failed - cannot continue")
            return False

        # Test login with same credentials
        login_data = {
            "email": test_email,
            "password": "123456"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        # Test get current user
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        return True

    def test_client_management(self):
        """Test client CRUD operations"""
        self.log("👥 Testing Client Management")
        
        # Create client
        client_data = {
            "name": "João Silva",
            "phone": "+5511999999999",
            "email": "joao@exemplo.com"
        }
        
        success, response = self.run_test(
            "Create Client",
            "POST",
            "clients",
            200,
            data=client_data
        )
        
        if success and 'id' in response:
            self.created_client_id = response['id']
            self.log(f"✅ Client created with ID: {self.created_client_id}")
        
        # List clients
        success, response = self.run_test(
            "List Clients",
            "GET",
            "clients",
            200
        )
        
        # Get specific client
        if self.created_client_id:
            success, response = self.run_test(
                "Get Client by ID",
                "GET",
                f"clients/{self.created_client_id}",
                200
            )

    def test_event_management(self):
        """Test event CRUD operations"""
        self.log("📅 Testing Event Management")
        
        if not self.created_client_id:
            self.log("❌ No client ID available - skipping event tests")
            return
        
        # Create event
        event_data = {
            "client_id": self.created_client_id,
            "event_type": "Casamento",
            "event_date": "2025-03-15T14:00:00",
            "location": "Igreja São José",
            "total_value": 2500.0,
            "amount_paid": 500.0,
            "remaining_installments": 3,
            "notes": "Evento de teste",
            "status": "confirmado"
        }
        
        success, response = self.run_test(
            "Create Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        
        if success and 'id' in response:
            self.created_event_id = response['id']
            self.log(f"✅ Event created with ID: {self.created_event_id}")
        
        # List events
        success, response = self.run_test(
            "List Events",
            "GET",
            "events",
            200
        )
        
        # Get specific event
        if self.created_event_id:
            success, response = self.run_test(
                "Get Event by ID",
                "GET",
                f"events/{self.created_event_id}",
                200
            )

    def test_payment_management(self):
        """Test payment operations"""
        self.log("💳 Testing Payment Management")
        
        if not self.created_event_id:
            self.log("❌ No event ID available - skipping payment tests")
            return
        
        # Create payment
        payment_data = {
            "event_id": self.created_event_id,
            "installment_number": 1,
            "amount": 500.0,
            "due_date": "2025-02-15"
        }
        
        success, response = self.run_test(
            "Create Payment",
            "POST",
            "payments",
            200,
            data=payment_data
        )
        
        created_payment_id = None
        if success and 'id' in response:
            created_payment_id = response['id']
        
        # List payments
        success, response = self.run_test(
            "List Payments",
            "GET",
            "payments",
            200
        )
        
        # Mark payment as paid
        if created_payment_id:
            success, response = self.run_test(
                "Mark Payment as Paid",
                "PATCH",
                f"payments/{created_payment_id}/pay",
                200
            )

    def test_gallery_management(self):
        """Test gallery operations"""
        self.log("🖼️ Testing Gallery Management")
        
        # Create gallery
        gallery_data = {
            "event_id": self.created_event_id,
            "name": "Galeria de Teste"
        }
        
        success, response = self.run_test(
            "Create Gallery",
            "POST",
            "galleries",
            200,
            data=gallery_data
        )
        
        # List galleries
        success, response = self.run_test(
            "List Galleries",
            "GET",
            "galleries",
            200
        )

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        self.log("📊 Testing Dashboard Statistics")
        
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            stats = response
            self.log(f"   📈 Total Clients: {stats.get('total_clients', 0)}")
            self.log(f"   📅 Total Events: {stats.get('total_events', 0)}")
            self.log(f"   💰 Total Revenue: R$ {stats.get('total_revenue', 0)}")
            self.log(f"   ⏰ Pending Payments: R$ {stats.get('pending_payments', 0)}")

    def test_password_recovery(self):
        """Test password recovery flow"""
        self.log("🔑 Testing Password Recovery Flow")
        
        if not self.user_data or not self.user_data.get('email'):
            self.log("❌ No user email available - skipping password recovery")
            return
        
        # Request password reset
        reset_data = {
            "email": self.user_data['email']
        }
        
        success, response = self.run_test(
            "Request Password Reset",
            "POST",
            "auth/forgot-password",
            200,
            data=reset_data
        )

    def cleanup_test_data(self):
        """Clean up created test data"""
        self.log("🧹 Cleaning up test data")
        
        # Delete created event
        if self.created_event_id:
            self.run_test(
                "Delete Event",
                "DELETE",
                f"events/{self.created_event_id}",
                200
            )
        
        # Delete created client
        if self.created_client_id:
            self.run_test(
                "Delete Client",
                "DELETE",
                f"clients/{self.created_client_id}",
                200
            )

    def run_all_tests(self):
        """Run complete test suite"""
        self.log("🚀 Starting FOTIVA Backend API Tests")
        self.log(f"🌐 Testing against: {self.base_url}")
        
        # Run tests in order
        if not self.test_auth_flow():
            self.log("❌ Auth tests failed - stopping")
            return False
        
        self.test_client_management()
        self.test_event_management()
        self.test_payment_management()
        self.test_gallery_management()
        self.test_dashboard_stats()
        self.test_password_recovery()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Results
        self.log("\n" + "="*50)
        self.log("📊 TEST RESULTS")
        self.log("="*50)
        self.log(f"Total Tests: {self.tests_run}")
        self.log(f"Passed: {self.tests_passed}")
        self.log(f"Failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 All tests passed!")
            return True
        else:
            self.log(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main function"""
    tester = FotivaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())