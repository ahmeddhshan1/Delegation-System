import { useState, useEffect } from 'react'
import { Icon } from "@iconify/react/dist/iconify.js"
import MainEventManager from '../../components/Events/MainEventManager'
import SubEventManager from '../../components/Events/SubEventManager'
import { Button } from "@/components/ui/button"
import { PermissionGuard } from '../../components/Permissions/PermissionGuard'
import { PERMISSIONS } from '../../utils/permissions'

const EventsManagement = () => {
    const [selectedMainEvent, setSelectedMainEvent] = useState(null)
    const [mainEvents, setMainEvents] = useState([])
    const [stats, setStats] = useState({
        totalDelegations: 0,
        totalMembers: 0
    })

    // تحميل البيانات من localStorage عند بدء الصفحة
    useEffect(() => {
        const loadData = () => {
            // تحميل الأحداث
            const savedEvents = localStorage.getItem('mainEvents')
            if (savedEvents) {
                try {
                    const events = JSON.parse(savedEvents)
                    setMainEvents(events)
                    
                    // إلغاء تحديد الحدث إذا كان محذوف
                    if (selectedMainEvent && !events.find(e => e.id === selectedMainEvent.id)) {
                        setSelectedMainEvent(null)
                    }
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأحداث:', error)
                    setMainEvents([])
                }
            } else {
                setMainEvents([])
            }
            
            // تحميل إحصائيات الوفود والأعضاء
            const savedDelegations = localStorage.getItem('delegations')
            const savedMembers = localStorage.getItem('members')
            
            let delegationCount = 0
            let memberCount = 0
            
            if (savedDelegations) {
                try {
                    const delegations = JSON.parse(savedDelegations)
                    delegationCount = delegations.length
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الوفود:', error)
                }
            }
            
            if (savedMembers) {
                try {
                    const members = JSON.parse(savedMembers)
                    memberCount = members.length
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأعضاء:', error)
                }
            }
            
            setStats({
                totalDelegations: delegationCount,
                totalMembers: memberCount
            })
        }
        
        loadData()
        
        // الاستماع لتغييرات localStorage
        const handleStorageChange = () => {
            loadData()
        }
        
        // الاستماع لتغييرات localStorage (للتابات الأخرى)
        window.addEventListener('storage', (event) => {
            if (event.key === 'lastEventUpdate') {
                handleStorageChange()
            }
        })
        
        // الاستماع للأحداث المخصصة (لنفس التابة)
        window.addEventListener('memberAdded', handleStorageChange)
        window.addEventListener('memberDeleted', handleStorageChange)
        window.addEventListener('memberUpdated', handleStorageChange)
        window.addEventListener('delegationAdded', handleStorageChange)
        window.addEventListener('delegationDeleted', handleStorageChange)
        window.addEventListener('delegationUpdated', handleStorageChange)
        window.addEventListener('eventAdded', handleStorageChange)
        window.addEventListener('eventDeleted', handleStorageChange)
        window.addEventListener('eventUpdated', handleStorageChange)
        
        return () => {
            window.removeEventListener('storage', (event) => {
                if (event.key === 'lastEventUpdate') {
                    handleStorageChange()
                }
            })
            window.removeEventListener('memberAdded', handleStorageChange)
            window.removeEventListener('memberDeleted', handleStorageChange)
            window.removeEventListener('memberUpdated', handleStorageChange)
            window.removeEventListener('delegationAdded', handleStorageChange)
            window.removeEventListener('delegationDeleted', handleStorageChange)
            window.removeEventListener('delegationUpdated', handleStorageChange)
            window.removeEventListener('eventAdded', handleStorageChange)
            window.removeEventListener('eventDeleted', handleStorageChange)
            window.removeEventListener('eventUpdated', handleStorageChange)
        }
    }, [])

    const handleMainEventAdded = (newEvent) => {
        const updatedEvents = [...mainEvents, newEvent]
        setMainEvents(updatedEvents)
        // حفظ في localStorage
        localStorage.setItem('mainEvents', JSON.stringify(updatedEvents))
    }

    const handleMainEventUpdated = (eventId, updatedData) => {
        const updatedEvents = mainEvents.map(event => 
            event.id === eventId 
                ? { ...event, ...updatedData }
                : event
        )
        setMainEvents(updatedEvents)
        // حفظ في localStorage
        localStorage.setItem('mainEvents', JSON.stringify(updatedEvents))
    }

    const handleSubEventAdded = (mainEventId, newSubEvent) => {
        const updatedEvents = mainEvents.map(event => 
            event.id === mainEventId 
                ? { 
                    ...event, 
                    sub_events: [...(event.sub_events || []), newSubEvent] 
                }
                : event
        )
        setMainEvents(updatedEvents)
        // حفظ في localStorage
        localStorage.setItem('mainEvents', JSON.stringify(updatedEvents))
    }

    const handleSubEventUpdated = (mainEventId, subEventId, updatedData) => {
        const updatedEvents = mainEvents.map(event => 
            event.id === mainEventId 
                ? { 
                    ...event, 
                    sub_events: event.sub_events?.map(subEvent => 
                        subEvent.id === subEventId 
                            ? { ...subEvent, ...updatedData }
                            : subEvent
                    ) || []
                }
                : event
        )
        setMainEvents(updatedEvents)
        // حفظ في localStorage
        localStorage.setItem('mainEvents', JSON.stringify(updatedEvents))
    }

    const handleMainEventDeleted = (eventId) => {
        const updatedEvents = mainEvents.filter(event => event.id !== eventId)
        setMainEvents(updatedEvents)
        
        // إلغاء تحديد الحدث إذا كان محذوف
        if (selectedMainEvent && selectedMainEvent.id === eventId) {
            setSelectedMainEvent(null)
        }
        
        // حفظ في localStorage
        localStorage.setItem('mainEvents', JSON.stringify(updatedEvents))
    }

    const handleSubEventDeleted = (mainEventId, subEventId) => {
        const updatedEvents = mainEvents.map(event => 
            event.id === mainEventId 
                ? { 
                    ...event, 
                    sub_events: event.sub_events?.filter(subEvent => subEvent.id !== subEventId) || []
                }
                : event
        )
        setMainEvents(updatedEvents)
        // حفظ في localStorage
        localStorage.setItem('mainEvents', JSON.stringify(updatedEvents))
    }

    return (
        <PermissionGuard 
            requiredPermissions={[PERMISSIONS.MANAGE_EVENTS]}
            fallbackComponent={
                <div className="content">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center max-w-md">
                            <Icon icon="material-symbols:block" className="text-6xl text-red-500 mb-4" />
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
                   <div className="content h-screen flex flex-col" style={{ overflow: 'hidden' }}>
                   {/* الإحصائيات */}
                   <div className="flex gap-2 justify-between flex-shrink-0">
                       <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                           <div className="flex flex-col gap-1">
                               <span className="text-neutral-600">الأحداث الرئيسية</span>
                               <h2 className="text-sky-700 font-bold text-5xl">{mainEvents.length}</h2>
                               <span className="text-neutral-400 text-xs">
                                   اخر تحديث منذ {new Date().toLocaleDateString()}
                               </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-sky-100 grid place-items-center">
                               <Icon icon="material-symbols:event" fontSize={28} className="text-sky-600" />
                           </div>
                       </div>
                       <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                           <div className="flex flex-col gap-1">
                               <span className="text-neutral-600">الأحداث الفرعية</span>
                               <h2 className="text-orange-700 font-bold text-5xl">
                                   {mainEvents.reduce((total, event) => total + (event.sub_events?.length || 0), 0)}
                               </h2>
                               <span className="text-neutral-400 text-xs">
                                   اخر تحديث منذ {new Date().toLocaleDateString()}
                               </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-orange-100 grid place-items-center">
                               <Icon icon="material-symbols:event-note" fontSize={28} className="text-orange-600" />
                           </div>
                       </div>
                       <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                           <div className="flex flex-col gap-1">
                               <span className="text-neutral-600">عدد الوفود</span>
                               <h2 className="text-lime-700 font-bold text-5xl">
                                   {stats.totalDelegations}
                               </h2>
                               <span className="text-neutral-400 text-xs">
                                   اخر تحديث منذ {new Date().toLocaleDateString()}
                               </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-lime-100 grid place-items-center">
                               <Icon icon="fa:globe" fontSize={28} className="text-lime-600" />
                           </div>
                       </div>
                       <div 
                           className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between cursor-pointer hover:shadow-md transition-shadow"
                           onClick={() => window.location.href = '/all-members'}
                       >
                           <div className="flex flex-col gap-1">
                               <span className="text-neutral-600">عدد الأعضاء</span>
                               <h2 className="text-purple-700 font-bold text-5xl">
                                   {stats.totalMembers}
                               </h2>
                               <span className="text-neutral-400 text-xs">
                                   اخر تحديث منذ {new Date().toLocaleDateString()}
                               </span>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-purple-100 grid place-items-center">
                               <Icon icon="fa:users" fontSize={28} className="text-purple-600" />
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
                                            <Icon icon={selectedMainEvent.icon} fontSize={24} className="text-primary-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-neutral-800">
                                                {selectedMainEvent.name}
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
                                             <Icon icon="material-symbols:close" fontSize={16} />
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
                                             <Icon icon="qlementine-icons:plus-16" fontSize={16} />
                                             <span>إضافة حدث فرعي</span>
                                         </Button>
                                     </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                                        <Icon icon="material-symbols:event-note" fontSize={24} className="text-neutral-600" />
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
                                    <Icon icon="material-symbols:event-note" fontSize={64} className="mx-auto mb-4" />
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
