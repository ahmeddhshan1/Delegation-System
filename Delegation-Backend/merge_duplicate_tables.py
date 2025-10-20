#!/usr/bin/env python
"""
Script to merge duplicate tables and unify database structure
"""
import os
import sys
import django
from datetime import datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODEL', 'delegation_system.settings')
django.setup()

from django.db import connection, transaction
from django.contrib.auth import get_user_model
from api.models import (
    MainEvent, SubEvent, Nationality, MilitaryPosition,
    Airport, Airline, Delegation, Member, DepartureSession
)
from accounts.models import LoginSession, AuditLog

User = get_user_model()

class DatabaseMerger:
    def __init__(self):
        self.backup_file = f"backup_before_merge_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        self.migration_log = []
    
    def log_action(self, action):
        """Log migration actions"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {action}"
        self.migration_log.append(log_entry)
        print(log_entry)
    
    def create_backup(self):
        """Create database backup before migration"""
        self.log_action("🔄 Creating database backup...")
        
        try:
            import subprocess
            result = subprocess.run([
                'pg_dump', 
                '-h', 'localhost',
                '-U', 'postgres',
                '-d', 'delegation_system',
                '-f', self.backup_file,
                '--verbose'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_action(f"✅ Backup created: {self.backup_file}")
                return True
            else:
                self.log_action(f"❌ Backup failed: {result.stderr}")
                return False
                
        except Exception as e:
            self.log_action(f"❌ Backup error: {e}")
            return False
    
    def migrate_users_data(self):
        """Migrate users data from old table to Django User model"""
        self.log_action("🔄 Migrating users data...")
        
        with connection.cursor() as cursor:
            # Check if old users table has data
            cursor.execute("SELECT COUNT(*) FROM users;")
            old_users_count = cursor.fetchone()[0]
            
            # Check if api_user table has data
            cursor.execute("SELECT COUNT(*) FROM api_user;")
            api_users_count = cursor.fetchone()[0]
            
            self.log_action(f"   Old users table: {old_users_count} records")
            self.log_action(f"   API users table: {api_users_count} records")
            
            if old_users_count > 0 and api_users_count == 0:
                # Migrate from old users table to Django User model
                cursor.execute("""
                    INSERT INTO api_user (
                        id, username, password_hash, full_name, role, is_active,
                        created_at, created_by_id, updated_at, updated_by_id,
                        device_info, last_login, date_joined, is_staff, 
                        is_superuser, email, first_name, last_name
                    )
                    SELECT 
                        id, username, password_hash, full_name, role, is_active,
                        created_at, created_by, updated_at, updated_by,
                        device_info, NULL, created_at, 
                        CASE WHEN role = 'SUPER_ADMIN' THEN true ELSE false END,
                        CASE WHEN role = 'SUPER_ADMIN' THEN true ELSE false END,
                        username || '@example.com', 
                        split_part(full_name, ' ', 1),
                        CASE 
                            WHEN position(' ' in full_name) > 0 
                            THEN substring(full_name from position(' ' in full_name) + 1)
                            ELSE ''
                        END
                    FROM users
                    WHERE NOT EXISTS (
                        SELECT 1 FROM api_user WHERE api_user.id = users.id
                    );
                """)
                
                migrated_count = cursor.rowcount
                self.log_action(f"   ✅ Migrated {migrated_count} users")
                
            elif api_users_count > 0:
                self.log_action("   ✅ API users table already has data, skipping migration")
            else:
                self.log_action("   ℹ️  No users data to migrate")
    
    def migrate_lookup_tables(self):
        """Migrate lookup tables (nationalities, airports, airlines, etc.)"""
        self.log_action("🔄 Migrating lookup tables...")
        
        lookup_tables = [
            ('nationalities', 'api_nationality'),
            ('airports', 'api_airport'),
            ('airlines', 'api_airline'),
            ('military_positions', 'api_militaryposition'),
        ]
        
        for old_table, new_table in lookup_tables:
            self.log_action(f"   Migrating {old_table} → {new_table}")
            
            with connection.cursor() as cursor:
                # Check data counts
                cursor.execute(f"SELECT COUNT(*) FROM {old_table};")
                old_count = cursor.fetchone()[0]
                
                cursor.execute(f"SELECT COUNT(*) FROM {new_table};")
                new_count = cursor.fetchone()[0]
                
                if old_count > 0 and new_count == 0:
                    # Get column names for both tables
                    cursor.execute(f"""
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = '{old_table}' 
                        AND column_name != 'id'
                        ORDER BY ordinal_position;
                    """)
                    old_columns = [row[0] for row in cursor.fetchall()]
                    
                    cursor.execute(f"""
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = '{new_table}' 
                        AND column_name != 'id'
                        ORDER BY ordinal_position;
                    """)
                    new_columns = [row[0] for row in cursor.fetchall()]
                    
                    # Create migration query
                    column_mapping = dict(zip(old_columns, new_columns))
                    columns_str = ', '.join([f'"{col}"' for col in ['id'] + list(column_mapping.keys())])
                    values_str = ', '.join(['id'] + list(column_mapping.values()))
                    
                    query = f"""
                        INSERT INTO {new_table} ({values_str})
                        SELECT {columns_str}
                        FROM {old_table}
                        WHERE NOT EXISTS (
                            SELECT 1 FROM {new_table} WHERE {new_table}.id = {old_table}.id
                        );
                    """
                    
                    cursor.execute(query)
                    migrated_count = cursor.rowcount
                    self.log_action(f"     ✅ Migrated {migrated_count} records")
                else:
                    self.log_action(f"     ℹ️  No migration needed")
    
    def migrate_main_entities(self):
        """Migrate main entities (events, delegations, etc.)"""
        self.log_action("🔄 Migrating main entities...")
        
        entity_tables = [
            ('main_events', 'api_mainevent'),
            ('sub_events', 'api_subevent'),
            ('delegations', 'api_delegation'),
            ('members', 'api_member'),
            ('departure_sessions', 'api_departuresession'),
        ]
        
        for old_table, new_table in entity_tables:
            self.log_action(f"   Migrating {old_table} → {new_table}")
            
            with connection.cursor() as cursor:
                # Check data counts
                cursor.execute(f"SELECT COUNT(*) FROM {old_table};")
                old_count = cursor.fetchone()[0]
                
                cursor.execute(f"SELECT COUNT(*) FROM {new_table};")
                new_count = cursor.fetchone()[0]
                
                if old_count > 0 and new_count == 0:
                    # Get column mapping
                    cursor.execute(f"""
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = '{old_table}' 
                        ORDER BY ordinal_position;
                    """)
                    old_columns = [row[0] for row in cursor.fetchall()]
                    
                    cursor.execute(f"""
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = '{new_table}' 
                        ORDER BY ordinal_position;
                    """)
                    new_columns = [row[0] for row in cursor.fetchall()]
                    
                    # Simple migration for now - copy all columns
                    columns_str = ', '.join([f'"{col}"' for col in old_columns])
                    values_str = ', '.join(old_columns)
                    
                    query = f"""
                        INSERT INTO {new_table} ({columns_str})
                        SELECT {values_str}
                        FROM {old_table}
                        WHERE NOT EXISTS (
                            SELECT 1 FROM {new_table} WHERE {new_table}.id = {old_table}.id
                        );
                    """
                    
                    cursor.execute(query)
                    migrated_count = cursor.rowcount
                    self.log_action(f"     ✅ Migrated {migrated_count} records")
                else:
                    self.log_action(f"     ℹ️  No migration needed")
    
    def migrate_audit_logs(self):
        """Migrate audit logs"""
        self.log_action("🔄 Migrating audit logs...")
        
        with connection.cursor() as cursor:
            # Check data counts
            cursor.execute("SELECT COUNT(*) FROM audit_log;")
            old_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM api_auditlog;")
            new_count = cursor.fetchone()[0]
            
            if old_count > 0 and new_count == 0:
                query = """
                    INSERT INTO api_auditlog (
                        id, table_name, record_id, action, old_values, new_values,
                        timestamp, device_info, user_id
                    )
                    SELECT 
                        id, table_name, record_id, action, old_values, new_values,
                        timestamp, device_info, user_id
                    FROM audit_log
                    WHERE NOT EXISTS (
                        SELECT 1 FROM api_auditlog WHERE api_auditlog.id = audit_log.id
                    );
                """
                
                cursor.execute(query)
                migrated_count = cursor.rowcount
                self.log_action(f"   ✅ Migrated {migrated_count} audit log records")
            else:
                self.log_action("   ℹ️  No audit log migration needed")
    
    def update_foreign_keys(self):
        """Update foreign key references"""
        self.log_action("🔄 Updating foreign key references...")
        
        # This will be handled by Django migrations
        self.log_action("   ℹ️  Foreign key updates will be handled by Django migrations")
    
    def drop_old_tables(self):
        """Drop old tables after successful migration"""
        self.log_action("🔄 Dropping old tables...")
        
        old_tables = [
            'users', 'delegations', 'nationalities', 'main_events', 
            'sub_events', 'members', 'military_positions', 
            'airports', 'airlines', 'audit_log', 
            'departure_sessions', 'login_sessions'
        ]
        
        with connection.cursor() as cursor:
            for table in old_tables:
                try:
                    cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
                    self.log_action(f"   ✅ Dropped table: {table}")
                except Exception as e:
                    self.log_action(f"   ❌ Error dropping {table}: {e}")
    
    def verify_migration(self):
        """Verify migration success"""
        self.log_action("🔍 Verifying migration...")
        
        with connection.cursor() as cursor:
            # Check Django tables have data
            django_tables = [
                'api_user', 'api_nationality', 'api_airport', 'api_airline',
                'api_militaryposition', 'api_mainevent', 'api_subevent',
                'api_delegation', 'api_member', 'api_departuresession',
                'api_auditlog', 'api_loginsession'
            ]
            
            for table in django_tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table};")
                count = cursor.fetchone()[0]
                self.log_action(f"   📊 {table}: {count} records")
    
    def run_migration(self):
        """Run the complete migration process"""
        self.log_action("🚀 Starting database unification migration...")
        
        try:
            # Step 1: Create backup
            if not self.create_backup():
                self.log_action("❌ Backup failed, aborting migration")
                return False
            
            # Step 2: Migrate data
            self.migrate_users_data()
            self.migrate_lookup_tables()
            self.migrate_main_entities()
            self.migrate_audit_logs()
            
            # Step 3: Update foreign keys (handled by Django)
            self.update_foreign_keys()
            
            # Step 4: Verify migration
            self.verify_migration()
            
            # Step 5: Drop old tables (optional - comment out for safety)
            # self.drop_old_tables()
            
            self.log_action("✅ Migration completed successfully!")
            return True
            
        except Exception as e:
            self.log_action(f"❌ Migration failed: {e}")
            return False
    
    def save_migration_log(self):
        """Save migration log to file"""
        log_file = f"migration_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(log_file, 'w', encoding='utf-8') as f:
            for log_entry in self.migration_log:
                f.write(log_entry + '\n')
        self.log_action(f"📝 Migration log saved to: {log_file}")

if __name__ == '__main__':
    print("🚀 Starting Database Unification Migration...")
    print("=" * 60)
    
    merger = DatabaseMerger()
    
    # Ask for confirmation
    print("\n⚠️  WARNING: This will modify your database structure!")
    print("   Make sure you have a backup before proceeding.")
    
    response = input("\nDo you want to continue? (yes/no): ").lower().strip()
    
    if response == 'yes':
        success = merger.run_migration()
        merger.save_migration_log()
        
        if success:
            print("\n✅ Migration completed successfully!")
            print("📝 Next steps:")
            print("   1. Run: python manage.py makemigrations")
            print("   2. Run: python manage.py migrate")
            print("   3. Test the application")
        else:
            print("\n❌ Migration failed. Check the log for details.")
    else:
        print("❌ Migration cancelled.")



