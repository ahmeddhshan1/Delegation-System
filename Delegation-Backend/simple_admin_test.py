#!/usr/bin/env python
"""
Simple test script for Django Admin Dashboard
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.admin.sites import site
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
                print("   SUCCESS: Database connection successful!")
                return True
    except Exception as e:
        print(f"   ERROR: Database connection failed: {e}")
        return False

def test_user_model():
    """Test User model"""
    print("\n2. Testing User model...")
    try:
        user = User.objects.get(username='najibe')
        print(f"   SUCCESS: User 'najibe' found!")
        print(f"      - ID: {user.id}")
        print(f"      - Username: {user.username}")
        print(f"      - Full Name: {user.full_name}")
        print(f"      - Role: {user.role}")
        print(f"      - Is Superuser: {user.is_superuser}")
        print(f"      - Is Staff: {user.is_staff}")
        print(f"      - Is Active: {user.is_active}")
        
        if user.check_password('722003'):
            print("      - Password: CORRECT")
        else:
            print("      - Password: INCORRECT")
        
        return True
    except User.DoesNotExist:
        print("   ERROR: User 'najibe' not found!")
        return False
    except Exception as e:
        print(f"   ERROR: User model error: {e}")
        return False

def test_admin_registration():
    """Test Django Admin registration"""
    print("\n3. Testing Django Admin registration...")
    try:
        registered_models = list(site._registry.keys())
        print(f"   SUCCESS: Found {len(registered_models)} registered models:")
        
        for model in registered_models:
            print(f"      - {model.__name__}")
        
        if User in registered_models:
            print("      - User model is registered!")
        else:
            print("      - User model is NOT registered!")
            return False
        
        return True
    except Exception as e:
        print(f"   ERROR: Admin registration error: {e}")
        return False

def test_user_permissions():
    """Test user permissions"""
    print("\n4. Testing user permissions...")
    try:
        user = User.objects.get(username='najibe')
        
        if user.is_superuser:
            print("   SUCCESS: User has superuser permissions!")
        
        if user.is_staff:
            print("   SUCCESS: User has staff permissions!")
        
        can_add_user = user.has_perm('accounts.add_user')
        can_change_user = user.has_perm('accounts.change_user')
        can_delete_user = user.has_perm('accounts.delete_user')
        can_view_user = user.has_perm('accounts.view_user')
        
        print(f"   - Can add user: {'YES' if can_add_user else 'NO'}")
        print(f"   - Can change user: {'YES' if can_change_user else 'NO'}")
        print(f"   - Can delete user: {'YES' if can_delete_user else 'NO'}")
        print(f"   - Can view user: {'YES' if can_view_user else 'NO'}")
        
        return True
    except Exception as e:
        print(f"   ERROR: Permissions test error: {e}")
        return False

def test_database_tables():
    """Test database tables"""
    print("\n5. Testing database tables...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'users_groups', 'users_user_permissions', 'login_sessions', 'audit_log')
                ORDER BY table_name
            """)
            
            tables = [row[0] for row in cursor.fetchall()]
            
            required_tables = ['users', 'users_groups', 'users_user_permissions', 'login_sessions', 'audit_log']
            
            print(f"   SUCCESS: Found {len(tables)} user-related tables:")
            for table in tables:
                print(f"      - {table}")
            
            missing_tables = [table for table in required_tables if table not in tables]
            if missing_tables:
                print(f"   ERROR: Missing tables: {missing_tables}")
                return False
            else:
                print("   SUCCESS: All required tables exist!")
            
            return True
    except Exception as e:
        print(f"   ERROR: Database tables test error: {e}")
        return False

def main():
    """Run all tests"""
    print("Django Admin Dashboard Test")
    print("=" * 40)
    
    tests = [
        test_database_connection,
        test_user_model,
        test_admin_registration,
        test_user_permissions,
        test_database_tables
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 40)
    print("Test Results Summary:")
    print("=" * 40)
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"ALL TESTS PASSED! ({passed}/{total})")
        print("\nDjango Admin Dashboard is ready!")
        print("\nYou can access:")
        print("   - Django Admin: http://localhost:8000/admin")
        print("   - User Management: http://localhost:8000/admin/accounts/user/")
        print("\nLogin with:")
        print("   Username: najibe")
        print("   Password: 722003")
    else:
        print(f"{total - passed} TESTS FAILED! ({passed}/{total})")
        print("\nDjango Admin Dashboard has issues that need to be fixed.")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Test execution error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
