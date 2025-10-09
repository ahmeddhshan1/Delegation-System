import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react/dist/iconify.js"
import AllMembersFilter from "./AllMembersFilter"
import MembersReportExport from "./MembersReportExport"
import { toast } from "sonner"

const AllMembersTableToolbar = ({ table, data, onCleanup }) => {
    const cleanupOrphanedMembers = () => {
        try {
            const savedDelegations = localStorage.getItem('delegations')
            const savedMembers = localStorage.getItem('members')
            
            if (savedDelegations && savedMembers) {
                const delegations = JSON.parse(savedDelegations)
                const members = JSON.parse(savedMembers)
                
                const delegationIds = delegations.map(d => d.id)
                const validMembers = members.filter(member => {
                    if (member.delegation && member.delegation.id) {
                        return delegationIds.includes(member.delegation.id)
                    }
                    return true
                })
                
                const deletedCount = members.length - validMembers.length
                
                if (deletedCount > 0) {
                    localStorage.setItem('members', JSON.stringify(validMembers))
                    // إرسال حدث لتحديث البيانات فوراً
                    window.dispatchEvent(new CustomEvent('memberDeleted'))
                    window.dispatchEvent(new CustomEvent('localStorageUpdated'))
                    toast.success(`تم حذف ${deletedCount} عضو معلق`)
                    if (onCleanup) onCleanup()
                } else {
                    toast.info('لا توجد أعضاء معلقة')
                }
            } else {
                toast.warning('لا توجد بيانات للتنظيف')
            }
        } catch (error) {
            console.error('خطأ في تنظيف الأعضاء:', error)
            toast.error('حدث خطأ أثناء تنظيف الأعضاء')
        }
    }

    const updateMemberEventData = () => {
        try {
            const savedMembers = localStorage.getItem('members')
            const savedDelegations = localStorage.getItem('delegations')
            const savedEventCategories = localStorage.getItem('eventCategories')

            if (savedMembers && savedMembers !== '[]') {
                const members = JSON.parse(savedMembers)
                const delegations = savedDelegations ? JSON.parse(savedDelegations) : []
                
                // استخراج الأحداث الفرعية من mainEvents (البيانات الحقيقية)
                let subEvents = []
                const savedMainEvents = localStorage.getItem('mainEvents')
                if (savedMainEvents) {
                    const mainEvents = JSON.parse(savedMainEvents)
                    mainEvents.forEach(mainEvent => {
                        if (mainEvent.sub_events && Array.isArray(mainEvent.sub_events)) {
                            mainEvent.sub_events.forEach(subEvent => {
                                subEvents.push({
                                    id: subEvent.id,
                                    name: subEvent.name,
                                    mainEventId: mainEvent.id,
                                    mainEventName: mainEvent.name
                                })
                            })
                        }
                    })
                }
                

                let updatedCount = 0

                // تحديث معلومات الأحداث للأعضاء
                const updatedMembers = members.map(member => {
                    let updatedMember = { ...member }
                    let needsUpdate = false

                    // البحث عن معلومات الحدث الرئيسي والفرعي من خلال الوفد
                    let subEventId = member.subEventId // من العضو مباشرة
                    
                    // إذا لم يوجد subEventId في العضو، ابحث في الوفد
                    if (!subEventId && member.delegation && member.delegation.id) {
                        const delegation = delegations.find(d => d.id === member.delegation.id)
                        if (delegation) {
                            if (delegation.subEventId) {
                                subEventId = delegation.subEventId
                                needsUpdate = true
                            }
                        }
                    }
                    
                    if (subEventId) {
                        const subEvent = subEvents.find(se => se.id == subEventId) // استخدام == للتحويل بين string و number
                        if (subEvent) {
                            updatedMember.subEvent = {
                                id: subEvent.id,
                                name: subEvent.name,
                                mainEventId: subEvent.mainEventId
                            }
                            
                            // البحث عن الحدث الرئيسي
                            if (subEvent.mainEventId) {
                                const mainEvent = eventCategories.find(me => me.id === subEvent.mainEventId)
                                if (mainEvent) {
                                    updatedMember.subEvent.mainEventName = mainEvent.name
                                }
                            }
                            
                            if (needsUpdate) {
                                updatedMember.subEventId = subEventId
                                updatedCount++
                            }
                        }
                    }

                    return updatedMember
                })

                // إذا لم يتم تحديث أي عضو، جرب إصلاح الـ IDs
                if (updatedCount === 0 && subEvents.length > 0) {
                    
                    // تحديث subEventId في الأعضاء لتطابق أول حدث فرعي
                    const firstSubEvent = subEvents[0]
                    const fixedMembers = updatedMembers.map(member => ({
                        ...member,
                        subEventId: firstSubEvent.id,
                        subEvent: {
                            id: firstSubEvent.id,
                            name: firstSubEvent.name,
                            mainEventId: firstSubEvent.mainEventId,
                            mainEventName: firstSubEvent.mainEventName
                        }
                    }))
                    
                    // تحديث subEventId في الوفود أيضاً
                    const fixedDelegations = delegations.map(delegation => ({
                        ...delegation,
                        subEventId: firstSubEvent.id
                    }))
                    
                    // حفظ البيانات المحدثة
                    localStorage.setItem('members', JSON.stringify(fixedMembers))
                    localStorage.setItem('delegations', JSON.stringify(fixedDelegations))
                    
                    // إرسال حدث للتحديث
                    window.dispatchEvent(new CustomEvent('localStorageUpdated'))
                    
                    toast.success(`تم إصلاح الـ IDs لجميع الأعضاء والوفود (${fixedMembers.length} عضو، ${fixedDelegations.length} وفد)`)
                } else {
                    // حفظ البيانات المحدثة
                    localStorage.setItem('members', JSON.stringify(updatedMembers))
                    
                    // إرسال حدث للتحديث
                    window.dispatchEvent(new CustomEvent('localStorageUpdated'))
                    
                    toast.success(`تم تحديث بيانات الأحداث لـ ${updatedCount} عضو`)
                }
            } else {
                toast.warning('لا توجد بيانات للأعضاء')
            }
        } catch (error) {
            console.error('خطأ في تحديث بيانات الأحداث:', error)
            toast.error('حدث خطأ أثناء تحديث بيانات الأحداث')
        }
    }


    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between py-4">
            <Input
                placeholder="بحث ..."
                value={table.getState().globalFilter ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="w-full sm:max-w-sm !ring-0"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <AllMembersFilter table={table} data={data} />
                <MembersReportExport data={data} />
            </div>
        </div>
    )
}

export default AllMembersTableToolbar

