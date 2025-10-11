#!/usr/bin/env python
"""
Final status check for Django Admin Dashboard
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

def final_status_check():
    """Final comprehensive status check"""
    print("Django Admin Dashboard - Final Status Check")
    print("=" * 50)
    
    # 1. Database Connection
    print("1. Database Connection:")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result:
                print("   STATUS: OK - Database connected successfully")
            else:
                print("   STATUS: ERROR - Database connection failed")
                return False
    except Exception as e:
        print(f"   STATUS: ERROR - {e}")
        return False
    
    # 2. User Model
    print("\n2. User Model:")
    try:
        user = User.objects.get(username='najibe')
        print(f"   STATUS: OK - User 'najibe' found")
        print(f"   - ID: {user.id}")
        print(f"   - Username: {user.username}")
        print(f"   - Role: {user.role}")
        print(f"   - Is Superuser: {user.is_superuser}")
        print(f"   - Is Staff: {user.is_staff}")
        print(f"   - Is Active: {user.is_active}")
        
        # Password check
        if user.check_password('722003'):
            print("   - Password: OK")
        else:
            print("   - Password: ERROR")
            return False
    except User.DoesNotExist:
        print("   STATUS: ERROR - User 'najibe' not found")
        return False
    except Exception as e:
        print(f"   STATUS: ERROR - {e}")
        return False
    
    # 3. Admin Registration
    print("\n3. Django Admin Registration:")
    try:
        registered_models = list(site._registry.keys())
        print(f"   STATUS: OK - {len(registered_models)} models registered")
        
        # Check key models
        key_models = ['User', 'MainEvent', 'SubEvent', 'Delegation', 'Member']
        for model_name in key_models:
            model_found = any(m.__name__ == model_name for m in registered_models)
            status = "OK" if model_found else "MISSING"
            print(f"   - {model_name}: {status}")
        
        if User not in [m for m in registered_models if m.__name__ == 'User']:
            print("   STATUS: ERROR - User model not registered")
            return False
    except Exception as e:
        print(f"   STATUS: ERROR - {e}")
        return False
    
    # 4. User Permissions
    print("\n4. User Permissions:")
    try:
        user = User.objects.get(username='najibe')
        
        permissions = [
            ('add_user', 'Add Users'),
            ('change_user', 'Change Users'),
            ('delete_user', 'Delete Users'),
            ('view_user', 'View Users')
        ]
        
        all_permissions_ok = True
        for perm_codename, perm_name in permissions:
            has_perm = user.has_perm(f'accounts.{perm_codename}')
            status = "OK" if has_perm else "ERROR"
            print(f"   - {perm_name}: {status}")
            if not has_perm:
                all_permissions_ok = False
        
        if not all_permissions_ok:
            print("   STATUS: ERROR - Some permissions missing")
            return False
        else:
            print("   STATUS: OK - All permissions granted")
    except Exception as e:
        print(f"   STATUS: ERROR - {e}")
        return False
    
    # 5. Database Tables
    print("\n5. Database Tables:")
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
            
            all_tables_ok = True
            for table in required_tables:
                status = "OK" if table in tables else "MISSING"
                print(f"   - {table}: {status}")
                if table not in tables:
                    all_tables_ok = False
            
            if not all_tables_ok:
                print("   STATUS: ERROR - Some tables missing")
                return False
            else:
                print("   STATUS: OK - All required tables exist")
    except Exception as e:
        print(f"   STATUS: ERROR - {e}")
        return False
    
    return True

def main():
    """Main function"""
    success = final_status_check()
    
    print("\n" + "=" * 50)
    print("FINAL RESULT:")
    print("=" * 50)
    
    if success:
        print("STATUS: ALL SYSTEMS OPERATIONAL")
        print("\nDjango Admin Dashboard is ready for use!")
        print("\nAccess Information:")
        print("   URL: http://localhost:8000/admin")
        print("   Username: najibe")
        print("   Password: 722003")
        print("\nAvailable Features:")
        print("   - Full user management")
        print("   - Add/Edit/Delete users")
        print("   - Manage all system data")
        print("   - Complete admin control")
    else:
        print("STATUS: ISSUES DETECTED")
        print("\nDjango Admin Dashboard has problems that need fixing.")
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
