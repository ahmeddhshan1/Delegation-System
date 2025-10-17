import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react/dist/iconify.js"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import { deleteSubEventData } from "../../utils/cascadeDelete"
import DeletePopup from "../DeletePopup"
import { eventService, delegationService } from "../../services/api"

const SubEventManager = ({ mainEvent, onSubEventAdded, onSubEventUpdated, onSubEventDeleted }) => {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editingSubEvent, setEditingSubEvent] = useState(null)
    const [subEvents, setSubEvents] = useState([])
    const [subEventsWithStats, setSubEventsWithStats] = useState([])

    const validationSchema = yup.object({
        name: yup.string().required("اسم الحدث الفرعي مطلوب"),
    })

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: "",
        }
    })

    // جلب الأحداث الفرعية من API
    useEffect(() => {
        let isMounted = true
        
        const loadSubEvents = async () => {
            if (!mainEvent?.id) {
                setSubEvents([])
                setSubEventsWithStats([])
                return
            }
            
            try {
                const subEventsResponse = await eventService.getSubEvents(mainEvent.id)
                let validSubEvents = []
                
                if (subEventsResponse && subEventsResponse.results && Array.isArray(subEventsResponse.results)) {
                    validSubEvents = subEventsResponse.results
                } else if (Array.isArray(subEventsResponse)) {
                    validSubEvents = subEventsResponse
                }
                
                if (isMounted) {
                    setSubEvents(validSubEvents)
                    
                    // جلب الوفود لحساب الإحصائيات
                    const delegationsResponse = await delegationService.getDelegations()
                    let allDelegations = []
                    
                    if (delegationsResponse && delegationsResponse.results && Array.isArray(delegationsResponse.results)) {
                        allDelegations = delegationsResponse.results
                    } else if (Array.isArray(delegationsResponse)) {
                        allDelegations = delegationsResponse
                    }
                    
                    // إضافة إحصائيات لكل حدث فرعي
                    const subEventsWithStats = validSubEvents.map(subEvent => {
                        const eventDelegations = allDelegations.filter(delegation => 
                            delegation.sub_event_id === subEvent.id
                        )
                        
                        const totalMembers = eventDelegations.reduce((sum, delegation) => 
                            sum + (delegation.current_members || 0), 0
                        )
                        
                        return {
                            ...subEvent,
                            delegationCount: eventDelegations.length,
                            membersCount: totalMembers
                        }
                    })
                    
                    setSubEventsWithStats(subEventsWithStats)
                }
            } catch (error) {
                console.error('خطأ في جلب الأحداث الفرعية:', error)
                if (isMounted) {
                    setSubEvents([])
                    setSubEventsWithStats([])
                }
            }
        }
        
        loadSubEvents()
        
        return () => {
            isMounted = false
        }
    }, [mainEvent])

    // الاستماع لحذف الحدث الرئيسي وإعادة تحميل البيانات
    useEffect(() => {
        const handleMainEventDeleted = () => {
            // إعادة تحميل البيانات من localStorage
            const savedEvents = localStorage.getItem('mainEvents')
            if (savedEvents) {
                try {
                    const events = JSON.parse(savedEvents)
                    const updatedMainEvent = events.find(e => e.id === mainEvent?.id)
                    if (updatedMainEvent && updatedMainEvent.sub_events) {
                        setSubEvents(updatedMainEvent.sub_events)
                    } else {
                        setSubEvents([])
                    }
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأحداث:', error)
                    setSubEvents([])
                }
            } else {
                setSubEvents([])
            }
        }

        window.addEventListener('eventDeleted', handleMainEventDeleted)
        window.addEventListener('eventUpdated', handleMainEventDeleted)

        return () => {
            window.removeEventListener('eventDeleted', handleMainEventDeleted)
            window.removeEventListener('eventUpdated', handleMainEventDeleted)
        }
    }, [mainEvent?.id])

    // إعادة تحميل البيانات عند تغيير mainEvent
    useEffect(() => {
        if (mainEvent && mainEvent.sub_events) {
            setSubEvents(mainEvent.sub_events)
        } else {
            setSubEvents([])
        }
    }, [mainEvent])


    const onSubmit = handleSubmit(async (data) => {
        setLoading(true)
        
        try {
            if (editingSubEvent) {
                // تحديث حدث فرعي موجود
                const updateData = {
                    event_name: data.name
                }
                
                await eventService.updateSubEvent(editingSubEvent.id, updateData)
                
                toast.success("تم تحديث الحدث الفرعي بنجاح")
                if (onSubEventUpdated) onSubEventUpdated(mainEvent.id, editingSubEvent.id, updateData)
            } else {
                // إضافة حدث فرعي جديد
                const newSubEventData = {
                    event_name: data.name,
                    main_event_id: mainEvent.id
                }
                
                const newSubEvent = await eventService.createSubEvent(newSubEventData)
                
                toast.success("تم إضافة الحدث الفرعي بنجاح")
                if (onSubEventAdded) onSubEventAdded(mainEvent.id, newSubEvent)
            }
            
            reset()
            setEditingSubEvent(null)
            setLoading(false)
            setOpen(false)
        } catch (error) {
            console.error('خطأ في حفظ الحدث الفرعي:', error)
            toast.error("حدث خطأ أثناء حفظ الحدث الفرعي")
            setLoading(false)
        }
    })

    const handleEdit = (subEvent) => {
        setEditingSubEvent(subEvent)
        setValue('name', subEvent.event_name)
        setOpen(true)
    }

    const handleDelete = async (subEventId) => {
        try {
            // حذف الحدث الفرعي من API
            await eventService.deleteSubEvent(subEventId)
            
            // استدعاء دالة الحذف في المكون الأب
            onSubEventDeleted && onSubEventDeleted(mainEvent.id, subEventId)
            
            toast.success("تم حذف الحدث الفرعي بنجاح")
        } catch (error) {
            console.error('خطأ في حذف الحدث الفرعي:', error)
            toast.error("حدث خطأ أثناء حذف الحدث الفرعي")
        }
    }

    const handleClose = () => {
        setOpen(false)
        setEditingSubEvent(null)
        reset()
    }

    if (!mainEvent) {
        return (
            <div className="text-center py-8 text-neutral-500">
                <Icon icon="material-symbols:event" fontSize={48} className="mx-auto mb-4" />
                <p>اختر حدث رئيسي لعرض الأحداث الفرعية</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="hidden">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingSubEvent(null)} data-add-sub-event>
                            <Icon icon="qlementine-icons:plus-16" />
                            <span>إضافة حدث فرعي</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSubEvent ? "تعديل الحدث الفرعي" : "إضافة حدث فرعي جديد"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingSubEvent 
                                    ? "قم بتعديل بيانات الحدث الفرعي" 
                                    : `أضف حدث فرعي جديد لـ ${mainEvent.name}`
                                }
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">اسم الحدث الفرعي</Label>
                                    <Input 
                                        id="name"
                                        placeholder={`مثال: ${mainEvent.name} 2025`}
                                        {...register('name')}
                                    />
                                    {errors.name && (
                                        <span className="text-sm text-red-500">{errors.name.message}</span>
                                    )}
                                </div>

                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Icon icon="material-symbols:info" className="text-neutral-500" />
                                        <span>سيتم إنشاء الحدث الفرعي تحت: <strong>{mainEvent.name}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                                    إلغاء
                                </Button>
                                <Button 
                                    type="button" 
                                    onClick={onSubmit} 
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    {loading ? (
                                        <>
                                            <Icon icon="jam:refresh" className="animate-spin" />
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        editingSubEvent ? "تحديث" : "إضافة"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subEventsWithStats.map(subEvent => (
                    <div key={subEvent.id} className="border border-neutral-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="font-medium">{subEvent.event_name}</h4>
                                <p className="text-sm text-neutral-500">
                                    {new Date(subEvent.created_at).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(subEvent)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Icon icon="material-symbols:edit" fontSize={16} />
                                </Button>
                                <DeletePopup
                                    item={subEvent}
                                    onDelete={handleDelete}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                        <Icon icon="material-symbols:delete" fontSize={16} />
                                    </Button>
                                </DeletePopup>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-neutral-600">
                                <Icon icon="fa:globe" fontSize={14} />
                                <span>الوفود: {subEvent.delegationCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600">
                                <Icon icon="fa:users" fontSize={14} />
                                <span>الأعضاء: {subEvent.membersCount || 0}</span>
                            </div>
                        </div>

                        <div className="mt-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => {
                                    // التنقل إلى صفحة وفود الحدث الفرعي
                                    // مسار ديناميكي بناءً على event_link أو event_name
                                    let mainEventPath = ''
                                    if (mainEvent.event_link && mainEvent.event_link.trim()) {
                                        mainEventPath = mainEvent.event_link.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
                                    } else {
                                        mainEventPath = mainEvent.event_name.toLowerCase().replace(/\s+/g, '').replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '')
                                    }
                                    navigate(`/${mainEventPath}/${subEvent.id}`)
                                }}
                            >
                                <Icon icon="material-symbols:visibility" fontSize={16} />
                                <span>عرض الوفود</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {subEventsWithStats.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                    <Icon icon="material-symbols:event-note" fontSize={48} className="mx-auto mb-4" />
                    <p>لا توجد أحداث فرعية</p>
                    <p className="text-sm">اضغط على "إضافة حدث فرعي" لبدء إضافة الأحداث</p>
                </div>
            )}
        </div>
    )
}

export default SubEventManager
