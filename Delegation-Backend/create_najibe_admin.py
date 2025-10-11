#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Create SUPER_ADMIN user 'najibe' for the Delegation System
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_najibe_admin():
    """Create SUPER_ADMIN user 'najibe'"""
    
    print("Creating SUPER_ADMIN user 'najibe'...")
    
    # Check if user already exists
    if User.objects.filter(username='najibe').exists():
        print("User 'najibe' already exists!")
        user = User.objects.get(username='najibe')
        
        # Update to SUPER_ADMIN if not already
        if user.role != 'SUPER_ADMIN':
            user.role = 'SUPER_ADMIN'
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print("Updated user 'najibe' to SUPER_ADMIN")
        else:
            print("User 'najibe' is already SUPER_ADMIN")
            
        # Update password
        user.set_password('722003')
        user.save()
        print("Password updated for user 'najibe'")
        
    else:
        # Create new user
        user = User.objects.create_user(
            username='najibe',
            password='722003',
            full_name='Najibe Admin',
            email='najibe@admin.com',
            role='SUPER_ADMIN',
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        print("Created new SUPER_ADMIN user 'najibe'")
    
    print("\nUser Details:")
    print(f"Username: {user.username}")
    print(f"Full Name: {user.full_name}")
    print(f"Role: {user.role}")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"Is Active: {user.is_active}")
    
    print("\nAccess URLs:")
    print("Django Admin: http://localhost:8000/admin/")
    print("Frontend App: http://localhost:5173/")
    
    print("\nLogin Credentials:")
    print("Username: najibe")
    print("Password: 722003")
    
    print("\nSUPER_ADMIN Permissions:")
    print("✅ Full access to all database data")
    print("✅ Add/Edit/Delete any data")
    print("✅ Manage users and roles")
    print("✅ View audit logs")
    print("✅ Full Django Admin access")
    print("✅ Manage all tables and models")
    
    return user

if __name__ == '__main__':
    try:
        create_najibe_admin()
        print("\n✅ SUCCESS: SUPER_ADMIN user 'najibe' is ready!")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        sys.exit(1)
