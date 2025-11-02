import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import Icon from '../components/ui/Icon';
import { useSelector, useDispatch } from 'react-redux'
import EventsList from '../components/Events/EventsList'
import Stats from '../components/Stats'
import { fetchMainEvents } from '../store/slices/eventsSlice'
import { fetchStats } from '../store/slices/statsSlice'
import { fetchSubEvents } from '../store/slices/subEventsSlice'
import { fetchDelegations } from '../store/slices/delegationsSlice'
import { usePermissions } from '../store/hooks'

const Home = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { checkPermission } = usePermissions()
    const [latestSubEvents, setLatestSubEvents] = useState([])
    const [eventsLoading, setEventsLoading] = useState(true)
    
    // Redux state
    const { mainEvents = [], loading: eventsReduxLoading } = useSelector(state => state.events || {})
    const statsState = useSelector(state => state.stats || {})
    const { subEvents = [], loading: subEventsLoading } = useSelector(state => state.subEvents || {})
    const { delegations = [], loading: delegationsLoading } = useSelector(state => state.delegations || {})
    
    // Extract stats properly
    const stats = {
        delegation_stats: statsState.delegation_stats || {},
        member_stats: statsState.member_stats || {},
        event_stats: statsState.event_stats || {}
    }
    const statsLoading = statsState.loading

    useEffect(() => {
        // جلب البيانات باستخدام Redux مرة واحدة فقط
        dispatch(fetchStats())
        dispatch(fetchMainEvents())
        dispatch(fetchSubEvents())
        dispatch(fetchDelegations())
    }, [dispatch])
    
    // حساب آخر الأحداث مع useMemo للتحسين
    const latestSubEventsComputed = useMemo(() => {
        if (mainEvents.length === 0 || subEvents.length === 0) {
            return []
        }
        
        const allSubEvents = []
        
        for (const mainEvent of mainEvents) {
            try {
                const validSubEvents = subEvents.filter(subEvent => 
                    subEvent.main_event === mainEvent.id || subEvent.main_event_id === mainEvent.id
                )
                
                if (validSubEvents.length > 0) {
                    const subEventsWithCounts = validSubEvents.map(subEvent => {
                        const eventDelegations = delegations.filter(delegation => 
                            delegation.sub_event === subEvent.id || delegation.sub_event_id === subEvent.id
                        )
                        
                        const totalMembers = eventDelegations.reduce((total, delegation) => 
                            total + (delegation.current_members || 0), 0
                        )
                        
                        return {
                            ...subEvent,
                            mainEventName: mainEvent.event_name,
                            mainEventId: mainEvent.id,
                            mainEventIcon: mainEvent.event_icon,
                            mainEventLink: mainEvent.event_link,
                            delegationCount: eventDelegations.length,
                            membersCount: totalMembers
                        }
                    })
                    
                    allSubEvents.push(...subEventsWithCounts)
                }
            } catch (error) {
                console.error('خطأ في معالجة الأحداث الفرعية:', error)
            }
        }
        
        // ترتيب وأخذ آخر حدثين
        allSubEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        return allSubEvents.slice(0, 2)
    }, [mainEvents, subEvents, delegations])
    
    useEffect(() => {
        setLatestSubEvents(latestSubEventsComputed)
    }, [latestSubEventsComputed])
    
    // Separate effect for old async code cleanup
    useEffect(() => {
        let isMounted = true
        
        const legacyLoad = async () => {
            if (isMounted) {
                setEventsLoading(false)
            }
        }
        
        legacyLoad()
        
        return () => {
            isMounted = false
        }
    }, [])

    // WebSocket for MainEvent updates with auto-reconnect (only in production)
    useEffect(() => {
        // Disable in development to prevent reconnect loops
        if (import.meta.env.DEV) {
            return
        }
        
        // Check if WebSocket is enabled in env
        const wsEnabled = import.meta.env.VITE_ENABLE_WEBSOCKET === 'true'
        if (!wsEnabled) {
            return
        }

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/updates/'
        const reconnectInterval = Number(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 3000
        const maxReconnectAttempts = Number(import.meta.env.VITE_WS_RECONNECT_ATTEMPTS) || 5
        
        let ws = null
        let reconnectTimeout = null
        let reconnectAttempts = 0
        let isManualClose = false
        let debounceTimeout = null

        const connect = () => {
            // Don't reconnect if manually closed or max attempts reached
            if (isManualClose || reconnectAttempts >= maxReconnectAttempts) {
                if (reconnectAttempts >= maxReconnectAttempts) {
                    console.log(`⚠️ WebSocket max reconnect attempts (${maxReconnectAttempts}) reached. Stopped trying.`)
                }
                return
            }

            try {
                console.log(`🔌 Connecting to WebSocket: ${wsUrl} (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
                ws = new WebSocket(wsUrl)

                ws.onopen = () => {
                    console.log('✅ WebSocket connected successfully!')
                    reconnectAttempts = 0 // Reset counter on successful connection
                }

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)
                        console.log('📨 WebSocket message received:', data)
                        
                        // Handle MainEvent updates with debouncing
                        if (data.model === 'MainEvent') {
                            console.log('🔄 MainEvent updated, debouncing refresh...')
                            
                            // Clear previous debounce timeout
                            if (debounceTimeout) {
                                clearTimeout(debounceTimeout)
                            }
                            
                            // Debounce the refresh to prevent rapid-fire updates
                            debounceTimeout = setTimeout(() => {
                                console.log('🔄 Executing debounced MainEvent refresh...')
                                // Clear cache first to ensure fresh data
                                dispatch({ type: 'delegations/clearDelegationsCache' })
                                dispatch(fetchMainEvents())
                                dispatch(fetchSubEvents())
                                dispatch(fetchDelegations())
                                dispatch(fetchStats())
                            }, 1000) // 1 second debounce
                        }
                    } catch (error) {
                        console.error('❌ Error parsing WebSocket message:', error)
                    }
                }

                ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error)
                }

                ws.onclose = (event) => {
                    console.log(`🔌 WebSocket closed: code=${event.code}, reason=${event.reason || 'No reason'}`)
                    ws = null
                    
                    // Auto-reconnect if not manually closed
                    if (!isManualClose && reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++
                        console.log(`🔄 Reconnecting in ${reconnectInterval / 1000}s... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
                        reconnectTimeout = setTimeout(connect, reconnectInterval)
                    }
                }
            } catch (error) {
                console.error('❌ Error creating WebSocket:', error)
                // Retry connection
                if (!isManualClose && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++
                    reconnectTimeout = setTimeout(connect, reconnectInterval)
                }
            }
        }

        connect()

        return () => {
            isManualClose = true
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout)
            }
            if (debounceTimeout) {
                clearTimeout(debounceTimeout)
            }
            if (ws) {
                ws.close()
            }
        }
    }, [dispatch])

    return (
        <div className='content'>
            <Stats 
                delegationNum={stats?.delegation_stats?.total_delegations || 0} 
                militaryDelegationNum={stats?.delegation_stats?.military_delegations || 0} 
                civilDelegationNum={stats?.delegation_stats?.civilian_delegations || 0} 
                memebersNum={stats?.member_stats?.total_members || 0}
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
                                    let mainEventPath = ''
                                    if (subEvent.mainEventLink && subEvent.mainEventLink.trim()) {
                                        mainEventPath = subEvent.mainEventLink.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                                    } else {
                                        mainEventPath = subEvent.mainEventName.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                                    }
                                    navigate(`/${mainEventPath}/${subEvent.id}`)
                                }}
                            >
                                <div className="w-full border-b p-6 border-neutral-300 flex items-center gap-4 pb-6">
                                    <div className="w-18 h-18 rounded-full grid place-items-center bg-gradient-to-b from-[#F4CB00] to-[#F4B400]">
                                        <Icon name={subEvent.mainEventIcon || 'Calendar'} size={42} className="text-white" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="font-bold text-xl">{subEvent.event_name || subEvent.name}</h2>
                                        <div className="text-neutral-400 flex items-center gap-1">
                                            <Icon name="MapPin" size={20} />
                                            <span>{subEvent.mainEventName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full flex items-center gap-6 p-6 justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-neutral-100 grid place-items-center text-neutral-800">
                                            <Icon name="Calendar" size={26} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm text-neutral-400">التاريخ</span>
                                            <span className="font-medium">{new Date(subEvent.created_at).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-neutral-100 grid place-items-center text-neutral-800">
                                            <Icon name="Globe" size={26} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm text-neutral-400">عدد الوفود</span>
                                            <span className="font-medium">{subEvent.delegationCount || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-neutral-100 grid place-items-center text-neutral-800">
                                            <Icon name="Users" size={22} />
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
                        <Icon name="Calendar" size={64} className="mx-auto mb-6 text-neutral-400" />
                        <h3 className="text-xl font-semibold mb-2 text-neutral-700">لا توجد أحداث</h3>
                        <p className="text-neutral-500 mb-6">
                            لم يتم إنشاء أي أحداث بعد.
                            {checkPermission('MANAGE_EVENTS') && ' ابدأ بإنشاء أول حدث لك من خلال صفحة إدارة الأحداث.'}
                        </p>
                        {checkPermission('MANAGE_EVENTS') && (
                            <button 
                                onClick={() => navigate('/events-management')}
                                className="bg-primary-400 hover:bg-primary-500 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                            >
                                <Icon name="Plus" size={20} className="inline-block ml-2" />
                                إنشاء حدث جديد
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home