import { useLocation } from 'react-router'
import { useState, useEffect } from 'react'
import UserProfile from './UserProfile'
import { UserRoleInfo } from './Permissions/PermissionGuard'

const Header = () => {
    const navigation = useLocation()
    const [events, setEvents] = useState([])

    useEffect(() => {
        const loadEvents = () => {
            const savedEvents = localStorage.getItem('mainEvents')
            if (savedEvents) {
                try {
                    const parsedEvents = JSON.parse(savedEvents)
                    setEvents(parsedEvents)
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأحداث:', error)
                }
            }
        }

        loadEvents()

        // الاستماع لتغييرات localStorage
        const handleStorageChange = () => {
            loadEvents()
        }

        // الاستماع لتغييرات localStorage (للتابات الأخرى)
        window.addEventListener('storage', (event) => {
            if (event.key === 'lastEventUpdate') {
                handleStorageChange()
            }
        })
        
        // الاستماع للأحداث المخصصة (لنفس التابة)
        window.addEventListener('eventAdded', handleStorageChange)
        window.addEventListener('eventDeleted', handleStorageChange)
        window.addEventListener('eventUpdated', handleStorageChange)

        return () => {
            window.removeEventListener('storage', (event) => {
                if (event.key === 'lastEventUpdate') {
                    handleStorageChange()
                }
            })
            window.removeEventListener('eventAdded', handleStorageChange)
            window.removeEventListener('eventDeleted', handleStorageChange)
            window.removeEventListener('eventUpdated', handleStorageChange)
        }
    }, [])

    const headerTitle = () => {
        // الصفحات الثابتة
        switch (navigation.pathname) {
        case '/':
            return "لوحة التحكم"
        case '/events-management':
            return "إدارة الأحداث"
        case '/all-members':
            return "جميع الأعضاء"
        }

        // للأحداث الفرعية والصفحات الديناميكية
        const pathSegments = navigation.pathname.split('/').filter(segment => segment)
        
        if (pathSegments.length >= 1) {
            const eventPath = pathSegments[0]
            
            // البحث في الأحداث المحملة
            const event = events.find(e => {
                // استخدام الاسم الإنجليزي إذا كان متوفراً، وإلا استخدم الاسم العربي
                let eventPathFromName = ''
                if (e.englishName) {
                    eventPathFromName = e.englishName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                } else {
                    eventPathFromName = e.name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                    // معالجة التاء المربوطة
                    if (eventPathFromName.endsWith('ة')) {
                        eventPathFromName = eventPathFromName.slice(0, -1) + 'ه'
                    }
                }
                
                // معالجة التاء المربوطة في المقارنة
                let normalizedEventPath = eventPath
                if (normalizedEventPath.endsWith('ة')) {
                    normalizedEventPath = normalizedEventPath.slice(0, -1) + 'ه'
                }
                
                return eventPathFromName === normalizedEventPath
            })
            
            if (event) {
                return event.name
            }
        }
        
        return "لوحة التحكم"
    }
    return (
        <header className='p-2 rounded-xl w-full bg-white flex items-center justify-between shadow-md'>
            <h1 className='font-bold text-xl ms-8'>
                {headerTitle()}
            </h1>
            <div className="flex items-center gap-4">
                <UserProfile />
            </div>
        </header>
    )
}

export default Header