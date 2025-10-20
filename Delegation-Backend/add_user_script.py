#!/usr/bin/env python
"""
Script to add a new user with proper password validation
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

def add_user():
    """Add a new user with proper validation"""
    print("Adding New User")
    print("=" * 20)
    
    try:
        # User details
        username = "ahmed"
        password = "Ahmed123!@#"  # Strong password
        full_name = "أحمد المستخدم"
        email = "ahmed@example.com"
        role = "USER"  # or "ADMIN" or "SUPER_ADMIN"
        
        print(f"Creating user: {username}")
        print(f"Full Name: {full_name}")
        print(f"Role: {role}")
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"User '{username}' already exists!")
            print("Updating existing user...")
            
            user = User.objects.get(username=username)
            user.set_password(password)
            user.full_name = full_name
            user.email = email
            user.role = role
            user.is_active = True
            user.is_staff = False  # Regular user, not staff
            user.is_superuser = False  # Regular user, not superuser
            
            user.save()
            print("User updated successfully!")
        else:
            # Create new user
            user = User.objects.create_user(
                username=username,
                password=password,
                full_name=full_name,
                email=email,
                role=role,
                is_active=True,
                is_staff=False,  # Regular user
                is_superuser=False  # Regular user
            )
            print("User created successfully!")
        
        # Verify the user
        print("\nVerifying user...")
        if user.check_password(password):
            print("Password verification: SUCCESS")
        else:
            print("Password verification: FAILED")
        
        print(f"\nUser Details:")
        print(f"  ID: {user.id}")
        print(f"  Username: {user.username}")
        print(f"  Full Name: {user.full_name}")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.role}")
        print(f"  Is Active: {user.is_active}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Superuser: {user.is_superuser}")
        
        print("\nSUCCESS!")
        print(f"User '{username}' has been added successfully!")
        print(f"Password: {password}")
        print("\nYou can now login with:")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        
        return True
        
    except ValidationError as e:
        print(f"Validation Error: {e}")
        return False
    except Exception as e:
        print(f"Error creating user: {e}")
        import traceback
        traceback.print_exc()
        return False

def add_multiple_users():
    """Add multiple users with different roles"""
    print("Adding Multiple Users")
    print("=" * 25)
    
    users_to_create = [
        {
            "username": "ahmed",
            "password": "Ahmed123!@#",
            "full_name": "أحمد المستخدم",
            "email": "ahmed@example.com",
            "role": "USER"
        },
        {
            "username": "admin_user",
            "password": "Admin123!@#",
            "full_name": "مدير النظام",
            "email": "admin@example.com",
            "role": "ADMIN"
        },
        {
            "username": "manager",
            "password": "Manager123!@#",
            "full_name": "مدير الوفود",
            "email": "manager@example.com",
            "role": "ADMIN"
        }
    ]
    
    success_count = 0
    
    for user_data in users_to_create:
        try:
            print(f"\nCreating user: {user_data['username']}")
            
            if User.objects.filter(username=user_data['username']).exists():
                print(f"  User '{user_data['username']}' already exists, skipping...")
                continue
            
            user = User.objects.create_user(
                username=user_data['username'],
                password=user_data['password'],
                full_name=user_data['full_name'],
                email=user_data['email'],
                role=user_data['role'],
                is_active=True,
                is_staff=(user_data['role'] == 'ADMIN'),
                is_superuser=False
            )
            
            print(f"  ✅ User '{user_data['username']}' created successfully!")
            success_count += 1
            
        except Exception as e:
            print(f"  ❌ Error creating user '{user_data['username']}': {e}")
    
    print(f"\nTotal users created: {success_count}/{len(users_to_create)}")
    return success_count > 0

if __name__ == "__main__":
    try:
        print("User Management Script")
        print("=" * 30)
        
        # Add single user
        success1 = add_user()
        
        print("\n" + "=" * 50)
        
        # Add multiple users
        success2 = add_multiple_users()
        
        if success1 or success2:
            print("\nSUCCESS!")
            print("Users have been added successfully!")
            print("\nYou can now:")
            print("  1. Login to Django Admin: http://localhost:8000/admin")
            print("  2. Login to Frontend: http://localhost:5173/login")
            print("  3. Use the created users to test the system")
        else:
            print("\nFAILED!")
            print("No users were created successfully.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
