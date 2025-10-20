#!/usr/bin/env python
"""
Create test data for API testing
"""
import os
import sys
import django
from datetime import datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'delegation_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import (
    MainEvent, SubEvent, Nationality, MilitaryPosition,
    Airport, Airline, Delegation, Member, DepartureSession
)

User = get_user_model()

def create_test_data():
    """Create test data for API testing"""
    print("🚀 Creating test data for API testing...")
    
    # Create test users if they don't exist
    print("\n👤 Creating test users...")
    
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'full_name': 'مدير النظام',
            'role': 'SUPER_ADMIN',
            'is_active': True,
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("   ✅ Created admin user")
    else:
        print("   ✅ Admin user already exists")
    
    test_user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'full_name': 'مستخدم الاختبار',
            'role': 'ADMIN',
            'is_active': True,
        }
    )
    if created:
        test_user.set_password('test123')
        test_user.save()
        print("   ✅ Created test user")
    else:
        print("   ✅ Test user already exists")
    
    # Create main events
    print("\n📅 Creating main events...")
    
    main_event, created = MainEvent.objects.get_or_create(
        name='مؤتمر الدفاع العربي',
        defaults={
            'icon': 'shield',
            'description': 'مؤتمر سنوي للدفاع والأمن العربي',
            'created_by': admin_user
        }
    )
    if created:
        print(f"   ✅ Created main event: {main_event.name}")
    else:
        print(f"   ✅ Main event exists: {main_event.name}")
    
    # Create sub events
    print("\n📋 Creating sub events...")
    
    sub_event, created = SubEvent.objects.get_or_create(
        name='جلسة الأمن السيبراني',
        defaults={
            'main_event': main_event,
            'description': 'جلسة متخصصة في الأمن السيبراني',
            'created_by': admin_user
        }
    )
    if created:
        print(f"   ✅ Created sub event: {sub_event.name}")
    else:
        print(f"   ✅ Sub event exists: {sub_event.name}")
    
    # Create nationalities
    print("\n🌍 Creating nationalities...")
    
    nationalities_data = [
        {'name': 'مصرية', 'code': 'EG'},
        {'name': 'سعودية', 'code': 'SA'},
        {'name': 'إماراتية', 'code': 'AE'},
        {'name': 'أردنية', 'code': 'JO'},
        {'name': 'كويتية', 'code': 'KW'},
    ]
    
    for nat_data in nationalities_data:
        nationality, created = Nationality.objects.get_or_create(
            code=nat_data['code'],
            defaults={
                'name': nat_data['name'],
                'created_by': admin_user
            }
        )
        if created:
            print(f"   ✅ Created nationality: {nationality.name}")
        else:
            print(f"   ✅ Nationality exists: {nationality.name}")
    
    # Create military positions
    print("\n🎖️ Creating military positions...")
    
    positions_data = [
        {'name': 'لواء', 'rank_level': 1, 'equivalent_position': 'مدير عام'},
        {'name': 'عميد', 'rank_level': 2, 'equivalent_position': 'مدير إدارة'},
        {'name': 'عقيد', 'rank_level': 3, 'equivalent_position': 'رئيس قسم'},
        {'name': 'مقدم', 'rank_level': 4, 'equivalent_position': 'نائب رئيس قسم'},
        {'name': 'رائد', 'rank_level': 5, 'equivalent_position': 'رئيس شعبة'},
    ]
    
    for pos_data in positions_data:
        position, created = MilitaryPosition.objects.get_or_create(
            name=pos_data['name'],
            defaults={
                'rank_level': pos_data['rank_level'],
                'equivalent_position': pos_data['equivalent_position'],
                'created_by': admin_user
            }
        )
        if created:
            print(f"   ✅ Created position: {position.name}")
        else:
            print(f"   ✅ Position exists: {position.name}")
    
    # Create airports
    print("\n✈️ Creating airports...")
    
    airports_data = [
        {'name': 'مطار القاهرة الدولي', 'code': 'CAI', 'city': 'القاهرة', 'country': 'مصر'},
        {'name': 'مطار الملك خالد الدولي', 'code': 'RUH', 'city': 'الرياض', 'country': 'السعودية'},
        {'name': 'مطار دبي الدولي', 'code': 'DXB', 'city': 'دبي', 'country': 'الإمارات'},
        {'name': 'مطار الملكة علياء الدولي', 'code': 'AMM', 'city': 'عمان', 'country': 'الأردن'},
    ]
    
    for airport_data in airports_data:
        airport, created = Airport.objects.get_or_create(
            code=airport_data['code'],
            defaults={
                'name': airport_data['name'],
                'city': airport_data['city'],
                'country': airport_data['country'],
                'created_by': admin_user
            }
        )
        if created:
            print(f"   ✅ Created airport: {airport.name}")
        else:
            print(f"   ✅ Airport exists: {airport.name}")
    
    # Create airlines
    print("\n🛫 Creating airlines...")
    
    airlines_data = [
        {'name': 'مصر للطيران', 'code': 'MS', 'country': 'مصر'},
        {'name': 'الخطوط الجوية السعودية', 'code': 'SV', 'country': 'السعودية'},
        {'name': 'طيران الإمارات', 'code': 'EK', 'country': 'الإمارات'},
        {'name': 'الخطوط الجوية الملكية الأردنية', 'code': 'RJ', 'country': 'الأردن'},
    ]
    
    for airline_data in airlines_data:
        airline, created = Airline.objects.get_or_create(
            code=airline_data['code'],
            defaults={
                'name': airline_data['name'],
                'country': airline_data['country'],
                'created_by': admin_user
            }
        )
        if created:
            print(f"   ✅ Created airline: {airline.name}")
        else:
            print(f"   ✅ Airline exists: {airline.name}")
    
    # Create a sample delegation
    print("\n🏛️ Creating sample delegation...")
    
    egyptian_nationality = Nationality.objects.get(code='EG')
    cairo_airport = Airport.objects.get(code='CAI')
    egyptair = Airline.objects.get(code='MS')
    
    delegation, created = Delegation.objects.get_or_create(
        sub_event=sub_event,
        nationality=egyptian_nationality,
        defaults={
            'type': 'MILITARY',
            'status': 'NOT_DEPARTED',
            'max_members': 5,
            'arrival_info': {
                'arrival_hall': 'قاعة الوصول الرئيسية',
                'arrival_airline': egyptair.name,
                'arrival_flight_number': 'MS123',
                'arrival_origin': 'القاهرة',
                'arrival_date': '2024-01-15',
                'arrival_time': '1430',
                'arrival_receptor': 'وزارة الدفاع',
                'arrival_destination': 'الرياض',
                'arrival_shipments': 'أمتعة شخصية',
                'delegation_head': 'اللواء أحمد محمد'
            },
            'created_by': admin_user
        }
    )
    
    if created:
        print(f"   ✅ Created delegation: {delegation.nationality.name}")
        
        # Add some members to the delegation
        print("\n👥 Creating delegation members...")
        
        members_data = [
            {
                'name': 'اللواء أحمد محمد',
                'rank': 'لواء',
                'position': 'قائد الوفد',
                'equivalent_position': 'مدير عام',
                'status': 'NOT_DEPARTED'
            },
            {
                'name': 'العقيد سامي أحمد',
                'rank': 'عقيد',
                'position': 'نائب قائد الوفد',
                'equivalent_position': 'رئيس قسم',
                'status': 'NOT_DEPARTED'
            },
            {
                'name': 'المقدم خالد محمود',
                'rank': 'مقدم',
                'position': 'ضابط الاتصال',
                'equivalent_position': 'نائب رئيس قسم',
                'status': 'NOT_DEPARTED'
            }
        ]
        
        for member_data in members_data:
            member, created = Member.objects.get_or_create(
                delegation=delegation,
                name=member_data['name'],
                defaults={
                    'rank': member_data['rank'],
                    'position': member_data['position'],
                    'equivalent_position': member_data['equivalent_position'],
                    'status': member_data['status'],
                    'created_by': admin_user
                }
            )
            if created:
                print(f"   ✅ Created member: {member.name}")
            else:
                print(f"   ✅ Member exists: {member.name}")
    else:
        print(f"   ✅ Delegation exists: {delegation.nationality.name}")
    
    print("\n🎉 Test data creation completed!")
    print("\n📝 Test credentials:")
    print("   Admin: username='admin', password='admin123'")
    print("   User:  username='testuser', password='test123'")
    print("\n🚀 You can now test the API using Postman!")

if __name__ == '__main__':
    create_test_data()



