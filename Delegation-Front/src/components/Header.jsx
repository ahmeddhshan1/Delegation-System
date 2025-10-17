import { useLocation } from 'react-router'
import { useState, useEffect } from 'react'
import UserProfile from './UserProfile'
import { eventService } from '../services/api'

const Header = () => {
    const navigation = useLocation()
    const [events, setEvents] = useState([])
    const [title, setTitle] = useState('لوحة التحكم')

    useEffect(() => {
        let isMounted = true // flag لتتبع حالة المكون
        
        const loadEventsFromAPI = async () => {
            try {
                const eventsResponse = await eventService.getMainEvents()
                let list = []
                
                if (eventsResponse && eventsResponse.results && Array.isArray(eventsResponse.results)) {
                    list = eventsResponse.results
                } else if (Array.isArray(eventsResponse)) {
                    list = eventsResponse
                } else {
                    console.warn('API لم يرجع array للأحداث:', eventsResponse)
                }
                
                if (isMounted) {
                    setEvents(list)
                }
            } catch (error) {
                console.error('خطأ في جلب الأحداث من API:', error)
                if (isMounted) {
                    setEvents([])
                }
            }
        }

        loadEventsFromAPI()

        return () => {
            isMounted = false // تعيين flag إلى false عند cleanup
        }
    }, [])

    // حساب عنوان الهيدر حسب الصفحة الحالية
    useEffect(() => {
        const computeTitle = async () => {
            // الصفحات الثابتة
            if (navigation.pathname === '/') {
                setTitle('لوحة التحكم')
                return
            }
            if (navigation.pathname === '/events-management') {
                setTitle('إدارة الأحداث')
                return
            }
            if (navigation.pathname === '/all-members') {
                setTitle('جميع الأعضاء')
                return
            }

            const segments = navigation.pathname.split('/').filter(Boolean)
            if (segments.length === 1) {
                const eventPath = segments[0]
                const event = events.find(e => {
                    const byLink = (e.event_link || '').toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                    const byName = e.event_name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                    return byLink === eventPath || byName === eventPath
                })
                setTitle(event ? event.event_name : 'لوحة التحكم')
                return
            }
            if (segments.length >= 2) {
                const [eventPath, subEventId] = segments
                const event = events.find(e => {
                    const byLink = (e.event_link || '').toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                    const byName = e.event_name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                    return byLink === eventPath || byName === eventPath
                })
                if (!event) {
                    setTitle('لوحة التحكم')
                    return
                }
                // في صفحات الأحداث الفرعية، العنوان يجب أن يكون اسم الحدث الرئيسي
                setTitle(event.event_name)
                return
            }

            setTitle('لوحة التحكم')
        }

        computeTitle()
    }, [navigation.pathname, events])
    return (
        <header className='p-2 rounded-xl w-full bg-white flex items-center justify-between shadow-md'>
            <h1 className='font-bold text-xl ms-8'>
                {title}
            </h1>
            <div className="flex items-center gap-4">
                <UserProfile />
            </div>
        </header>
    )
}

export default Header