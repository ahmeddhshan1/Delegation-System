#!/usr/bin/env python
"""
Script to fix user authentication issues
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

def check_and_fix_user():
    """Check and fix user authentication"""
    print("🔍 Checking user authentication...")
    
    try:
        # Check if user exists
        user = User.objects.filter(username='najibe').first()
        
        if not user:
            print("❌ User 'najibe' not found. Creating...")
            # Create user
            user = User.objects.create_user(
                username='najibe',
                password='722003',
                full_name='احمد نيجب',
                role='SUPER_ADMIN',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print("✅ User 'najibe' created successfully!")
        else:
            print("✅ User 'najibe' found. Checking details...")
            
            # Update user details
            user.set_password('722003')
            user.full_name = 'احمد نيجب'
            user.role = 'SUPER_ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            print("✅ User 'najibe' updated successfully!")
        
        # Test authentication
        print("\n🧪 Testing authentication...")
        test_user = User.objects.get(username='najibe')
        
        if test_user.check_password('722003'):
            print("✅ Password verification successful!")
        else:
            print("❌ Password verification failed!")
            # Force password reset
            test_user.set_password('722003')
            test_user.save()
            print("✅ Password reset successful!")
        
        # Print user details
        print(f"\n📋 User Details:")
        print(f"   ID: {test_user.id}")
        print(f"   Username: {test_user.username}")
        print(f"   Full Name: {test_user.full_name}")
        print(f"   Role: {test_user.role}")
        print(f"   Is Staff: {test_user.is_staff}")
        print(f"   Is Superuser: {test_user.is_superuser}")
        print(f"   Is Active: {test_user.is_active}")
        print(f"   Date Joined: {test_user.date_joined}")
        
        # Check database table
        print(f"\n🗄️ Database Check:")
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE username = 'najibe'")
            row = cursor.fetchone()
            if row:
                print(f"   Database record found: {row}")
            else:
                print("   ❌ No database record found!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_test_admin():
    """Create a test admin user"""
    print("\n👤 Creating test admin user...")
    
    try:
        # Create test admin
        test_admin = User.objects.create_user(
            username='testadmin',
            password='test123',
            full_name='Test Admin',
            role='ADMIN',
            is_staff=True,
            is_superuser=False,
            is_active=True
        )
        
        print("✅ Test admin created successfully!")
        print("   Username: testadmin")
        print("   Password: test123")
        print("   Role: ADMIN")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating test admin: {e}")
        return False

if __name__ == "__main__":
    try:
        print("🔧 User Authentication Fix Tool")
        print("=" * 50)
        
        success1 = check_and_fix_user()
        success2 = create_test_admin()
        
        if success1 and success2:
            print("\n🎉 All operations completed successfully!")
            print("\n📝 You can now login with:")
            print("   - najibe / 722003 (SUPER_ADMIN)")
            print("   - testadmin / test123 (ADMIN)")
        else:
            print("\n❌ Some operations failed!")
            sys.exit(1)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
