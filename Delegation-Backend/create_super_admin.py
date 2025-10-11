#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script to create a SUPER_ADMIN user for the Delegation System
"""
import os
import sys
import django

# Set encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import call_command

User = get_user_model()

def create_super_admin():
    """Create a SUPER_ADMIN user with full permissions"""
    
    print("🏛️ إنشاء مستخدم SUPER_ADMIN لنظام إدارة الوفود")
    print("=" * 50)
    
    # Check if super admin already exists
    existing_super_admin = User.objects.filter(role='SUPER_ADMIN').first()
    if existing_super_admin:
        print(f"⚠️  يوجد بالفعل مستخدم SUPER_ADMIN: {existing_super_admin.full_name} ({existing_super_admin.username})")
        response = input("هل تريد إنشاء مستخدم جديد؟ (y/n): ")
        if response.lower() != 'y':
            print("تم إلغاء العملية")
            return
    
    # Get user details
    print("\n📝 أدخل بيانات المستخدم:")
    username = input("اسم المستخدم: ").strip()
    if not username:
        print("❌ اسم المستخدم مطلوب!")
        return
    
    # Check if username already exists
    if User.objects.filter(username=username).exists():
        print(f"❌ اسم المستخدم '{username}' موجود بالفعل!")
        return
    
    full_name = input("الاسم الكامل: ").strip()
    if not full_name:
        print("❌ الاسم الكامل مطلوب!")
        return
    
    email = input("البريد الإلكتروني (اختياري): ").strip()
    password = input("كلمة المرور: ").strip()
    if not password:
        print("❌ كلمة المرور مطلوبة!")
        return
    
    # Create SUPER_ADMIN user
    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            full_name=full_name,
            email=email,
            role='SUPER_ADMIN',
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        
        print(f"\n✅ تم إنشاء المستخدم SUPER_ADMIN بنجاح!")
        print(f"📋 بيانات المستخدم:")
        print(f"   - اسم المستخدم: {user.username}")
        print(f"   - الاسم الكامل: {user.full_name}")
        print(f"   - البريد الإلكتروني: {user.email}")
        print(f"   - الدور: {user.role}")
        print(f"   - صلاحيات Django: SUPERUSER + STAFF")
        
        print(f"\n🌐 يمكنك الآن الوصول إلى:")
        print(f"   - Django Admin: http://localhost:8000/admin/")
        print(f"   - Frontend App: http://localhost:5173/")
        
        print(f"\n🔐 صلاحيات SUPER_ADMIN:")
        print(f"   ✅ عرض جميع البيانات في قاعدة البيانات")
        print(f"   ✅ إضافة/تعديل/حذف أي بيانات")
        print(f"   ✅ إدارة المستخدمين")
        print(f"   ✅ الوصول الكامل لـ Django Admin")
        print(f"   ✅ عرض سجلات التدقيق")
        print(f"   ✅ إدارة جميع الجداول والنماذج")
        
    except Exception as e:
        print(f"❌ حدث خطأ في إنشاء المستخدم: {str(e)}")

def list_super_admins():
    """List all SUPER_ADMIN users"""
    super_admins = User.objects.filter(role='SUPER_ADMIN')
    
    if not super_admins.exists():
        print("❌ لا يوجد مستخدمين SUPER_ADMIN")
        return
    
    print("📋 قائمة مستخدمي SUPER_ADMIN:")
    print("=" * 50)
    
    for user in super_admins:
        print(f"👤 {user.full_name}")
        print(f"   - اسم المستخدم: {user.username}")
        print(f"   - البريد الإلكتروني: {user.email}")
        print(f"   - نشط: {'نعم' if user.is_active else 'لا'}")
        print(f"   - تاريخ الإنشاء: {user.created_at}")
        print("-" * 30)

def main():
    """Main function"""
    while True:
        print("\n🏛️ نظام إدارة الوفود - إدارة SUPER_ADMIN")
        print("=" * 50)
        print("1. إنشاء مستخدم SUPER_ADMIN جديد")
        print("2. عرض مستخدمي SUPER_ADMIN")
        print("3. إنشاء Django Superuser")
        print("4. خروج")
        
        choice = input("\nاختر رقم العملية (1-4): ").strip()
        
        if choice == '1':
            create_super_admin()
        elif choice == '2':
            list_super_admins()
        elif choice == '3':
            print("\n🔧 إنشاء Django Superuser...")
            call_command('createsuperuser')
        elif choice == '4':
            print("👋 شكراً لاستخدام نظام إدارة الوفود!")
            break
        else:
            print("❌ اختيار غير صحيح! يرجى المحاولة مرة أخرى.")

if __name__ == '__main__':
    main()
