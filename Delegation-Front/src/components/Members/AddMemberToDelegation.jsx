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
import Icon from '../ui/Icon';
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { militaryPositions } from "../../utils/militaryPositions"
import { useParams } from "react-router"
import EquivalentPositionSelector from "./EquivalentPositionSelector"
import { useSelector, useDispatch } from 'react-redux'
import { createMember, fetchMembers } from '../../store/slices/membersSlice'
import { fetchEquivalentJobs, createEquivalentJob, deleteEquivalentJob } from '../../store/slices/equivalentJobsSlice'
import { fetchDelegations } from '../../store/slices/delegationsSlice'
import { fetchNationalities } from '../../store/slices/nationalitiesSlice'

const AddMemberToDelegation = () => {
    const { delegationId } = useParams()
    const dispatch = useDispatch()
    
    // Redux selectors - يجب أن يكونوا في البداية
    const { jobs: equivalentJobs = [] } = useSelector(state => state.equivalentJobs || {})
    const { delegations = [] } = useSelector(state => state.delegations || {})
    const { members = [] } = useSelector(state => state.members || {})
    
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [selectedEquivalentPosition, setSelectedEquivalentPosition] = useState("")
    const [selectedPosition, setSelectedPosition] = useState("")
    const [showAddPosition, setShowAddPosition] = useState(false)
    const [newPosition, setNewPosition] = useState("")
    const [availablePositions, setAvailablePositions] = useState([])
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

    const handleAddNewPosition = async () => {
        const position = newPosition.trim()
        if (!position) {
            toast.error("يرجى إدخال اسم الوظيفة المعادلة")
            return
        }
        if (availablePositions.includes(position)) {
            toast.error("هذه الوظيفة المعادلة موجودة بالفعل")
            return
        }
        
        try {
            const created = await dispatch(createEquivalentJob({ name: position })).unwrap()
            
            setSelectedEquivalentPosition(created.name)
            setValue('equivalentRole', created.name)
            setNewPosition("")
            setShowAddPosition(false)
            setSearchTerm("")
            toast.success("تم إضافة الوظيفة المعادلة الجديدة بنجاح")
        } catch (error) {
            toast.error("تعذر إضافة الوظيفة المعادلة. تأكد أن الاسم غير مكرر")
        }
    }

    const handleDeletePosition = (position) => {
        setDeleteItem({
            type: 'position',
            name: position,
            onDelete: async () => {
                try {
                    const jobToDelete = equivalentJobs.find(job => job.name === position)
                    
                    if (jobToDelete) {
                        await dispatch(deleteEquivalentJob(jobToDelete.id)).unwrap()
                        
                        // إذا كانت الوظيفة المحذوفة مختارة، امسح الاختيار
                        if (selectedEquivalentPosition === position) {
                            setSelectedEquivalentPosition("")
                            setValue('equivalentRole', "")
                        }
                        
                        toast.success("تم حذف الوظيفة المعادلة بنجاح")
                        setDeleteItem(null)
                    }
                } catch (error) {
                    toast.error("تعذر حذف الوظيفة المعادلة")
                    setDeleteItem(null)
                }
            }
        })
    }

    const filteredPositions = availablePositions.filter(position =>
        position.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true)
        try {
            // تحقق بسيط قبل الإرسال
            if (!data.rank || !data.name || !data.role) {
                toast.error("يرجى ملء جميع الحقول المطلوبة")
                setLoading(false)
                return
            }
        
            // البحث عن ID الوظيفة المعادلة المختارة
            let equivalent_job_id = null
            if (data.equivalentRole) {
                const selectedJob = equivalentJobs.find(job => job.name === data.equivalentRole)
                if (selectedJob) {
                    equivalent_job_id = selectedJob.id
                }
            }
        
            // إنشاء العضو عبر Redux
            const payload = {
                delegation_id: delegationId,
                rank: data.rank,
                name: data.name,
                job_title: data.role,
                equivalent_job_id: equivalent_job_id
            }
            await dispatch(createMember(payload)).unwrap()
            toast.success("تم إضافة العضو بنجاح")

            // إطلاق إشارة عامة لإعادة التحميل لباقي المكونات
            window.dispatchEvent(new CustomEvent('delegationUpdated'))
            
            reset()
            setSelectedEquivalentPosition("")
            setSelectedPosition("")
            setSearchTerm("")
            setOpen(false)
        } catch (e) {
            toast.error("فشل إضافة العضو")
        } finally {
            setLoading(false)
        }
    })

    // تم نقل تحميل الوظائف المعادلة إلى Redux (انظر أسفل)

    // تحديث معلومات عدد الأعضاء من Redux
    const updateMemberCountInfo = () => {
        if (!delegationId) return
        try {
            // البحث بالـ UUID مباشرة (string comparison)
            const delegation = delegations.find(d => 
                d.id === delegationId || d.id?.toString() === delegationId?.toString()
            )
            const delegationMembers = members.filter(m => 
                m.delegation_id === delegationId || 
                m.delegation_id?.toString() === delegationId?.toString()
            )
            
            const max = delegation?.member_count || 0
            const current = delegation?.current_members || delegationMembers.length
            
            setMemberCountInfo({ current, max })
        } catch (e) {
            setMemberCountInfo({ current: 0, max: 0 })
        }
    }

    useEffect(() => {
        reset()
        setSelectedEquivalentPosition("")
        setSelectedPosition("")
        setShowAddPosition(false)
        setNewPosition("")
        setSearchTerm("")
        if (open) {
            updateMemberCountInfo()
        }
    }, [open, delegationId])
    
    // تحميل البيانات من Redux
    useEffect(() => {
        dispatch(fetchEquivalentJobs())
        dispatch(fetchDelegations())
        dispatch(fetchMembers())
    }, [dispatch])
    
    // تحديث القائمة عند تغيير البيانات
    useEffect(() => {
        if (equivalentJobs.length > 0) {
            const jobNames = equivalentJobs.map(job => job.name)
            setAvailablePositions(jobNames)
        } else {
            // استخدام البيانات الافتراضية كـ fallback
            setAvailablePositions(militaryPositions)
        }
    }, [equivalentJobs])

    // تحديث فوري عند تحميل البيانات من Redux
    useEffect(() => {
        updateMemberCountInfo()
    }, [delegations, members, delegationId])

    useEffect(() => {
        const handleMemberChange = () => { updateMemberCountInfo() }
        window.addEventListener('delegationUpdated', handleMemberChange)
        return () => {
            window.removeEventListener('delegationUpdated', handleMemberChange)
        }
    }, [delegationId])

    // التحقق من امتلاء الوفد
    const isDelegationFull = memberCountInfo.max > 0 && memberCountInfo.current >= memberCountInfo.max

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    className={isDelegationFull ? "cursor-not-allowed" : "cursor-pointer"}
                    disabled={isDelegationFull}
                    title={isDelegationFull ? `الوفد مكتمل (${memberCountInfo.current}/${memberCountInfo.max})` : "إضافة عضو جديد للوفد"}
                >
                    <Icon name={isDelegationFull ? "Ban" : "Plus"} size={20} />
                    <span>
                        {isDelegationFull 
                            ? `الوفد مكتمل (${memberCountInfo.current}/${memberCountInfo.max})` 
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
                    </DialogDescription>
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
                                    <Icon name="Plus" size={14} />
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
                                        <Icon name="Check" size={16} />
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
                                        <Icon name="X" size={16} />
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
                                                        <Icon name="X" size={16} />
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
                                        <Icon name="RefreshCw" size={20} className="animate-spin" />
                                        <span>اضافة ...</span>
                                    </>
                                    :
                                    <span>اضافة</span>
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
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
