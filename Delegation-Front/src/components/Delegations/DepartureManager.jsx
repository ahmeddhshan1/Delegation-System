import { useState, useEffect } from 'react'
import Icon from '../ui/Icon';
import { Button } from "@/components/ui/button"
import AddDepartureSession from './AddDepartureSession'
import DepartureSessionsList from './DepartureSessionsList'
import DepartureReportExport from './DepartureReportExport'
import { PermissionElement } from '../Permissions/PermissionGuard'
import { usePermissions } from '../../store/hooks'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMembers } from '../../store/slices/membersSlice'
import { fetchDepartureSessions, deleteDepartureSession } from '../../store/slices/delegationsSlice'

const DepartureManager = ({ delegation, onUpdate }) => {
    const dispatch = useDispatch()
    
    // Redux selectors
    const { departureSessions = [] } = useSelector(state => state.delegations)
    const { members = [] } = useSelector(state => state.members)
    
    // Filter members for this delegation and not departed
    const availableMembers = members.filter(m => {
        const matchesDelegation = m.delegation_id === delegation.id || m.delegation_id?.toString() === delegation.id?.toString()
        const isNotDeparted = m.status === 'NOT_DEPARTED'
        return matchesDelegation && isNotDeparted
    })

    // تحميل الجلسات والأعضاء المتاحين عبر Redux
    useEffect(() => {
        dispatch(fetchDepartureSessions(delegation.id))
        dispatch(fetchMembers(delegation.id))
    }, [delegation.id, dispatch])

    const reloadAll = async (notifyOthers = false) => {
        await dispatch(fetchDepartureSessions(delegation.id))
        await dispatch(fetchMembers(delegation.id))
        // إعلام بقية المكونات للتحديث (فقط لو طُلب ذلك)
        if (notifyOthers) {
            window.dispatchEvent(new CustomEvent('delegationUpdated'))
        }
    }

    // إعادة تحميل عند إشارات عامة من بقية المكونات (بدون infinite loop)
    useEffect(() => {
        const handler = () => { 
            // إعادة تحميل بس لو الفورم مش مفتوح
            if (!document.querySelector('[data-radix-dialog-content]')) {
                reloadAll(false) // مش هنبعت event تاني
            }
        }
        window.addEventListener('delegationUpdated', handler)
        return () => { window.removeEventListener('delegationUpdated', handler) }
    }, [delegation.id])

    const handleAddSession = async () => {
        await reloadAll(true) // نبعت event للآخرين
    }

    const handleUpdateSession = async () => {
        await reloadAll(true) // نبعت event للآخرين
    }

    const handleDeleteSession = async (sessionId) => {
        try {
            await dispatch(deleteDepartureSession(sessionId)).unwrap()
        } finally {
            await reloadAll(true) // نبعت event للآخرين
        }
    }

    const totalDeparted = departureSessions.reduce((total, session) => total + (Array.isArray(session.members) ? session.members.length : 0), 0)
    const remainingMembers = (parseInt(delegation.membersCount) || 0) - totalDeparted

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
                    <PermissionElement permission="EXPORT_REPORTS">
                        <DepartureReportExport delegation={delegation} departureSessions={departureSessions} />
                    </PermissionElement>
                    <AddDepartureSession 
                        delegation={delegation}
                        onAdd={handleAddSession}
                        remainingMembers={availableMembers.length}
                    />
                </div>
            </div>

            {departureSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Icon name="PlaneTakeoff" size={48} className="mx-auto mb-4" />
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
