import requests
import json

# Test API endpoints
base_url = "http://localhost:8000/api"

def test_api():
    print("🧪 Testing Django APIs...")
    print("=" * 50)
    
    # Test 1: Dashboard Stats (should require authentication)
    try:
        response = requests.get(f"{base_url}/dashboard/stats/")
        print(f"📊 Dashboard Stats: {response.status_code}")
        if response.status_code == 401:
            print("✅ Authentication required - Good!")
        else:
            print(f"Response: {response.text[:100]}...")
    except Exception as e:
        print(f"❌ Dashboard Stats Error: {e}")
    
    # Test 2: Login
    try:
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{base_url}/auth/login/", json=login_data)
        print(f"🔐 Login: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"✅ Login successful! Token: {token[:20]}...")
            
            # Test 3: Dashboard Stats with authentication
            headers = {"Authorization": f"Token {token}"}
            response = requests.get(f"{base_url}/dashboard/stats/", headers=headers)
            print(f"📊 Dashboard Stats (Auth): {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Dashboard data retrieved successfully!")
                print(f"Event Stats: {data.get('event_stats', {})}")
                print(f"Delegation Stats: {data.get('delegation_stats', {})}")
            
        else:
            print(f"❌ Login failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Login Error: {e}")
    
    # Test 4: Main Events
    try:
        response = requests.get(f"{base_url}/main-events/")
        print(f"📅 Main Events: {response.status_code}")
        if response.status_code == 401:
            print("✅ Authentication required - Good!")
    except Exception as e:
        print(f"❌ Main Events Error: {e}")
    
    print("=" * 50)
    print("🎯 API Testing Complete!")

if __name__ == "__main__":
    test_api()
