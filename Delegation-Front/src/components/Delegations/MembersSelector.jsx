import { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react/dist/iconify.js"
import { members } from "../../data"

const MembersSelector = ({ delegation, selected, onChange }) => {
    const [availableMembers, setAvailableMembers] = useState([])

    useEffect(() => {
        // تحميل الأعضاء من localStorage
        const loadMembers = () => {

            try {
                const savedMembers = localStorage.getItem('members')
                if (savedMembers) {
                    const parsedMembers = JSON.parse(savedMembers)

                    // تصفية الأعضاء الذين ينتمون لهذا الوفد ولم يغادروا بعد
                    // أو الأعضاء المختارين مسبقاً (للسماح بتعديل الجلسة)
                    const delegationMembers = parsedMembers.filter(member => {
                        if (!member.delegation || member.delegation.id !== delegation.id) {
                            return false
                        }
                        
                        // إذا كان العضو مختار مسبقاً (للتعديل)، اظهره حتى لو سافر
                        if (selected.includes(member.id)) {
                            return true
                        }
                        
                        // إذا لم يسافر بعد، اظهره
                        // في البيانات الافتراضية: "not_departed" = لم يغادر، "departed" = مغادر
                        return member.memberStatus !== 'departed'
                    })
                    

                    setAvailableMembers(delegationMembers)

                } else {
                    // استخدام البيانات الافتراضية إذا لم توجد بيانات محفوظة
                    const delegationMembers = members.filter(member => 
                        member.delegation.id === delegation.id && 
                        (member.memberStatus !== 'departed' || selected.includes(member.id))
                    )
                    setAvailableMembers(delegationMembers)

                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات الأعضاء:', error)
                // استخدام البيانات الافتراضية في حالة الخطأ
                const delegationMembers = members.filter(member => 
                    member.delegation.id === delegation.id && 
                    (member.memberStatus !== 'departed' || selected.includes(member.id))
                )
                setAvailableMembers(delegationMembers)
            }
        }

        loadMembers()
    }, [delegation.id, selected])

    // الاستماع لتغييرات الأعضاء
    useEffect(() => {
        const loadMembers = () => {

            try {
                const savedMembers = localStorage.getItem('members')
                if (savedMembers) {
                    const parsedMembers = JSON.parse(savedMembers)

                    // تصفية الأعضاء الذين ينتمون لهذا الوفد ولم يغادروا بعد
                    // أو الأعضاء المختارين مسبقاً (للسماح بتعديل الجلسة)
                    const delegationMembers = parsedMembers.filter(member => {
                        if (!member.delegation || member.delegation.id !== delegation.id) {
                            return false
                        }
                        
                        // إذا كان العضو مختار مسبقاً (للتعديل)، اظهره حتى لو سافر
                        if (selected.includes(member.id)) {
                            return true
                        }
                        
                        // إذا لم يسافر بعد، اظهره
                        // في البيانات الافتراضية: "not_departed" = لم يغادر، "departed" = مغادر
                        return member.memberStatus !== 'departed'
                    })
                    

                    setAvailableMembers(delegationMembers)

                } else {
                    // استخدام البيانات الافتراضية إذا لم توجد بيانات محفوظة
                    const delegationMembers = members.filter(member => 
                        member.delegation.id === delegation.id && 
                        (member.memberStatus !== 'departed' || selected.includes(member.id))
                    )
                    setAvailableMembers(delegationMembers)

                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات الأعضاء:', error)
                // استخدام البيانات الافتراضية في حالة الخطأ
                const delegationMembers = members.filter(member => 
                    member.delegation.id === delegation.id && 
                    (member.memberStatus !== 'departed' || selected.includes(member.id))
                )
                setAvailableMembers(delegationMembers)
            }
        }

        const handleMemberChange = (event) => {
            loadMembers()
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

    const handleSelectAll = () => {
        if (selected.length === availableMembers.length) {
            onChange([])
        } else {
            onChange(availableMembers.map(member => member.id))
        }
    }

    const handleMemberToggle = (memberId, checked) => {

        if (checked) {
            const newSelected = [...selected, memberId]

            onChange(newSelected)
        } else {
            const newSelected = selected.filter(id => id !== memberId)

            onChange(newSelected)
        }
    }

    const isAllSelected = selected.length === availableMembers.length
    const isIndeterminate = selected.length > 0 && selected.length < availableMembers.length

    return (
        <div className="border border-neutral-300 rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">الأعضاء المتاحون</h4>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs !ring-0"
                >
                    {isAllSelected ? 'إلغاء الكل' : 'اختيار الكل'}
                </Button>
            </div>

            {availableMembers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                    <Icon icon="material-symbols:person-off" fontSize={32} className="mx-auto mb-2" />
                    <p>لا يوجد أعضاء متاحين للمغادرة</p>
                    <p className="text-sm">جميع الأعضاء قد غادروا بالفعل</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {availableMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 border border-neutral-300 rounded-xl hover:bg-neutral-50">
                            <Checkbox 
                                id={`member-${member.id}`}
                                checked={selected.includes(member.id)}
                                onCheckedChange={(checked) => handleMemberToggle(member.id, checked)}
                            />
                            <div className="flex-1">
                                <label 
                                    htmlFor={`member-${member.id}`}
                                    className="cursor-pointer flex items-center gap-2"
                                >
                                    <span className="font-medium">{member.rank}</span>
                                    <span>{member.name}</span>
                                    <span className="text-sm text-muted-foreground">({member.role})</span>
                                </label>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {member.memberStatus === 'departed' && selected.includes(member.id) ? (
                                    <span className="text-orange-600">مغادر (مختار)</span>
                                ) : (
                                    <span className="text-green-600">متاح</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected.length > 0 && (
                <div className="mt-4 p-3 bg-primary-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                        <Icon icon="material-symbols:check-circle" className="text-primary-600" />
                        <span className="font-medium">تم اختيار {selected.length} عضو</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MembersSelector
