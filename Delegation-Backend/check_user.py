import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from accounts.models import User

def check_user():
    try:
        # Check if admin user exists
        admin_user = User.objects.filter(username='admin').first()
        if admin_user:
            print(f"✅ Admin user found:")
            print(f"   Username: {admin_user.username}")
            print(f"   Full Name: {admin_user.full_name}")
            print(f"   Role: {admin_user.role}")
            print(f"   Is Active: {admin_user.is_active}")
            print(f"   Is Staff: {admin_user.is_staff}")
            print(f"   Is Superuser: {admin_user.is_superuser}")
            print(f"   Password Hash: {admin_user.password[:20]}..." if admin_user.password else "No password")
        else:
            print("❌ Admin user not found")
            
        # List all users
        all_users = User.objects.all()
        print(f"\n📊 Total users in database: {all_users.count()}")
        for user in all_users:
            print(f"   - {user.username} ({user.full_name}) - {user.role}")
            
    except Exception as e:
        print(f"❌ Error checking user: {e}")

if __name__ == '__main__':
    check_user()
