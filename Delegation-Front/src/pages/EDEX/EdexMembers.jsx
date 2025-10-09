import Members from "../../components/Members/Members"
import { useParams } from "react-router"
import { members, delegations } from "../../data"
import { formatTime } from "../../utils"
import DepartureManager from "../../components/Delegations/DepartureManager"
import { useState, useEffect } from "react"

const DelegationMembers = () => {
    const { eventName, subEventId, delegationId } = useParams()
    const [delegationMembers, setDelegationMembers] = useState([])
    const [selectedDelegation, setSelectedDelegation] = useState(null)
    
    // تحميل البيانات الحقيقية
    useEffect(() => {
        const loadData = () => {

            // تحميل الأعضاء من localStorage
            const savedMembers = localStorage.getItem('members')
            const savedDelegations = localStorage.getItem('delegations')
            if (savedMembers) {
                try {
                    const parsedMembers = JSON.parse(savedMembers)
                    const parsedDelegations = savedDelegations ? JSON.parse(savedDelegations) : []
                    const filteredMembers = parsedMembers.filter(member => 
                        member.delegation && member.delegation.id === delegationId
                    )
                    
                    // تحديث حالة الأعضاء بناءً على جلسات المغادرة
                    const updatedMembers = filteredMembers.map(member => {
                        const delegation = parsedDelegations.find(d => d.id === delegationId)
                        if (delegation && delegation.departureInfo && delegation.departureInfo.departureSessions) {
                            // البحث عن العضو في جلسات المغادرة
                            let departureDate = null
                            let isInDepartureSession = false
                            
                            for (const session of delegation.departureInfo.departureSessions) {
                                const memberInSession = session.members.find(sessionMember => {
                                    if (typeof sessionMember === 'object' && sessionMember.id) {
                                        return sessionMember.id === member.id
                                    }
                                    return sessionMember === member.id
                                })
                                
                                if (memberInSession) {
                                    isInDepartureSession = true
                                    departureDate = session.date
                                    break
                                }
                            }
                            
                            return {
                                ...member,
                                memberStatus: isInDepartureSession ? "departed" : "not_departed",
                                departureDate: departureDate
                            }
                        }
                        return { ...member, memberStatus: "not_departed", departureDate: null }
                    })
                    
                    setDelegationMembers(updatedMembers)

                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأعضاء:', error)
                    setDelegationMembers([])
                }
            } else {
                setDelegationMembers([])
            }
            
            // تحميل الوفود من localStorage أو استخدام البيانات الافتراضية
            if (savedDelegations) {
                try {
                    const parsedDelegations = JSON.parse(savedDelegations)
                    const delegation = parsedDelegations.find(d => d.id === delegationId)



                    if (delegation && delegation.departureInfo) {
                        // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
                    } else {
                        // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
                    }

                    setSelectedDelegation(delegation || null)
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الوفود:', error)
                    setSelectedDelegation(null)
                }
            } else {
                // استخدام البيانات الافتراضية للوفد
                const delegation = delegations.find(d => d.id === delegationId)
                setSelectedDelegation(delegation || null)
            }
        }
        
        loadData()
        
        // الاستماع لتغييرات localStorage
        const handleStorageChange = (event) => {



            loadData()
        }
        
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('memberAdded', handleStorageChange)
        window.addEventListener('memberDeleted', handleStorageChange)
        window.addEventListener('memberUpdated', handleStorageChange)
        window.addEventListener('localStorageUpdated', handleStorageChange)
        window.addEventListener('delegationUpdated', handleStorageChange)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('memberAdded', handleStorageChange)
            window.removeEventListener('memberDeleted', handleStorageChange)
            window.removeEventListener('memberUpdated', handleStorageChange)
            window.removeEventListener('localStorageUpdated', handleStorageChange)
            window.removeEventListener('delegationUpdated', handleStorageChange)
        }
    }, [delegationId])
    
    return (
        <div className="content">
            <div className="delegationDetails mb-6 p-4 bg-white border border-neutral-300 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">تفاصيل الوفد</h2>
                {selectedDelegation ? (
                    <div className="space-y-6">
                        {/* معلومات الوصول */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-primary-600">معلومات الوصول</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <span className="text-muted-foreground">الجنسية:</span>
                                    <p className="font-medium">{selectedDelegation.nationality}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">رئيس الوفد:</span>
                                    <p className="font-medium">{selectedDelegation.delegationHead}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">عدد الأعضاء:</span>
                                    <p className="font-medium">{selectedDelegation.membersCount}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">مطار الوصول:</span>
                                    <p className="font-medium">{selectedDelegation.arrivalInfo?.arrivalHall}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">شركة طيران الوصول:</span>
                                    <p className="font-medium">{selectedDelegation.arrivalInfo?.arrivalAirline}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">رقم رحلة الوصول:</span>
                                    <p className="font-medium">{selectedDelegation.arrivalInfo?.arrivalFlightNumber}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">قادمة من:</span>
                                    <p className="font-medium">{selectedDelegation.arrivalInfo?.arrivalOrigin}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">تاريخ الوصول:</span>
                                    <p className="font-medium">{selectedDelegation.arrivalInfo?.arrivalDate}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">سعت الوصول:</span>
                                    <p className="font-medium">{formatTime(selectedDelegation.arrivalInfo?.arrivalTime)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">مستقبل الوصول:</span>
                                    <p className="font-medium">{selectedDelegation.arrivalInfo?.arrivalReceptor}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">وجهة الوصول:</span>
                                    <p className="font-medium">{selectedDelegation.arrivalInfo?.arrivalDestination}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">شحنات الوصول:</span>
                                    <p className="font-medium">{selectedDelegation.arrivalInfo?.arrivalShipments}</p>
                                </div>
                            </div>
                        </div>

                        {/* إدارة المغادرات */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-primary-500">إدارة المغادرات</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <span className="text-muted-foreground">إجمالي الأعضاء:</span>
                                    <p className="font-medium">{selectedDelegation.departureInfo?.totalMembers || selectedDelegation.membersCount}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">عدد المغادرين:</span>
                                    <p className="font-medium">{selectedDelegation.departureInfo?.departedMembers || 0}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">المتبقون:</span>
                                    <p className="font-medium">{(selectedDelegation.departureInfo?.totalMembers || parseInt(selectedDelegation.membersCount)) - (selectedDelegation.departureInfo?.departedMembers || 0)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">عدد جلسات المغادرة:</span>
                                    <p className="font-medium">{selectedDelegation.departureInfo?.departureSessions?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-red-600">لم يتم العثور على الوفد المحدد</p>
                )}
            </div>
            
            {/* إدارة المغادرات */}
            {selectedDelegation && (
                <DepartureManager 
                    delegation={selectedDelegation}
                    onUpdate={(updatedDelegation) => {
                        // تحديث الوفد المحلي
                        setSelectedDelegation(updatedDelegation)


                        // إعادة تحميل بيانات الأعضاء
                        setTimeout(() => {
                            // يمكن إضافة منطق إعادة تحميل البيانات هنا
                        }, 100)
                    }}
                />
            )}
            
            
            <Members members={delegationMembers} showDelegationInfo={true} />
        </div>
    )
}

export default DelegationMembers
