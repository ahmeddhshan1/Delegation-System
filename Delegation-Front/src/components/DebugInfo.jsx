import { useSelector } from 'react-redux'

const DebugInfo = ({ eventName, subEventId }) => {
    const { mainEvents = [] } = useSelector(state => state.events || {})
    const { subEvents: subEventsFromEvents = [] } = useSelector(state => state.events || {})
    const { subEvents = [] } = useSelector(state => state.subEvents || {})
    const { delegations = [] } = useSelector(state => state.delegations || {})
    
    const allSubEvents = subEventsFromEvents.length > 0 ? subEventsFromEvents : subEvents
    
    return (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md z-50">
            <h3 className="font-bold mb-2">🐛 Debug Info</h3>
            <div className="space-y-1">
                <p><strong>URL Params:</strong></p>
                <p>• Event Name: {eventName}</p>
                <p>• Sub Event ID: {subEventId}</p>
                <br />
                <p><strong>Redux State:</strong></p>
                <p>• Main Events: {mainEvents.length}</p>
                <p>• Sub Events (Events): {subEventsFromEvents.length}</p>
                <p>• Sub Events (SubEvents): {subEvents.length}</p>
                <p>• Delegations: {delegations.length}</p>
                <br />
                <p><strong>Main Events:</strong></p>
                {mainEvents.map(event => (
                    <p key={event.id}>• {event.event_name} (ID: {event.id})</p>
                ))}
                <br />
                <p><strong>Sub Events:</strong></p>
                {allSubEvents.map(event => (
                    <p key={event.id}>• {event.event_name} (ID: {event.id})</p>
                ))}
                <br />
                <p><strong>Sub Event Details:</strong></p>
                {allSubEvents.filter(se => se.id.toString() === subEventId).map(event => (
                    <div key={event.id}>
                        <p>• Name: {event.event_name}</p>
                        <p>• Main Event ID: {event.main_event || event.main_event_id || 'None'}</p>
                        <p>• Main Event Name: {mainEvents.find(me => me.id === (event.main_event || event.main_event_id))?.event_name || 'Not Found'}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DebugInfo
