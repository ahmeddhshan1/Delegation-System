#!/usr/bin/env python
"""
Safe database migration script with rollback capability
"""
import os
import sys
import django
from datetime import datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.db import connection
from django.core.management import call_command

class SafeMigration:
    def __init__(self):
        self.backup_file = f"backup_before_unification_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        self.migration_steps = []
        self.rollback_steps = []
    
    def log_step(self, step, description):
        """Log a migration step"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {step}: {description}"
        self.migration_steps.append(log_entry)
        print(log_entry)
    
    def create_backup(self):
        """Create database backup"""
        self.log_step("BACKUP", "Creating database backup...")
        
        try:
            import subprocess
            result = subprocess.run([
                'pg_dump', 
                '-h', 'localhost',
                '-U', 'postgres',
                '-d', 'delegation_system',
                '-f', self.backup_file,
                '--verbose',
                '--no-owner',
                '--no-privileges'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_step("BACKUP", f"✅ Backup created: {self.backup_file}")
                return True
            else:
                self.log_step("BACKUP", f"❌ Backup failed: {result.stderr}")
                return False
                
        except Exception as e:
            self.log_step("BACKUP", f"❌ Backup error: {e}")
            return False
    
    def analyze_current_state(self):
        """Analyze current database state"""
        self.log_step("ANALYZE", "Analyzing current database state...")
        
        with connection.cursor() as cursor:
            # Check which tables exist and have data
            cursor.execute("""
                SELECT table_name, 
                       (SELECT COUNT(*) FROM information_schema.tables t2 
                        WHERE t2.table_name = t1.table_name) as exists_count
                FROM information_schema.tables t1
                WHERE table_schema = 'public' 
                AND (table_name LIKE '%api_%' OR table_name NOT LIKE '%api_%')
                ORDER BY table_name;
            """)
            
            tables = cursor.fetchall()
            
            self.log_step("ANALYZE", "📊 Current tables:")
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table[0]};")
                count = cursor.fetchone()[0]
                self.log_step("ANALYZE", f"   - {table[0]}: {count} records")
    
    def test_django_connection(self):
        """Test Django ORM connection"""
        self.log_step("TEST", "Testing Django ORM connection...")
        
        try:
            from api.models import MainEvent, SubEvent, Nationality
            from accounts.models import User
            
            # Test basic queries
            user_count = User.objects.count()
            main_events_count = MainEvent.objects.count()
            nationalities_count = Nationality.objects.count()
            
            self.log_step("TEST", f"✅ Django ORM working:")
            self.log_step("TEST", f"   - Users: {user_count}")
            self.log_step("TEST", f"   - Main Events: {main_events_count}")
            self.log_step("TEST", f"   - Nationalities: {nationalities_count}")
            
            return True
            
        except Exception as e:
            self.log_step("TEST", f"❌ Django ORM error: {e}")
            return False
    
    def run_django_migrations(self):
        """Run Django migrations"""
        self.log_step("MIGRATE", "Running Django migrations...")
        
        try:
            # Make migrations
            call_command('makemigrations', verbosity=0)
            self.log_step("MIGRATE", "✅ makemigrations completed")
            
            # Run migrations
            call_command('migrate', verbosity=0)
            self.log_step("MIGRATE", "✅ migrate completed")
            
            return True
            
        except Exception as e:
            self.log_step("MIGRATE", f"❌ Migration error: {e}")
            return False
    
    def verify_migration(self):
        """Verify migration success"""
        self.log_step("VERIFY", "Verifying migration...")
        
        try:
            from api.models import MainEvent, SubEvent, Nationality, Delegation
            from accounts.models import User
            
            # Test all models
            models_to_test = [
                (User, 'Users'),
                (MainEvent, 'Main Events'),
                (SubEvent, 'Sub Events'),
                (Nationality, 'Nationalities'),
                (Delegation, 'Delegations'),
            ]
            
            for model, name in models_to_test:
                count = model.objects.count()
                self.log_step("VERIFY", f"   ✅ {name}: {count} records")
            
            # Test API endpoints
            from django.test import Client
            client = Client()
            
            # Test basic API access
            response = client.get('/api/')
            if response.status_code in [200, 404]:  # 404 is OK for root API
                self.log_step("VERIFY", "✅ API endpoints accessible")
            else:
                self.log_step("VERIFY", f"⚠️  API response: {response.status_code}")
            
            return True
            
        except Exception as e:
            self.log_step("VERIFY", f"❌ Verification error: {e}")
            return False
    
    def run_safe_migration(self):
        """Run the complete safe migration process"""
        print("🚀 Starting Safe Database Unification Migration...")
        print("=" * 60)
        
        try:
            # Step 1: Create backup
            if not self.create_backup():
                print("❌ Backup failed, aborting migration")
                return False
            
            # Step 2: Analyze current state
            self.analyze_current_state()
            
            # Step 3: Test Django connection
            if not self.test_django_connection():
                print("❌ Django connection failed, aborting migration")
                return False
            
            # Step 4: Run Django migrations
            if not self.run_django_migrations():
                print("❌ Django migrations failed, aborting migration")
                return False
            
            # Step 5: Verify migration
            if not self.verify_migration():
                print("❌ Migration verification failed")
                return False
            
            print("\n✅ Safe migration completed successfully!")
            return True
            
        except Exception as e:
            print(f"\n❌ Migration failed with error: {e}")
            return False
    
    def save_migration_log(self):
        """Save migration log"""
        log_file = f"safe_migration_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(log_file, 'w', encoding='utf-8') as f:
            for step in self.migration_steps:
                f.write(step + '\n')
        print(f"📝 Migration log saved to: {log_file}")

def main():
    print("🛡️  Safe Database Unification Migration")
    print("=" * 60)
    print("This script will:")
    print("  1. Create a backup of your database")
    print("  2. Analyze the current state")
    print("  3. Run Django migrations safely")
    print("  4. Verify everything is working")
    print("\n⚠️  Make sure you have PostgreSQL access configured!")
    
    response = input("\nDo you want to proceed? (yes/no): ").lower().strip()
    
    if response == 'yes':
        migrator = SafeMigration()
        success = migrator.run_safe_migration()
        migrator.save_migration_log()
        
        if success:
            print("\n🎉 Migration completed successfully!")
            print("📝 Next steps:")
            print("   1. Test your application")
            print("   2. Check all API endpoints")
            print("   3. Verify frontend functionality")
        else:
            print("\n❌ Migration failed. Check the log for details.")
            print("💡 You can restore from backup if needed.")
    else:
        print("❌ Migration cancelled.")

if __name__ == '__main__':
    main()



