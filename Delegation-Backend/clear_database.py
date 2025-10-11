#!/usr/bin/env python
"""
Script to clear all data from the database
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

def clear_database():
    """Clear all data from the database"""
    print("🗑️  Starting database cleanup...")
    
    with connection.cursor() as cursor:
        # Get all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE 'django_%'
            AND table_name != 'auth_group'
            AND table_name != 'auth_group_permissions'
            AND table_name != 'auth_permission'
            AND table_name != 'django_content_type'
            AND table_name != 'django_migrations'
        """)
        
        tables = cursor.fetchall()
        
        # Disable foreign key checks temporarily
        cursor.execute("SET session_replication_role = replica;")
        
        # Clear all tables
        for table in tables:
            table_name = table[0]
            print(f"   Clearing table: {table_name}")
            cursor.execute(f'DELETE FROM "{table_name}";')
        
        # Re-enable foreign key checks
        cursor.execute("SET session_replication_role = DEFAULT;")
        
        # Reset sequences
        cursor.execute("""
            SELECT setval(pg_get_serial_sequence('api_user_user_permissions', 'id'), 1, false);
        """)
        
        cursor.execute("""
            SELECT setval(pg_get_serial_sequence('api_user_groups', 'id'), 1, false);
        """)
        
        cursor.execute("""
            SELECT setval(pg_get_serial_sequence('django_admin_log', 'id'), 1, false);
        """)
        
        cursor.execute("""
            SELECT setval(pg_get_serial_sequence('django_content_type', 'id'), 1, false);
        """)
        
        cursor.execute("""
            SELECT setval(pg_get_serial_sequence('django_migrations', 'id'), 1, false);
        """)
        
        cursor.execute("""
            SELECT setval(pg_get_serial_sequence('auth_group', 'id'), 1, false);
        """)
        
        cursor.execute("""
            SELECT setval(pg_get_serial_sequence('auth_group_permissions', 'id'), 1, false);
        """)
        
        cursor.execute("""
            SELECT setval(pg_get_serial_sequence('auth_permission', 'id'), 1, false);
        """)
    
    print("✅ Database cleared successfully!")
    print("📊 All tables have been emptied and sequences reset.")

def create_default_admin():
    """Create default admin user"""
    print("\n👤 Creating default admin user...")
    
    try:
        # Create main admin user (najibe)
        if not User.objects.filter(username='najibe').exists():
            admin_user = User.objects.create_user(
                username='najibe',
                password='722003',
                full_name='احمد نيجب',
                role='SUPER_ADMIN',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print("✅ Main admin user created successfully!")
            print("   Username: najibe")
            print("   Password: 722003")
            print("   Full Name: احمد نيجب")
            print("   Role: SUPER_ADMIN")
        else:
            print("   Main admin user (najibe) already exists, skipping...")
        
        # Create secondary admin user (admin)
        if not User.objects.filter(username='admin').exists():
            admin_user2 = User.objects.create_user(
                username='admin',
                password='admin123',
                full_name='مدير النظام',
                role='SUPER_ADMIN',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print("✅ Secondary admin user created successfully!")
            print("   Username: admin")
            print("   Password: admin123")
            print("   Full Name: مدير النظام")
            print("   Role: SUPER_ADMIN")
        else:
            print("   Secondary admin user (admin) already exists, skipping...")
        
    except Exception as e:
        print(f"❌ Error creating admin users: {e}")

if __name__ == "__main__":
    try:
        clear_database()
        create_default_admin()
        print("\n🎉 Database setup completed successfully!")
        print("\n📝 Next steps:")
        print("   1. Run: python manage.py migrate")
        print("   2. Start the server: python manage.py runserver")
        print("   3. Access admin panel: http://localhost:8000/admin")
        print("   4. Login with either:")
        print("      - najibe / 722003 (احمد نيجب)")
        print("      - admin / admin123 (مدير النظام)")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
