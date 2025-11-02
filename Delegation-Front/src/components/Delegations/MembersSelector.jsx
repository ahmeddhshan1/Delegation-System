import { useEffect, useMemo } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import Icon from '../ui/Icon';
import { useSelector, useDispatch } from 'react-redux'
import { fetchMembers } from '../../store/slices/membersSlice'
import { toast } from "sonner"

const MembersSelector = ({ delegation, selected, onChange, isEditing = false, currentSessionId = null }) => {
    const dispatch = useDispatch()
    const { members } = useSelector(state => state.members)
    const { departureSessions = [] } = useSelector(state => state.delegations)
    
    // Get members who are already departed in other sessions
    const departedMembersInOtherSessions = useMemo(() => {
        const otherSessions = departureSessions.filter(session => 
            session.delegation_id === delegation.id && 
            session.id !== currentSessionId
        )
        
        const departedMemberIds = new Set()
        otherSessions.forEach(session => {
            if (session.members && Array.isArray(session.members)) {
                session.members.forEach(member => {
                    if (typeof member === 'object' && member.id) {
                        departedMemberIds.add(member.id)
                    } else if (typeof member === 'number' || typeof member === 'string') {
                        departedMemberIds.add(member)
                    }
                })
            }
        })
        
        return departedMemberIds
    }, [departureSessions, delegation.id, currentSessionId])

    // Filter members from Redux store
    const availableMembers = useMemo(() => {
        return members
            .filter(m => m.delegation_id === delegation.id || m.delegation_id?.toString() === delegation.id?.toString())
            // Show all members, including departed ones, so they can be selected/deselected
    }, [members, delegation.id])

    // Load members from Redux
    useEffect(() => {
        dispatch(fetchMembers(delegation.id))
    }, [dispatch, delegation.id])

    // Reload on delegation updates
    useEffect(() => {
        const reload = () => {
            dispatch(fetchMembers(delegation.id))
        }
        window.addEventListener('delegationUpdated', reload)
        return () => {
            window.removeEventListener('delegationUpdated', reload)
        }
    }, [dispatch, delegation.id])

    const handleSelectAll = () => {
        if (selected.length === selectableMembers.length) {
            onChange([])
        } else {
            onChange(selectableMembers.map(member => member.id))
        }
    }

    const handleMemberToggle = (memberId, checked) => {
        // Check if member is already departed in other sessions
        if (checked && departedMembersInOtherSessions.has(memberId)) {
            // In edit mode, only allow selection if member is already in current session
            // In add mode, never allow selection of departed members
            if (!isEditing || !selected.includes(memberId)) {
                toast.error("هذا العضو غادر بالفعل في جلسة مغادرة أخرى ولا يمكن اختياره")
                return
            }
        }

        if (checked) {
            const newSelected = [...selected, memberId]
            onChange(newSelected)
        } else {
            const newSelected = selected.filter(id => id !== memberId)
            onChange(newSelected)
        }
    }

    const selectableMembers = isEditing 
        ? availableMembers.filter(member => 
            !departedMembersInOtherSessions.has(member.id) || selected.includes(member.id)
          )
        : availableMembers.filter(member => !departedMembersInOtherSessions.has(member.id))
    
    const isAllSelected = selected.length === selectableMembers.length && selectableMembers.length > 0
    const isIndeterminate = selected.length > 0 && selected.length < selectableMembers.length
    const hasSelectableMembers = selectableMembers.length > 0

    return (
        <div className="border border-neutral-300 rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">الأعضاء المتاحون</h4>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={!hasSelectableMembers}
                    className="text-xs !ring-0"
                >
                    {isAllSelected ? 'إلغاء الكل' : 'اختيار الكل'}
                </Button>
            </div>

            {availableMembers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                    <Icon name="UserX" size={32} className="mx-auto mb-2" />
                    <p>لا يوجد أعضاء متاحين للمغادرة</p>
                    <p className="text-sm">جميع الأعضاء قد غادروا بالفعل</p>
                </div>
            ) : !isEditing && availableMembers.every(member => departedMembersInOtherSessions.has(member.id)) ? (
                <div className="text-center py-4 text-muted-foreground">
                    <Icon name="AlertCircle" size={32} className="mx-auto mb-2 text-orange-500" />
                    <p>جميع الأعضاء غادروا بالفعل في جلسات أخرى</p>
                    <p className="text-sm">لا يمكن إضافة جلسة مغادرة جديدة</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {availableMembers.map(member => {
                        const isDepartedInOtherSessions = departedMembersInOtherSessions.has(member.id)
                        const isCurrentlySelected = selected.includes(member.id)
                        const isSelectable = isEditing 
                            ? (!isDepartedInOtherSessions || isCurrentlySelected)
                            : !isDepartedInOtherSessions
                        
                        return (
                            <div 
                                key={member.id} 
                                className={`flex items-center gap-3 p-2 border rounded-xl ${
                                    isSelectable 
                                        ? 'border-neutral-300 hover:bg-neutral-50' 
                                        : 'border-red-200 bg-red-50 opacity-60'
                                }`}
                            >
                                <Checkbox 
                                    id={`member-${member.id}`}
                                    checked={selected.includes(member.id)}
                                    onCheckedChange={(checked) => handleMemberToggle(member.id, checked)}
                                    disabled={!isSelectable}
                                />
                                <div className="flex-1">
                                    <label 
                                        htmlFor={`member-${member.id}`}
                                        className={`flex items-center gap-2 ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    >
                                        <span className="font-medium">{member.rank}</span>
                                        <span>{member.name}</span>
                                        <span className="text-sm text-muted-foreground">({member.job_title})</span>
                                    </label>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {isDepartedInOtherSessions && !isCurrentlySelected ? (
                                        <span className="text-red-600">غادر في جلسة أخرى</span>
                                    ) : isDepartedInOtherSessions && isCurrentlySelected ? (
                                        <span className="text-orange-600">مغادر (مختار في هذه الجلسة)</span>
                                    ) : member.status === 'DEPARTED' && selected.includes(member.id) ? (
                                        <span className="text-orange-600">مغادر (مختار)</span>
                                    ) : (
                                        <span className="text-green-600">متاح</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {selected.length > 0 && (
                <div className="mt-4 p-3 bg-primary-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                        <Icon name="CheckCircle" size={20} className="text-primary-600" />
                        <span className="font-medium">تم اختيار {selected.length} عضو</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MembersSelector
