import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { Icon } from "@iconify/react/dist/iconify.js"
import AddEvent from "../../components/Events/AddEvent"
import EmptyEvent from "../../components/Events/EmptyEvent"
import EventsList from "../../components/Events/EventsList"
import { Button } from "@/components/ui/button"
import Stats from "../../components/Stats"
import { eventService, delegationService } from "../../services/api"

const EventPage = () => {
    const { eventName } = useParams()
    const [subEvents, setSubEvents] = useState([])
    const [eventData, setEventData] = useState(null)
    const [stats, setStats] = useState({
        delegationNum: 0,
        militaryDelegationNum: 0,
        civilDelegationNum: 0,
        memebersNum: 0
    })

    // دالة لإعادة تحميل الأحداث الفرعية عند إضافة حدث جديد
    const handleEventAdded = async () => {
        if (eventData) {
            try {
                const subEventsResponse = await eventService.getSubEvents(eventData.id)
                let validSubEvents = []
                
                if (subEventsResponse && subEventsResponse.results && Array.isArray(subEventsResponse.results)) {
                    validSubEvents = subEventsResponse.results
                } else if (Array.isArray(subEventsResponse)) {
                    validSubEvents = subEventsResponse
                }
                
                setSubEvents(validSubEvents)
            } catch (error) {
                console.error('خطأ في إعادة تحميل الأحداث الفرعية:', error)
            }
        }
    }

    useEffect(() => {
        const loadEvents = async () => {
            try {
                // جلب جميع الأحداث الرئيسية من API
                const mainEventsResponse = await eventService.getMainEvents()
                
                let mainEvents = []
                if (mainEventsResponse && mainEventsResponse.results && Array.isArray(mainEventsResponse.results)) {
                    mainEvents = mainEventsResponse.results
                } else if (Array.isArray(mainEventsResponse)) {
                    mainEvents = mainEventsResponse
                }
                
                // البحث عن الحدث المطلوب
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
                
                if (targetEvent) {
                    setEventData(targetEvent)
                    
                    // جلب الأحداث الفرعية
                    const subEventsResponse = await eventService.getSubEvents(targetEvent.id)
                    
                    let validSubEvents = []
                    if (subEventsResponse && subEventsResponse.results && Array.isArray(subEventsResponse.results)) {
                        validSubEvents = subEventsResponse.results
                    } else if (Array.isArray(subEventsResponse)) {
                        validSubEvents = subEventsResponse
                    }
                    
                    setSubEvents(validSubEvents)
                    
                    // حساب الإحصائيات
                    if (validSubEvents.length > 0) {
                        // جلب جميع الوفود
                        const allDelegationsResponse = await delegationService.getDelegations()
                        let allDelegations = []
                        if (allDelegationsResponse && allDelegationsResponse.results && Array.isArray(allDelegationsResponse.results)) {
                            allDelegations = allDelegationsResponse.results
                        } else if (Array.isArray(allDelegationsResponse)) {
                            allDelegations = allDelegationsResponse
                        }
                        
                        // فلترة الوفود للأحداث الفرعية
                        const subEventIds = validSubEvents.map(se => se.id)
                        const filteredDelegations = allDelegations.filter(d => 
                            subEventIds.includes(d.sub_event_id)
                        )
                        
                        // حساب الإحصائيات
                        const delegationCount = filteredDelegations.length
                        const militaryCount = filteredDelegations.filter(d => d.type === 'MILITARY').length
                        const civilCount = filteredDelegations.filter(d => d.type === 'CIVILIAN').length
                        const memberCount = filteredDelegations.reduce((sum, d) => sum + (d.current_members || 0), 0)
                            
                            setStats({
                                delegationNum: delegationCount,
                                militaryDelegationNum: militaryCount,
                                civilDelegationNum: civilCount,
                                memebersNum: memberCount
                            })
                        } else {
                            setStats({
                                delegationNum: 0,
                                militaryDelegationNum: 0,
                                civilDelegationNum: 0,
                                memebersNum: 0
                            })
                        }
                } else {
                        setEventData(null)
                        setSubEvents([])
                        setStats({
                            delegationNum: 0,
                            militaryDelegationNum: 0,
                            civilDelegationNum: 0,
                            memebersNum: 0
                        })
                    }
                } catch (error) {
                    setEventData(null)
                    setSubEvents([])
                setStats({
                    delegationNum: 0,
                    militaryDelegationNum: 0,
                    civilDelegationNum: 0,
                    memebersNum: 0
                })
            }
        }
        
        loadEvents()
    }, [eventName])

    if (!eventData) {
        return (
            <div className="content">
                <div className="text-center py-12 text-neutral-500">
                    <Icon icon="material-symbols:event" fontSize={64} className="mx-auto mb-4" />
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
                {subEvents.length === 0 ? (
                    <EmptyEvent />
                ) : (
                    <>
                        <div className="flex items-center gap-4 justify-between mb-6">
                            <Button variant="outline" className="!ring-0">
                                <Icon icon={'fluent:filter-32-filled'} />
                                <span>فلتر</span>
                            </Button>
                            <AddEvent onEventAdded={handleEventAdded} />
                        </div>
                        <EventsList 
                            events={subEvents} 
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
