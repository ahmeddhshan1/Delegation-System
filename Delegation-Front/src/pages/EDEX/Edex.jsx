import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Icon from '../../components/ui/Icon';
import AddEvent from "../../components/Events/AddEvent";
import EmptyEvent from "../../components/Events/EmptyEvent";
import EventsList from "../../components/Events/EventsList";
import { Button } from "@/components/ui/button"
import Stats from "../../components/Stats";
import { fetchMainEvents } from '../../store/slices/eventsSlice'
import { fetchSubEvents } from '../../store/slices/subEventsSlice'
import { fetchDelegations } from '../../store/slices/delegationsSlice'

const Edex = () => {
    const dispatch = useDispatch()
    const [currentEvent, setCurrentEvent] = useState(null);
    
    // Redux state
    const { mainEvents = [], loading: eventsLoading } = useSelector(state => state.events || {})
    const { subEvents = [], loading: subEventsLoading } = useSelector(state => state.subEvents || {})
    const { delegations = [], loading: delegationsLoading } = useSelector(state => state.delegations || {})
    
    // حساب الإحصائيات مع useMemo
    const stats = useMemo(() => ({
        delegationNum: delegations?.length || 0,
        militaryDelegationNum: delegations?.filter(d => d.delegation_type === 'military').length || 0,
        civilDelegationNum: delegations?.filter(d => d.delegation_type === 'civilian').length || 0,
        memebersNum: delegations?.reduce((total, d) => total + (d.current_members || 0), 0) || 0
    }), [delegations])

    useEffect(() => {
        // تحميل البيانات باستخدام Redux
        dispatch(fetchMainEvents())
        dispatch(fetchDelegations())
        
        // البحث عن حدث ايديكس من Redux state
        const edexEvent = mainEvents.find(event => 
            event.id === 1 || // ID الخاص بايديكس
            event.event_name === 'ايديكس' || 
            event.event_name === 'EDEX'
        );
        
        if (edexEvent) {
            setCurrentEvent(edexEvent);
            dispatch(fetchSubEvents(edexEvent.id));
        } else {
            setCurrentEvent(null);
        }
    }, [dispatch, mainEvents]);

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
                                <Icon name="Filter" size={20} />
                                <span>فلتر</span>
                            </Button>
                            <AddEvent />
                        </div>
                        <EventsList events={subEvents} mainEventName={currentEvent?.event_name} mainEventEnglishName={currentEvent?.event_link} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Edex;
