import { Icon } from "@iconify/react/dist/iconify.js"
import { NavLink, useLocation, useNavigate, useRoutes } from "react-router"
import { navLinks } from "../constants"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { usePermissions } from "../store/hooks"
import { eventService } from "../services/api"

const SideBar = () => {
    const navigate = useNavigate()
    const route = useLocation()
    const handleLogout = () => navigate('/login')    
    const [subEvents, setSubEvents] = useState({})
    const [dynamicNavLinks, setDynamicNavLinks] = useState([])
    
    // جلب صلاحيات المستخدم من Redux
    const { checkPermission, userRole } = usePermissions()

    // جلب بيانات الأحداث من API
    useEffect(() => {
        let isMounted = true
        
        const loadEventsFromAPI = async () => {
            try {
                const response = await eventService.getMainEvents()
                
                if (!isMounted) return
                
                // التحقق من أن response يحتوي على results array
                let events = []
                if (response && response.results && Array.isArray(response.results)) {
                    events = response.results
                } else if (Array.isArray(response)) {
                    // fallback للـ response القديم
                    events = response
                } else {
                    console.warn('⚠️ API لم يرجع results array للأحداث:', response)
                    if (isMounted) {
                        setSubEvents({})
                        setDynamicNavLinks([])
                    }
                    return
                }
                
                const eventsMap = {}
                const dynamicLinks = []
                
                // جلب الأحداث الفرعية لكل حدث رئيسي
                for (const event of events) {
                    try {
                        const subEventsResponse = await eventService.getSubEvents(event.id)
                        
                        if (!isMounted) return
                        
                        // التحقق من أن subEventsResponse يحتوي على results array
                        let validSubEvents = []
                        if (subEventsResponse && subEventsResponse.results && Array.isArray(subEventsResponse.results)) {
                            validSubEvents = subEventsResponse.results
                        } else if (Array.isArray(subEventsResponse)) {
                            validSubEvents = subEventsResponse
                        }
                        
                        // تحويل اسم الحدث إلى مسار مناسب
                        let path = ''
                        // استخدام event_link إذا كان متوفراً، وإلا الاسم العربي
                        if (event.event_link && event.event_link.trim()) {
                            // إذا كان في event_link، استخدمه مباشرة
                            path = `/${event.event_link.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`
                        } else {
                            // استخدام اسم الحدث بالعربية
                            path = `/${event.event_name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')}`
                        }
                        
                        eventsMap[path] = validSubEvents.map(subEvent => ({
                            id: subEvent.id,
                            name: subEvent.event_name,
                            to: `${path}/${subEvent.id}`
                        }))

                        // إضافة الرابط الديناميكي
                        dynamicLinks.push({
                            name: event.event_name,
                            icon: event.event_icon || null, // لا نضع أيقونة افتراضية
                            to: path,
                            type: "main-event",
                            isFromAPI: true
                        })
                    } catch (subEventError) {
                        console.error(`❌ خطأ في جلب الأحداث الفرعية للحدث ${event.event_name}:`, subEventError)
                        // متابعة مع الأحداث الأخرى حتى لو فشل أحدها
                    }
                }
                
                if (isMounted) {
                    setSubEvents(eventsMap)
                    setDynamicNavLinks(dynamicLinks)
                }
            } catch (error) {
                console.error('❌ خطأ في جلب الأحداث من API:', error)
                if (isMounted) {
                    setSubEvents({})
                    setDynamicNavLinks([])
                }
            }
        }
        
        loadEventsFromAPI()
        
        return () => {
            isMounted = false
        }
    }, [])

    // إزالة الاستماع لتغييرات localStorage لأننا نستخدم API الآن
    // يمكن إضافة refresh mechanism إذا لزم الأمر



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
                
                {/* الأحداث الأساسية من API */}
                {dynamicNavLinks.map((link, index) => (
                    <li key={index}>
                        <NavLink to={link.to} className="link">
                            {link.icon && <Icon icon={link.icon} fontSize={24} />}
                            <span>{link.name}</span>
                        </NavLink>
                    </li>
                ))}
                
                {/* ملاحظة: تم إزالة الأحداث الجديدة المضافة من localStorage لأنها تُحمل من API الآن */}
                
                {/* إدارة الأحداث - ممنوع على USER */}
                {checkPermission('MANAGE_EVENTS') && (
                    <li>
                        <NavLink to="/events-management" className="link">
                            <Icon icon="material-symbols:event" fontSize={24} />
                            <span>إدارة الأحداث</span>
                        </NavLink>
                    </li>
                )}
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