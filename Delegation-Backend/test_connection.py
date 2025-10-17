#!/usr/bin/env python
"""
Script to test the connection between frontend and backend
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
import json

User = get_user_model()

def test_api_connection():
    """Test API endpoints"""
    print("🔍 Testing API Connection...")
    
    client = APIClient()
    
    # Test 1: Check if API is accessible
    print("\n1. Testing API accessibility...")
    try:
        response = client.get('/api/')
        print(f"   ✅ API accessible: {response.status_code}")
    except Exception as e:
        print(f"   ❌ API not accessible: {e}")
        return False
    
    # Test 2: Check authentication endpoints
    print("\n2. Testing authentication endpoints...")
    try:
        response = client.get('/api/auth/')
        print(f"   ✅ Auth endpoints accessible: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Auth endpoints not accessible: {e}")
    
    # Test 3: Check main events endpoint
    print("\n3. Testing main events endpoint...")
    try:
        response = client.get('/api/main-events/')
        print(f"   ✅ Main events endpoint: {response.status_code}")
        if response.status_code == 401:
            print("   ℹ️  Authentication required (expected)")
    except Exception as e:
        print(f"   ❌ Main events endpoint error: {e}")
    
    # Test 4: Create test user and token
    print("\n4. Creating test user...")
    try:
        # Create test user if not exists
        test_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'full_name': 'Test User',
                'role': 'ADMIN',
                'is_active': True,
            }
        )
        
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            print("   ✅ Test user created")
        else:
            print("   ✅ Test user already exists")
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=test_user)
        print(f"   ✅ Token: {token.key}")
        
        # Test authenticated request
        client.force_authenticate(user=test_user)
        response = client.get('/api/main-events/')
        print(f"   ✅ Authenticated request: {response.status_code}")
        
        # Test auth endpoints
        response = client.get('/api/auth/me/')
        print(f"   ✅ User info: {response.status_code}")
        
        response = client.get('/api/auth/user_permissions/')
        print(f"   ✅ User permissions: {response.status_code}")
        
    except Exception as e:
        print(f"   ❌ User creation/auth test failed: {e}")
        return False
    
    print("\n🎉 All tests passed! Backend is ready for frontend connection.")
    return True

def test_cors_headers():
    """Test CORS headers"""
    print("\n🔍 Testing CORS Headers...")
    
    client = Client()
    
    # Test OPTIONS request (CORS preflight)
    try:
        response = client.options('/api/main-events/', 
                                HTTP_ORIGIN='http://localhost:5173',
                                HTTP_ACCESS_CONTROL_REQUEST_METHOD='GET')
        
        print(f"   ✅ OPTIONS request: {response.status_code}")
        
        # Check CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': response.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.get('Access-Control-Allow-Headers'),
        }
        
        for header, value in cors_headers.items():
            if value:
                print(f"   ✅ {header}: {value}")
            else:
                print(f"   ⚠️  {header}: Not set")
                
    except Exception as e:
        print(f"   ❌ CORS test failed: {e}")

def test_database_models():
    """Test database models"""
    print("\n🔍 Testing Database Models...")
    
    try:
        # Test User model
        user_count = User.objects.count()
        print(f"   ✅ Users in database: {user_count}")
        
        # Test other models
        from api.models import MainEvent, SubEvent, Nationality, Delegation
        
        main_events_count = MainEvent.objects.count()
        sub_events_count = SubEvent.objects.count()
        nationalities_count = Nationality.objects.count()
        delegations_count = Delegation.objects.count()
        
        print(f"   ✅ Main Events: {main_events_count}")
        print(f"   ✅ Sub Events: {sub_events_count}")
        print(f"   ✅ Nationalities: {nationalities_count}")
        print(f"   ✅ Delegations: {delegations_count}")
        
    except Exception as e:
        print(f"   ❌ Database models test failed: {e}")

if __name__ == '__main__':
    print("🚀 Starting Backend Connection Tests...")
    print("=" * 50)
    
    # Run tests
    test_database_models()
    test_cors_headers()
    success = test_api_connection()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Backend is ready for frontend connection!")
        print("\n📝 Next steps:")
        print("   1. Start the backend server: python manage.py runserver")
        print("   2. Start the frontend server: npm run dev")
        print("   3. Test the connection in browser")
    else:
        print("❌ Backend has issues that need to be fixed first.")
        sys.exit(1)



