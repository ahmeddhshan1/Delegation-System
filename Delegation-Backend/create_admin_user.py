#!/usr/bin/env python
"""
Create admin user with proper permissions
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin_user():
    """Create admin user"""
    print("Creating Admin User")
    print("=" * 25)
    
    try:
        # Admin user details
        username = "admin_user"
        password = "Admin123!@#"
        full_name = "Admin User"
        email = "admin@example.com"
        role = "ADMIN"
        
        print(f"Creating admin user: {username}")
        print(f"Full Name: {full_name}")
        print(f"Role: {role}")
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"Admin user '{username}' already exists!")
            print("Updating existing admin user...")
            
            user = User.objects.get(username=username)
            user.set_password(password)
            user.full_name = full_name
            user.email = email
            user.role = role
            user.is_active = True
            user.is_staff = True  # Admin users are staff
            user.is_superuser = False
            
            user.save()
            print("Admin user updated successfully!")
        else:
            # Create new admin user
            user = User.objects.create_user(
                username=username,
                password=password,
                full_name=full_name,
                email=email,
                role=role,
                is_active=True,
                is_staff=True,  # Admin users are staff
                is_superuser=False
            )
            print("Admin user created successfully!")
        
        # Verify the user
        print("\nVerifying admin user...")
        if user.check_password(password):
            print("Password verification: SUCCESS")
        else:
            print("Password verification: FAILED")
        
        print(f"\nAdmin User Details:")
        print(f"  ID: {user.id}")
        print(f"  Username: {user.username}")
        print(f"  Full Name: {user.full_name}")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.role}")
        print(f"  Is Active: {user.is_active}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Superuser: {user.is_superuser}")
        
        print("\nSUCCESS!")
        print(f"Admin user '{username}' has been created successfully!")
        print(f"Password: {password}")
        print("\nAdmin user can:")
        print("  - Access Django Admin")
        print("  - Manage users and data")
        print("  - Login to frontend")
        
        return True
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        return False

def list_all_users():
    """List all users"""
    print("\nAll Users in System:")
    print("=" * 25)
    
    try:
        users = User.objects.all()
        for user in users:
            staff_status = "STAFF" if user.is_staff else "USER"
            super_status = "SUPER" if user.is_superuser else "REGULAR"
            print(f"  - {user.username} ({user.full_name}) - {user.role} - {staff_status} - {super_status}")
        
        print(f"\nTotal users: {users.count()}")
        
    except Exception as e:
        print(f"Error listing users: {e}")

if __name__ == "__main__":
    try:
        print("Admin User Creation Script")
        print("=" * 35)
        
        # Create admin user
        success = create_admin_user()
        
        # List all users
        list_all_users()
        
        if success:
            print("\nSUCCESS!")
            print("Admin user has been created successfully!")
            print("\nLogin credentials:")
            print("  Username: admin_user")
            print("  Password: Admin123!@#")
            print("\nThis admin user can access Django Admin and manage the system.")
        else:
            print("\nFAILED!")
            print("Admin user was not created successfully.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
