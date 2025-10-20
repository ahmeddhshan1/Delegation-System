import { Icon } from "@iconify/react/dist/iconify.js"
import { NavLink, useNavigate } from "react-router"
import { events } from "../../constants"
import { useState, useEffect } from "react"
import { delegationService } from "../../services/api"


const EventsList = ({ events: customEvents, categoryId, mainEventName, mainEventEnglishName }) => {
    const navigate = useNavigate()
    const [eventsWithStats, setEventsWithStats] = useState([])
    
    // استخدام البيانات الممررة أو البيانات الافتراضية
    const eventsData = customEvents || events;
    
    // حساب الإحصائيات الحقيقية لكل حدث من API
    useEffect(() => {
        const calculateStats = async () => {
            try {
                // جلب جميع الوفود من API
                const delegationsResponse = await delegationService.getDelegations()
                let allDelegations = []
                
                if (delegationsResponse && delegationsResponse.results && Array.isArray(delegationsResponse.results)) {
                    allDelegations = delegationsResponse.results
                } else if (Array.isArray(delegationsResponse)) {
                    allDelegations = delegationsResponse
                }
                
                // حساب الإحصائيات لكل حدث
                const updatedEvents = eventsData.map(event => {
                    const eventDelegations = allDelegations.filter(delegation => 
                        delegation.sub_event_id === event.id
                    )
                    
                    const totalMembers = eventDelegations.reduce((sum, delegation) => 
                        sum + (delegation.current_members || 0), 0
                    )
                    
                    return {
                        ...event,
                        delegationCount: eventDelegations.length,
                        membersCount: totalMembers,
                        date: event.date || new Date(event.created_at).toLocaleDateString('ar-EG')
                    }
                })
                
                setEventsWithStats(updatedEvents)
            } catch (error) {
                console.error('خطأ في جلب الإحصائيات:', error)
                // في حالة الخطأ، استخدم البيانات بدون إحصائيات
                const updatedEvents = eventsData.map(event => ({
                    ...event,
                    delegationCount: 0,
                    membersCount: 0,
                    date: event.date || new Date(event.created_at).toLocaleDateString('ar-EG')
                }))
                setEventsWithStats(updatedEvents)
            }
        }
        
        calculateStats()
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
                                <h2 className="font-bold text-xl">{event.event_name || event.name}</h2>
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