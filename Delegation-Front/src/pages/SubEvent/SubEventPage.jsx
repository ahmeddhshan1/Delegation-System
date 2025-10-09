import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Icon } from "@iconify/react/dist/iconify.js"
import Delegations from "../../components/Delegations/Delegations"
import Stats from "../../components/Stats"

const SubEventPage = () => {
    const { eventName, subEventId } = useParams()
    const navigate = useNavigate()
    const [subEventData, setSubEventData] = useState(null)
    const [mainEventData, setMainEventData] = useState(null)
    const [filteredDelegations, setFilteredDelegations] = useState([])
    const [stats, setStats] = useState({
        delegationNum: 0,
        militaryDelegationNum: 0,
        civilDelegationNum: 0,
        memebersNum: 0
    })

    const loadData = useCallback(() => {
        // تحميل بيانات الأحداث
        const savedEvents = localStorage.getItem('mainEvents')
        if (savedEvents) {
            try {
                const events = JSON.parse(savedEvents)
                
                // البحث عن الحدث الفرعي في جميع الأحداث
                let foundSubEvent = null
                let foundMainEvent = null
                
                for (const event of events) {
                    const subEvent = event.sub_events?.find(se => se.id.toString() === subEventId)
                    if (subEvent) {
                        foundSubEvent = subEvent
                        foundMainEvent = event
                        break
                    }
                }
                
                if (foundSubEvent && foundMainEvent) {
                    setSubEventData(foundSubEvent)
                    setMainEventData(foundMainEvent)
                    
                    // إذا كان الحدث الرئيسي مختلف عن المحدد في الرابط، أعد التوجيه
                    let correctEventPath = ''
                    // استخدام الاسم الإنجليزي إذا كان متوفراً
                    if (foundMainEvent.englishName) {
                        correctEventPath = foundMainEvent.englishName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                    } else {
                        correctEventPath = foundMainEvent.name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                        // معالجة التاء المربوطة
                        if (correctEventPath.endsWith('ة')) {
                            correctEventPath = correctEventPath.slice(0, -1) + 'ه'
                        }
                    }
                    
                    if (correctEventPath !== eventName) {
                        navigate(`/${correctEventPath}/${subEventId}`, { replace: true })
                        return
                    }
                } else {
                    // إذا لم يتم العثور على الحدث الفرعي، جرب البحث في الحدث الرئيسي المحدد
                    let mainEvent = null
                    
                    // البحث في جميع الأحداث بناءً على المسار
                    mainEvent = events.find(e => {
                        let path = ''
                        if (e.englishName) {
                            path = e.englishName.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                        } else {
                            path = e.name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                            // معالجة التاء المربوطة
                            if (path.endsWith('ة')) {
                                path = path.slice(0, -1) + 'ه'
                            }
                        }
                        return path === eventName
                    })
                    
                    if (mainEvent) {
                        setMainEventData(mainEvent)
                        const subEvent = mainEvent.sub_events?.find(se => se.id.toString() === subEventId)
                        if (subEvent) {
                            setSubEventData(subEvent)
                        }
                    }
                }
            } catch (error) {
                console.error('خطأ في تحليل بيانات الأحداث:', error)
            }
        }
        
        // تحميل الوفود وفلترتها حسب الحدث الفرعي
        const savedDelegations = localStorage.getItem('delegations')
        if (savedDelegations) {
            try {
                const allDelegations = JSON.parse(savedDelegations)
                
                // فلترة الوفود حسب الحدث الفرعي
                const filtered = allDelegations.filter(delegation => 
                    delegation.subEventId === subEventId || delegation.subEventId === parseInt(subEventId)
                )
                
                setFilteredDelegations(filtered)
                
                // حساب الإحصائيات
                const militaryCount = filtered.filter(d => d.type === 'military').length
                const civilCount = filtered.filter(d => d.type === 'civil').length
                
                // حساب عدد الأعضاء
                const savedMembers = localStorage.getItem('members')
                let memberCount = 0
                if (savedMembers) {
                    const allMembers = JSON.parse(savedMembers)
                    memberCount = allMembers.filter(member => 
                        member.subEventId === subEventId || member.subEventId === parseInt(subEventId)
                    ).length
                }
                
                setStats({
                    delegationNum: filtered.length,
                    militaryDelegationNum: militaryCount,
                    civilDelegationNum: civilCount,
                    memebersNum: memberCount
                })
                
            } catch (error) {
                console.error('خطأ في تحليل بيانات الوفود:', error)
            }
        }
    }, [eventName, subEventId, navigate])

    useEffect(() => {
        loadData()
        
        // الاستماع لتغييرات localStorage
        const handleStorageChange = () => {
            loadData()
        }
        
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('memberAdded', handleStorageChange)
        window.addEventListener('memberDeleted', handleStorageChange)
        window.addEventListener('memberUpdated', handleStorageChange)
        window.addEventListener('delegationAdded', handleStorageChange)
        window.addEventListener('delegationDeleted', handleStorageChange)
        window.addEventListener('delegationUpdated', handleStorageChange)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('memberAdded', handleStorageChange)
            window.removeEventListener('memberDeleted', handleStorageChange)
            window.removeEventListener('memberUpdated', handleStorageChange)
            window.removeEventListener('delegationAdded', handleStorageChange)
            window.removeEventListener('delegationDeleted', handleStorageChange)
            window.removeEventListener('delegationUpdated', handleStorageChange)
        }
    }, [loadData])

    if (!subEventData || !mainEventData) {
        return (
            <div className="content">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Icon icon="material-symbols:event-note" className="text-6xl text-neutral-400 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">الحدث الفرعي غير موجود</h2>
                        <p className="text-neutral-600">يرجى التحقق من الرابط</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='content'>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <Icon icon={mainEventData.icon} fontSize={28} className="text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800">
                            {subEventData.name}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <Stats 
                delegationNum={stats.delegationNum} 
                militaryDelegationNum={stats.militaryDelegationNum} 
                civilDelegationNum={stats.civilDelegationNum} 
                memebersNum={stats.memebersNum} 
            />
            
            {/* Delegations Table */}
            <div className="mt-8">
                <Delegations 
                    subEventId={subEventId}
                />
            </div>
        </div>
    )
}

export default SubEventPage