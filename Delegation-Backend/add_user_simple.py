#!/usr/bin/env python
"""
Simple script to add a new user
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def add_user():
    """Add a new user"""
    print("Adding New User")
    print("=" * 20)
    
    try:
        # User details
        username = "ahmed"
        password = "Ahmed123!@#"  # Strong password
        full_name = "Ahmed User"
        email = "ahmed@example.com"
        role = "USER"
        
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
            user.is_staff = False
            user.is_superuser = False
            
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
                is_staff=False,
                is_superuser=False
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
        
    except Exception as e:
        print(f"Error creating user: {e}")
        return False

def list_all_users():
    """List all users in the system"""
    print("\nAll Users in System:")
    print("=" * 25)
    
    try:
        users = User.objects.all()
        for user in users:
            print(f"  - {user.username} ({user.full_name}) - Role: {user.role}")
        
        print(f"\nTotal users: {users.count()}")
        
    except Exception as e:
        print(f"Error listing users: {e}")

if __name__ == "__main__":
    try:
        print("User Management Script")
        print("=" * 30)
        
        # Add user
        success = add_user()
        
        # List all users
        list_all_users()
        
        if success:
            print("\nSUCCESS!")
            print("User has been added successfully!")
            print("\nYou can now:")
            print("  1. Login to Django Admin: http://localhost:8000/admin")
            print("  2. Login to Frontend: http://localhost:5173/login")
            print("  3. Use the created user to test the system")
        else:
            print("\nFAILED!")
            print("User was not created successfully.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
