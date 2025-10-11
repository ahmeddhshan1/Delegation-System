#!/usr/bin/env python
"""
Final test for Django Admin
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

def final_test():
    """Final comprehensive test"""
    print("Django Admin Final Test")
    print("=" * 30)
    
    # Test 1: User exists and has correct permissions
    print("1. Testing user permissions...")
    try:
        user = User.objects.get(username='najibe')
        print(f"   User: {user.username}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Active: {user.is_active}")
        
        can_add = user.has_perm('accounts.add_user')
        can_change = user.has_perm('accounts.change_user')
        can_delete = user.has_perm('accounts.delete_user')
        can_view = user.has_perm('accounts.view_user')
        
        print(f"   - Add Users: {'YES' if can_add else 'NO'}")
        print(f"   - Change Users: {'YES' if can_change else 'NO'}")
        print(f"   - Delete Users: {'YES' if can_delete else 'NO'}")
        print(f"   - View Users: {'YES' if can_view else 'NO'}")
        
        if all([can_add, can_change, can_delete, can_view, user.is_superuser, user.is_staff, user.is_active]):
            print("   STATUS: OK")
        else:
            print("   STATUS: ERROR")
            return False
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    # Test 2: Database foreign key constraints
    print("\n2. Testing database constraints...")
    try:
        with connection.cursor() as cursor:
            # Check django_admin_log foreign key
            cursor.execute("""
                SELECT 
                    tc.constraint_name, 
                    ccu.table_name AS foreign_table_name
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name='django_admin_log'
                AND kcu.column_name='user_id'
            """)
            
            constraints = cursor.fetchall()
            
            if constraints:
                for constraint_name, foreign_table in constraints:
                    print(f"   Constraint: {constraint_name}")
                    print(f"   References: {foreign_table}")
                    
                    if foreign_table == 'users':
                        print("   STATUS: OK - References correct table")
                    else:
                        print(f"   STATUS: ERROR - References wrong table: {foreign_table}")
                        return False
            else:
                print("   STATUS: ERROR - No foreign key constraint found")
                return False
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    # Test 3: User exists in database
    print("\n3. Testing user in database...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, username FROM users WHERE username = 'najibe'")
            user_row = cursor.fetchone()
            
            if user_row:
                user_id, username = user_row
                print(f"   User ID: {user_id}")
                print(f"   Username: {username}")
                print("   STATUS: OK")
            else:
                print("   STATUS: ERROR - User not found in database")
                return False
    except Exception as e:
        print(f"   ERROR: {e}")
        return False
    
    return True

def main():
    """Main function"""
    success = final_test()
    
    print("\n" + "=" * 30)
    print("FINAL RESULT:")
    print("=" * 30)
    
    if success:
        print("STATUS: ALL TESTS PASSED!")
        print("\nDjango Admin is ready!")
        print("\nYou can now:")
        print("  - Access Django Admin: http://localhost:8000/admin")
        print("  - Login with: najibe / 722003")
        print("  - Add, edit, delete users")
        print("  - Manage all data")
        print("  - No more foreign key errors!")
    else:
        print("STATUS: SOME TESTS FAILED!")
        print("\nDjango Admin still has issues.")
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
