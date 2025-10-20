import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import AddEvent from "../../components/Events/AddEvent";
import EmptyEvent from "../../components/Events/EmptyEvent";
import EventsList from "../../components/Events/EventsList";
import { Button } from "@/components/ui/button"
import Stats from "../../components/Stats";
import { eventService, delegationService, memberService } from "../../services/api";

const Edex = () => {
    const [subEvents, setSubEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [stats, setStats] = useState({
        delegationNum: 0,
        militaryDelegationNum: 0,
        civilDelegationNum: 0,
        memebersNum: 0
    });

    useEffect(() => {
        const loadEvents = async () => {
            try {
                // جلب الأحداث من API
                const eventsResponse = await eventService.getMainEvents();
                const events = Array.isArray(eventsResponse?.results) ? eventsResponse.results : Array.isArray(eventsResponse) ? eventsResponse : [];
                
                // البحث عن حدث ايديكس بالـ ID أو الاسم
                const edexEvent = events.find(event => 
                    event.id === 1 || // ID الخاص بايديكس
                    event.event_name === 'ايديكس' || 
                    event.event_name === 'EDEX'
                );
                
                if (edexEvent) {
                    // جلب الأحداث الفرعية
                    const subEventsResponse = await eventService.getSubEvents(edexEvent.id);
                    const subEvents = Array.isArray(subEventsResponse?.results) ? subEventsResponse.results : Array.isArray(subEventsResponse) ? subEventsResponse : [];
                    
                    setSubEvents(subEvents);
                    setCurrentEvent(edexEvent);
                    
                    // حساب الإحصائيات الحقيقية
                    const subEventIds = subEvents.map(se => se.id);
                    
                    // جلب الوفود
                    const delegationsResponse = await delegationService.getDelegations();
                    const delegations = Array.isArray(delegationsResponse?.results) ? delegationsResponse.results : Array.isArray(delegationsResponse) ? delegationsResponse : [];
                    
                    const filteredDelegations = delegations.filter(d => 
                        subEventIds.includes(d.sub_event_id)
                    );
                    
                    const delegationCount = filteredDelegations.length;
                    const militaryCount = filteredDelegations.filter(d => d.type === 'MILITARY').length;
                    const civilCount = filteredDelegations.filter(d => d.type === 'CIVILIAN').length;
                    
                    // جلب الأعضاء
                    const membersResponse = await memberService.getMembers();
                    const members = Array.isArray(membersResponse?.results) ? membersResponse.results : Array.isArray(membersResponse) ? membersResponse : [];
                    
                    const filteredMembers = members.filter(m => 
                        subEventIds.includes(m.sub_event_id)
                    );
                    const memberCount = filteredMembers.length;
                    
                    setStats({
                        delegationNum: delegationCount,
                        militaryDelegationNum: militaryCount,
                        civilDelegationNum: civilCount,
                        memebersNum: memberCount
                    });
                } else {
                    setSubEvents([]);
                    setCurrentEvent(null);
                    setStats({
                        delegationNum: 0,
                        militaryDelegationNum: 0,
                        civilDelegationNum: 0,
                        memebersNum: 0
                    });
                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات الأحداث:', error);
                setSubEvents([]);
                setCurrentEvent(null);
                setStats({
                    delegationNum: 0,
                    militaryDelegationNum: 0,
                    civilDelegationNum: 0,
                    memebersNum: 0
                });
            }
        }
        
        loadEvents()
    }, []);

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
                        <EventsList events={subEvents} mainEventName={currentEvent?.name} mainEventEnglishName={currentEvent?.englishName} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Edex;
