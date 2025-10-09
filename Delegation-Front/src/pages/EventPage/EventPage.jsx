import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { Icon } from "@iconify/react/dist/iconify.js"
import AddEvent from "../../components/Events/AddEvent"
import EmptyEvent from "../../components/Events/EmptyEvent"
import EventsList from "../../components/Events/EventsList"
import { Button } from "@/components/ui/button"
import Stats from "../../components/Stats"

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

    useEffect(() => {
        const loadEvents = () => {
            // جلب الأحداث الفرعية للحدث المحدد من localStorage
            const savedEvents = localStorage.getItem('mainEvents')
            if (savedEvents) {
                try {
                    const events = JSON.parse(savedEvents)
                    // البحث عن الحدث بالاسم
                    const event = events.find(e => {
                        // استخدام الاسم الإنجليزي إذا كان متوفراً، وإلا استخدم الاسم العربي
                        let eventPath = ''
                        if (e.englishName) {
                            eventPath = e.englishName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                        } else {
                            eventPath = e.name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                            // معالجة التاء المربوطة
                            if (eventPath.endsWith('ة')) {
                                eventPath = eventPath.slice(0, -1) + 'ه'
                            }
                        }
                        
                        // معالجة التاء المربوطة في المقارنة
                        let normalizedEventName = eventName
                        if (normalizedEventName.endsWith('ة')) {
                            normalizedEventName = normalizedEventName.slice(0, -1) + 'ه'
                        }
                        return eventPath === normalizedEventName
                    })
                    
                    if (event) {
                        setEventData(event)
                        if (event.sub_events) {
                            setSubEvents(event.sub_events)
                            
                            // حساب الإحصائيات الحقيقية
                            const subEventIds = event.sub_events.map(se => se.id)
                            
                            // جلب الوفود
                            const savedDelegations = localStorage.getItem('delegations')
                            let delegationCount = 0
                            let militaryCount = 0
                            let civilCount = 0
                            
                            if (savedDelegations) {
                                const delegations = JSON.parse(savedDelegations)
                                const filteredDelegations = delegations.filter(d => 
                                    subEventIds.includes(d.subEventId) || subEventIds.includes(parseInt(d.subEventId))
                                )
                                
                                delegationCount = filteredDelegations.length
                                militaryCount = filteredDelegations.filter(d => d.type === 'military').length
                                civilCount = filteredDelegations.filter(d => d.type === 'civil').length
                            }
                            
                            // جلب الأعضاء
                            const savedMembers = localStorage.getItem('members')
                            let memberCount = 0
                            
                            if (savedMembers) {
                                const members = JSON.parse(savedMembers)
                                const filteredMembers = members.filter(m => 
                                    subEventIds.includes(m.subEventId) || subEventIds.includes(parseInt(m.subEventId))
                                )
                                memberCount = filteredMembers.length
                            }
                            
                            setStats({
                                delegationNum: delegationCount,
                                militaryDelegationNum: militaryCount,
                                civilDelegationNum: civilCount,
                                memebersNum: memberCount
                            })
                        } else {
                            setSubEvents([])
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
                    console.error('خطأ في تحليل بيانات الأحداث:', error)
                    setEventData(null)
                    setSubEvents([])
                }
            } else {
                setEventData(null)
                setSubEvents([])
            }
        }
        
        loadEvents()
        
        // الاستماع لتغييرات localStorage
        const handleStorageChange = () => {
            loadEvents()
        }
        
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('eventAdded', handleStorageChange)
        window.addEventListener('eventDeleted', handleStorageChange)
        window.addEventListener('delegationAdded', handleStorageChange)
        window.addEventListener('delegationDeleted', handleStorageChange)
        window.addEventListener('memberAdded', handleStorageChange)
        window.addEventListener('memberDeleted', handleStorageChange)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('eventAdded', handleStorageChange)
            window.removeEventListener('eventDeleted', handleStorageChange)
            window.removeEventListener('delegationAdded', handleStorageChange)
            window.removeEventListener('delegationDeleted', handleStorageChange)
            window.removeEventListener('memberAdded', handleStorageChange)
            window.removeEventListener('memberDeleted', handleStorageChange)
        }
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
                            <AddEvent />
                        </div>
                        <EventsList events={subEvents} />
                    </>
                )}
            </div>
        </div>
    )
}

export default EventPage
