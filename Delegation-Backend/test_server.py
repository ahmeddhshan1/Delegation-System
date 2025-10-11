#!/usr/bin/env python
"""
Script to test server startup and check for issues
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')

def test_server():
    """Test server startup and check for issues"""
    print("🔧 Testing server startup...")
    
    try:
        # Setup Django
        django.setup()
        print("✅ Django setup successful")
        
        # Check database connection
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection successful")
        
        # Check models
        from django.contrib.auth import get_user_model
        from api.models import MainEvent, SubEvent, Delegation, Member
        
        User = get_user_model()
        print("✅ Models imported successfully")
        
        # Check if we can create objects
        try:
            # Test User model
            user_count = User.objects.count()
            print(f"✅ User model working - {user_count} users found")
            
            # Test API models
            main_events_count = MainEvent.objects.count()
            sub_events_count = SubEvent.objects.count()
            delegations_count = Delegation.objects.count()
            members_count = Member.objects.count()
            
            print(f"✅ API models working:")
            print(f"   - Main Events: {main_events_count}")
            print(f"   - Sub Events: {sub_events_count}")
            print(f"   - Delegations: {delegations_count}")
            print(f"   - Members: {members_count}")
            
        except Exception as e:
            print(f"❌ Error testing models: {e}")
            return False
        
        # Check URLs
        from django.urls import reverse
        try:
            # Test some URLs
            admin_url = reverse('admin:index')
            print(f"✅ URLs working - Admin URL: {admin_url}")
        except Exception as e:
            print(f"❌ Error testing URLs: {e}")
            return False
        
        print("🎉 Server test successful! Ready to run server.")
        return True
        
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False

if __name__ == '__main__':
    success = test_server()
    sys.exit(0 if success else 1)

