import { useState, useEffect } from 'react'
import Icon from '../../components/ui/Icon';
import { useSelector, useDispatch } from 'react-redux'
import MainEventManager from '../../components/Events/MainEventManager'
import SubEventManager from '../../components/Events/SubEventManager'
import { Button } from "@/components/ui/button"
import { PermissionGuard } from '../../components/Permissions/PermissionGuard'
import { PERMISSIONS } from '../../utils/permissions'
import { fetchMainEvents } from '../../store/slices/eventsSlice'
import { fetchStats } from '../../store/slices/statsSlice'
import { useWebSocket } from '../../contexts/WebSocketContext'

const EventsManagement = () => {
    const dispatch = useDispatch()
    const [selectedMainEvent, setSelectedMainEvent] = useState(null)
    const { isConnected: wsConnected } = useWebSocket()
    
    // Redux state
    const { mainEvents = [], loading: eventsLoading } = useSelector(state => state.events || {})
    const statsState = useSelector(state => state.stats || {})
    const stats = statsState || {}
    const statsLoading = statsState.loading

    // WebSocket is now handled globally - no need for local WebSocket code

    // تحميل البيانات باستخدام Redux
    useEffect(() => {
        dispatch(fetchStats())
        dispatch(fetchMainEvents())
    }, [dispatch])
    
    // إلغاء تحديد الحدث إذا كان محذوف
    useEffect(() => {
        if (selectedMainEvent && !mainEvents.find(e => e.id === selectedMainEvent.id)) {
            setSelectedMainEvent(null)
        }
    }, [mainEvents, selectedMainEvent])

    const handleMainEventAdded = (newEvent) => {
        // إعادة تحميل البيانات باستخدام Redux
        dispatch(fetchMainEvents())
        dispatch(fetchStats())
    }

    const handleMainEventUpdated = (eventId, updatedData) => {
        // إعادة تحميل البيانات باستخدام Redux
        dispatch(fetchMainEvents())
        dispatch(fetchStats())
    }

    const handleSubEventAdded = (mainEventId, newSubEvent) => {
        // إعادة تحميل البيانات باستخدام Redux
        dispatch(fetchStats())
    }

    const handleSubEventUpdated = (mainEventId, subEventId, updatedData) => {
        // إعادة تحميل البيانات باستخدام Redux
        dispatch(fetchStats())
    }

    const handleMainEventDeleted = (eventId) => {
        // إلغاء تحديد الحدث إذا كان محذوف
        if (selectedMainEvent && selectedMainEvent.id === eventId) {
            setSelectedMainEvent(null)
        }
        // إعادة تحميل البيانات باستخدام Redux
        dispatch(fetchMainEvents())
        dispatch(fetchStats())
    }

    const handleSubEventDeleted = (mainEventId, subEventId) => {
        // إعادة تحميل البيانات باستخدام Redux
        dispatch(fetchStats())
    }

    return (
        <PermissionGuard 
            requiredPermissions={[PERMISSIONS.MANAGE_EVENTS]}
            fallbackComponent={
                <div className="content">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center max-w-md">
                            <Icon name="Ban" size={20} className="text-6xl text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">غير مصرح لك بالوصول</h2>
                            <p className="text-neutral-600 mb-6">
                                ليس لديك الصلاحيات المطلوبة لإدارة الأحداث
                            </p>
                            <Button onClick={() => window.history.back()}>
                                العودة للصفحة السابقة
                            </Button>
                        </div>
                    </div>
                </div>
            }
        >
                   <div className="content h-screen flex flex-col overflow-y-auto">
                   
                   {/* الإحصائيات */}
                   <div className="flex gap-2 justify-between flex-shrink-0">
                       <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                           <div className="flex flex-col gap-1">
                               <span className="text-neutral-600">عدد الأحداث الرئيسية</span>
                               <h2 className="text-sky-700 font-bold text-5xl">
                                   {statsLoading ? '...' : stats?.event_stats?.total_main_events || 0}
                               </h2>
                               <span className="text-neutral-400 text-xs">
                                   اخر تحديث منذ {new Date().toLocaleDateString()}
                               </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-sky-100 grid place-items-center">
                                <Icon name="Calendar" size={28} className="text-sky-600" />
                           </div>
                       </div>
                       <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                           <div className="flex flex-col gap-1">
                               <span className="text-neutral-600">عدد الأحداث الفرعية</span>
                               <h2 className="text-orange-700 font-bold text-5xl">
                                   {statsLoading ? '...' : stats?.event_stats?.total_sub_events || 0}
                               </h2>
                               <span className="text-neutral-400 text-xs">
                                   اخر تحديث منذ {new Date().toLocaleDateString()}
                               </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-orange-100 grid place-items-center">
                               <Icon name="List" size={28} className="text-orange-600" />
                           </div>
                       </div>
                       <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                           <div className="flex flex-col gap-1">
                               <span className="text-neutral-600">عدد الوفود</span>
                               <h2 className="text-lime-700 font-bold text-5xl">
                                   {statsLoading ? '...' : stats?.event_stats?.total_delegations || 0}
                               </h2>
                               <span className="text-neutral-400 text-xs">
                                   اخر تحديث منذ {new Date().toLocaleDateString()}
                               </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-lime-100 grid place-items-center">
                               <Icon name="Globe" size={28} className="text-lime-600" />
                           </div>
                       </div>
                       <div 
                           className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between cursor-pointer hover:shadow-md transition-shadow"
                           onClick={() => window.location.href = '/all-members'}
                       >
                           <div className="flex flex-col gap-1">
                               <span className="text-neutral-600">عدد الأعضاء</span>
                               <h2 className="text-purple-700 font-bold text-5xl">
                                   {statsLoading ? '...' : stats?.event_stats?.total_members || 0}
                               </h2>
                               <span className="text-neutral-400 text-xs">
                                   اخر تحديث منذ {new Date().toLocaleDateString()}
                               </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-purple-100 grid place-items-center">
                               <Icon name="Users" size={28} className="text-purple-600" />
                           </div>
                       </div>
                   </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 mb-8 flex-1 min-h-0">
                {/* الأحداث الرئيسية */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-neutral-300 rounded-2xl p-6 flex flex-col" style={{ height: window.innerWidth < 768 ? '350px' : '420px' }}>
                        <MainEventManager 
                            events={mainEvents}
                            onEventAdded={handleMainEventAdded}
                            onEventUpdated={handleMainEventUpdated}
                            onEventDeleted={handleMainEventDeleted}
                            onEventSelected={setSelectedMainEvent}
                            selectedEvent={selectedMainEvent}
                        />
                    </div>
                </div>

                {/* الأحداث الفرعية */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-neutral-300 rounded-2xl p-6 flex flex-col" style={{ height: window.innerWidth < 768 ? '350px' : '420px' }}>
                        {selectedMainEvent ? (
                            <div className="mb-6 flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            {selectedMainEvent?.event_icon && (
                                                <Icon name={selectedMainEvent.event_icon} size={24} className="text-primary-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-neutral-800">
                                                {selectedMainEvent?.event_name}
                                            </h2>
                                            <p className="text-sm text-neutral-600">
                                                الأحداث الفرعية
                                            </p>
                                        </div>
                                    </div>
                                    
                                     <div className="flex gap-2">
                                         <Button 
                                             variant="outline" 
                                             size="sm"
                                             onClick={() => setSelectedMainEvent(null)}
                                         >
                                             <Icon name="X" size={16} />
                                             <span>إلغاء التحديد</span>
                                         </Button>
                                         <Button 
                                             size="sm"
                                             onClick={() => {
                                                 // فتح dialog إضافة حدث فرعي
                                                 const addButton = document.querySelector('[data-add-sub-event]')
                                                 if (addButton) {
                                                     addButton.click()
                                                 }
                                             }}
                                         >
                                             <Icon name="Plus" size={16} />
                                             <span>إضافة حدث فرعي</span>
                                         </Button>
                                     </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                                        <Icon name="CalendarDays" size={24} className="text-neutral-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-800">
                                            الأحداث الفرعية
                                        </h2>
                                        <p className="text-sm text-neutral-600">
                                            اختر حدث رئيسي لعرض الأحداث الفرعية
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ 
                            height: window.innerWidth < 768 ? '300px' : '420px', 
                            overflowY: 'scroll',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }} className="[&::-webkit-scrollbar]:hidden">
                            {selectedMainEvent ? (
                                <SubEventManager 
                                    mainEvent={selectedMainEvent}
                                    onSubEventAdded={handleSubEventAdded}
                                    onSubEventUpdated={handleSubEventUpdated}
                                    onSubEventDeleted={handleSubEventDeleted}
                                />
                            ) : (
                                <div className="text-center py-12 text-neutral-500">
                                    <Icon name="CalendarDays" size={64} className="mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">اختر حدث رئيسي</h3>
                                    <p className="text-sm">
                                        اختر حدث رئيسي من القائمة على اليسار لعرض وإدارة الأحداث الفرعية التابعة له
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
        </PermissionGuard>
    )
}

export default EventsManagement
