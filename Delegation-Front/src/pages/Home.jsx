import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Icon } from "@iconify/react/dist/iconify.js"
import EventsList from '../components/Events/EventsList'
import Stats from '../components/Stats'
import { dashboardService, eventService, delegationService } from '../services/api'

const Home = () => {
    const navigate = useNavigate()
    const [latestSubEvents, setLatestSubEvents] = useState([])
    const [statsData, setStatsData] = useState(null)
    const [statsLoading, setStatsLoading] = useState(true)
    const [eventsLoading, setEventsLoading] = useState(true)
    
    const stats = statsData || {
        delegation_stats: {
            total_delegations: 0,
            military_delegations: 0,
            civilian_delegations: 0
        },
        member_stats: {
            total_members: 0
        }
    }

    useEffect(() => {
        let isMounted = true // flag لتتبع حالة المكون
        
        // جلب الإحصائيات
        const fetchStats = async () => {
            try {
                if (isMounted) {
                    setStatsLoading(true)
                }
                const response = await dashboardService.getStats()
                if (isMounted) {
                    setStatsData(response)
                }
            } catch (error) {
                console.error('خطأ في جلب الإحصائيات:', error)
            } finally {
                if (isMounted) {
                    setStatsLoading(false)
                }
            }
        }

        fetchStats()

        const loadLatestSubEvents = async () => {
            // التحقق من أن المكون ما زال mounted
            if (!isMounted) return
            
            try {
                if (isMounted) {
                    setEventsLoading(true)
                }
                // جلب الأحداث الرئيسية من API
                const mainEventsResponse = await eventService.getMainEvents()
                
                if (!isMounted) return
                
                // التحقق من أن response يحتوي على results array
                let mainEvents = []
                if (mainEventsResponse && mainEventsResponse.results && Array.isArray(mainEventsResponse.results)) {
                    mainEvents = mainEventsResponse.results
                } else if (Array.isArray(mainEventsResponse)) {
                    // fallback للـ response القديم
                    mainEvents = mainEventsResponse
                } else {
                    console.warn('⚠️ API لم يرجع results array للأحداث الرئيسية في Home:', mainEventsResponse)
                    if (isMounted) {
                        setLatestSubEvents([])
                    }
                    return
                }
                
                const allSubEvents = []
                
                // جمع جميع الأحداث الفرعية من جميع الأحداث الرئيسية
                for (const mainEvent of mainEvents) {
                    try {
                        const subEventsResponse = await eventService.getSubEvents(mainEvent.id)
                        
                        if (!isMounted) return
                        
                        // التحقق من أن subEventsResponse يحتوي على results array
                        let validSubEvents = []
                        if (subEventsResponse && subEventsResponse.results && Array.isArray(subEventsResponse.results)) {
                            validSubEvents = subEventsResponse.results
                        } else if (Array.isArray(subEventsResponse)) {
                            validSubEvents = subEventsResponse
                        } else {
                            console.warn(`⚠️ API لم يرجع results array للأحداث الفرعية للحدث ${mainEvent.event_name}:`, subEventsResponse)
                            continue
                        }
                        
                        if (validSubEvents.length > 0) {
                            // جلب الوفود لجميع الأحداث الفرعية مرة واحدة باستخدام Promise.all
                            const delegationPromises = validSubEvents.map(async (subEvent) => {
                                try {
                                    const delegationsResponse = await delegationService.getDelegations({ sub_event_id: subEvent.id })
                                    
                                    let delegations = []
                                    if (delegationsResponse && delegationsResponse.results && Array.isArray(delegationsResponse.results)) {
                                        delegations = delegationsResponse.results
                                    } else if (Array.isArray(delegationsResponse)) {
                                        delegations = delegationsResponse
                                    }
                                    
                                    // حساب إجمالي عدد الأعضاء من جميع الوفود
                                    let totalMembers = 0
                                    delegations.forEach(delegation => {
                                        totalMembers += delegation.current_members || 0
                                    })
                                    
                                    return {
                                        ...subEvent,
                                        mainEventName: mainEvent.event_name,
                                        mainEventIcon: mainEvent.event_icon,
                                        delegationCount: delegations.length,
                                        membersCount: totalMembers
                                    }
                                } catch (delegationError) {
                                    console.error(`خطأ في جلب الوفود للحدث الفرعي ${subEvent.event_name}:`, delegationError)
                                    return {
                                        ...subEvent,
                                        mainEventName: mainEvent.event_name,
                                        mainEventIcon: mainEvent.event_icon,
                                        delegationCount: 0,
                                        membersCount: 0
                                    }
                                }
                            })
                            
                            // انتظار جميع الطلبات وتجميع النتائج
                            const subEventsWithCounts = await Promise.all(delegationPromises)
                            allSubEvents.push(...subEventsWithCounts)
                        }
                    } catch (subEventError) {
                        console.error('خطأ في جلب الأحداث الفرعية:', subEventError)
                        // متابعة مع الأحداث الأخرى حتى لو فشل أحدها
                    }
                }
                
                // ترتيب الأحداث حسب تاريخ الإنشاء (الأحدث أولاً)
                allSubEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                
                // أخذ آخر حدثين
                if (isMounted) {
                    setLatestSubEvents(allSubEvents.slice(0, 2))
                    setEventsLoading(false)
                }
            } catch (error) {
                console.error('خطأ في جلب آخر الأحداث:', error)
                if (isMounted) {
                    setLatestSubEvents([])
                    setEventsLoading(false)
                }
            }
        }
        
        loadLatestSubEvents()
        
        // ملاحظة: تم إزالة event listeners للـ localStorage لأننا نستخدم API الآن
        
        return () => {
            isMounted = false // تعيين flag إلى false عند cleanup
        }
    }, [])

    return (
        <div className='content'>
            <Stats 
                delegationNum={stats.delegation_stats?.total_delegations || 0} 
                militaryDelegationNum={stats.delegation_stats?.military_delegations || 0} 
                civilDelegationNum={stats.delegation_stats?.civilian_delegations || 0} 
                memebersNum={stats.member_stats?.total_members || 0}
                loading={statsLoading}
            />
            <div className='mt-8 bg-white border border-neutral-300 rounded-2xl p-6'>
                <div className='flex items-center gap-4 justify-between mb-6'>
                    <h2 className='text-2xl font-bold'>اخر الاحداث و المعارض</h2>
                </div>
                
                {eventsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        <span className="mr-3 text-neutral-500">جاري تحميل الأحداث...</span>
                    </div>
                ) : latestSubEvents.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {latestSubEvents.map((subEvent, index) => (
                            <div 
                                key={subEvent.id} 
                                className="box bg-white w-full border border-neutral-300 rounded-xl flex flex-col transition-all ease-out hover:shadow cursor-pointer hover:border-primary-400"
                                onClick={() => {
                                    // التنقل إلى صفحة وفود الحدث الفرعي
                                    const mainEventPath = subEvent.mainEventName.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                                    navigate(`/${mainEventPath}/${subEvent.id}`)
                                }}
                            >
                                <div className="w-full border-b p-6 border-neutral-300 flex items-center gap-4 pb-6">
                                    <div className="w-18 h-18 rounded-full grid place-items-center bg-gradient-to-b from-[#F4CB00] to-[#F4B400]">
                                        <Icon 
                                            icon={subEvent.mainEventIcon || 'material-symbols:event'} 
                                            fontSize={42} 
                                            className="text-white" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="font-bold text-xl">{subEvent.event_name || subEvent.name}</h2>
                                        <div className="text-neutral-400 flex items-center gap-1">
                                            <Icon icon={'mingcute:location-fill'} fontSize={22} />
                                            <span>{subEvent.mainEventName}</span>
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
                                            <span className="font-medium">{new Date(subEvent.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-neutral-100 grid place-items-center text-neutral-800">
                                            <Icon icon={'fa:globe'} fontSize={26} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm text-neutral-400">عدد الوفود</span>
                                            <span className="font-medium">{subEvent.delegationCount || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-neutral-100 grid place-items-center text-neutral-800">
                                            <Icon icon={'fa:users'} fontSize={22} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm text-neutral-400">عدد الاعضاء</span>
                                            <span className="font-medium">{subEvent.membersCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-neutral-500">
                        <Icon icon="material-symbols:event" fontSize={64} className="mx-auto mb-6 text-neutral-400" />
                        <h3 className="text-xl font-semibold mb-2 text-neutral-700">لا توجد أحداث</h3>
                        <p className="text-neutral-500 mb-6">
                            لم يتم إنشاء أي أحداث بعد. ابدأ بإنشاء أول حدث لك من خلال صفحة إدارة الأحداث.
                        </p>
                        <button 
                            onClick={() => navigate('/events-management')}
                            className="bg-primary-400 hover:bg-primary-500 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                        >
                            <Icon icon="material-symbols:add" className="inline-block ml-2" />
                            إنشاء حدث جديد
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home