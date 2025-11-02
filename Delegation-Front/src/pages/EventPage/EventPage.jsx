import { useState, useEffect, useMemo } from "react"
import { useParams } from "react-router"
import { useSelector, useDispatch } from 'react-redux'
import Icon from '../../components/ui/Icon';
import AddEvent from "../../components/Events/AddEvent"
import EmptyEvent from "../../components/Events/EmptyEvent"
import EventsList from "../../components/Events/EventsList"
import { Button } from "@/components/ui/button"
import Stats from "../../components/Stats"
import { fetchSubEvents } from '../../store/slices/subEventsSlice'
import { fetchDelegations } from '../../store/slices/delegationsSlice'
import { fetchMainEvents } from '../../store/slices/eventsSlice'

const EventPage = () => {
    const dispatch = useDispatch()
    const { eventName } = useParams()
    const [eventData, setEventData] = useState(null)
    
    // Redux state
    const { subEvents = [], loading: subEventsLoading } = useSelector(state => state.subEvents || {})
    const { delegations = [], loading: delegationsLoading } = useSelector(state => state.delegations || {})
    const { mainEvents = [], loading: eventsLoading } = useSelector(state => state.events || {})
    
    // حساب الإحصائيات مع useMemo
    const stats = useMemo(() => ({
        delegationNum: delegations?.length || 0,
        militaryDelegationNum: delegations?.filter(d => d.delegation_type === 'military').length || 0,
        civilDelegationNum: delegations?.filter(d => d.delegation_type === 'civilian').length || 0,
        memebersNum: delegations?.reduce((total, d) => total + (d.current_members || 0), 0) || 0
    }), [delegations])

    // دالة لإعادة تحميل الأحداث الفرعية عند إضافة حدث جديد
    const handleEventAdded = () => {
        dispatch(fetchSubEvents())
        dispatch(fetchDelegations())
    }

    useEffect(() => {
        // تحميل البيانات باستخدام Redux
        dispatch(fetchMainEvents())
        dispatch(fetchSubEvents())
        dispatch(fetchDelegations())
    }, [dispatch])
    
    useEffect(() => {
        // البحث عن الحدث المطلوب من Redux state
        if (mainEvents.length > 0) {
            const targetEvent = mainEvents.find(event => {
                // إنشاء المسار من event_link أو event_name
                let eventPath = ''
                if (event.event_link && event.event_link.trim()) {
                    eventPath = event.event_link.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                } else {
                    eventPath = event.event_name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                }
                
                return eventPath === eventName
            })
            
            setEventData(targetEvent || null)
        }
    }, [eventName, mainEvents])

    // فلترة الأحداث الفرعية مع useMemo (MUST be before early return)
    const filteredSubEvents = useMemo(() => 
        subEvents.filter(se => 
            se.main_event === eventData?.id || se.main_event_id === eventData?.id
        )
    , [subEvents, eventData?.id])

    if (!eventData) {
        return (
            <div className="content">
                <div className="text-center py-12 text-neutral-500">
                    <Icon name="Calendar" size={64} className="mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">الحدث غير موجود</h3>
                    <p className="text-sm">الحدث المطلوب غير موجود في النظام</p>
                </div>
            </div>
        )
    }

    return (
        <div className="content">
            <Stats 
                delegationNum={stats.delegationNum} 
                militaryDelegationNum={stats.militaryDelegationNum} 
                civilDelegationNum={stats.civilDelegationNum} 
                memebersNum={stats.memebersNum} 
            />
            <div className="mt-8 bg-white border border-neutral-300 rounded-2xl p-6">
                {filteredSubEvents.length === 0 ? (
                    <EmptyEvent />
                ) : (
                    <>
                        <div className="flex items-center gap-4 justify-between mb-6">
                            <Button variant="outline" className="!ring-0">
                                <Icon name="Filter" size={20} />
                                <span>فلتر</span>
                            </Button>
                            <AddEvent onEventAdded={handleEventAdded} />
                        </div>
                        <EventsList 
                            events={filteredSubEvents} 
                            mainEventName={eventData.event_name} 
                            mainEventEnglishName={eventData.event_link}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default EventPage
