#!/usr/bin/env python
"""
Script to fix User model database issues
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection
from django.core.management import execute_from_command_line

def fix_user_tables():
    """Fix user-related database tables"""
    print("Fixing user tables...")
    
    try:
        with connection.cursor() as cursor:
            # Check if users table exists
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            """)
            
            users_table_exists = cursor.fetchone() is not None
            
            if not users_table_exists:
                print("Users table doesn't exist. Creating...")
                # Create users table
                cursor.execute("""
                    CREATE TABLE users (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(100) NOT NULL,
                        role VARCHAR(20) DEFAULT 'USER',
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_by UUID REFERENCES users(id),
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_by UUID REFERENCES users(id),
                        device_info JSONB DEFAULT '{}',
                        last_login TIMESTAMP NULL,
                        date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        is_staff BOOLEAN DEFAULT FALSE,
                        is_superuser BOOLEAN DEFAULT FALSE,
                        email VARCHAR(254) NULL,
                        first_name VARCHAR(30) DEFAULT '',
                        last_name VARCHAR(150) DEFAULT ''
                    )
                """)
                print("Users table created successfully!")
            
            # Create users_groups table if it doesn't exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users_groups'
            """)
            
            users_groups_exists = cursor.fetchone() is not None
            
            if not users_groups_exists:
                print("Creating users_groups table...")
                cursor.execute("""
                    CREATE TABLE users_groups (
                        id SERIAL PRIMARY KEY,
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
                        UNIQUE(user_id, group_id)
                    )
                """)
                print("Users_groups table created successfully!")
            
            # Create users_user_permissions table if it doesn't exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users_user_permissions'
            """)
            
            users_permissions_exists = cursor.fetchone() is not None
            
            if not users_permissions_exists:
                print("Creating users_user_permissions table...")
                cursor.execute("""
                    CREATE TABLE users_user_permissions (
                        id SERIAL PRIMARY KEY,
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
                        UNIQUE(user_id, permission_id)
                    )
                """)
                print("Users_user_permissions table created successfully!")
            
            # Create login_sessions table if it doesn't exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'login_sessions'
            """)
            
            login_sessions_exists = cursor.fetchone() is not None
            
            if not login_sessions_exists:
                print("Creating login_sessions table...")
                cursor.execute("""
                    CREATE TABLE login_sessions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        logout_time TIMESTAMP NULL,
                        device_info JSONB DEFAULT '{}',
                        ip_address INET NULL,
                        user_agent TEXT NULL,
                        is_active BOOLEAN DEFAULT TRUE
                    )
                """)
                print("Login_sessions table created successfully!")
            
            # Create audit_log table if it doesn't exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'audit_log'
            """)
            
            audit_log_exists = cursor.fetchone() is not None
            
            if not audit_log_exists:
                print("Creating audit_log table...")
                cursor.execute("""
                    CREATE TABLE audit_log (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        table_name VARCHAR(50) NOT NULL,
                        record_id UUID NOT NULL,
                        action VARCHAR(20) NOT NULL,
                        old_values JSONB NULL,
                        new_values JSONB NULL,
                        user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        device_info JSONB DEFAULT '{}'
                    )
                """)
                print("Audit_log table created successfully!")
        
        print("All user tables created successfully!")
        return True
        
    except Exception as e:
        print(f"Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_najibe_user():
    """Create najibe user"""
    print("\nCreating najibe user...")
    
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Check if user exists
        if User.objects.filter(username='najibe').exists():
            user = User.objects.get(username='najibe')
            user.is_superuser = True
            user.is_staff = True
            user.is_active = True
            user.save()
            print("User 'najibe' updated successfully!")
        else:
            # Create user
            user = User.objects.create_user(
                username='najibe',
                password='722003',
                full_name='احمد نيجب',
                role='SUPER_ADMIN',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print("User 'najibe' created successfully!")
        
        print(f"User details:")
        print(f"  ID: {user.id}")
        print(f"  Username: {user.username}")
        print(f"  Role: {user.role}")
        print(f"  Is Superuser: {user.is_superuser}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Active: {user.is_active}")
        
        return True
        
    except Exception as e:
        print(f"Error creating user: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        print("User Model Database Fix Tool")
        print("=" * 40)
        
        success1 = fix_user_tables()
        success2 = create_najibe_user()
        
        if success1 and success2:
            print("\nSUCCESS!")
            print("All user tables have been created and user 'najibe' is ready!")
            print("You can now access Django Admin without errors.")
        else:
            print("\nFAILED!")
            sys.exit(1)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)