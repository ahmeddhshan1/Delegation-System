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
import { useEffect, useState } from "react"
import { militaryPositions } from "../../utils/militaryPositions"
import { useSelector, useDispatch } from 'react-redux'
import { updateMember } from '../../store/slices/membersSlice'
import { fetchNationalities } from '../../store/slices/nationalitiesSlice'
import { fetchEquivalentJobs, createEquivalentJob, deleteEquivalentJob } from '../../store/slices/equivalentJobsSlice'

const EditMember = ({ member, children, onEdit }) => {
    const dispatch = useDispatch()
    const { jobs: equivalentJobs } = useSelector(state => state.equivalentJobs)
    
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [selectedEquivalentPosition, setSelectedEquivalentPosition] = useState("")
    const [showAddPosition, setShowAddPosition] = useState(false)
    const [newPosition, setNewPosition] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteItem, setDeleteItem] = useState(null)
    
    const availablePositions = equivalentJobs.map(job => job.name)

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

    const handleAddNewPosition = async () => {
        const position = newPosition.trim()
        if (!position || availablePositions.includes(position)) {
            return
        }
        
        try {
            const created = await dispatch(createEquivalentJob({ name: position })).unwrap()
            
            setSelectedEquivalentPosition(created.name)
            setValue('equivalentRole', created.name)
            setNewPosition("")
            setShowAddPosition(false)
            setSearchTerm("")
        } catch (error) {
            // Handle error silently
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
                        
                        if (selectedEquivalentPosition === position) {
                            setSelectedEquivalentPosition("")
                            setValue('equivalentRole', "")
                        }
                        
                        setDeleteItem(null)
                    }
                } catch (error) {
                    setDeleteItem(null)
                }
            }
        })
    }

    // تصفية المناصب حسب البحث
    const filteredPositions = availablePositions.filter(position =>
        position.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true)
        
        try {
            // البحث عن ID الوظيفة المعادلة المختارة من Redux store
            let equivalent_job_id = null
            if (data.equivalentRole) {
                const selectedJob = equivalentJobs.find(job => job.name === data.equivalentRole)
                if (selectedJob) {
                    equivalent_job_id = selectedJob.id
                }
            }
            
            // تحديث بيانات العضو عبر API
            const payload = {
                rank: data.rank,
                name: data.name,
                job_title: data.role,
                equivalent_job_id: equivalent_job_id
            }
            
            const updatedMember = await dispatch(updateMember({ memberId: member.id, memberData: payload })).unwrap()
            
            // تحديث فوري للبيانات المحلية
            if (onEdit) {
                onEdit(updatedMember)
            }
            
            // إطلاق إشارة لإعادة تحميل البيانات
            window.dispatchEvent(new CustomEvent('memberUpdated'))
            window.dispatchEvent(new CustomEvent('delegationUpdated'))
            window.dispatchEvent(new CustomEvent('dataUpdated'))
            window.dispatchEvent(new CustomEvent('refreshData'))
            
            setOpen(false)
        } catch (error) {
            console.error('خطأ في تحديث العضو:', error)
        } finally {
            setLoading(false)
        }
    })

    // جلب الوظائف المعادلة من Redux
    useEffect(() => {
        if (open) {
            dispatch(fetchEquivalentJobs())
        }
    }, [open, dispatch])

    // تحديث البيانات عند فتح الحوار
    useEffect(() => {
        if (open && member) {
            setValue('rank', member.rank || '')
            setValue('name', member.name || '')
            setValue('role', member.job_title || '')
            setValue('equivalentRole', member.equivalent_job_name || '')
            setSelectedEquivalentPosition(member.equivalent_job_name || '')
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

    // تحميل الوظائف المعادلة عند فتح المكون
    useEffect(() => {
        dispatch(fetchEquivalentJobs())
    }, [dispatch])

    // الاستماع لتحديث الوظائف المعادلة
    useEffect(() => {
        const handlePositionsUpdated = () => {
            dispatch(fetchEquivalentJobs())
        }

        const handleMemberUpdate = () => {
            dispatch(fetchEquivalentJobs())
        }

        window.addEventListener('positionsUpdated', handlePositionsUpdated)
        window.addEventListener('memberAdded', handleMemberUpdate)
        window.addEventListener('memberDeleted', handleMemberUpdate)
        window.addEventListener('memberUpdated', handleMemberUpdate)
        
        return () => {
            window.removeEventListener('positionsUpdated', handlePositionsUpdated)
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
