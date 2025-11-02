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
import Icon from './ui/Icon'
import { Button } from "@/components/ui/button"
import { deleteDelegationData, deleteSubEventData, deleteMainEventData } from "../utils/cascadeDelete"
import { useSelector, useDispatch } from 'react-redux'
import { deleteDelegation } from '../store/slices/delegationsSlice'
import { deleteMember } from '../store/slices/membersSlice'

const DeletePopup = ({item, children, onDelete}) => {
    const dispatch = useDispatch()
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
                    await dispatch(deleteDelegation(itemId)).unwrap()
                    
                    // إرسال إشعار بالحذف
                    window.dispatchEvent(new CustomEvent('delegationDeleted'))
                    window.dispatchEvent(new CustomEvent('dataUpdated'))
                    window.dispatchEvent(new CustomEvent('refreshData'))
                } catch (error) {
                    console.error('خطأ في حذف الوفد:', error)
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
                } else {
                    setLoading(false)
                    return
                }
            } else if ((item.original && item.original.name) || item.name) {
                // حذف عضو - استدعاء دالة الحذف الممررة من المكون الأب
                onDelete && onDelete(itemId)
                
                // إطلاق إشارة لإعادة تحميل البيانات
                window.dispatchEvent(new CustomEvent('memberDeleted'))
                window.dispatchEvent(new CustomEvent('dataUpdated'))
                window.dispatchEvent(new CustomEvent('refreshData'))
                
            } else if ((item.original && item.original.date) || item.date) {
                // حذف جلسة مغادرة
                if (onDelete) {
                    onDelete(itemId)
                }
            } else if (onDelete) {
                // استخدام دالة الحذف المخصصة
                onDelete(itemId)
            }
        } catch (error) {
            console.error('خطأ في الحذف:', error)
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
                                <Icon name="RefreshCw" size={16} className="animate-spin" />
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
