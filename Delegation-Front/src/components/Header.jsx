import { useLocation } from 'react-router'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UserProfile from './UserProfile'
import { fetchMainEvents } from '../store/slices/eventsSlice'

const Header = () => {
    const dispatch = useDispatch()
    const navigation = useLocation()
    const [title, setTitle] = useState('لوحة التحكم')
    
    // Redux state
    const { mainEvents, loading: eventsLoading } = useSelector(state => state.events)

    useEffect(() => {
        // تحميل البيانات باستخدام Redux
        dispatch(fetchMainEvents())
    }, [dispatch])

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
                const event = mainEvents.find(e => {
                    const byLink = (e.event_link || '').toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                    const byName = e.event_name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                    return byLink === eventPath || byName === eventPath
                })
                setTitle(event ? event.event_name : 'لوحة التحكم')
                return
            }
            if (segments.length >= 2) {
                const [eventPath, subEventId] = segments
                const event = mainEvents.find(e => {
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
    }, [navigation.pathname, mainEvents])
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