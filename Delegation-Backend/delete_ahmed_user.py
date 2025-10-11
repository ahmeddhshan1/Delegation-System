#!/usr/bin/env python
"""
Delete all users with username 'ahmed' completely
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

def delete_all_ahmed_users():
    """Delete all users with username 'ahmed'"""
    print("Deleting all users with username 'ahmed'")
    print("=" * 40)
    
    try:
        # Check Django ORM
        users = User.objects.filter(username='ahmed')
        count = users.count()
        print(f"Found {count} users with username 'ahmed' via Django ORM")
        
        if count > 0:
            for user in users:
                print(f"Deleting user: {user.id} - {user.username}")
                user.delete()
            print("All 'ahmed' users deleted via Django ORM")
        
        # Check database directly
        print("\nChecking database directly...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, username FROM users WHERE username = 'ahmed'")
            db_users = cursor.fetchall()
            
            if db_users:
                print(f"Found {len(db_users)} users with username 'ahmed' in database")
                for user_id, username in db_users:
                    print(f"Deleting from database: {user_id} - {username}")
                    cursor.execute("DELETE FROM users WHERE id = %s", [user_id])
                print("All 'ahmed' users deleted from database")
            else:
                print("No 'ahmed' users found in database")
        
        # Verify deletion
        print("\nVerifying deletion...")
        remaining_users = User.objects.filter(username='ahmed')
        if remaining_users.count() == 0:
            print("SUCCESS: No users with username 'ahmed' found")
            return True
        else:
            print(f"ERROR: Still found {remaining_users.count()} users with username 'ahmed'")
            return False
        
    except Exception as e:
        print(f"Error deleting users: {e}")
        import traceback
        traceback.print_exc()
        return False

def list_all_users():
    """List all remaining users"""
    print("\nAll remaining users in system:")
    print("=" * 35)
    
    try:
        users = User.objects.all()
        print(f"Total users: {users.count()}")
        
        for user in users:
            print(f"  - {user.username} ({user.full_name}) - {user.role}")
        
    except Exception as e:
        print(f"Error listing users: {e}")

def clear_admin_log_for_ahmed():
    """Clear admin log entries related to ahmed user"""
    print("\nClearing admin log entries for ahmed user...")
    
    try:
        with connection.cursor() as cursor:
            # Find admin log entries for ahmed user
            cursor.execute("""
                SELECT id, object_repr, action_time 
                FROM django_admin_log 
                WHERE object_repr LIKE '%ahmed%' OR object_repr LIKE '%Ahmed%'
            """)
            
            log_entries = cursor.fetchall()
            
            if log_entries:
                print(f"Found {len(log_entries)} admin log entries related to ahmed")
                for log_id, object_repr, action_time in log_entries:
                    print(f"  - {log_id}: {object_repr} ({action_time})")
                
                # Delete these entries
                cursor.execute("""
                    DELETE FROM django_admin_log 
                    WHERE object_repr LIKE '%ahmed%' OR object_repr LIKE '%Ahmed%'
                """)
                print("Admin log entries cleared")
            else:
                print("No admin log entries found for ahmed")
        
        return True
        
    except Exception as e:
        print(f"Error clearing admin log: {e}")
        return False

if __name__ == "__main__":
    try:
        print("Complete Ahmed User Deletion")
        print("=" * 30)
        
        # Delete all ahmed users
        success1 = delete_all_ahmed_users()
        
        # Clear admin log
        success2 = clear_admin_log_for_ahmed()
        
        # List remaining users
        list_all_users()
        
        if success1 and success2:
            print("\nSUCCESS!")
            print("All 'ahmed' users have been completely deleted!")
            print("\nNow you can create a new user with username 'ahmed' in Django Admin.")
            print("\nSteps:")
            print("1. Go to: http://localhost:8000/admin/accounts/user/add/")
            print("2. Username: ahmed")
            print("3. Password: Test123!@#")
            print("4. Fill other fields and save")
        else:
            print("\nFAILED!")
            print("Some users might still exist. Check the output above.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
