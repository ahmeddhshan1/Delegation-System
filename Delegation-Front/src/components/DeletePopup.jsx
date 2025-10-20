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
import { delegationService, memberService, departureSessionService } from "../services/api"

const DeletePopup = ({item, children, onDelete}) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmit = async () => {
        setLoading(true)
        
        try {
            // تحديد الـ ID بناءً على نوع العنصر
            const itemId = item.original ? item.original.id : item.id

            
            // تحديد نوع العنصر بناءً على البيانات المتاحة
            if ((item.original && item.original.delegationHead) || item.delegationHead) {
                // حذف وفد من API - سيحذف تلقائياً الأعضاء وجلسات المغادرة بسبب CASCADE
                try {
                    await delegationService.deleteDelegation(itemId)
                    
                    // إرسال إشعار بالحذف
                    window.dispatchEvent(new CustomEvent('delegationDeleted'))
                    toast.success('تم حذف الوفد وجميع البيانات المرتبطة به بنجاح')
                } catch (error) {
                    console.error('خطأ في حذف الوفد:', error)
                    toast.error('حدث خطأ أثناء حذف الوفد')
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
                // حذف عضو - استدعاء دالة الحذف الممررة من المكون الأب
                onDelete && onDelete(itemId)
                toast.success('تم حذف العضو بنجاح')
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
        } finally {
            setLoading(false)
            setOpen(false)
        }
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
