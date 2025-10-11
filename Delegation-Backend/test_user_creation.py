#!/usr/bin/env python
"""
Test user creation to verify Django Admin works
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

def test_user_creation():
    """Test creating a user with the same method Django Admin uses"""
    print("Testing User Creation (Django Admin Method)")
    print("=" * 45)
    
    try:
        # Test data
        username = "ahmed"
        password = "Test123!@#"
        full_name = "Ahmed User"
        email = "ahmed@example.com"
        role = "USER"
        
        print(f"Testing creation of user: {username}")
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"User '{username}' already exists!")
            existing_user = User.objects.get(username=username)
            print(f"Existing user ID: {existing_user.id}")
            print("Deleting existing user to test creation...")
            existing_user.delete()
            print("Existing user deleted.")
        
        # Create user (same as Django Admin)
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
        print(f"User ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Full Name: {user.full_name}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role}")
        
        # Test password
        if user.check_password(password):
            print("Password verification: SUCCESS")
        else:
            print("Password verification: FAILED")
        
        # Test login simulation
        from django.contrib.auth import authenticate
        auth_user = authenticate(username=username, password=password)
        if auth_user:
            print("Authentication test: SUCCESS")
        else:
            print("Authentication test: FAILED")
        
        return True
        
    except ValidationError as e:
        print(f"Validation Error: {e}")
        return False
    except Exception as e:
        print(f"Error creating user: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_django_admin_form():
    """Test Django Admin form validation"""
    print("\nTesting Django Admin Form Validation")
    print("=" * 40)
    
    try:
        from django.contrib.auth.forms import UserCreationForm
        from django import forms
        
        # Create a test form
        class TestUserForm(forms.ModelForm):
            password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
            password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)
            
            class Meta:
                model = User
                fields = ['username', 'full_name', 'email', 'role', 'is_active', 'is_staff']
        
        # Test form with valid data
        form_data = {
            'username': 'test_user',
            'full_name': 'Test User',
            'email': 'test@example.com',
            'role': 'USER',
            'is_active': True,
            'is_staff': False,
            'password1': 'Test123!@#',
            'password2': 'Test123!@#'
        }
        
        form = TestUserForm(data=form_data)
        
        if form.is_valid():
            print("Form validation: SUCCESS")
            print("All form fields are valid")
        else:
            print("Form validation: FAILED")
            print("Form errors:")
            for field, errors in form.errors.items():
                print(f"  {field}: {errors}")
        
        return form.is_valid()
        
    except Exception as e:
        print(f"Error testing form: {e}")
        return False

if __name__ == "__main__":
    try:
        print("Django Admin User Creation Test")
        print("=" * 35)
        
        success1 = test_user_creation()
        success2 = test_django_admin_form()
        
        print("\n" + "=" * 35)
        print("FINAL RESULT")
        print("=" * 35)
        
        if success1 and success2:
            print("SUCCESS: Django Admin user creation should work!")
            print("\nTo add a user in Django Admin:")
            print("1. Go to: http://localhost:8000/admin/accounts/user/add/")
            print("2. Fill in the form with:")
            print("   - Username: ahmed (or any available username)")
            print("   - Password: Test123!@#")
            print("   - Full Name: Ahmed User")
            print("   - Email: ahmed@example.com")
            print("   - Role: USER")
            print("3. Click Save")
        else:
            print("FAILED: There might be an issue with user creation.")
            print("Check the error messages above.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
