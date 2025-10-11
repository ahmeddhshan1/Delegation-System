#!/usr/bin/env python
"""
Check user creation issue in Django Admin
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

def check_existing_users():
    """Check existing users with username 'ahmed'"""
    print("Checking existing users with username 'ahmed'...")
    
    try:
        # Check Django ORM
        users = User.objects.filter(username='ahmed')
        print(f"Found {users.count()} users with username 'ahmed' via Django ORM:")
        
        for user in users:
            print(f"  - ID: {user.id}")
            print(f"    Username: {user.username}")
            print(f"    Full Name: {user.full_name}")
            print(f"    Email: {user.email}")
            print(f"    Role: {user.role}")
            print(f"    Is Active: {user.is_active}")
        
        # Check database directly
        print("\nChecking database directly...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, username, full_name, email, role, is_active FROM users WHERE username = 'ahmed'")
            db_users = cursor.fetchall()
            
            print(f"Found {len(db_users)} users with username 'ahmed' in database:")
            for user_row in db_users:
                user_id, username, full_name, email, role, is_active = user_row
                print(f"  - ID: {user_id}")
                print(f"    Username: {username}")
                print(f"    Full Name: {full_name}")
                print(f"    Email: {email}")
                print(f"    Role: {role}")
                print(f"    Is Active: {is_active}")
        
        return len(users) > 0
        
    except Exception as e:
        print(f"Error checking users: {e}")
        return False

def delete_duplicate_users():
    """Delete duplicate users with username 'ahmed'"""
    print("\nDeleting duplicate users with username 'ahmed'...")
    
    try:
        users = User.objects.filter(username='ahmed')
        count = users.count()
        
        if count > 1:
            print(f"Found {count} users with username 'ahmed'")
            print("Keeping the first one, deleting the rest...")
            
            # Keep the first user, delete the rest
            users_to_delete = users[1:]
            deleted_count = 0
            
            for user in users_to_delete:
                print(f"Deleting user: {user.id}")
                user.delete()
                deleted_count += 1
            
            print(f"Deleted {deleted_count} duplicate users")
            return True
        else:
            print("No duplicate users found")
            return True
            
    except Exception as e:
        print(f"Error deleting duplicate users: {e}")
        return False

def create_unique_user():
    """Create a unique user with a different username"""
    print("\nCreating a new unique user...")
    
    try:
        # Try different usernames
        usernames_to_try = ['ahmed_user', 'ahmed_new', 'ahmed_test', 'user_ahmed']
        
        for username in usernames_to_try:
            if not User.objects.filter(username=username).exists():
                print(f"Creating user with username: {username}")
                
                user = User.objects.create_user(
                    username=username,
                    password='Test123!@#',
                    full_name='Ahmed Test User',
                    email=f'{username}@example.com',
                    role='USER',
                    is_active=True,
                    is_staff=False,
                    is_superuser=False
                )
                
                print(f"User created successfully!")
                print(f"  Username: {username}")
                print(f"  Password: Test123!@#")
                print(f"  ID: {user.id}")
                
                return True
        
        print("All suggested usernames are already taken!")
        return False
        
    except Exception as e:
        print(f"Error creating user: {e}")
        return False

def check_user_model_constraints():
    """Check if there are any unique constraints causing issues"""
    print("\nChecking user model constraints...")
    
    try:
        with connection.cursor() as cursor:
            # Check unique constraints on users table
            cursor.execute("""
                SELECT 
                    tc.constraint_name,
                    tc.constraint_type,
                    kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_name = 'users'
                AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
                ORDER BY tc.constraint_type, kcu.column_name
            """)
            
            constraints = cursor.fetchall()
            
            print("Unique constraints on users table:")
            for constraint_name, constraint_type, column_name in constraints:
                print(f"  - {constraint_type}: {column_name} (constraint: {constraint_name})")
        
        return True
        
    except Exception as e:
        print(f"Error checking constraints: {e}")
        return False

def fix_user_creation_issue():
    """Main function to fix user creation issue"""
    print("Django Admin User Creation Issue Fix")
    print("=" * 40)
    
    # Step 1: Check existing users
    has_duplicates = check_existing_users()
    
    # Step 2: Check constraints
    check_user_model_constraints()
    
    # Step 3: Delete duplicates if found
    if has_duplicates:
        delete_duplicate_users()
    
    # Step 4: Create a test user
    create_unique_user()
    
    print("\n" + "=" * 40)
    print("SOLUTION:")
    print("=" * 40)
    print("The issue is likely that a user with username 'ahmed' already exists.")
    print("\nTo add a new user in Django Admin:")
    print("1. Use a different username (e.g., 'ahmed_user', 'ahmed_new')")
    print("2. Or delete the existing user first")
    print("3. Or modify the existing user instead of creating a new one")
    print("\nAvailable usernames to try:")
    print("  - ahmed_user")
    print("  - ahmed_new") 
    print("  - ahmed_test")
    print("  - user_ahmed")

if __name__ == "__main__":
    try:
        fix_user_creation_issue()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
