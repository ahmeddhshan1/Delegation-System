import { Icon } from "@iconify/react/dist/iconify.js"
import { Button } from "@/components/ui/button"
import { formatTime } from "../../utils"
import DeletePopup from "../DeletePopup"
import EditDepartureSession from "./EditDepartureSession"
import { useState, useEffect } from 'react'
import { usePermissions } from '../../store/hooks'

const DepartureSessionsList = ({ sessions, delegation, onDelete, onUpdate }) => {
    const [updatedSessions, setUpdatedSessions] = useState(sessions)
    const { checkPermission } = usePermissions()
    
    // تحديث البيانات عند تغيير الأعضاء
    useEffect(() => {
        const updateMemberData = () => {
            // تم إزالة هذه الوظيفة لأننا نستخدم API الآن
            setUpdatedSessions(sessions)
        }
        
        updateMemberData()
        
        // الاستماع لتغييرات الأعضاء
        const handleMemberChange = () => {
            updateMemberData()
        }
        
        window.addEventListener('memberUpdated', handleMemberChange)
        window.addEventListener('memberAdded', handleMemberChange)
        window.addEventListener('memberDeleted', handleMemberChange)
        
        return () => {
            window.removeEventListener('memberUpdated', handleMemberChange)
            window.removeEventListener('memberAdded', handleMemberChange)
            window.removeEventListener('memberDeleted', handleMemberChange)
        }
    }, [sessions])
    
    if (updatedSessions.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-lg">جلسات المغادرة المسجلة</h4>
            
            {updatedSessions.map((session, index) => (
                <div key={session.id} className="border border-neutral-300 rounded-2xl p-4 bg-neutral-50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Icon icon="material-symbols:flight-takeoff" className="text-primary-600" />
                            <h5 className="font-medium">جلسة مغادرة #{index + 1}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {session.members.length} عضو
                            </span>
                            {/* جلب صلاحيات المستخدم من Redux */}
                            {checkPermission('EDIT_DEPARTURES') && (
                                <EditDepartureSession 
                                    session={session}
                                    delegation={delegation}
                                    onUpdate={onUpdate}
                                />
                            )}
                            {checkPermission('DELETE_DEPARTURES') && (
                                <DeletePopup 
                                    item={session}
                                    onDelete={() => onDelete(session.id)}
                                >
                                    <Button variant="outline" size="sm" className="!ring-0">
                                        <Icon icon="mynaui:trash" />
                                    </Button>
                                </DeletePopup>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">التاريخ:</span>
                            <p className="font-medium">{session.checkout_date || session.date}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">سعت:</span>
                            <p className="font-medium">{(session.checkout_time || session.time || '').toString().replace(':', '').slice(0,4)}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">المطار:</span>
                            <p className="font-medium">{session.airport_name || session.hall}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">شركة الطيران:</span>
                            <p className="font-medium">{session.airline_name || session.airline}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">رقم الرحلة:</span>
                            <p className="font-medium">{session.flight_number || session.flightNumber}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">مغادر إلى:</span>
                            <p className="font-medium">{session.city_name || session.destination}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">المودع:</span>
                            <p className="font-medium">{session.depositor_name || session.receptor}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">الشحنات:</span>
                            <p className="font-medium">{session.goods || session.shipments}</p>
                        </div>
                    </div>

                    {session.notes && (
                        <div className="mt-3 p-3 bg-white rounded-xl border">
                            <span className="text-muted-foreground font-medium">ملاحظات:</span>
                            <p className="text-foreground mt-1">{session.notes}</p>
                        </div>
                    )}

                    <div className="mt-3">
                        <span className="text-muted-foreground font-medium">الأعضاء المغادرون:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {session.members.map((member, index) => {
                                // إذا كان member object كامل
                                if (typeof member === 'object' && member.name) {
                                    return (
                                        <span 
                                            key={member.id || index}
                                            className="px-2 py-1 bg-primary-100 text-primary-800 rounded-xl text-xs"
                                        >
                                            {member.rank} {member.name}
                                        </span>
                                    )
                                }
                                // إذا كان member ID فقط، نحاول نلاقي الاسم من localStorage
                                else {
                                    const memberId = typeof member === 'object' ? member.id : member
                                    let memberName = `عضو #${memberId}`
                                    
                                    // تم إزالة تحديث البيانات من localStorage لأننا نستخدم API الآن
                                    
                                    return (
                                        <span 
                                            key={memberId || index}
                                            className="px-2 py-1 bg-primary-100 text-primary-800 rounded-xl text-xs"
                                        >
                                            {memberName}
                                        </span>
                                    )
                                }
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default DepartureSessionsList
