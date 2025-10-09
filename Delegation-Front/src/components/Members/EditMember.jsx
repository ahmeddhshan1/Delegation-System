import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Icon } from "@iconify/react/dist/iconify.js"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { militaryPositions } from "../../utils/militaryPositions"

const EditMember = ({ member, children }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [selectedEquivalentPosition, setSelectedEquivalentPosition] = useState("")
    const [showAddPosition, setShowAddPosition] = useState(false)
    const [newPosition, setNewPosition] = useState("")
    const [availablePositions, setAvailablePositions] = useState(militaryPositions)
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteItem, setDeleteItem] = useState(null)

    const validationSchema = yup.object({
        rank: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        name: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        role: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        equivalentRole: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
    })

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            rank: "",
            name: "",
            role: "",
            equivalentRole: "",
        }
    })

    const handleEquivalentPositionChange = (value) => {
        setSelectedEquivalentPosition(value)
        setValue('equivalentRole', value)
    }

    const handleAddNewPosition = () => {
        if (newPosition.trim() && !availablePositions.includes(newPosition.trim())) {
            const updatedPositions = [...availablePositions, newPosition.trim()].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailablePositions(updatedPositions)
            
            // حفظ في localStorage
            localStorage.setItem('militaryPositions', JSON.stringify(updatedPositions))
            
            // إرسال custom event لتحديث الفورمات الأخرى
            window.dispatchEvent(new CustomEvent('positionsUpdated'))
            
            setSelectedEquivalentPosition(newPosition.trim())
            setValue('equivalentRole', newPosition.trim())
            setNewPosition("")
            setShowAddPosition(false)
            toast.success("تم إضافة المنصب الجديد بنجاح")
        } else if (availablePositions.includes(newPosition.trim())) {
            toast.error("هذا المنصب موجود بالفعل")
        } else {
            toast.error("يرجى إدخال اسم المنصب")
        }
    }

    // دالة حذف المنصب العسكري
    const handleDeletePosition = (position) => {
        setDeleteItem({
            type: 'position',
            name: position,
            onDelete: () => {
                // حذف من قائمة المناصب
                const updatedPositions = availablePositions.filter(p => p !== position)
                setAvailablePositions(updatedPositions)
                
                // حفظ في localStorage
                localStorage.setItem('militaryPositions', JSON.stringify(updatedPositions))
                
                // إرسال custom event لتحديث الفورمات الأخرى
                window.dispatchEvent(new CustomEvent('positionsUpdated'))
                
                // إذا كان المنصب المحذوف هو المحدد حالياً، امسح التحديد
                if (selectedEquivalentPosition === position) {
                    setSelectedEquivalentPosition("")
                    setValue('equivalentRole', "")
                }
                
                toast.success("تم حذف المنصب العسكري بنجاح")
                setDeleteItem(null)
            }
        })
    }

    // تصفية المناصب حسب البحث
    const filteredPositions = availablePositions.filter(position =>
        position.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const onSubmit = handleSubmit((data) => {
        setLoading(true)
        
        try {
            // جلب الأعضاء الحاليين من localStorage
            const savedMembers = localStorage.getItem('members')
            if (savedMembers) {
                const members = JSON.parse(savedMembers)
                const memberIndex = members.findIndex(m => m.id === member.id)
                
                if (memberIndex !== -1) {
                    // تحديث بيانات العضو
                    members[memberIndex] = {
                        ...members[memberIndex],
                        rank: data.rank,
                        name: data.name,
                        role: data.role,
                        equivalentRole: data.equivalentRole,
                        job: data.equivalentRole, // للتوافق مع النظام الحالي
                    }
                    
                    // حفظ القائمة المحدثة
                    localStorage.setItem('members', JSON.stringify(members))
                    
                    // إرسال event لتحديث الصفحة
                    window.dispatchEvent(new CustomEvent('memberUpdated'))
                    window.dispatchEvent(new CustomEvent('localStorageUpdated'))
                    
                    toast.success('تم تحديث بيانات العضو بنجاح')
                }
            }
        } catch (error) {
            console.error('خطأ في تحديث العضو:', error)
            toast.error('حدث خطأ أثناء تحديث العضو')
        }
        
        setTimeout(() => {
            setLoading(false)
            setOpen(false)
        }, 1500)
    })

    // تحديث البيانات عند فتح الحوار
    useEffect(() => {
        if (open && member) {
            setValue('rank', member.rank || '')
            setValue('name', member.name || '')
            setValue('role', member.role || '')
            setValue('equivalentRole', member.equivalentRole || '')
            setSelectedEquivalentPosition(member.equivalentRole || '')
        }
    }, [open, member, setValue])

    useEffect(() => {
        if (!open) {
            reset()
            setSelectedEquivalentPosition("")
            setShowAddPosition(false)
            setNewPosition("")
            setSearchTerm("")
        }
    }, [open, reset])

    // تحميل المناصب العسكرية من localStorage في البداية
    useEffect(() => {
        const savedPositions = localStorage.getItem('militaryPositions')
        if (savedPositions) {
            try {
                const positions = JSON.parse(savedPositions)
                setAvailablePositions(positions)
            } catch (error) {
                console.error('خطأ في تحليل المناصب العسكرية:', error)
                // استخدام المناصب الافتراضية في حالة الخطأ
                setAvailablePositions(militaryPositions)
            }
        } else {
            // إذا لم توجد مناصب محفوظة، استخدم الافتراضية
            setAvailablePositions(militaryPositions)
        }
    }, [])

    // الاستماع لتحديث المناصب العسكرية من الفورمات الأخرى
    useEffect(() => {
        const handlePositionsUpdated = () => {
            const savedPositions = localStorage.getItem('militaryPositions')
            if (savedPositions) {
                try {
                    const positions = JSON.parse(savedPositions)
                    setAvailablePositions(positions)
                } catch (error) {
                    console.error('خطأ في تحليل المناصب العسكرية:', error)
                }
            }
        }

        // الاستماع لتغييرات localStorage مباشرة
        const handleStorageChange = (e) => {
            if (e.key === 'militaryPositions' && e.newValue) {
                try {
                    const positions = JSON.parse(e.newValue)
                    setAvailablePositions(positions)
                } catch (error) {
                    console.error('خطأ في تحليل المناصب العسكرية:', error)
                }
            }
        }

        // الاستماع لتحديث الأعضاء (لإعادة تحميل البيانات عند الحاجة)
        const handleMemberUpdate = () => {
            // إعادة تحميل البيانات من localStorage
            const savedPositions = localStorage.getItem('militaryPositions')
            if (savedPositions) {
                try {
                    const positions = JSON.parse(savedPositions)
                    setAvailablePositions(positions)
                } catch (error) {
                    console.error('خطأ في تحليل المناصب العسكرية:', error)
                }
            }
        }

        window.addEventListener('positionsUpdated', handlePositionsUpdated)
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('memberAdded', handleMemberUpdate)
        window.addEventListener('memberDeleted', handleMemberUpdate)
        window.addEventListener('memberUpdated', handleMemberUpdate)
        
        return () => {
            window.removeEventListener('positionsUpdated', handlePositionsUpdated)
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('memberAdded', handleMemberUpdate)
            window.removeEventListener('memberDeleted', handleMemberUpdate)
            window.removeEventListener('memberUpdated', handleMemberUpdate)
        }
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[725px] max-h-[675px] [&_[data-slot='dialog-close']]:!right-[95%] overflow-auto">
                <DialogHeader className="!text-start !py-2">
                    <DialogTitle>تعديل بيانات العضو</DialogTitle>
                    <DialogDescription>
                        يمكنك تعديل بيانات العضو من هنا, حينما تنتهي من التعديل قم بضغط حفظ.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="grid gap-4">
                        <div className="w-full items-start flex gap-4">
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="rank">الرتبة</Label>
                                <input type="text" id="rank" name="rank" placeholder="ادخل رتبة العضو" {...register('rank')} />
                                {errors.rank && <span className="text-sm text-rose-400 block">{errors.rank.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="name">الاسم</Label>
                                <input type="text" id="name" name="name" placeholder="ادخل اسم العضو" {...register('name')} />
                                {errors.name && <span className="text-sm text-rose-400 block">{errors.name.message}</span>}
                            </div>
                        </div>
                        <div className="grid gap-3 w-full">
                            <Label htmlFor="role">الوظيفة</Label>
                            <input 
                                type="text" 
                                id="role" 
                                name="role" 
                                placeholder="مثال: مهندس، طبيب، محاسب، مدير" 
                                {...register('role')} 
                            />
                            {errors.role && <span className="text-sm text-rose-400 block">{errors.role.message}</span>}
                        </div>
                        
                        <div className="grid gap-3 w-full">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="equivalentRole">المنصب العسكري المعادل</Label>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowAddPosition(!showAddPosition)}
                                    className="text-xs"
                                >
                                    <Icon icon="qlementine-icons:plus-16" fontSize={14} />
                                    <span>إضافة منصب جديد</span>
                                </Button>
                            </div>
                            
                            {showAddPosition && (
                                <div className="flex gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                                    <input 
                                        type="text" 
                                        placeholder="أدخل اسم المنصب الجديد"
                                        value={newPosition}
                                        onChange={(e) => setNewPosition(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-sm"
                                    />
                                    <Button 
                                        type="button"
                                        size="sm"
                                        onClick={handleAddNewPosition}
                                        disabled={!newPosition.trim()}
                                    >
                                        <Icon icon="material-symbols:check" fontSize={16} />
                                    </Button>
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowAddPosition(false)
                                            setNewPosition("")
                                        }}
                                    >
                                        <Icon icon="material-symbols:close" fontSize={16} />
                                    </Button>
                                </div>
                            )}
                            
                            <Select value={selectedEquivalentPosition} onValueChange={handleEquivalentPositionChange}>
                                <SelectTrigger className="w-full text-right" dir="rtl">
                                    <SelectValue placeholder="ابحث واختر المنصب العسكري المعادل" />
                                </SelectTrigger>
                                <SelectContent className="text-right" dir="rtl">
                                    <div className="p-2 border-b border-neutral-200">
                                        <input 
                                            type="text" 
                                            placeholder="ابحث في المناصب العسكرية..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {filteredPositions.length > 0 ? (
                                            filteredPositions.map((position, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 hover:bg-neutral-100">
                                                    <SelectItem value={position} className="text-right flex-1" dir="rtl">
                                                        {position}
                                                    </SelectItem>
                                                    <button
                                                        type="button"
                                                        onPointerDown={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            handleDeletePosition(position)
                                                        }}
                                                        className="text-neutral-500 hover:text-neutral-700 p-1 rounded flex-shrink-0"
                                                        title="حذف المنصب العسكري"
                                                    >
                                                        <Icon icon="material-symbols:close" fontSize={16} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-neutral-500 text-center">
                                                لا توجد نتائج للبحث
                                            </div>
                                        )}
                                    </div>
                                </SelectContent>
                            </Select>
                            {errors.equivalentRole && <span className="text-sm text-rose-400 block">{errors.equivalentRole.message}</span>}
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button disabled={loading} variant="outline" className="cursor-pointer">الغاء</Button>
                        </DialogClose>
                        <Button disabled={loading} type="button" className="cursor-pointer" onClick={onSubmit}>
                            {
                                loading
                                    ?
                                    <>
                                        <Icon icon="jam:refresh" className="animate-spin" />
                                        <span>حفظ ...</span>
                                    </>
                                    :
                                    <span>حفظ التغييرات</span>
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            
            {/* نافذة تأكيد الحذف */}
            {deleteItem && (
                <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>تأكيد الحذف</DialogTitle>
                            <DialogDescription>
                                هل أنت متأكد من حذف "{deleteItem.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => setDeleteItem(null)}
                                className="cursor-pointer"
                            >
                                إلغاء
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={deleteItem.onDelete}
                                className="cursor-pointer"
                            >
                                حذف
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    )
}

export default EditMember
