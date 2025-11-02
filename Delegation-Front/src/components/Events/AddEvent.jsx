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
import Icon from '../ui/Icon';
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { usePermissions } from "../../store/hooks"
import { useParams } from "react-router"
import { useSelector, useDispatch } from 'react-redux'
import { createSubEvent } from '../../store/slices/subEventsSlice'
import { fetchMainEvents } from '../../store/slices/eventsSlice'


const AddEvent = ({ onEventAdded }) => {
    const dispatch = useDispatch()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    
    // Redux state
    const { mainEvents: mainEventsFromRedux } = useSelector(state => state.events)
    const { eventName } = useParams()
    
    // جلب صلاحيات المستخدم من Redux
    const { checkPermission } = usePermissions()
    
    // إخفاء المكون إذا لم يكن المستخدم لديه صلاحية إدارة الأحداث
    if (!checkPermission('MANAGE_EVENTS')) {
        return null
    }

    const validationSchema = yup.object({
        name: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
    })


    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: "",
        }
    })

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true)
        
        try {
            // جلب جميع الأحداث الرئيسية من Redux state
            dispatch(fetchMainEvents())
            const mainEvents = mainEventsFromRedux || []
            
            // البحث عن الحدث الرئيسي المطابق للـ URL
            const targetEvent = mainEvents.find(event => {
                let eventPath = ''
                if (event.event_link && event.event_link.trim()) {
                    eventPath = event.event_link.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                } else {
                    eventPath = event.event_name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                }
                return eventPath === eventName
            })
            
            if (!targetEvent) {
                toast.error("لم يتم العثور على الحدث الرئيسي")
                setLoading(false)
                return
            }
            
            // إنشاء الحدث الفرعي الجديد
            const newSubEventData = {
                event_name: data.name,
                main_event_id: targetEvent.id
            }
            
            // إضافة الحدث الفرعي عبر API
                const newSubEvent = await dispatch(createSubEvent(newSubEventData)).unwrap()
            
            toast.success("تم إضافة الحدث الفرعي بنجاح")
                reset()
                setLoading(false)
                setOpen(false)
                
                // إرسال البيانات للوالد إذا كان متوفراً
                if (onEventAdded) {
                    onEventAdded(newSubEvent)
                }
                
            } catch (error) {
            console.error('خطأ في إضافة الحدث الفرعي:', error)
            toast.error("حدث خطأ أثناء إضافة الحدث الفرعي")
                setLoading(false)
            }
    })

    useEffect(() => reset(), [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <Icon name="Plus" size={20} />
                    <span>اضافة حدث جديد</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] [&_[data-slot='dialog-close']]:!right-[95%]">
                <DialogHeader className="!text-start !py-4">
                    <DialogTitle className="text-xl font-bold">إضافة حدث جديد</DialogTitle>
                    <DialogDescription className="text-neutral-600">
                        أدخل اسم الحدث الجديد لإضافته إلى النظام
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="py-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-medium">اسم الحدث</Label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    placeholder="مثال: ايديكس 2025" 
                                    className="w-full p-3 border border-neutral-300 rounded-lg focus:border-primary-600 focus:ring-1 focus:ring-primary-200 transition-all duration-200"
                                    {...register('name')} 
                                />
                                {errors.name && (
                                    <div className="flex items-center gap-2 text-rose-400 text-sm">
                                        <Icon name="AlertCircle" size={16} />
                                        <span>{errors.name.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 pt-4 border-t border-neutral-200">
                        <DialogClose asChild>
                            <Button disabled={loading} variant="outline" className="cursor-pointer flex-1 h-11">الغاء</Button>
                        </DialogClose>
                        <Button disabled={loading} type="button" className="cursor-pointer flex-1 h-11" onClick={onSubmit}>
                            {loading ? (
                                <>
                                    <Icon name="RefreshCw" size={20} className="animate-spin mr-2" />
                                    <span>اضافة ...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="Plus" size={20} className="mr-2" />
                                    <span>اضافة الحدث</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default AddEvent