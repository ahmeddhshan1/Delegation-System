#!/usr/bin/env python
"""
List all users in the system
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

def list_all_users():
    """List all users in the system"""
    print("All Users in System")
    print("=" * 25)
    
    try:
        # Django ORM
        users = User.objects.all()
        print(f"Total users via Django ORM: {users.count()}")
        
        for user in users:
            print(f"\nUser ID: {user.id}")
            print(f"  Username: {user.username}")
            print(f"  Full Name: {user.full_name}")
            print(f"  Email: {user.email}")
            print(f"  Role: {user.role}")
            print(f"  Is Active: {user.is_active}")
            print(f"  Is Staff: {user.is_staff}")
            print(f"  Is Superuser: {user.is_superuser}")
            print(f"  Date Joined: {user.date_joined}")
        
        # Database direct query
        print("\n" + "=" * 50)
        print("Database Direct Query")
        print("=" * 50)
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, username, full_name, email, role, is_active, is_staff, is_superuser, date_joined
                FROM users 
                ORDER BY date_joined
            """)
            
            db_users = cursor.fetchall()
            print(f"Total users in database: {len(db_users)}")
            
            for user_row in db_users:
                user_id, username, full_name, email, role, is_active, is_staff, is_superuser, date_joined = user_row
                print(f"\nUser ID: {user_id}")
                print(f"  Username: {username}")
                print(f"  Full Name: {full_name}")
                print(f"  Email: {email}")
                print(f"  Role: {role}")
                print(f"  Is Active: {is_active}")
                print(f"  Is Staff: {is_staff}")
                print(f"  Is Superuser: {is_superuser}")
                print(f"  Date Joined: {date_joined}")
        
        return True
        
    except Exception as e:
        print(f"Error listing users: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_username_availability():
    """Check if specific usernames are available"""
    print("\n" + "=" * 50)
    print("Username Availability Check")
    print("=" * 50)
    
    usernames_to_check = ['ahmed', 'ahmed_user', 'ahmed_new', 'test_user', 'user123']
    
    for username in usernames_to_check:
        exists = User.objects.filter(username=username).exists()
        status = "EXISTS" if exists else "AVAILABLE"
        print(f"  {username}: {status}")

if __name__ == "__main__":
    try:
        list_all_users()
        check_username_availability()
        
        print("\n" + "=" * 50)
        print("SOLUTION FOR DJANGO ADMIN")
        print("=" * 50)
        print("To add a new user in Django Admin:")
        print("1. Go to: http://localhost:8000/admin/accounts/user/add/")
        print("2. Use a username that doesn't already exist")
        print("3. Make sure to use a strong password")
        print("4. Set the appropriate role and permissions")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
