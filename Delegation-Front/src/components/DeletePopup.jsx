import { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deleteDelegationData, deleteSubEventData, deleteMainEventData } from "../utils/cascadeDelete"

const DeletePopup = ({item, children, onDelete}) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmit = () => {
        setLoading(true)
        
        try {
            // تحديد الـ ID بناءً على نوع العنصر
            const itemId = item.original ? item.original.id : item.id


            
            // تحديد نوع العنصر بناءً على البيانات المتاحة
            if ((item.original && item.original.delegationHead) || item.delegationHead) {
                // حذف وفد مع جميع البيانات المرتبطة
                const deleteResult = deleteDelegationData(itemId)
                
                if (deleteResult.success) {
                    // حذف الوفد نفسه
                    const savedDelegations = localStorage.getItem('delegations')
                    if (savedDelegations) {
                        const delegations = JSON.parse(savedDelegations)
                        const updatedDelegations = delegations.filter(delegation => delegation.id !== itemId)
                        localStorage.setItem('delegations', JSON.stringify(updatedDelegations))
                        
                        window.dispatchEvent(new CustomEvent('delegationDeleted'))
                        toast.success('تم حذف الوفد وجميع البيانات المرتبطة به بنجاح')
                    }
                } else {
                    toast.error(deleteResult.message)
                    setLoading(false)
                    return
                }
            } else if ((item.original && item.original.sub_events) || item.sub_events) {
                // حذف حدث رئيسي
                
                // استدعاء دالة الحذف الممررة من المكون الأب (ستتعامل مع الحذف)
                onDelete && onDelete(itemId)
            } else if ((item.original && item.original.created_at) || item.created_at) {
                // حذف حدث فرعي

                
                // حذف جميع البيانات المرتبطة بالحدث الفرعي
                const deleteResult = deleteSubEventData(itemId)
                
                if (deleteResult.success) {
                    // استدعاء دالة الحذف الممررة من المكون الأب
                    onDelete && onDelete(itemId)
                    toast.success('تم حذف الحدث الفرعي وجميع البيانات المرتبطة به بنجاح')
                } else {
                    toast.error(deleteResult.message)
                    setLoading(false)
                    return
                }
            } else if ((item.original && item.original.name) || item.name) {
                // حذف عضو

                
                // حذف العضو من members
                const savedMembers = localStorage.getItem('members')
                if (savedMembers) {
                    const members = JSON.parse(savedMembers)
                    const memberToDelete = members.find(member => member.id === itemId)
                    const updatedMembers = members.filter(member => member.id !== itemId)
                    localStorage.setItem('members', JSON.stringify(updatedMembers))
                    

                    
                    // حذف العضو من جلسات المغادرة
                    if (memberToDelete && memberToDelete.delegation) {
                        const delegationId = memberToDelete.delegation.id

                        
                        // تحديث جلسات المغادرة في الوفد
                        const savedDelegations = localStorage.getItem('delegations')
                        if (savedDelegations) {
                            const delegations = JSON.parse(savedDelegations)
                            const delegationIndex = delegations.findIndex(d => d.id === delegationId)
                            
                            if (delegationIndex !== -1) {
                                const delegation = delegations[delegationIndex]
                                if (delegation.departureInfo && delegation.departureInfo.departureSessions) {
                                    // تحديث كل جلسة مغادرة
                                    const updatedSessions = delegation.departureInfo.departureSessions.map(session => {
                                        // إزالة العضو من الجلسة
                                        const updatedSessionMembers = session.members.filter(member => {
                                            // إذا كان member object كامل
                                            if (typeof member === 'object' && member.id) {
                                                return member.id !== itemId
                                            }
                                            // إذا كان member ID فقط
                                            return member !== itemId
                                        })
                                        
                                        return {
                                            ...session,
                                            members: updatedSessionMembers
                                        }
                                    }).filter(session => session.members.length > 0) // إزالة الجلسات الفارغة
                                    
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
                                    
                                    // تحديث الوفد
                                    delegations[delegationIndex] = {
                                        ...delegation,
                                        delegationStatus: newStatus,
                                        departureInfo: {
                                            ...delegation.departureInfo,
                                            totalMembers: parseInt(delegation.membersCount),
                                            departedMembers: totalDeparted,
                                            departureSessions: updatedSessions
                                        }
                                    }
                                    
                                    localStorage.setItem('delegations', JSON.stringify(delegations))

                                    
                                    // إرسال events لتحديث المكونات
                                    window.dispatchEvent(new CustomEvent('delegationUpdated'))
                                }
                            }
                        }
                    }
                    

                    window.dispatchEvent(new CustomEvent('memberDeleted'))
                    window.dispatchEvent(new CustomEvent('localStorageUpdated'))
                    
                    toast.success('تم حذف العضو من جميع جلسات المغادرة بنجاح')
                }
            } else if ((item.original && item.original.date) || item.date) {
                // حذف جلسة مغادرة

                if (onDelete) {
                    onDelete(itemId)
                    toast.success('تم حذف جلسة المغادرة بنجاح')
                } else {
                    toast.error('خطأ: لم يتم العثور على دالة الحذف')
                }
            } else if (onDelete) {
                // استخدام دالة الحذف المخصصة
                onDelete(itemId)
                toast.success('تم الحذف بنجاح')
            }
        } catch (error) {
            console.error('خطأ في الحذف:', error)
            toast.error('حدث خطأ أثناء الحذف')
        }
        
        setTimeout(() => {
            setLoading(false)
            setOpen(false)
        }, 1500)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] [&_[data-slot='dialog-close']]:!right-[95%]">
                <DialogHeader className="!text-start !py-2">
                    <DialogTitle>هل انت متأكد من حذفك لهذه البيانات ؟</DialogTitle>
                    <DialogDescription>
                        {((item.original && item.original.sub_events) || item.sub_events) 
                            ? "سيتم حذف الحدث الرئيسي وجميع الأحداث الفرعية والوفود والأعضاء المرتبطة به نهائياً"
                            : ((item.original && item.original.created_at) || item.created_at) 
                                ? "سيتم حذف الحدث الفرعي وجميع البيانات المرتبطة به نهائياً"
                                : "عند حذفك لتلك البيانات لن تستطيع استرجاعها ابدا , حيث سيتم محوها من قاعدة البيانات الخاصة بنا."
                        }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <DialogClose asChild>
                        <Button disabled={loading} variant="outline" className="cursor-pointer !ring-0">الغاء</Button>
                    </DialogClose>
                    <Button disabled={loading} type="submit" variant="destructive" className="cursor-pointer" onClick={onSubmit}>
                        {loading ? (
                            <>
                                <Icon icon="jam:refresh" className="animate-spin" />
                                <span>حذف ...</span>
                            </>
                        ) : (
                            <span>حذف</span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeletePopup
