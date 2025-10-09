import { Icon } from "@iconify/react/dist/iconify.js"
import { NavLink, useNavigate } from "react-router"
import { events } from "../../constants"
import { useState, useEffect } from "react"


const EventsList = ({ events: customEvents, categoryId, mainEventName, mainEventEnglishName }) => {
    const navigate = useNavigate()
    const [eventsWithStats, setEventsWithStats] = useState([])
    
    // استخدام البيانات الممررة أو البيانات الافتراضية
    const eventsData = customEvents || events;
    
    // حساب الإحصائيات الحقيقية لكل حدث
    useEffect(() => {
        const calculateStats = () => {
            const updatedEvents = eventsData.map(event => {
                // جلب الوفود
                const savedDelegations = localStorage.getItem('delegations')
                let delegationCount = 0
                
                if (savedDelegations) {
                    try {
                        const delegations = JSON.parse(savedDelegations)
                        delegationCount = delegations.filter(d => 
                            d.subEventId === event.id || d.subEventId === parseInt(event.id)
                        ).length
                    } catch (error) {
                        console.error('خطأ في تحليل بيانات الوفود:', error)
                    }
                }
                
                // جلب الأعضاء
                const savedMembers = localStorage.getItem('members')
                let memberCount = 0
                
                if (savedMembers) {
                    try {
                        const members = JSON.parse(savedMembers)
                        memberCount = members.filter(m => 
                            m.subEventId === event.id || m.subEventId === parseInt(event.id)
                        ).length
                    } catch (error) {
                        console.error('خطأ في تحليل بيانات الأعضاء:', error)
                    }
                }
                
                return {
                    ...event,
                    delegationCount,
                    membersCount: memberCount,
                    date: event.date || new Date(event.created_at).toLocaleDateString('ar-EG')
                }
            })
            
            setEventsWithStats(updatedEvents)
        }
        
        calculateStats()
        
        // الاستماع لتغييرات localStorage
        const handleStorageChange = () => {
            calculateStats()
        }
        
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('delegationAdded', handleStorageChange)
        window.addEventListener('delegationDeleted', handleStorageChange)
        window.addEventListener('memberAdded', handleStorageChange)
        window.addEventListener('memberDeleted', handleStorageChange)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('delegationAdded', handleStorageChange)
            window.removeEventListener('delegationDeleted', handleStorageChange)
            window.removeEventListener('memberAdded', handleStorageChange)
            window.removeEventListener('memberDeleted', handleStorageChange)
        }
    }, [eventsData])
    
    return (
        <div className="flex flex-col gap-4">
            {
                eventsWithStats.map((event, index) => (
                    <div 
                        key={event.id || index} 
                        onClick={() => {
                            if (categoryId) {
                                navigate(`/category/${categoryId}/event/${event.id || index}`)
                            } else if (mainEventName) {
                                // التنقل إلى صفحة وفود الحدث الفرعي
                                let mainEventPath = ''
                                if (mainEventEnglishName) {
                                    // استخدام الاسم الإنجليزي إذا كان متوفراً
                                    mainEventPath = mainEventEnglishName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                                } else {
                                    // استخدام الاسم العربي كـ fallback (ديناميكي)
                                    mainEventPath = mainEventName.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                                }
                                navigate(`/${mainEventPath}/${event.id}`)
                            } else {
                                // استخدام مسار افتراضي ديناميكي
                                const defaultPath = event.mainEventName?.toLowerCase().replace(/\s+/g, '') || 'event'
                                navigate(`/${defaultPath}/${event.id}`)
                            }
                        }}
                        className="box bg-white w-full border border-neutral-300 rounded-xl flex flex-col transition-all ease-out hover:shadow cursor-pointer hover:border-primary-400"
                    >
                        <div className="w-full border-b p-6 border-neutral-300 flex items-center gap-4 pb-6">
                            <div className="w-18 h-18 rounded-full grid place-items-center bg-gradient-to-b from-[#F4CB00] to-[#F4B400]">
                                <Icon icon="stash:calendar-star-solid" fontSize={42} className="text-white" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="font-bold text-xl">{event.name}</h2>
                                <div className="text-neutral-400 flex items-center gap-1">
                                    <Icon icon={'mingcute:location-fill'} fontSize={22} />
                                    <span>مركز مصر للمعارض الدولية</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex items-center gap-6 p-6 justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 grid place-items-center text-neutral-800">
                                    <Icon icon="solar:calendar-bold" fontSize={26} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-neutral-400">التاريخ</span>
                                    <span className="font-medium">{event.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 grid place-items-center text-neutral-800">
                                    <Icon icon={'fa:globe'} fontSize={26} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-neutral-400">عدد الوفود</span>
                                    <span className="font-medium">{event.delegationCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 grid place-items-center text-neutral-800">
                                    <Icon icon={'fa:users'} fontSize={22} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-neutral-400">عدد الاعضاء</span>
                                    <span className="font-medium">{event.membersCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default EventsList