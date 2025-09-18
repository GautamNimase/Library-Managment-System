#!/usr/bin/env python3

import requests
import json

# Test all database functions
BASE_URL = "http://localhost:5000/api"

def test_endpoint(method, endpoint, data=None, description=""):
    """Test an API endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        print(f"\n🔍 Testing: {description}")
        print(f"   {method} {url}")
        
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
        elif method == "PUT":
            response = requests.put(url, json=data, headers={'Content-Type': 'application/json'})
        elif method == "DELETE":
            response = requests.delete(url)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ SUCCESS")
            try:
                result = response.json()
                if isinstance(result, dict) and 'books' in result:
                    print(f"   📚 Found {len(result['books'])} books")
                elif isinstance(result, dict) and 'message' in result:
                    print(f"   💬 Message: {result['message']}")
                elif isinstance(result, dict) and 'token' in result:
                    print(f"   🔑 Token received (length: {len(result['token'])})")
                else:
                    print(f"   📄 Response: {str(result)[:100]}...")
            except:
                print(f"   📄 Response: {response.text[:100]}...")
        else:
            print(f"   ❌ FAILED: {response.text[:100]}...")
            
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)}")

def main():
    print("🚀 Testing Library Management System Database Functions")
    print("=" * 60)
    
    # Test 1: Get Books
    test_endpoint("GET", "/books", description="Get all books")
    
    # Test 2: Search Books
    test_endpoint("GET", "/books/search?q=gatsby", description="Search books")
    
    # Test 3: Get Single Book
    test_endpoint("GET", "/books/1", description="Get single book")
    
    # Test 4: User Registration
    test_endpoint("POST", "/auth/register", {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    }, description="User registration")
    
    # Test 5: User Login
    test_endpoint("POST", "/auth/login", {
        "email": "test@example.com",
        "password": "password123"
    }, description="User login")
    
    # Test 6: Admin Login
    test_endpoint("POST", "/auth/admin/login", {
        "email": "admin@libraryms.com",
        "password": "password"
    }, description="Admin login")
    
    # Test 7: Issue Book (if we have a token)
    test_endpoint("POST", "/issues", {
        "book_id": 1,
        "due_days": 30
    }, description="Issue book (requires auth)")
    
    # Test 8: Get Admin Stats
    test_endpoint("GET", "/admin/stats", description="Get admin statistics")
    
    print("\n" + "=" * 60)
    print("🎯 Database Function Test Complete!")
    print("\n📋 Summary:")
    print("   - If you see ✅ SUCCESS, that function is working")
    print("   - If you see ❌ FAILED, there might be an issue")
    print("   - Some endpoints require authentication tokens")

if __name__ == "__main__":
    main()
