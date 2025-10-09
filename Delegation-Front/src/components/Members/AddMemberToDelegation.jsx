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
import { useParams } from "react-router"
import EquivalentPositionSelector from "./EquivalentPositionSelector"

const AddMemberToDelegation = () => {
    const { delegationId } = useParams()



    
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [selectedEquivalentPosition, setSelectedEquivalentPosition] = useState("")
    const [selectedPosition, setSelectedPosition] = useState("")
    const [showAddPosition, setShowAddPosition] = useState(false)
    const [newPosition, setNewPosition] = useState("")
    const [availablePositions, setAvailablePositions] = useState(militaryPositions)
    const [searchTerm, setSearchTerm] = useState("")
    const [memberCountInfo, setMemberCountInfo] = useState({ current: 0, max: 0 })
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

    const handlePositionChange = (value) => {
        setSelectedPosition(value)
        setValue('role', value)
        setSelectedEquivalentPosition("") // إعادة تعيين الوظيفة المكافئة
    }

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
        
        // التحقق من البيانات المطلوبة
        if (!data.rank || !data.name || !data.role || !data.equivalentRole) {
            toast.error("يرجى ملء جميع الحقول المطلوبة")
            setLoading(false)
            return
        }
        
        // التحقق من عدد الأعضاء المسموح به في الوفد
        try {
            const savedDelegations = localStorage.getItem('delegations')
            if (savedDelegations) {
                const delegations = JSON.parse(savedDelegations)
                const currentDelegation = delegations.find(d => d.id === delegationId)
                
                if (currentDelegation) {
                    const maxMembers = parseInt(currentDelegation.membersCount)
                    
                    // عد الأعضاء الحاليين في هذا الوفد
                    const savedMembers = localStorage.getItem('members')
                    if (savedMembers) {
                        const members = JSON.parse(savedMembers)
                        const currentMembersCount = members.filter(member => 
                            member.delegation && member.delegation.id === delegationId
                        ).length
                        
                        if (currentMembersCount >= maxMembers) {
                            toast.error(`لا يمكن إضافة عضو جديد. الحد الأقصى للوفد هو ${maxMembers} عضو`, {
                                style: {
                                    background: 'var(--destructive)',
                                    color: 'white',
                                    border: '1px solid var(--destructive)'
                                }
                            })
                            setLoading(false)
                            return
                        }
                    }
                }
            }
        } catch (error) {
            console.error('خطأ في التحقق من عدد الأعضاء:', error)
            toast.error("خطأ في التحقق من عدد الأعضاء المسموح به", {
                style: {
                    background: 'var(--destructive)',
                    color: 'white',
                    border: '1px solid var(--destructive)'
                }
            })
            setLoading(false)
            return
        }
        
        // إنشاء العضو الجديد
        // جلب بيانات الوفد الحقيقية

        
        let delegationData = {
            id: delegationId || "d1",
            nationality: "مصري", // fallback
            delegationHead: "رئيس الوفد" // fallback
        }
        
        try {
            const savedDelegations = localStorage.getItem('delegations')

            
            if (savedDelegations) {
                const delegations = JSON.parse(savedDelegations)


                
                const currentDelegation = delegations.find(d => d.id === delegationId)

                
                if (currentDelegation) {
                    delegationData = {
                        id: currentDelegation.id,
                        nationality: currentDelegation.nationality,
                        delegationHead: currentDelegation.delegationHead,
                        delegationType: currentDelegation.delegationType,
                        membersCount: currentDelegation.membersCount,
                        subEventId: currentDelegation.subEventId, // إضافة subEventId
                        arrivalInfo: currentDelegation.arrivalInfo
                    }

                } else {

                }
            } else {

            }
        } catch (error) {
            console.error('خطأ في جلب بيانات الوفد:', error)

        }

        // تحديد تاريخ الوصول - استخدم تاريخ وصول الوفد إذا كان موجوداً
        let arrivalDate = null
        if (delegationData.arrivalInfo && delegationData.arrivalInfo.arrivalDate) {
            arrivalDate = delegationData.arrivalInfo.arrivalDate
        } else {
            // إذا لم يوجد تاريخ وصول للوفد، استخدم التاريخ الحالي
            arrivalDate = new Date().toISOString().split('T')[0]
        }

        const newMember = {
            id: `mem_${Date.now()}`,
            rank: data.rank,
            name: data.name,
            role: data.role, // الوظيفة
            equivalentRole: data.equivalentRole, // المنصب العسكري المعادل
            job: data.equivalentRole, // للتوافق مع النظام الحالي
            memberStatus: "not_departed",
            nationality: delegationData.nationality, // استخدام الجنسية الحقيقية للوفد
            arrivalDate: arrivalDate, // استخدام تاريخ وصول الوفد
            departureDate: null,
            subEventId: delegationData.subEventId, // إضافة subEventId للعضو
            delegation: delegationData // استخدام بيانات الوفد الحقيقية
        }

        // جلب الأعضاء الحاليين من localStorage
        const existingMembers = JSON.parse(localStorage.getItem('members') || '[]')

        
        // إضافة العضو الجديد
        const updatedMembers = [...existingMembers, newMember]

        
        // حفظ في localStorage
        try {
            localStorage.setItem('members', JSON.stringify(updatedMembers))
            
            // إرسال events فوراً بعد الحفظ
            window.dispatchEvent(new CustomEvent('memberAdded'))
            window.dispatchEvent(new CustomEvent('localStorageUpdated'))

        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error)
            toast.error("خطأ في حفظ البيانات", {
                style: {
                    background: 'var(--destructive)',
                    color: 'white',
                    border: '1px solid var(--destructive)'
                }
            })
            setLoading(false)
            return
        }
        
        // التحقق من الحفظ
        const savedData = localStorage.getItem('members')

        
        // التحقق من أن البيانات محفوظة بشكل صحيح
        try {
            const parsedSavedData = JSON.parse(savedData)


        } catch (error) {
            console.error('خطأ في تحليل البيانات المحفوظة:', error)
        }
        


        
        setTimeout(() => {
            // حساب عدد الأعضاء المتبقيين
            try {
                const savedDelegations = localStorage.getItem('delegations')
                const savedMembers = localStorage.getItem('members')
                
                if (savedDelegations && savedMembers) {
                    const delegations = JSON.parse(savedDelegations)
                    const members = JSON.parse(savedMembers)
                    const currentDelegation = delegations.find(d => d.id === delegationId)
                    
                    if (currentDelegation) {
                        const maxMembers = parseInt(currentDelegation.membersCount)
                        const currentMembersCount = members.filter(member => 
                            member.delegation && member.delegation.id === delegationId
                        ).length
                        const remainingMembers = maxMembers - currentMembersCount
                        
                        if (remainingMembers > 0) {
                            toast.success(`تم إضافة عضو جديد للوفد. متبقي ${remainingMembers} عضو`, {
                                style: {
                                    background: 'var(--primary)',
                                    color: 'var(--primary-foreground)',
                                    border: '1px solid var(--primary)'
                                }
                            })
                        } else {
                            toast.success(`تم إضافة عضو جديد للوفد. الوفد مكتمل`, {
                                style: {
                                    background: 'var(--primary)',
                                    color: 'var(--primary-foreground)',
                                    border: '1px solid var(--primary)'
                                }
                            })
                        }
                    } else {
                        toast.success(`تم اضافة عضو جديد للوفد`, {
                            style: {
                                background: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                border: '1px solid var(--primary)'
                            }
                        })
                    }
                } else {
                    toast.success(`تم اضافة عضو جديد للوفد`, {
                        style: {
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            border: '1px solid var(--primary)'
                        }
                    })
                }
            } catch (error) {
                toast.success(`تم اضافة عضو جديد للوفد`, {
                    style: {
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        border: '1px solid var(--primary)'
                    }
                })
            }
            
            reset()
            setSelectedEquivalentPosition("")
            setSelectedPosition("")
            setSearchTerm("")
            setLoading(false)
            setOpen(false)
        }, 1500)
    })

    // دالة تحديث معلومات عدد الأعضاء
    const updateMemberCountInfo = () => {

        if (delegationId) {
            try {
                const savedDelegations = localStorage.getItem('delegations')
                const savedMembers = localStorage.getItem('members')
                


                
                if (savedDelegations && savedMembers) {
                    const delegations = JSON.parse(savedDelegations)
                    const members = JSON.parse(savedMembers)


                    
                    const currentDelegation = delegations.find(d => d.id === delegationId)

                    
                    if (currentDelegation) {
                        const maxMembers = parseInt(currentDelegation.membersCount)
                        const currentMembersCount = members.filter(member => 
                            member.delegation && member.delegation.id === delegationId
                        ).length
                        

                        setMemberCountInfo({ current: currentMembersCount, max: maxMembers })
                    } else {

                    }
                } else {

                }
            } catch (error) {
                console.error('خطأ في تحديث معلومات عدد الأعضاء:', error)
            }
        }
    }

    useEffect(() => {

        reset()
        setSelectedEquivalentPosition("")
        setSelectedPosition("")
        setShowAddPosition(false)
        setNewPosition("")
        setSearchTerm("")
        
        // تحديث معلومات عدد الأعضاء عند فتح النموذج
        if (open) {

            updateMemberCountInfo()
        }
    }, [open, delegationId])

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

    // الاستماع لتغييرات الأعضاء (حذف، إضافة، تحديث)
    useEffect(() => {
        const handleMemberChange = () => {
            updateMemberCountInfo()
        }

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

        // إضافة event listeners للتغييرات
        window.addEventListener('memberDeleted', handleMemberChange)
        window.addEventListener('memberAdded', handleMemberChange)
        window.addEventListener('memberUpdated', handleMemberChange)
        window.addEventListener('localStorageUpdated', handleMemberChange)
        window.addEventListener('positionsUpdated', handlePositionsUpdated)
        window.addEventListener('storage', handleStorageChange)

        // تحديث العداد عند تحميل المكون
        updateMemberCountInfo()

        return () => {
            window.removeEventListener('memberDeleted', handleMemberChange)
            window.removeEventListener('memberAdded', handleMemberChange)
            window.removeEventListener('memberUpdated', handleMemberChange)
            window.removeEventListener('localStorageUpdated', handleMemberChange)
            window.removeEventListener('positionsUpdated', handlePositionsUpdated)
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [delegationId])

    // تحديث دوري للعداد (كل 2 ثانية) للتأكد من التزامن
    useEffect(() => {
        const interval = setInterval(() => {
            updateMemberCountInfo()
        }, 2000)

        return () => clearInterval(interval)
    }, [delegationId])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    className="cursor-pointer" 
                    disabled={memberCountInfo.max > 0 && memberCountInfo.current >= memberCountInfo.max}
                >
                    <Icon icon="qlementine-icons:plus-16" />
                    <span>
                        {memberCountInfo.max > 0 && memberCountInfo.current >= memberCountInfo.max 
                            ? "الوفد مكتمل" 
                            : "اضافة عضو للوفد"
                        }
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[725px] max-h-[675px] [&_[data-slot='dialog-close']]:!right-[95%] overflow-auto">
                <DialogHeader className="!text-start !py-2">
                    <DialogTitle>إضافة عضو جديد للوفد</DialogTitle>
                    <DialogDescription>
                        يمكنك اضافة عضو جديد للوفد المحدد من هنا, حينما تنتهي من ملئ البيانات قم بضغط اضافة.
                        {memberCountInfo.max > 0 && (
                            <div className={`mt-2 p-2 rounded-lg border ${
                                memberCountInfo.current >= memberCountInfo.max 
                                    ? 'bg-red-50 border-red-200' 
                                    : 'bg-primary-50 border-primary-200'
                            }`}>
                                <span className={`text-sm ${
                                    memberCountInfo.current >= memberCountInfo.max 
                                        ? 'text-red-700' 
                                        : 'text-primary-700'
                                }`}>
                                    الأعضاء الحاليون: {memberCountInfo.current} / {memberCountInfo.max}
                                    {memberCountInfo.current >= memberCountInfo.max && (
                                        <span className="text-red-600 font-semibold"> (الوفد مكتمل)</span>
                                    )}
                                </span>
                            </div>
                        )}
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
                                        <span>اضافة ...</span>
                                    </>
                                    :
                                    <span>اضافة</span>
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

export default AddMemberToDelegation
