import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Icon } from "@iconify/react/dist/iconify.js"
import EventsList from '../components/Events/EventsList'
import Stats from '../components/Stats'

const Home = () => {
    const navigate = useNavigate()
    const [latestSubEvents, setLatestSubEvents] = useState([])
    const [stats, setStats] = useState({
        delegationNum: 0,
        militaryDelegationNum: 0,
        civilDelegationNum: 0,
        memebersNum: 0
    })

    useEffect(() => {
        const loadData = () => {
            // جلب آخر حدثين فرعيين من localStorage
            const savedEvents = localStorage.getItem('mainEvents')
            if (savedEvents) {
                try {
                    const events = JSON.parse(savedEvents)
                    const allSubEvents = []
                    
                    // جمع جميع الأحداث الفرعية من جميع الأحداث الرئيسية
                    events.forEach(mainEvent => {
                        if (mainEvent.sub_events && mainEvent.sub_events.length > 0) {
                            mainEvent.sub_events.forEach(subEvent => {
                                allSubEvents.push({
                                    ...subEvent,
                                    mainEventName: mainEvent.name,
                                    mainEventIcon: mainEvent.icon
                                })
                            })
                        }
                    })
                    
                    // ترتيب الأحداث حسب تاريخ الإنشاء (الأحدث أولاً)
                    allSubEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    
                    // أخذ آخر حدثين
                    setLatestSubEvents(allSubEvents.slice(0, 2))
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأحداث:', error)
                }
            }
            
            // جلب إحصائيات الوفود والأعضاء من localStorage
            const savedDelegations = localStorage.getItem('delegations')
            const savedMembers = localStorage.getItem('members')
            
            let delegationCount = 0
            let militaryCount = 0
            let civilCount = 0
            
            if (savedDelegations) {
                try {
                    const delegations = JSON.parse(savedDelegations)
                    delegationCount = delegations.length
                    militaryCount = delegations.filter(d => d.type === 'military').length
                    civilCount = delegations.filter(d => d.type === 'civil').length
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الوفود:', error)
                }
            }
            
            let memberCount = 0
            if (savedMembers) {
                try {
                    const members = JSON.parse(savedMembers)
                    memberCount = members.length
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأعضاء:', error)
                }
            }
            
            setStats({
                delegationNum: delegationCount,
                militaryDelegationNum: militaryCount,
                civilDelegationNum: civilCount,
                memebersNum: memberCount
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
        window.addEventListener('eventUpdated', handleStorageChange)
        
        return () => {
            window.removeEventListener('storage', (event) => {
                if (event.key === 'lastEventUpdate') {
                    handleStorageChange()
                }
            })
            window.removeEventListener('memberAdded', handleStorageChange)
            window.removeEventListener('eventUpdated', handleStorageChange)
        }
    }, [])

    return (
        <div className='content'>
            <Stats 
                delegationNum={stats.delegationNum} 
                militaryDelegationNum={stats.militaryDelegationNum} 
                civilDelegationNum={stats.civilDelegationNum} 
                memebersNum={stats.memebersNum} 
            />
            <div className='mt-8 bg-white border border-neutral-300 rounded-2xl p-6'>
                <div className='flex items-center gap-4 justify-between mb-6'>
                    <h2 className='text-2xl font-bold'>اخر الاحداث و المعارض</h2>
                </div>
                
                {latestSubEvents.length > 0 ? (
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
                                        <Icon icon={subEvent.mainEventIcon} fontSize={42} className="text-white" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="font-bold text-xl">{subEvent.name}</h2>
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