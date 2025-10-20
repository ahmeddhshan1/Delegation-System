#!/usr/bin/env python
"""
Test all API endpoints
"""
import os
import sys
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def test_all_endpoints():
    """Test all API endpoints"""
    print("🧪 Testing all API endpoints...")
    
    client = Client()
    
    # Step 1: Login
    print("\n1️⃣ Testing Login...")
    login_data = {
        'username': 'admin',
        'password': 'admin123'
    }
    
    response = client.post(
        '/api/auth/login/', 
        data=json.dumps(login_data),
        content_type='application/json'
    )
    
    if response.status_code == 200:
        data = json.loads(response.content)
        token = data['token']
        print(f"   ✅ Login successful! Token: {token[:20]}...")
        
        # Set authorization header
        client.defaults['HTTP_AUTHORIZATION'] = f'Token {token}'
    else:
        print(f"   ❌ Login failed: {response.status_code}")
        return False
    
    # Step 2: Test Get Current User
    print("\n2️⃣ Testing Get Current User...")
    response = client.get('/api/auth/me/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ User info: {data['username']} ({data['role']})")
    else:
        print(f"   ❌ Get user failed: {response.status_code}")
    
    # Step 3: Test Get User Permissions
    print("\n3️⃣ Testing Get User Permissions...")
    response = client.get('/api/auth/user_permissions/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Permissions: {data['role']} - Super Admin: {data['is_super_admin']}")
    else:
        print(f"   ❌ Get permissions failed: {response.status_code}")
    
    # Step 4: Test Main Events
    print("\n4️⃣ Testing Main Events...")
    response = client.get('/api/main-events/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Main events: {len(data['results'])} events")
    else:
        print(f"   ❌ Get main events failed: {response.status_code}")
    
    # Step 5: Test Sub Events
    print("\n5️⃣ Testing Sub Events...")
    response = client.get('/api/sub-events/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Sub events: {len(data['results'])} events")
    else:
        print(f"   ❌ Get sub events failed: {response.status_code}")
    
    # Step 6: Test Nationalities
    print("\n6️⃣ Testing Nationalities...")
    response = client.get('/api/nationalities/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Nationalities: {len(data['results'])} nationalities")
    else:
        print(f"   ❌ Get nationalities failed: {response.status_code}")
    
    # Step 7: Test Military Positions
    print("\n7️⃣ Testing Military Positions...")
    response = client.get('/api/military-positions/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Military positions: {len(data['results'])} positions")
    else:
        print(f"   ❌ Get military positions failed: {response.status_code}")
    
    # Step 8: Test Airports
    print("\n8️⃣ Testing Airports...")
    response = client.get('/api/airports/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Airports: {len(data['results'])} airports")
    else:
        print(f"   ❌ Get airports failed: {response.status_code}")
    
    # Step 9: Test Airlines
    print("\n9️⃣ Testing Airlines...")
    response = client.get('/api/airlines/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Airlines: {len(data['results'])} airlines")
    else:
        print(f"   ❌ Get airlines failed: {response.status_code}")
    
    # Step 10: Test Delegations
    print("\n🔟 Testing Delegations...")
    response = client.get('/api/delegations/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Delegations: {len(data['results'])} delegations")
    else:
        print(f"   ❌ Get delegations failed: {response.status_code}")
    
    # Step 11: Test Members
    print("\n1️⃣1️⃣ Testing Members...")
    response = client.get('/api/members/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Members: {len(data['results'])} members")
    else:
        print(f"   ❌ Get members failed: {response.status_code}")
    
    # Step 12: Test Dashboard Stats
    print("\n1️⃣2️⃣ Testing Dashboard Stats...")
    response = client.get('/api/dashboard/stats/')
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"   ✅ Dashboard stats: {data}")
    else:
        print(f"   ❌ Get dashboard stats failed: {response.status_code}")
    
    print("\n🎉 API endpoints testing completed!")
    return True

if __name__ == '__main__':
    test_all_endpoints()



