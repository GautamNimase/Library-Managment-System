#!/usr/bin/env python3

import urllib.request
import urllib.parse
import json

def test_endpoint(url, method="GET", data=None):
    try:
        if method == "GET":
            with urllib.request.urlopen(url) as response:
                result = response.read().decode('utf-8')
                return json.loads(result)
        elif method == "POST":
            if data:
                data = json.dumps(data).encode('utf-8')
                req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
            else:
                req = urllib.request.Request(url, headers={'Content-Type': 'application/json'})
            
            with urllib.request.urlopen(req) as response:
                result = response.read().decode('utf-8')
                return json.loads(result)
    except Exception as e:
        return {"error": str(e)}

# Test all functions
print("🚀 Testing Library Management System Database Functions")
print("=" * 60)

# Test 1: Get Books
print("\n🔍 Testing: Get all books")
result = test_endpoint("http://localhost:5000/api/books")
if "books" in result:
    print(f"   ✅ SUCCESS: Found {len(result['books'])} books")
    print(f"   📚 Sample book: {result['books'][0]['title']}")
else:
    print(f"   ❌ FAILED: {result}")

# Test 2: Search Books
print("\n🔍 Testing: Search books")
result = test_endpoint("http://localhost:5000/api/books/search?q=gatsby")
if "books" in result:
    print(f"   ✅ SUCCESS: Found {len(result['books'])} books")
else:
    print(f"   ❌ FAILED: {result}")

# Test 3: User Registration
print("\n🔍 Testing: User registration")
result = test_endpoint("http://localhost:5000/api/auth/register", "POST", {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
})
if "message" in result and "successfully" in result["message"]:
    print(f"   ✅ SUCCESS: {result['message']}")
else:
    print(f"   ❌ FAILED: {result}")

# Test 4: Admin Login
print("\n🔍 Testing: Admin login")
result = test_endpoint("http://localhost:5000/api/auth/admin/login", "POST", {
    "email": "admin@libraryms.com",
    "password": "password"
})
if "token" in result:
    print(f"   ✅ SUCCESS: Admin login successful")
    print(f"   🔑 Token length: {len(result['token'])}")
else:
    print(f"   ❌ FAILED: {result}")

print("\n" + "=" * 60)
print("🎯 Database Function Test Complete!")
