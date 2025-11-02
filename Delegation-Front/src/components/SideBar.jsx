import Icon from './ui/Icon';
import { NavLink, useLocation, useNavigate, useRoutes } from "react-router"
import { navLinks } from "../constants"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { usePermissions } from "../store/hooks"
import { useSelector, useDispatch } from 'react-redux'
import { fetchMainEvents } from '../store/slices/eventsSlice'
import { fetchSubEvents } from '../store/slices/subEventsSlice'
import WebSocketStatus from '../components/WebSocketStatus'


const SideBar = () => {
    const navigate = useNavigate()
    const route = useLocation()
    const handleLogout = () => navigate('/login')    
    const [subEvents, setSubEvents] = useState({})
    const [dynamicNavLinks, setDynamicNavLinks] = useState([])
    
    const dispatch = useDispatch()
    
    // Redux selectors
    const { mainEvents = [] } = useSelector(state => state.events || {})
    const { subEvents: reduxSubEvents = [] } = useSelector(state => state.subEvents || {})
    
    // جلب صلاحيات المستخدم من Redux
    const { checkPermission, userRole } = usePermissions()

    // جلب بيانات الأحداث من Redux
    useEffect(() => {
        dispatch(fetchMainEvents())
        dispatch(fetchSubEvents())
    }, [dispatch])
    
    // تحديث الروابط الديناميكية عند تغيير البيانات
    useEffect(() => {
        if (mainEvents.length === 0) {
            setSubEvents({})
            setDynamicNavLinks([])
            return
        }
        
        const eventsMap = {}
        const dynamicLinks = []
        
        // معالجة الأحداث الرئيسية والفرعية
        for (const event of mainEvents) {
            try {
                // فلترة الأحداث الفرعية لهذا الحدث الرئيسي
                const validSubEvents = reduxSubEvents.filter(se => se.main_event === event.id || se.main_event_id === event.id)
                
                // تحويل اسم الحدث إلى مسار مناسب
                let path = ''
                // استخدام event_link إذا كان متوفراً، وإلا الاسم العربي
                if (event.event_link && event.event_link.trim()) {
                    path = `/${event.event_link.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`
                } else {
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
                    icon: event.event_icon || null,
                    to: path,
                    type: "main-event",
                    isFromAPI: true
                })
            } catch (error) {
                console.error(`❌ خطأ في معالجة الحدث ${event.event_name}:`, error)
            }
        }
        
        setSubEvents(eventsMap)
        setDynamicNavLinks(dynamicLinks)
    }, [mainEvents, reduxSubEvents])

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
                        <Icon name="LayoutDashboard" size={24} />
                        <span>لوحة التحكم</span>
                    </NavLink>
                </li>
                
                {/* الأحداث الأساسية من API */}
                {dynamicNavLinks.map((link, index) => (
                    <li key={index}>
                        <NavLink to={link.to} className="link">
                            {link.icon && <Icon name={link.icon} size={24} />}
                            <span>{link.name}</span>
                        </NavLink>
                    </li>
                ))}
                
                {/* ملاحظة: تم إزالة الأحداث الجديدة المضافة من localStorage لأنها تُحمل من API الآن */}
                
                {/* إدارة الأحداث - ممنوع على USER */}
                {checkPermission('MANAGE_EVENTS') && (
                    <li>
                        <NavLink to="/events-management" className="link">
                            <Icon name="Calendar" size={24} />
                            <span>إدارة الأحداث</span>
                        </NavLink>
                    </li>
                )}
            </ul>

            <div className="mt-auto space-y-4">
                <WebSocketStatus />

                <Button className="bg-transparent border-rose-400 border text-rose-400 hover:bg-rose-400/10 cursor-pointer w-full" onClick={handleLogout}>
                    <Icon name="LogOut" size={20} />
                    <span>تسجيل خروج</span>
                </Button>
            </div>
        </nav>
    )
}

export default SideBar