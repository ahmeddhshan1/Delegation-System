import { useState, useEffect } from 'react'
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
import { availableEmojis } from "../../utils/eventCategories"
import { deleteMainEventData } from "../../utils/cascadeDelete"
import DeletePopup from "../DeletePopup"

const MainEventManager = ({ events = [], onEventAdded, onEventUpdated, onEventDeleted, onEventSelected, selectedEvent }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editingEvent, setEditingEvent] = useState(null)
    const [mainEvents, setMainEvents] = useState(events)

    const validationSchema = yup.object({
        name: yup.string().required("اسم الحدث مطلوب"),
        englishName: yup.string()
            .required("الاسم الإنجليزي مطلوب")
            .test('unique-english-name', 'الاسم الإنجليزي مستخدم بالفعل', function(value) {
                if (!value) return true
                
                // تحقق من التكرار في الأحداث الموجودة
                const existingEvent = mainEvents.find(event => 
                    event.englishName?.toLowerCase() === value.toLowerCase() && 
                    (!editingEvent || event.id !== editingEvent.id)
                )
                
                return !existingEvent
            })
            .matches(/^[a-zA-Z0-9-_]+$/, "يجب أن يحتوي الاسم الإنجليزي على أحرف إنجليزية وأرقام وشرطات فقط"),
        icon: yup.string().required("الأيقونة مطلوبة"),
    })

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: "",
            englishName: "",
            icon: "",
        }
    })

    // تحديث البيانات عند تغيير الـ props
    useEffect(() => {
        setMainEvents(events)
    }, [events])

    // تحديث selectedEvent عند تغيير الـ props
    useEffect(() => {
        // selectedEvent يأتي من props، لا نحتاج لحفظه في state محلي
    }, [selectedEvent])

    // الاستماع لتغييرات localStorage والأحداث المخصصة
    useEffect(() => {
        const handleStorageChange = () => {
            // إعادة تحميل البيانات من localStorage
            const savedEvents = localStorage.getItem('mainEvents')
            if (savedEvents) {
                try {
                    const parsedEvents = JSON.parse(savedEvents)
                    setMainEvents(parsedEvents)
                    
                    // إلغاء تحديد الحدث إذا كان محذوف
                    if (selectedEvent && !parsedEvents.find(e => e.id === selectedEvent.id)) {
                        onEventSelected && onEventSelected(null)
                    }
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الأحداث:', error)
                }
            }
        }

        // الاستماع لتغييرات localStorage (للتابات الأخرى)
        window.addEventListener('storage', (event) => {
            if (event.key === 'lastEventUpdate') {
                handleStorageChange()
            }
        })
        
        // الاستماع للأحداث المخصصة (لنفس التابة)
        window.addEventListener('eventAdded', handleStorageChange)
        window.addEventListener('eventDeleted', handleStorageChange)
        window.addEventListener('eventUpdated', handleStorageChange)

        return () => {
            window.removeEventListener('storage', (event) => {
                if (event.key === 'lastEventUpdate') {
                    handleStorageChange()
                }
            })
            window.removeEventListener('eventAdded', handleStorageChange)
            window.removeEventListener('eventDeleted', handleStorageChange)
            window.removeEventListener('eventUpdated', handleStorageChange)
        }
    }, [])

    const onSubmit = handleSubmit((data) => {
        // التحقق الإضافي من التكرار قبل الحفظ
        const existingEvent = mainEvents.find(event => 
            event.englishName?.toLowerCase() === data.englishName.toLowerCase() && 
            (!editingEvent || event.id !== editingEvent.id)
        )
        
        if (existingEvent) {
            toast.error("الاسم الإنجليزي مستخدم بالفعل. يرجى اختيار اسم آخر.")
            return
        }
        
        setLoading(true)
        
        setTimeout(() => {
            if (editingEvent) {
                // تحديث حدث موجود
                const updatedEvents = mainEvents.map(event => 
                    event.id === editingEvent.id 
                        ? { ...event, ...data, updated_at: new Date().toISOString() }
                        : event
                )
                setMainEvents(updatedEvents)
                
                // حفظ في localStorage
                localStorage.setItem('mainEvents', JSON.stringify(updatedEvents))
                
                toast.success("تم تحديث الحدث بنجاح")
                if (onEventUpdated) onEventUpdated(editingEvent.id, data)
                
                // إرسال custom event لتحديث باقي الصفحات في نفس التابة
                window.dispatchEvent(new CustomEvent('eventUpdated'))
                
                // إرسال إشارة للتابات الأخرى عبر localStorage
                localStorage.setItem('lastEventUpdate', Date.now().toString())
            } else {
                // إضافة حدث جديد
                const newEvent = {
                    id: Date.now(),
                    name: data.name,
                    englishName: data.englishName,
                    icon: data.icon,
                    created_at: new Date().toISOString(),
                    sub_events: []
                }
                setMainEvents([...mainEvents, newEvent])
                
                // حفظ في localStorage
                localStorage.setItem('mainEvents', JSON.stringify([...mainEvents, newEvent]))
                
                toast.success("تم إضافة الحدث بنجاح")
                if (onEventAdded) onEventAdded(newEvent)
                
                // إرسال custom event لتحديث السايد بار
                window.dispatchEvent(new CustomEvent('eventAdded'))
                
                // إرسال إشارة للتابات الأخرى عبر localStorage
                localStorage.setItem('lastEventUpdate', Date.now().toString())
            }
            
            reset()
            setEditingEvent(null)
            setLoading(false)
            setOpen(false)
        }, 1500)
    })

    const handleEdit = (event) => {
        setEditingEvent(event)
        setValue('name', event.name)
        setValue('englishName', event.englishName || '')
        setValue('icon', event.icon)
        setOpen(true)
    }

    const handleDelete = (eventId) => {
        // حذف الحدث الرئيسي من القائمة أولاً
        const updatedEvents = mainEvents.filter(event => event.id !== eventId)
        setMainEvents(updatedEvents)
        
        // إلغاء تحديد الحدث إذا كان محذوف
        if (selectedEvent && selectedEvent.id === eventId) {
            onEventSelected && onEventSelected(null)
        }
        
        // حذف جميع البيانات المرتبطة بالحدث الرئيسي (قبل حذف الحدث من localStorage)
        const deleteResult = deleteMainEventData(eventId)
        
        // حفظ في localStorage
        localStorage.setItem('mainEvents', JSON.stringify(updatedEvents))
        
        // استدعاء دالة الحذف في المكون الأب
        onEventDeleted && onEventDeleted(eventId)
        
        if (deleteResult.success) {
            // رسالة نجاح مفصلة
            const stats = deleteResult.stats
            toast.success(`تم حذف الحدث الرئيسي بنجاح (${stats.subEvents} حدث فرعي، ${stats.delegations} وفد، ${stats.members} عضو)`)
        } else {
            toast.error(deleteResult.message)
        }
        
        // إرسال custom event لتحديث السايد بار
        window.dispatchEvent(new CustomEvent('eventDeleted'))
        
        // إرسال إشارة للتابات الأخرى عبر localStorage
        localStorage.setItem('lastEventUpdate', Date.now().toString())
    }

    const handleClose = () => {
        setOpen(false)
        setEditingEvent(null)
        reset()
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <Icon icon="material-symbols:event" className="text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold">الأحداث الرئيسية</h3>
                </div>
                       <Dialog open={open} onOpenChange={setOpen}>
                           <DialogTrigger asChild>
                               <Button onClick={() => setEditingEvent(null)} className="w-10 h-10 p-0">
                                   <Icon icon="qlementine-icons:plus-16" fontSize={20} />
                               </Button>
                           </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingEvent ? "تعديل الحدث الرئيسي" : "إضافة حدث رئيسي جديد"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingEvent 
                                    ? "قم بتعديل بيانات الحدث الرئيسي" 
                                    : "أضف حدث رئيسي جديد مثل ايديكس أو الفروسية"
                                }
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">اسم الحدث</Label>
                                    <Input 
                                        id="name"
                                        placeholder="مثال: ايديكس، الفروسية، النجم الساطع"
                                        {...register('name')}
                                    />
                                    {errors.name && (
                                        <span className="text-sm text-red-500">{errors.name.message}</span>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="englishName">الاسم الإنجليزي (للروابط)</Label>
                                    <Input 
                                        id="englishName"
                                        placeholder="مثال: edex-2024, military-event, sports-event"
                                        {...register('englishName')}
                                        className={errors.englishName ? 'border-red-500' : ''}
                                    />
                                    <div className="text-xs text-gray-500">
                                        • يجب أن يكون فريد (غير مستخدم من قبل)<br/>
                                        • أحرف إنجليزية وأرقام وشرطات فقط<br/>
                                        • سيُستخدم في رابط الصفحة
                                    </div>
                                    {errors.englishName && (
                                        <span className="text-sm text-red-500">{errors.englishName.message}</span>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    <Label>اختيار الأيقونة</Label>
                                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-neutral-300 rounded-lg p-3">
                                        {availableEmojis.map((emoji, index) => (
                                            <div
                                                key={index}
                                                className={`p-2 border rounded-lg cursor-pointer transition-all text-center ${
                                                    watch('icon') === emoji.icon
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-neutral-300 hover:border-primary-300'
                                                }`}
                                                onClick={() => setValue('icon', emoji.icon, { shouldValidate: true })}
                                                title={emoji.name}
                                            >
                                                <Icon icon={emoji.icon} fontSize={24} />
                                                <p className="text-xs mt-1 truncate">{emoji.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.icon && (
                                        <span className="text-sm text-red-500">{errors.icon.message}</span>
                                    )}
                                </div>

                                {watch('icon') && (
                                    <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Icon icon={watch('icon')} fontSize={24} className="text-primary-600" />
                                            <span className="text-sm font-medium">الأيقونة المختارة</span>
                                        </div>
                                    </div>
                                )}
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
                                        editingEvent ? "تحديث" : "إضافة"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{
                maxHeight: '420px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                <div className="space-y-3">
                    {mainEvents.map(event => (
                        <div 
                            key={event.id} 
                            className={`border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer ${
                                selectedEvent?.id === event.id 
                                    ? 'border-primary-500 bg-primary-50' 
                                    : 'border-neutral-300 hover:border-primary-300'
                            }`}
                            onClick={() => onEventSelected && onEventSelected(event)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                                        <Icon icon={event.icon} fontSize={24} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-neutral-800">{event.name}</h4>
                                        <span className="text-sm text-neutral-500">
                                            {event.sub_events?.length || 0} أحداث فرعية
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleEdit(event) }}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Icon icon="material-symbols:edit" fontSize={16} />
                                    </Button>
                                    <DeletePopup
                                        item={event}
                                        onDelete={handleDelete}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Icon icon="material-symbols:delete" fontSize={16} />
                                        </Button>
                                    </DeletePopup>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {mainEvents.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                    <Icon icon="material-symbols:event" fontSize={48} className="mx-auto mb-4" />
                    <p>لا توجد أحداث رئيسية</p>
                    <p className="text-sm">اضغط على "إضافة حدث رئيسي" لبدء إضافة الأحداث</p>
                </div>
            )}
        </div>
    )
}

export default MainEventManager
