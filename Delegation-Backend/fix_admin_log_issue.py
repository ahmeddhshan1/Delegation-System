#!/usr/bin/env python
"""
Script to fix Django Admin Log foreign key issue
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

def fix_admin_log_foreign_key():
    """Fix Django Admin Log foreign key constraint"""
    print("Fixing Django Admin Log foreign key issue...")
    
    try:
        with connection.cursor() as cursor:
            # Check if django_admin_log table exists
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'django_admin_log'
            """)
            
            admin_log_exists = cursor.fetchone() is not None
            
            if admin_log_exists:
                print("Django Admin Log table exists")
                
                # Check foreign key constraints
                cursor.execute("""
                    SELECT 
                        tc.constraint_name, 
                        tc.table_name, 
                        kcu.column_name, 
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name 
                    FROM 
                        information_schema.table_constraints AS tc 
                        JOIN information_schema.key_column_usage AS kcu
                          ON tc.constraint_name = kcu.constraint_name
                          AND tc.table_schema = kcu.table_schema
                        JOIN information_schema.constraint_column_usage AS ccu
                          ON ccu.constraint_name = tc.constraint_name
                          AND ccu.table_schema = tc.table_schema
                    WHERE tc.constraint_type = 'FOREIGN KEY' 
                    AND tc.table_name='django_admin_log'
                """)
                
                constraints = cursor.fetchall()
                print(f"Found {len(constraints)} foreign key constraints on django_admin_log")
                
                for constraint in constraints:
                    constraint_name, table_name, column_name, foreign_table, foreign_column = constraint
                    print(f"  Constraint: {constraint_name}")
                    print(f"    Table: {table_name}.{column_name}")
                    print(f"    References: {foreign_table}.{foreign_column}")
                    
                    # If it references api_user but we use users table, fix it
                    if foreign_table == 'api_user':
                        print(f"    FIXING: Changing reference from api_user to users")
                        
                        # Drop the existing constraint
                        cursor.execute(f"ALTER TABLE django_admin_log DROP CONSTRAINT {constraint_name}")
                        print(f"    Dropped constraint: {constraint_name}")
                        
                        # Add new constraint referencing users table
                        new_constraint_name = f"django_admin_log_user_id_fk_users"
                        cursor.execute(f"""
                            ALTER TABLE django_admin_log 
                            ADD CONSTRAINT {new_constraint_name}
                            FOREIGN KEY (user_id) REFERENCES users(id) 
                            ON DELETE SET NULL
                        """)
                        print(f"    Added new constraint: {new_constraint_name}")
            else:
                print("Django Admin Log table does not exist, creating...")
                
                # Create django_admin_log table
                cursor.execute("""
                    CREATE TABLE django_admin_log (
                        id SERIAL PRIMARY KEY,
                        action_time TIMESTAMP WITH TIME ZONE NOT NULL,
                        object_id TEXT,
                        object_repr VARCHAR(200) NOT NULL,
                        action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
                        change_message TEXT NOT NULL,
                        content_type_id INTEGER REFERENCES django_content_type(id),
                        user_id UUID REFERENCES users(id) ON DELETE SET NULL
                    )
                """)
                print("Created django_admin_log table with correct foreign key")
        
        print("Foreign key issue fixed successfully!")
        return True
        
    except Exception as e:
        print(f"Error fixing foreign key: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_user_exists():
    """Verify that the user exists in the correct table"""
    print("\nVerifying user exists...")
    
    try:
        with connection.cmd as cursor:
            # Check if user exists in users table
            cursor.execute("SELECT id, username, full_name FROM users WHERE username = 'najibe'")
            user = cursor.fetchone()
            
            if user:
                user_id, username, full_name = user
                print(f"User found in users table:")
                print(f"  ID: {user_id}")
                print(f"  Username: {username}")
                print(f"  Full Name: {full_name}")
                return True
            else:
                print("User not found in users table!")
                return False
                
    except Exception as e:
        print(f"Error verifying user: {e}")
        return False

def clear_admin_log():
    """Clear admin log to remove problematic entries"""
    print("\nClearing Django Admin Log...")
    
    try:
        with connection.cursor() as cursor:
            # Clear all admin log entries
            cursor.execute("DELETE FROM django_admin_log")
            print("Cleared all Django Admin Log entries")
            
            # Reset sequence
            cursor.execute("SELECT setval('django_admin_log_id_seq', 1, false)")
            print("Reset Django Admin Log sequence")
        
        return True
        
    except Exception as e:
        print(f"Error clearing admin log: {e}")
        return False

if __name__ == "__main__":
    try:
        print("Django Admin Log Fix Tool")
        print("=" * 40)
        
        success1 = fix_admin_log_foreign_key()
        success2 = verify_user_exists()
        success3 = clear_admin_log()
        
        if success1 and success2 and success3:
            print("\nSUCCESS!")
            print("Django Admin Log issue has been fixed!")
            print("You can now use Django Admin without foreign key errors.")
            print("\nAccess Django Admin at: http://localhost:8000/admin")
            print("Login with: najibe / 722003")
        else:
            print("\nFAILED!")
            sys.exit(1)
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
