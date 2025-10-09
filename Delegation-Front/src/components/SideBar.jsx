import { Icon } from "@iconify/react/dist/iconify.js"
import { NavLink, useLocation, useNavigate, useRoutes } from "react-router"
import { navLinks } from "../constants"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const SideBar = () => {
    const navigate = useNavigate()
    const route = useLocation()
    const handleLogout = () => navigate('/login')    
    const [subEvents, setSubEvents] = useState({})
    const [dynamicNavLinks, setDynamicNavLinks] = useState([])

    // جلب بيانات الأحداث من localStorage أو API
    useEffect(() => {
        // محاولة جلب البيانات من localStorage أولاً
        const savedEvents = localStorage.getItem('mainEvents')
        if (savedEvents) {
            try {
                const events = JSON.parse(savedEvents)
                const eventsMap = {}
                const dynamicLinks = []
                
                        events.forEach(event => {
                            // تحويل اسم الحدث إلى مسار مناسب
                            let path = ''
                            // استخدام الاسم الإنجليزي إذا كان متوفراً
                            if (event.englishName) {
                                path = `/${event.englishName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`
                            } else {
                                path = `/${event.name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')}`
                            }
                    
                    eventsMap[path] = event.sub_events?.map(subEvent => ({
                        id: subEvent.id,
                        name: subEvent.name,
                        to: `${path}/${subEvent.id}`
                    })) || []

                    // إضافة الرابط الديناميكي
                    dynamicLinks.push({
                        name: event.name,
                        icon: event.icon,
                        to: path,
                        type: "main-event",
                        isFromLocalStorage: true
                    })
                })
                
                setSubEvents(eventsMap)
                setDynamicNavLinks(dynamicLinks)
            } catch (error) {
                console.error('خطأ في تحليل بيانات الأحداث:', error)
                setDynamicNavLinks([])
            }
            } else {
                // لا توجد أحداث - ابدأ فارغ
                setSubEvents({})
                setDynamicNavLinks([])
            }
    }, [])

    // الاستماع لتغييرات البيانات
    useEffect(() => {
        const handleStorageChange = () => {
            const savedEvents = localStorage.getItem('mainEvents')
            if (savedEvents) {
                try {
                    const events = JSON.parse(savedEvents)
                    const eventsMap = {}
                    const dynamicLinks = []
                    
                    events.forEach(event => {
                        // تحويل اسم الحدث إلى مسار مناسب
                        let path = ''
                        // استخدام الاسم الإنجليزي إذا كان متوفراً
                        if (event.englishName) {
                            path = `/${event.englishName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`
                        } else {
                            path = `/${event.name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')}`
                        }
                        
                        eventsMap[path] = event.sub_events?.map(subEvent => ({
                            id: subEvent.id,
                            name: subEvent.name,
                            to: `${path}/${subEvent.id}`
                        })) || []

                        // إضافة الرابط الديناميكي
                        dynamicLinks.push({
                            name: event.name,
                            icon: event.icon,
                            to: path,
                            type: "main-event",
                            isFromLocalStorage: true
                        })
                    })
                    
                    setSubEvents(eventsMap)
                    setDynamicNavLinks(dynamicLinks)
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأحداث:', error)
                    setDynamicNavLinks([])
                }
            } else {
                setDynamicNavLinks([])
            }
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
        
        // فحص دوري للتغييرات (للتطوير)
        const interval = setInterval(handleStorageChange, 1000)

        return () => {
            window.removeEventListener('storage', (event) => {
                if (event.key === 'lastEventUpdate') {
                    handleStorageChange()
                }
            })
            window.removeEventListener('eventAdded', handleStorageChange)
            window.removeEventListener('eventDeleted', handleStorageChange)
            window.removeEventListener('eventUpdated', handleStorageChange)
            clearInterval(interval)
        }
    }, [])



    return (
        <nav className="sidebar p-6 w-[350px] bg-neutral-800 text-white rounded-xl flex flex-col gap-6 overflow-auto thin-scrollbar">
            <NavLink to={'/'} className="logo-wrapper mx-auto">
                <img src="/images/logo.png" width={128} alt="Logo Image" />
            </NavLink>
            
            {/* الروابط الثابتة */}
            <ul className="flex flex-col gap-2">
                {/* لوحة التحكم */}
                <li>
                    <NavLink to="/" className="link">
                        <Icon icon="material-symbols:dashboard-rounded" fontSize={24} />
                        <span>لوحة التحكم</span>
                    </NavLink>
                </li>
                
                {/* الأحداث الأساسية من localStorage */}
                {dynamicNavLinks.map((link, index) => (
                        <li key={index}>
                        <NavLink to={link.to} className="link">
                                <Icon icon={link.icon} fontSize={24} />
                                <span>{link.name}</span>
                            </NavLink>
                        </li>
                ))}
                
                {/* الأحداث الجديدة المضافة */}
                {Object.keys(subEvents).map((path) => {
                    // تجاهل الأحداث الموجودة بالفعل في dynamicNavLinks
                    const existingEvent = dynamicNavLinks.find(link => link.to === path)
                    if (existingEvent) return null
                    
                    // جلب اسم الحدث من localStorage
                    const savedEvents = localStorage.getItem('mainEvents')
                    if (!savedEvents) return null
                    
                    try {
                        const events = JSON.parse(savedEvents)
                        const event = events.find(e => {
                            let eventPath = ''
                            // للأحداث الجديدة، استخدم الاسم الإنجليزي إذا كان متوفراً
                            if (e.englishName) {
                                eventPath = `/${e.englishName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`
                            } else {
                                eventPath = `/${e.name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')}`
                            }
                            return eventPath === path
                        })
                        
                        if (!event) return null
                        
                        return (
                            <li key={path}>
                                <NavLink to={path} className="link">
                                    <Icon icon={event.icon} fontSize={24} />
                                    <span>{event.name}</span>
                                </NavLink>
                            </li>
                        )
                    } catch (error) {
                        return null
                    }
                })}
                
                {/* إدارة الأحداث */}
                <li>
                    <NavLink to="/events-management" className="link">
                        <Icon icon="material-symbols:event" fontSize={24} />
                        <span>إدارة الأحداث</span>
                    </NavLink>
                </li>
            </ul>

            <div className="mt-auto space-y-4">
                <Button className="bg-transparent border-rose-400 border text-rose-400 hover:bg-rose-400/10 cursor-pointer w-full" onClick={handleLogout}>
                    <Icon icon="solar:logout-outline" />
                    <span>تسجيل خروج</span>
                </Button>
            </div>
        </nav>
    )
}

export default SideBar