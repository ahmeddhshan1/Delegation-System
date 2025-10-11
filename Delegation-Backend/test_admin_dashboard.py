#!/usr/bin/env python
"""
Comprehensive test script for Django Admin Dashboard
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.admin.sites import site
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from django.db import connection

User = get_user_model()

def test_database_connection():
    """Test database connection"""
    print("1. Testing database connection...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result:
                print("   ✅ Database connection successful!")
                return True
    except Exception as e:
        print(f"   ❌ Database connection failed: {e}")
        return False

def test_user_model():
    """Test User model"""
    print("\n2. Testing User model...")
    try:
        # Test user creation
        user = User.objects.get(username='najibe')
        print(f"   ✅ User 'najibe' found!")
        print(f"      - ID: {user.id}")
        print(f"      - Username: {user.username}")
        print(f"      - Full Name: {user.full_name}")
        print(f"      - Role: {user.role}")
        print(f"      - Is Superuser: {user.is_superuser}")
        print(f"      - Is Staff: {user.is_staff}")
        print(f"      - Is Active: {user.is_active}")
        
        # Test password
        if user.check_password('722003'):
            print("      - Password: ✅ Correct")
        else:
            print("      - Password: ❌ Incorrect")
        
        return True
    except User.DoesNotExist:
        print("   ❌ User 'najibe' not found!")
        return False
    except Exception as e:
        print(f"   ❌ User model error: {e}")
        return False

def test_admin_registration():
    """Test Django Admin registration"""
    print("\n3. Testing Django Admin registration...")
    try:
        registered_models = list(site._registry.keys())
        print(f"   ✅ Found {len(registered_models)} registered models:")
        
        for model in registered_models:
            print(f"      - {model.__name__}")
        
        # Check if User model is registered
        if User in registered_models:
            print("      - ✅ User model is registered!")
        else:
            print("      - ❌ User model is NOT registered!")
            return False
        
        return True
    except Exception as e:
        print(f"   ❌ Admin registration error: {e}")
        return False

def test_user_permissions():
    """Test user permissions"""
    print("\n4. Testing user permissions...")
    try:
        user = User.objects.get(username='najibe')
        
        # Test superuser permissions
        if user.is_superuser:
            print("   ✅ User has superuser permissions!")
        
        # Test staff permissions
        if user.is_staff:
            print("   ✅ User has staff permissions!")
        
        # Test specific permissions
        can_add_user = user.has_perm('accounts.add_user')
        can_change_user = user.has_perm('accounts.change_user')
        can_delete_user = user.has_perm('accounts.delete_user')
        can_view_user = user.has_perm('accounts.view_user')
        
        print(f"   - Can add user: {'✅' if can_add_user else '❌'}")
        print(f"   - Can change user: {'✅' if can_change_user else '❌'}")
        print(f"   - Can delete user: {'✅' if can_delete_user else '❌'}")
        print(f"   - Can view user: {'✅' if can_view_user else '❌'}")
        
        return True
    except Exception as e:
        print(f"   ❌ Permissions test error: {e}")
        return False

def test_database_tables():
    """Test database tables"""
    print("\n5. Testing database tables...")
    try:
        with connection.cursor() as cursor:
            # Check users table
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'users_groups', 'users_user_permissions', 'login_sessions', 'audit_log')
                ORDER BY table_name
            """)
            
            tables = [row[0] for row in cursor.fetchall()]
            
            required_tables = ['users', 'users_groups', 'users_user_permissions', 'login_sessions', 'audit_log']
            
            print(f"   ✅ Found {len(tables)} user-related tables:")
            for table in tables:
                print(f"      - {table}")
            
            missing_tables = [table for table in required_tables if table not in tables]
            if missing_tables:
                print(f"   ❌ Missing tables: {missing_tables}")
                return False
            else:
                print("   ✅ All required tables exist!")
            
            return True
    except Exception as e:
        print(f"   ❌ Database tables test error: {e}")
        return False

def test_content_types():
    """Test content types"""
    print("\n6. Testing content types...")
    try:
        # Check if content types exist
        user_ct = ContentType.objects.get_for_model(User)
        print(f"   ✅ User content type: {user_ct}")
        
        # Check permissions
        permissions = Permission.objects.filter(content_type=user_ct)
        print(f"   ✅ Found {permissions.count()} permissions for User model:")
        
        for perm in permissions:
            print(f"      - {perm.codename}: {perm.name}")
        
        return True
    except Exception as e:
        print(f"   ❌ Content types test error: {e}")
        return False

def main():
    """Run all tests"""
    print("Django Admin Dashboard Comprehensive Test")
    print("=" * 50)
    
    tests = [
        test_database_connection,
        test_user_model,
        test_admin_registration,
        test_user_permissions,
        test_database_tables,
        test_content_types
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 50)
    print("Test Results Summary:")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ ALL TESTS PASSED! ({passed}/{total})")
        print("\n🎉 Django Admin Dashboard is ready!")
        print("\nYou can access:")
        print("   - Django Admin: http://localhost:8000/admin")
        print("   - User Management: http://localhost:8000/admin/accounts/user/")
        print("\nLogin with:")
        print("   Username: najibe")
        print("   Password: 722003")
    else:
        print(f"❌ {total - passed} TESTS FAILED! ({passed}/{total})")
        print("\n⚠️ Django Admin Dashboard has issues that need to be fixed.")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Test execution error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
