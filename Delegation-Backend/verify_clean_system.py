#!/usr/bin/env python
"""
Verify that the system is clean and ready for user creation
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

def verify_clean_system():
    """Verify that username 'ahmed' is available"""
    print("System Clean Verification")
    print("=" * 25)
    
    try:
        # Check if ahmed user exists
        ahmed_exists = User.objects.filter(username='ahmed').exists()
        
        if ahmed_exists:
            print("ERROR: User 'ahmed' still exists!")
            return False
        else:
            print("SUCCESS: Username 'ahmed' is available!")
        
        # Check database directly
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'ahmed'")
            count = cursor.fetchone()[0]
            
            if count > 0:
                print(f"ERROR: Found {count} ahmed users in database!")
                return False
            else:
                print("SUCCESS: No ahmed users in database!")
        
        # Check admin log
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) FROM django_admin_log 
                WHERE object_repr LIKE '%ahmed%' OR object_repr LIKE '%Ahmed%'
            """)
            log_count = cursor.fetchone()[0]
            
            if log_count > 0:
                print(f"WARNING: Found {log_count} admin log entries for ahmed")
            else:
                print("SUCCESS: No admin log entries for ahmed")
        
        # List all users
        print("\nCurrent users in system:")
        users = User.objects.all()
        for user in users:
            print(f"  - {user.username} ({user.role})")
        
        print(f"\nTotal users: {users.count()}")
        
        return True
        
    except Exception as e:
        print(f"Error verifying system: {e}")
        return False

def test_user_creation():
    """Test creating a user with username 'ahmed'"""
    print("\nTesting User Creation")
    print("=" * 25)
    
    try:
        # Try to create user
        user = User.objects.create_user(
            username='ahmed',
            password='Test123!@#',
            full_name='Ahmed User',
            email='ahmed@example.com',
            role='USER',
            is_active=True,
            is_staff=False,
            is_superuser=False
        )
        
        print("SUCCESS: User 'ahmed' created successfully!")
        print(f"User ID: {user.id}")
        
        # Clean up - delete the test user
        user.delete()
        print("Test user deleted (cleanup)")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Could not create user 'ahmed': {e}")
        return False

if __name__ == "__main__":
    try:
        print("System Verification and Test")
        print("=" * 30)
        
        # Verify system is clean
        clean = verify_clean_system()
        
        if clean:
            # Test user creation
            test_creation = test_user_creation()
            
            if test_creation:
                print("\n" + "=" * 30)
                print("FINAL RESULT: SUCCESS!")
                print("=" * 30)
                print("The system is clean and ready!")
                print("You can now create a user with username 'ahmed' in Django Admin.")
                print("\nSteps:")
                print("1. Go to: http://localhost:8000/admin")
                print("2. Login with: najibe / 722003")
                print("3. Go to: Accounts > Users > Add user")
                print("4. Username: ahmed")
                print("5. Password: Test123!@#")
                print("6. Save the user")
            else:
                print("\nERROR: User creation test failed!")
        else:
            print("\nERROR: System is not clean!")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
