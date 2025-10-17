#!/usr/bin/env python
"""
Script to analyze duplicate tables and plan migration strategy
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model
from api.models import (
    MainEvent, SubEvent, Nationality, MilitaryPosition,
    Airport, Airline, Delegation, Member, DepartureSession
)

User = get_user_model()

def analyze_table_structure():
    """Analyze the structure of duplicate tables"""
    print("🔍 Analyzing Table Structures...")
    print("=" * 60)
    
    with connection.cursor() as cursor:
        # Get all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%api_%' OR table_name NOT LIKE '%api_%'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        
        print("📋 All Tables in Database:")
        for table in tables:
            print(f"   - {table[0]}")
    
    print("\n" + "=" * 60)

def compare_table_data():
    """Compare data between duplicate tables"""
    print("📊 Comparing Data Between Duplicate Tables...")
    print("=" * 60)
    
    duplicate_pairs = [
        ('users', 'api_user'),
        ('delegations', 'api_delegation'),
        ('nationalities', 'api_nationality'),
        ('main_events', 'api_mainevent'),
        ('sub_events', 'api_subevent'),
        ('members', 'api_member'),
        ('military_positions', 'api_militaryposition'),
        ('airports', 'api_airport'),
        ('airlines', 'api_airline'),
        ('audit_log', 'api_auditlog'),
        ('departure_sessions', 'api_departuresession'),
        ('login_sessions', 'api_loginsession'),
    ]
    
    with connection.cursor() as cursor:
        for main_table, api_table in duplicate_pairs:
            print(f"\n🔍 Comparing {main_table} vs {api_table}:")
            
            try:
                # Count records in main table
                cursor.execute(f"SELECT COUNT(*) FROM {main_table};")
                main_count = cursor.fetchone()[0]
                
                # Count records in API table
                cursor.execute(f"SELECT COUNT(*) FROM {api_table};")
                api_count = cursor.fetchone()[0]
                
                print(f"   📈 {main_table}: {main_count} records")
                print(f"   📈 {api_table}: {api_count} records")
                
                if main_count == 0 and api_count > 0:
                    print(f"   ⚠️  {main_table} is empty, {api_table} has data")
                elif main_count > 0 and api_count == 0:
                    print(f"   ✅ {main_table} has data, {api_table} is empty")
                elif main_count > 0 and api_count > 0:
                    print(f"   ⚠️  Both tables have data - need migration strategy")
                else:
                    print(f"   ℹ️  Both tables are empty")
                    
            except Exception as e:
                print(f"   ❌ Error comparing {main_table} and {api_table}: {e}")

def analyze_table_schemas():
    """Analyze the schema differences between duplicate tables"""
    print("\n🔍 Analyzing Schema Differences...")
    print("=" * 60)
    
    with connection.cursor() as cursor:
        # Compare users vs api_user
        print("\n📋 Users vs API_User Schema:")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position;
        """)
        users_columns = cursor.fetchall()
        
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'api_user' 
            ORDER BY ordinal_position;
        """)
        api_user_columns = cursor.fetchall()
        
        print("   Users table columns:")
        for col in users_columns:
            print(f"     - {col[0]} ({col[1]}) {'NULL' if col[2] == 'YES' else 'NOT NULL'}")
            
        print("   API_User table columns:")
        for col in api_user_columns:
            print(f"     - {col[0]} ({col[1]}) {'NULL' if col[2] == 'YES' else 'NOT NULL'}")

def check_foreign_keys():
    """Check foreign key relationships"""
    print("\n🔗 Checking Foreign Key Relationships...")
    print("=" * 60)
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
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
            AND (tc.table_name LIKE '%api_%' OR tc.table_name NOT LIKE '%api_%')
            ORDER BY tc.table_name, kcu.column_name;
        """)
        
        foreign_keys = cursor.fetchall()
        
        print("📋 Foreign Key Relationships:")
        for fk in foreign_keys:
            print(f"   {fk[0]}.{fk[1]} → {fk[2]}.{fk[3]}")

def generate_migration_plan():
    """Generate a migration plan"""
    print("\n📝 Migration Plan:")
    print("=" * 60)
    
    plan = """
    🎯 MIGRATION STRATEGY:
    
    1. BACKUP DATABASE
       - Create full database backup before any changes
       
    2. DATA MIGRATION PRIORITY:
       - Keep Django ORM tables (api_*) as primary
       - Migrate data from old tables to Django tables
       - Update foreign key references
       
    3. MIGRATION STEPS:
       a) Migrate users data (api_user is primary)
       b) Migrate lookup tables (nationalities, airports, airlines, etc.)
       c) Migrate main entities (main_events, sub_events)
       d) Migrate delegations and related data
       e) Migrate audit logs
       f) Drop old tables
       
    4. VERIFICATION:
       - Test all API endpoints
       - Verify data integrity
       - Test frontend functionality
    """
    
    print(plan)

def check_django_migrations():
    """Check Django migration status"""
    print("\n🔍 Checking Django Migration Status...")
    print("=" * 60)
    
    from django.db import connection
    from django.core.management import call_command
    from io import StringIO
    
    # Check migration status
    out = StringIO()
    call_command('showmigrations', stdout=out)
    migrations_output = out.getvalue()
    
    print("📋 Migration Status:")
    print(migrations_output)

if __name__ == '__main__':
    print("🚀 Starting Database Analysis...")
    print("=" * 60)
    
    analyze_table_structure()
    compare_table_data()
    analyze_table_schemas()
    check_foreign_keys()
    check_django_migrations()
    generate_migration_plan()
    
    print("\n" + "=" * 60)
    print("✅ Database analysis complete!")
    print("\n📝 Next: Review the analysis and proceed with migration plan.")



