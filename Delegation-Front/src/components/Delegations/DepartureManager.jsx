import { useState, useEffect } from 'react'
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button } from "@/components/ui/button"
import AddDepartureSession from './AddDepartureSession'
import DepartureSessionsList from './DepartureSessionsList'
import DepartureReportExport from './DepartureReportExport'

const DepartureManager = ({ delegation, onUpdate }) => {
    const [departureSessions, setDepartureSessions] = useState(
        delegation.departureInfo?.departureSessions || []
    )
    const [availableMembers, setAvailableMembers] = useState([])

    // تحميل البيانات من localStorage عند تحميل المكون
    useEffect(() => {
        const loadDepartureData = () => {
            try {
                const savedDelegations = localStorage.getItem('delegations')
                const savedMembers = localStorage.getItem('members')
                
                if (savedDelegations) {
                    const delegations = JSON.parse(savedDelegations)
                    const currentDelegation = delegations.find(d => d.id === delegation.id)
                    
                    if (currentDelegation && currentDelegation.departureInfo) {
                        setDepartureSessions(currentDelegation.departureInfo.departureSessions || [])

                    }
                }
                
                // تحميل الأعضاء المتاحين للمغادرة
                if (savedMembers) {
                    const members = JSON.parse(savedMembers)
                    const allDelegationMembers = members.filter(member => 
                        member.delegation && member.delegation.id === delegation.id
                    )
                    const delegationMembers = allDelegationMembers.filter(member => {
                        // إذا لم يسافر بعد، اظهره
                        return member.memberStatus !== 'departed'
                    })
                    
                    setAvailableMembers(delegationMembers)
                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات المغادرة:', error)
            }
        }

        loadDepartureData()
    }, [delegation.id])

    // تحديث الأعضاء المتاحين عند إضافة جلسة جديدة
    const updateAvailableMembers = () => {

        try {
            const savedMembers = localStorage.getItem('members')
            if (savedMembers) {
                const members = JSON.parse(savedMembers)

                const delegationMembers = members.filter(member => {
                    if (!member.delegation || member.delegation.id !== delegation.id) {
                        return false
                    }
                    // إذا لم يسافر بعد، اظهره
                    return member.memberStatus !== 'departed'
                })
                setAvailableMembers(delegationMembers)
            }
        } catch (error) {
            console.error('خطأ في تحديث الأعضاء المتاحين:', error)
        }
    }

    // الاستماع لتغييرات الأعضاء
    useEffect(() => {
        const handleMemberChange = (event) => {
            // تحديث جلسات المغادرة من localStorage
            try {
                const savedDelegations = localStorage.getItem('delegations')
                if (savedDelegations) {
                    const delegations = JSON.parse(savedDelegations)
                    const currentDelegation = delegations.find(d => d.id === delegation.id)
                    
                    if (currentDelegation && currentDelegation.departureInfo) {
                        const updatedSessions = currentDelegation.departureInfo.departureSessions || []

                        setDepartureSessions(updatedSessions)
                        
                        // تحديث الوفد في DelegationMembers
                        if (onUpdate) {
                            const totalDeparted = updatedSessions.reduce((total, session) => 
                                total + session.members.length, 0
                            )
                            const newStatus = totalDeparted === parseInt(currentDelegation.membersCount) 
                                ? 'all_departed' 
                                : totalDeparted > 0 
                                    ? 'partial_departed' 
                                    : 'not_departed'
                            
                            onUpdate({
                                ...currentDelegation,
                                delegationStatus: newStatus,
                                departureInfo: {
                                    ...currentDelegation.departureInfo,
                                    totalMembers: parseInt(currentDelegation.membersCount),
                                    departedMembers: totalDeparted,
                                    departureSessions: updatedSessions
                                }
                            })

                        }
                    }
                }
            } catch (error) {
                console.error('خطأ في تحديث جلسات المغادرة:', error)
            }
            
            // تحديث الأعضاء المتاحين
            updateAvailableMembers()
        }

        window.addEventListener('memberAdded', handleMemberChange)
        window.addEventListener('memberDeleted', handleMemberChange)
        window.addEventListener('memberUpdated', handleMemberChange)
        window.addEventListener('localStorageUpdated', handleMemberChange)



        return () => {
            window.removeEventListener('memberAdded', handleMemberChange)
            window.removeEventListener('memberDeleted', handleMemberChange)
            window.removeEventListener('memberUpdated', handleMemberChange)
            window.removeEventListener('localStorageUpdated', handleMemberChange)

        }
    }, [delegation.id])

    const handleAddSession = (newSession) => {
        const updatedSessions = [...departureSessions, newSession]
        setDepartureSessions(updatedSessions)
        
        // تحديث عدد المغادرين
        const totalDeparted = updatedSessions.reduce((total, session) => 
            total + session.members.length, 0
        )
        
        // تحديث حالة الوفد
        const newStatus = totalDeparted === parseInt(delegation.membersCount) 
            ? 'all_departed' 
            : totalDeparted > 0 
                ? 'partial_departed' 
                : 'not_departed'
        
        // تحديث بيانات الوفد في localStorage
        try {
            const savedDelegations = localStorage.getItem('delegations')
            if (savedDelegations) {
                const delegations = JSON.parse(savedDelegations)
                const delegationIndex = delegations.findIndex(d => d.id === delegation.id)
                
                if (delegationIndex !== -1) {
                    delegations[delegationIndex] = {
                        ...delegations[delegationIndex],
                        delegationStatus: newStatus,
                        departureInfo: {
                            ...delegations[delegationIndex].departureInfo,
                            totalMembers: parseInt(delegation.membersCount),
                            departedMembers: totalDeparted,
                            departureSessions: updatedSessions
                        }
                    }
                    
                    localStorage.setItem('delegations', JSON.stringify(delegations))

                    
                    // إرسال event لتحديث الوفد
                    window.dispatchEvent(new CustomEvent('delegationUpdated'))
                }
            }
        } catch (error) {
            console.error('خطأ في تحديث بيانات الوفد:', error)
        }
        
        // تحديث الأعضاء المتاحين
        updateAvailableMembers()
        
        if (onUpdate) {
            onUpdate({
                ...delegation,
                delegationStatus: newStatus,
                departureInfo: {
                    ...delegation.departureInfo,
                    totalMembers: parseInt(delegation.membersCount),
                    departedMembers: totalDeparted,
                    departureSessions: updatedSessions
                }
            })
        }
    }

    const handleUpdateSession = (updatedSession) => {
        const updatedSessions = departureSessions.map(session => 
            session.id === updatedSession.id ? updatedSession : session
        )
        setDepartureSessions(updatedSessions)
        
        // تحديث عدد المغادرين
        const totalDeparted = updatedSessions.reduce((total, session) => 
            total + session.members.length, 0
        )
        
        // تحديث حالة الوفد
        const newStatus = totalDeparted === parseInt(delegation.membersCount) 
            ? 'all_departed' 
            : totalDeparted > 0 
                ? 'partial_departed' 
                : 'not_departed'
        
        // تحديث بيانات الوفد في localStorage
        try {
            const savedDelegations = localStorage.getItem('delegations')
            if (savedDelegations) {
                const delegations = JSON.parse(savedDelegations)
                const delegationIndex = delegations.findIndex(d => d.id === delegation.id)
                
                if (delegationIndex !== -1) {
                    delegations[delegationIndex] = {
                        ...delegations[delegationIndex],
                        delegationStatus: newStatus,
                        departureInfo: {
                            ...delegations[delegationIndex].departureInfo,
                            totalMembers: parseInt(delegation.membersCount),
                            departedMembers: totalDeparted,
                            departureSessions: updatedSessions
                        }
                    }
                    
                    localStorage.setItem('delegations', JSON.stringify(delegations))

                    
                    // إرسال event لتحديث الوفد
                    window.dispatchEvent(new CustomEvent('delegationUpdated'))
                }
            }
        } catch (error) {
            console.error('خطأ في تحديث بيانات الوفد:', error)
        }
        
        // تحديث الأعضاء المتاحين
        updateAvailableMembers()
        
        if (onUpdate) {
            onUpdate({
                ...delegation,
                delegationStatus: newStatus,
                departureInfo: {
                    ...delegation.departureInfo,
                    totalMembers: parseInt(delegation.membersCount),
                    departedMembers: totalDeparted,
                    departureSessions: updatedSessions
                }
            })
        }
    }

    const handleDeleteSession = (sessionId) => {
        // الحصول على الجلسة المحذوفة
        const deletedSession = departureSessions.find(session => session.id === sessionId)
        if (deletedSession) {
            // إرجاع الأعضاء لحالة "لم يغادر"
            try {
                const savedMembers = localStorage.getItem('members')
                if (savedMembers) {
                    const members = JSON.parse(savedMembers)
                    
                    // الحصول على IDs الأعضاء في الجلسة المحذوفة
                    const memberIds = deletedSession.members.map(member => {
                        if (typeof member === 'object' && member.id) {
                            return member.id
                        }
                        return member
                    })
                    

                    
                       const updatedMembers = members.map(member => {
                           if (memberIds.includes(member.id)) {

                               return { 
                                   ...member, 
                                   memberStatus: 'not_departed',
                                   departureDate: null // إرجاع تاريخ المغادرة لـ null
                               }
                           }
                           return member
                       })
                    
                    localStorage.setItem('members', JSON.stringify(updatedMembers))
                    
                    // إرسال events لتحديث المكونات
                    window.dispatchEvent(new CustomEvent('memberUpdated'))
                    window.dispatchEvent(new CustomEvent('localStorageUpdated'))
                }
            } catch (error) {
                console.error('خطأ في إرجاع حالة الأعضاء:', error)
            }
        }
        
        // تحديث الأعضاء المتاحين بعد إرجاع حالة الأعضاء
        setTimeout(() => {
            updateAvailableMembers()
        }, 100)
        
        const updatedSessions = departureSessions.filter(session => session.id !== sessionId)

        setDepartureSessions(updatedSessions)
        
        // تحديث عدد المغادرين
        const totalDeparted = updatedSessions.reduce((total, session) => 
            total + session.members.length, 0
        )
        
        // تحديث حالة الوفد
        const newStatus = totalDeparted === parseInt(delegation.membersCount) 
            ? 'all_departed' 
            : totalDeparted > 0 
                ? 'partial_departed' 
                : 'not_departed'
        
        // تحديث بيانات الوفد في localStorage
        try {
            const savedDelegations = localStorage.getItem('delegations')
            if (savedDelegations) {
                const delegations = JSON.parse(savedDelegations)
                const delegationIndex = delegations.findIndex(d => d.id === delegation.id)
                
                if (delegationIndex !== -1) {
                    delegations[delegationIndex] = {
                        ...delegations[delegationIndex],
                        delegationStatus: newStatus,
                        departureInfo: {
                            ...delegations[delegationIndex].departureInfo,
                            totalMembers: parseInt(delegation.membersCount),
                            departedMembers: totalDeparted,
                            departureSessions: updatedSessions
                        }
                    }
                    
                    localStorage.setItem('delegations', JSON.stringify(delegations))

                    
                    // إرسال event لتحديث الوفد
                    window.dispatchEvent(new CustomEvent('delegationUpdated'))
                }
            }
        } catch (error) {
            console.error('خطأ في تحديث بيانات الوفد:', error)
        }
        
        // تحديث الأعضاء المتاحين
        updateAvailableMembers()
        
        if (onUpdate) {
            onUpdate({
                ...delegation,
                delegationStatus: newStatus,
                departureInfo: {
                    ...delegation.departureInfo,
                    totalMembers: parseInt(delegation.membersCount),
                    departedMembers: totalDeparted,
                    departureSessions: updatedSessions
                }
            })
        }
    }

    const totalDeparted = departureSessions.reduce((total, session) => 
        total + session.members.length, 0
    )
    const remainingMembers = parseInt(delegation.membersCount) - totalDeparted

    return (
        <div className="departure-management bg-white border border-neutral-300 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">إدارة المغادرات</h3>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium">المغادرون: {totalDeparted}</span>
                        <span className="mx-2">|</span>
                        <span className="font-medium">المتبقون: {remainingMembers}</span>
                        <span className="mx-2">|</span>
                        <span className="font-medium">المتاحون: {availableMembers.length}</span>
                    </div>
                    <DepartureReportExport delegation={delegation} />
                    <AddDepartureSession 
                        delegation={delegation}
                        onAdd={handleAddSession}
                        remainingMembers={availableMembers.length}
                    />
                </div>
            </div>

            {departureSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Icon icon="material-symbols:flight-takeoff" fontSize={48} className="mx-auto mb-4" />
                    <p>لم يتم تسجيل أي مغادرات بعد</p>
                    <p className="text-sm">اضغط على "إضافة جلسة مغادرة" لبدء تسجيل المغادرات</p>
                    {availableMembers.length === 0 && (
                        <p className="text-sm text-orange-600 mt-2">جميع الأعضاء قد غادروا بالفعل</p>
                    )}
                </div>
            ) : (
                <DepartureSessionsList 
                    sessions={departureSessions}
                    delegation={delegation}
                    onDelete={handleDeleteSession}
                    onUpdate={handleUpdateSession}
                />
            )}
        </div>
    )
}

export default DepartureManager
