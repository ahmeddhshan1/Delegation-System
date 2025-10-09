import { useState } from 'react'
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
import { Icon } from "@iconify/react/dist/iconify.js"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import { useEffect } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { hallOptions } from "../../constants"
import MembersSelector from './MembersSelector'

const AddDepartureSession = ({ delegation, onAdd, remainingMembers }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedMembers, setSelectedMembers] = useState([])

    // إضافة الـ states للـ dropdown lists المشتركة
    const [selectedAirport, setSelectedAirport] = useState("")
    const [availableAirports, setAvailableAirports] = useState(() => {
        const savedAirports = localStorage.getItem('airports')
        if (savedAirports) {
            return JSON.parse(savedAirports)
        }
        return hallOptions.map(option => option.label)
    })
    const [airportSearchTerm, setAirportSearchTerm] = useState("")
    
    const [selectedAirline, setSelectedAirline] = useState("")
    const [availableAirlines, setAvailableAirlines] = useState(() => {
        const savedAirlines = localStorage.getItem('airlines')
        if (savedAirlines) {
            return JSON.parse(savedAirlines)
        }
        return [
            "الخطوط الجوية السعودية", "الخطوط الجوية الإماراتية", "الخطوط الجوية القطرية",
            "الخطوط الجوية الكويتية", "الخطوط الجوية العمانية", "الخطوط الجوية البحرينية",
            "الخطوط الجوية المصرية", "الخطوط الجوية الأردنية", "الخطوط الجوية اللبنانية",
            "الخطوط الجوية السورية", "الخطوط الجوية العراقية", "الخطوط الجوية اليمنية",
            "الخطوط الجوية التركية", "الخطوط الجوية الإيرانية", "الخطوط الجوية الأفغانية",
            "الخطوط الجوية الباكستانية", "الخطوط الجوية الهندية", "الخطوط الجوية البنجلاديشية",
            "الخطوط الجوية السريلانكية", "الخطوط الجوية المالديفية", "الخطوط الجوية النيبالية",
            "الخطوط الجوية الأمريكية", "الخطوط الجوية الكندية", "الخطوط الجوية الأسترالية"
        ]
    })
    const [airlineSearchTerm, setAirlineSearchTerm] = useState("")
    
    const [selectedDestination, setSelectedDestination] = useState("")
    const [availableDestinations, setAvailableDestinations] = useState(() => {
        const savedOrigins = localStorage.getItem('origins')
        if (savedOrigins) {
            return JSON.parse(savedOrigins)
        }
        return [
            "الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة",
            "الطائف", "تبوك", "بريدة", "خميس مشيط", "الهفوف",
            "الجبيل", "ينبع", "النماص", "الخبر", "القطيف",
            "الأحساء", "حائل", "الباحة", "نجران", "عرعر",
            "سكاكا", "القريات", "الرس", "عنيزة", "الزلفي"
        ]
    })
    const [destinationSearchTerm, setDestinationSearchTerm] = useState("")

    // إضافة الـ states للإضافة والحذف
    const [showAddAirport, setShowAddAirport] = useState(false)
    const [newAirport, setNewAirport] = useState("")
    const [showAddAirline, setShowAddAirline] = useState(false)
    const [newAirline, setNewAirline] = useState("")
    const [showAddDestination, setShowAddDestination] = useState(false)
    const [newDestination, setNewDestination] = useState("")
    const [deleteItem, setDeleteItem] = useState(null)

    // إضافة الـ handlers للـ dropdown lists
    const handleAirportChange = (value) => {
        setSelectedAirport(value)
        if (value === "add_new") {
            setShowAddAirport(true)
        } else {
            setValue('hall', value)
        }
    }

    const handleAirlineChange = (value) => {
        setSelectedAirline(value)
        if (value === "add_new") {
            setShowAddAirline(true)
        } else {
            setValue('airline', value)
        }
    }

    const handleDestinationChange = (value) => {
        setSelectedDestination(value)
        if (value === "add_new") {
            setShowAddDestination(true)
        } else {
            setValue('destination', value)
        }
    }

    // إضافة handlers للإضافة
    const handleAddNewAirport = () => {
        if (newAirport.trim() && !availableAirports.includes(newAirport.trim())) {
            const updatedAirports = [...availableAirports, newAirport.trim()].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableAirports(updatedAirports)
            localStorage.setItem('airports', JSON.stringify(updatedAirports))
            window.dispatchEvent(new CustomEvent('airportsUpdated'))
            setSelectedAirport(newAirport.trim())
            setValue('hall', newAirport.trim())
            setNewAirport("")
            setShowAddAirport(false)
            setAirportSearchTerm("")
            toast.success("تم إضافة المطار الجديد بنجاح")
        } else if (availableAirports.includes(newAirport.trim())) {
            toast.error("هذا المطار موجود بالفعل")
        } else {
            toast.error("يرجى إدخال اسم المطار")
        }
    }

    const handleAddNewAirline = () => {
        if (newAirline.trim() && !availableAirlines.includes(newAirline.trim())) {
            const updatedAirlines = [...availableAirlines, newAirline.trim()].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableAirlines(updatedAirlines)
            localStorage.setItem('airlines', JSON.stringify(updatedAirlines))
            window.dispatchEvent(new CustomEvent('airlinesUpdated'))
            setSelectedAirline(newAirline.trim())
            setValue('airline', newAirline.trim())
            setNewAirline("")
            setShowAddAirline(false)
            setAirlineSearchTerm("")
            toast.success("تم إضافة شركة الطيران الجديدة بنجاح")
        } else if (availableAirlines.includes(newAirline.trim())) {
            toast.error("هذه شركة الطيران موجودة بالفعل")
        } else {
            toast.error("يرجى إدخال اسم شركة الطيران")
        }
    }

    const handleAddNewDestination = () => {
        if (newDestination.trim() && !availableDestinations.includes(newDestination.trim())) {
            const updatedDestinations = [...availableDestinations, newDestination.trim()].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableDestinations(updatedDestinations)
            localStorage.setItem('origins', JSON.stringify(updatedDestinations))
            window.dispatchEvent(new CustomEvent('originsUpdated'))
            setSelectedDestination(newDestination.trim())
            setValue('destination', newDestination.trim())
            setNewDestination("")
            setShowAddDestination(false)
            setDestinationSearchTerm("")
            toast.success("تم إضافة الوجهة الجديدة بنجاح")
        } else if (availableDestinations.includes(newDestination.trim())) {
            toast.error("هذه الوجهة موجودة بالفعل")
        } else {
            toast.error("يرجى إدخال اسم الوجهة")
        }
    }

    // إضافة handlers للحذف
    const handleDeleteAirport = (airport) => {
        setDeleteItem({
            type: 'airport',
            name: airport,
            onDelete: () => {
                // حذف من قائمة المطارات
                const updatedAirports = availableAirports.filter(a => a !== airport)
                setAvailableAirports(updatedAirports)
                localStorage.setItem('airports', JSON.stringify(updatedAirports))
                
                // مسح المطار من الوفود التي تستخدمه (بدون تغيير حالة الوفد)
                const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]')
                const updatedDelegations = existingDelegations.map(delegation => {
                    if (delegation.arrivalInfo && delegation.arrivalInfo.arrivalHall === airport) {
                        return {
                            ...delegation,
                            arrivalInfo: {
                                ...delegation.arrivalInfo,
                                arrivalHall: "" // مسح المطار فقط
                            }
                        }
                    }
                    return delegation
                })
                localStorage.setItem('delegations', JSON.stringify(updatedDelegations))
                
                window.dispatchEvent(new CustomEvent('airportsUpdated'))
                window.dispatchEvent(new CustomEvent('delegationUpdated'))
                
                if (selectedAirport === airport) {
                    setSelectedAirport("")
                    setValue('hall', "")
                }
                toast.success("تم حذف المطار بنجاح")
                setDeleteItem(null)
            }
        })
    }

    const handleDeleteAirline = (airline) => {
        setDeleteItem({
            type: 'airline',
            name: airline,
            onDelete: () => {
                // حذف من قائمة شركات الطيران
                const updatedAirlines = availableAirlines.filter(a => a !== airline)
                setAvailableAirlines(updatedAirlines)
                localStorage.setItem('airlines', JSON.stringify(updatedAirlines))
                
                // مسح شركة الطيران من الوفود التي تستخدمها (بدون تغيير حالة الوفد)
                const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]')
                const updatedDelegations = existingDelegations.map(delegation => {
                    if (delegation.arrivalInfo && delegation.arrivalInfo.arrivalAirline === airline) {
                        return {
                            ...delegation,
                            arrivalInfo: {
                                ...delegation.arrivalInfo,
                                arrivalAirline: "" // مسح شركة الطيران فقط
                            }
                        }
                    }
                    return delegation
                })
                localStorage.setItem('delegations', JSON.stringify(updatedDelegations))
                
                window.dispatchEvent(new CustomEvent('airlinesUpdated'))
                window.dispatchEvent(new CustomEvent('delegationUpdated'))
                
                if (selectedAirline === airline) {
                    setSelectedAirline("")
                    setValue('airline', "")
                }
                toast.success("تم حذف شركة الطيران بنجاح")
                setDeleteItem(null)
            }
        })
    }

    const handleDeleteDestination = (destination) => {
        setDeleteItem({
            type: 'destination',
            name: destination,
            onDelete: () => {
                // حذف من قائمة المدن
                const updatedDestinations = availableDestinations.filter(d => d !== destination)
                setAvailableDestinations(updatedDestinations)
                localStorage.setItem('origins', JSON.stringify(updatedDestinations))
                
                // مسح المدينة من الوفود التي تستخدمها (بدون تغيير حالة الوفد)
                const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]')
                const updatedDelegations = existingDelegations.map(delegation => {
                    if (delegation.arrivalInfo && delegation.arrivalInfo.arrivalOrigin === destination) {
                        return {
                            ...delegation,
                            arrivalInfo: {
                                ...delegation.arrivalInfo,
                                arrivalOrigin: "" // مسح المدينة فقط
                            }
                        }
                    }
                    return delegation
                })
                localStorage.setItem('delegations', JSON.stringify(updatedDelegations))
                
                window.dispatchEvent(new CustomEvent('originsUpdated'))
                window.dispatchEvent(new CustomEvent('delegationUpdated'))
                
                if (selectedDestination === destination) {
                    setSelectedDestination("")
                    setValue('destination', "")
                }
                toast.success("تم حذف الوجهة بنجاح")
                setDeleteItem(null)
            }
        })
    }

    // تصفية البيانات حسب البحث
    const filteredAirports = availableAirports.filter(airport =>
        airport.toLowerCase().includes(airportSearchTerm.toLowerCase())
    )

    const filteredAirlines = availableAirlines.filter(airline =>
        airline.toLowerCase().includes(airlineSearchTerm.toLowerCase())
    )

    const filteredDestinations = availableDestinations.filter(destination =>
        destination.toLowerCase().includes(destinationSearchTerm.toLowerCase())
    )

    // الاستماع لتغييرات localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            // تحديث المطارات
            const savedAirports = localStorage.getItem('airports')
            if (savedAirports) {
                const airports = JSON.parse(savedAirports)
                setAvailableAirports(airports)
                // إعادة تعيين البحث
                setAirportSearchTerm("")
            }
            
            // تحديث شركات الطيران
            const savedAirlines = localStorage.getItem('airlines')
            if (savedAirlines) {
                const airlines = JSON.parse(savedAirlines)
                setAvailableAirlines(airlines)
                // إعادة تعيين البحث
                setAirlineSearchTerm("")
            }
            
            // تحديث المدن (الوجهات)
            const savedOrigins = localStorage.getItem('origins')
            if (savedOrigins) {
                const origins = JSON.parse(savedOrigins)
                setAvailableDestinations(origins)
                // إعادة تعيين البحث
                setDestinationSearchTerm("")
            }
        }

        // الاستماع للـ custom events
        window.addEventListener('airportsUpdated', handleStorageChange)
        window.addEventListener('airlinesUpdated', handleStorageChange)
        window.addEventListener('originsUpdated', handleStorageChange)
        window.addEventListener('delegationUpdated', handleStorageChange)
        
        return () => {
            window.removeEventListener('airportsUpdated', handleStorageChange)
            window.removeEventListener('airlinesUpdated', handleStorageChange)
            window.removeEventListener('originsUpdated', handleStorageChange)
            window.removeEventListener('delegationUpdated', handleStorageChange)
        }
    }, [])

    // إضافة event listener عام للـ localStorage changes
    useEffect(() => {
        const handleStorageEvent = (e) => {
            if (e.key === 'airports') {
                const airports = JSON.parse(e.newValue || '[]')
                setAvailableAirports(airports)
                setAirportSearchTerm("")
            } else if (e.key === 'airlines') {
                const airlines = JSON.parse(e.newValue || '[]')
                setAvailableAirlines(airlines)
                setAirlineSearchTerm("")
            } else if (e.key === 'origins') {
                const origins = JSON.parse(e.newValue || '[]')
                setAvailableDestinations(origins)
                setDestinationSearchTerm("")
            }
        }

        window.addEventListener('storage', handleStorageEvent)
        
        return () => {
            window.removeEventListener('storage', handleStorageEvent)
        }
    }, [])

    const validationSchema = yup.object({
        date: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        time: yup.string()
            .required("هذا الحقل لا يمكن ان يكون فارغا")
            .matches(/^[0-9]{4}$/, "يجب أن يكون الوقت بصيغة HHMM (مثل: 1430)"),
        hall: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        airline: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        flightNumber: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        destination: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        receptor: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        shipments: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
    })

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            date: "",
            time: "",
            hall: "",
            airline: "",
            flightNumber: "",
            destination: "",
            receptor: "",
            shipments: "",
            notes: "",
        }
    })

    const onSubmit = handleSubmit((data) => {
        if (selectedMembers.length === 0) {
            toast.error("يجب اختيار عضو واحد على الأقل")
            return
        }

        if (remainingMembers === 0) {
            toast.error("لا يوجد أعضاء متاحين للمغادرة")
            return
        }

        // تحويل IDs إلى member objects كاملة
        const memberObjects = selectedMembers.map(memberId => {
            // البحث عن العضو في localStorage
            try {
                const savedMembers = localStorage.getItem('members')
                if (savedMembers) {
                    const members = JSON.parse(savedMembers)
                    return members.find(member => member.id === memberId)
                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات الأعضاء:', error)
            }
            return null
        }).filter(member => member !== null)

        const newSession = {
            id: `dep_${Date.now()}`,
            date: data.date,
            time: data.time,
            hall: data.hall,
            airline: data.airline,
            flightNumber: data.flightNumber,
            destination: data.destination,
            receptor: data.receptor,
            shipments: data.shipments,
            members: memberObjects, // حفظ member objects كاملة
            notes: data.notes || ""
        }

        setLoading(true)
        
        // تحديث حالة الأعضاء في localStorage فوراً (بدون setTimeout)

        try {
            const savedMembers = localStorage.getItem('members')
            if (savedMembers) {
                const members = JSON.parse(savedMembers)

                
                const updatedMembers = members.map(member => {
                    if (selectedMembers.includes(member.id)) {

                        return { 
                            ...member, 
                            memberStatus: 'departed',
                            departureDate: data.date // تحديث تاريخ المغادرة
                        }
                    }
                    return member
                })
                localStorage.setItem('members', JSON.stringify(updatedMembers))
                
                // إرسال events لتحديث المكونات
                window.dispatchEvent(new CustomEvent('memberUpdated'))
                window.dispatchEvent(new CustomEvent('localStorageUpdated'))
            }
        } catch (error) {
            console.error('خطأ في تحديث حالة الأعضاء:', error)
        }
        
        setTimeout(() => {
            onAdd(newSession)
            toast.success("تم إضافة جلسة مغادرة جديدة")
            reset()
            setSelectedMembers([])
            setLoading(false)
            setOpen(false)
        }, 1500)
    })

    useEffect(() => {
        if (open) {
            reset()
            setSelectedMembers([])
            setSelectedAirport("")
            setSelectedAirline("")
            setSelectedDestination("")
            setAirportSearchTerm("")
            setAirlineSearchTerm("")
            setDestinationSearchTerm("")
            setShowAddAirport(false)
            setShowAddAirline(false)
            setShowAddDestination(false)
            setNewAirport("")
            setNewAirline("")
            setNewDestination("")
            setDeleteItem(null)
        }
    }, [open, reset])

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    className="cursor-pointer" 
                    disabled={remainingMembers === 0}
                    title={remainingMembers === 0 ? "لا يوجد أعضاء متاحين للمغادرة" : ""}
                >
                    <Icon icon="qlementine-icons:plus-16" />
                    <span>إضافة جلسة مغادرة</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] [&_[data-slot='dialog-close']]:!right-[95%] overflow-auto">
                <DialogHeader className="!text-start !py-2">
                    <DialogTitle>إضافة جلسة مغادرة جديدة</DialogTitle>
                    <DialogDescription>
                        يمكنك إضافة جلسة مغادرة جديدة للوفد {delegation.nationality}. 
                        الأعضاء المتاحون للمغادرة: {remainingMembers}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="grid gap-4">
                        {/* تفاصيل الرحلة */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="date">التاريخ</Label>
                                <input type="date" id="date" name="date" style={{ direction: 'ltr' }} {...register('date')} />
                                {errors.date && <span className="text-sm text-rose-400 block">{errors.date.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="time">سعت (HHMM)</Label>
                                <input 
                                    type="text" 
                                    id="time" 
                                    name="time" 
                                    {...register('time')} 
                                    placeholder="1430"
                                    maxLength="4"
                                    pattern="[0-9]{4}"
                                    onInput={(e) => {
                                        // إزالة أي حروف غير الأرقام
                                        let value = e.target.value.replace(/[^0-9]/g, '');
                                        // تحديد الحد الأقصى لـ 4 أرقام
                                        if (value.length > 4) {
                                            value = value.substring(0, 4);
                                        }
                                        e.target.value = value;
                                    }}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white"
                                />
                                {errors.time && <span className="text-sm text-rose-400 block">{errors.time.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="hall">المطار</Label>
                                
                                {showAddAirport && (
                                    <div className="flex gap-2 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                                        <input 
                                            type="text" 
                                            placeholder="أدخل اسم المطار الجديد"
                                            value={newAirport}
                                            onChange={(e) => setNewAirport(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-primary-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddNewAirport()
                                                } else if (e.key === 'Escape') {
                                                    setShowAddAirport(false)
                                                    setNewAirport("")
                                                }
                                            }}
                                        />
                                        <Button 
                                            type="button"
                                            size="sm"
                                            onClick={handleAddNewAirport}
                                            disabled={!newAirport.trim()}
                                            className="bg-primary-600 hover:bg-primary-700 rounded-lg"
                                        >
                                            <Icon icon="material-symbols:check" fontSize={16} />
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowAddAirport(false)
                                                setNewAirport("")
                                            }}
                                            className="border-primary-300 text-primary-600 hover:bg-primary-50 rounded-lg"
                                        >
                                            <Icon icon="material-symbols:close" fontSize={16} />
                                        </Button>
                                    </div>
                                )}
                                
                                <Select dir='rtl' value={selectedAirport} onValueChange={handleAirportChange} onOpenChange={(open) => {
                                    if (open) {
                                        setAirportSearchTerm("")
                                    }
                                }}>
                                    <SelectTrigger className="w-full !ring-0">
                                        <SelectValue placeholder="اختر المطار" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2 border-b">
                                            <input
                                                type="text"
                                                placeholder="ابحث عن مطار..."
                                                value={airportSearchTerm}
                                                onChange={(e) => setAirportSearchTerm(e.target.value)}
                                                className="w-full p-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 text-right"
                                                dir="rtl"
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredAirports.map((airport, index) => (
                                                <SelectItem key={index} value={airport} className="text-right">
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <button
                                                            type="button"
                                                            onPointerDown={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                handleDeleteAirport(airport)
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded flex-shrink-0"
                                                            title="حذف المطار"
                                                        >
                                                            <Icon icon="material-symbols:close" fontSize={16} />
                                                        </button>
                                                        <span className="flex-1">{airport}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {filteredAirports.length === 0 && (
                                                <div className="p-2 text-center text-neutral-500">
                                                    لا توجد مطارات مطابقة للبحث
                                                </div>
                                            )}
                                            <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="material-symbols:add" fontSize={16} />
                                                    <span>إضافة مطار جديد</span>
                                                </div>
                                            </SelectItem>
                                        </div>
                                    </SelectContent>
                                </Select>
                                {errors.hall && <span className="text-sm text-rose-400 block">{errors.hall.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="airline">شركة الطيران</Label>
                                
                                {showAddAirline && (
                                    <div className="flex gap-2 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                                        <input 
                                            type="text" 
                                            placeholder="أدخل اسم شركة الطيران الجديدة"
                                            value={newAirline}
                                            onChange={(e) => setNewAirline(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-primary-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddNewAirline()
                                                } else if (e.key === 'Escape') {
                                                    setShowAddAirline(false)
                                                    setNewAirline("")
                                                }
                                            }}
                                        />
                                        <Button 
                                            type="button"
                                            size="sm"
                                            onClick={handleAddNewAirline}
                                            disabled={!newAirline.trim()}
                                            className="bg-primary-600 hover:bg-primary-700 rounded-lg"
                                        >
                                            <Icon icon="material-symbols:check" fontSize={16} />
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowAddAirline(false)
                                                setNewAirline("")
                                            }}
                                            className="border-primary-300 text-primary-600 hover:bg-primary-50 rounded-lg"
                                        >
                                            <Icon icon="material-symbols:close" fontSize={16} />
                                        </Button>
                                    </div>
                                )}
                                
                                <Select dir='rtl' value={selectedAirline} onValueChange={handleAirlineChange} onOpenChange={(open) => {
                                    if (open) {
                                        setAirlineSearchTerm("")
                                    }
                                }}>
                                    <SelectTrigger className="w-full !ring-0">
                                        <SelectValue placeholder="اختر شركة الطيران" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2 border-b">
                                            <input
                                                type="text"
                                                placeholder="ابحث عن شركة الطيران..."
                                                value={airlineSearchTerm}
                                                onChange={(e) => setAirlineSearchTerm(e.target.value)}
                                                className="w-full p-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 text-right"
                                                dir="rtl"
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredAirlines.map((airline, index) => (
                                                <SelectItem key={index} value={airline} className="text-right">
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <button
                                                            type="button"
                                                            onPointerDown={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                handleDeleteAirline(airline)
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded flex-shrink-0"
                                                            title="حذف شركة الطيران"
                                                        >
                                                            <Icon icon="material-symbols:close" fontSize={16} />
                                                        </button>
                                                        <span className="flex-1">{airline}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {filteredAirlines.length === 0 && (
                                                <div className="p-2 text-center text-neutral-500">
                                                    لا توجد شركات طيران مطابقة للبحث
                                                </div>
                                            )}
                                            <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="material-symbols:add" fontSize={16} />
                                                    <span>إضافة شركة طيران جديدة</span>
                                                </div>
                                            </SelectItem>
                                        </div>
                                    </SelectContent>
                                </Select>
                                {errors.airline && <span className="text-sm text-rose-400 block">{errors.airline.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="flightNumber">رقم الرحلة</Label>
                                <input type="text" id="flightNumber" name="flightNumber" placeholder="ادخل رقم الرحلة" {...register('flightNumber')} />
                                {errors.flightNumber && <span className="text-sm text-rose-400 block">{errors.flightNumber.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="destination">وجهة الرحلة</Label>
                                
                                {showAddDestination && (
                                    <div className="flex gap-2 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                                        <input 
                                            type="text" 
                                            placeholder="أدخل اسم الوجهة الجديدة"
                                            value={newDestination}
                                            onChange={(e) => setNewDestination(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-primary-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddNewDestination()
                                                } else if (e.key === 'Escape') {
                                                    setShowAddDestination(false)
                                                    setNewDestination("")
                                                }
                                            }}
                                        />
                                        <Button 
                                            type="button"
                                            size="sm"
                                            onClick={handleAddNewDestination}
                                            disabled={!newDestination.trim()}
                                            className="bg-primary-600 hover:bg-primary-700 rounded-lg"
                                        >
                                            <Icon icon="material-symbols:check" fontSize={16} />
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowAddDestination(false)
                                                setNewDestination("")
                                            }}
                                            className="border-primary-300 text-primary-600 hover:bg-primary-50 rounded-lg"
                                        >
                                            <Icon icon="material-symbols:close" fontSize={16} />
                                        </Button>
                                    </div>
                                )}
                                
                                <Select dir='rtl' value={selectedDestination} onValueChange={handleDestinationChange} onOpenChange={(open) => {
                                    if (open) {
                                        setDestinationSearchTerm("")
                                    }
                                }}>
                                    <SelectTrigger className="w-full !ring-0">
                                        <SelectValue placeholder="اختر وجهة الرحلة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2 border-b">
                                            <input
                                                type="text"
                                                placeholder="ابحث عن وجهة..."
                                                value={destinationSearchTerm}
                                                onChange={(e) => setDestinationSearchTerm(e.target.value)}
                                                className="w-full p-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 text-right"
                                                dir="rtl"
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredDestinations.map((destination, index) => (
                                                <SelectItem key={index} value={destination} className="text-right">
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <button
                                                            type="button"
                                                            onPointerDown={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                handleDeleteDestination(destination)
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded flex-shrink-0"
                                                            title="حذف الوجهة"
                                                        >
                                                            <Icon icon="material-symbols:close" fontSize={16} />
                                                        </button>
                                                        <span className="flex-1">{destination}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {filteredDestinations.length === 0 && (
                                                <div className="p-2 text-center text-neutral-500">
                                                    لا توجد وجهات مطابقة للبحث
                                                </div>
                                            )}
                                            <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="material-symbols:add" fontSize={16} />
                                                    <span>إضافة وجهة جديدة</span>
                                                </div>
                                            </SelectItem>
                                        </div>
                                    </SelectContent>
                                </Select>
                                {errors.destination && <span className="text-sm text-rose-400 block">{errors.destination.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="receptor">المودع</Label>
                                <input type="text" id="receptor" name="receptor" placeholder="ادخل اسم المودع" {...register('receptor')} />
                                {errors.receptor && <span className="text-sm text-rose-400 block">{errors.receptor.message}</span>}
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="shipments">الشحنات</Label>
                                <input type="text" id="shipments" name="shipments" placeholder="ادخل الشحنات" {...register('shipments')} />
                                {errors.shipments && <span className="text-sm text-rose-400 block">{errors.shipments.message}</span>}
                            </div>
                        </div>

                        <div className="grid gap-3 w-full">
                            <Label htmlFor="notes">ملاحظات</Label>
                            <textarea 
                                id="notes" 
                                name="notes" 
                                placeholder="ادخل أي ملاحظات إضافية" 
                                rows={3}
                                {...register('notes')} 
                            />
                        </div>

                        {/* اختيار الأعضاء */}
                        <div className="grid gap-3 w-full">
                            <Label>اختيار الأعضاء المغادرين</Label>
                            <MembersSelector 
                                delegation={delegation}
                                selected={selectedMembers}
                                onChange={setSelectedMembers}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button disabled={loading} variant="outline" className="cursor-pointer">الغاء</Button>
                        </DialogClose>
                        <Button disabled={loading} type="button" className="cursor-pointer" onClick={onSubmit}>
                            {loading ? (
                                <>
                                    <Icon icon="jam:refresh" className="animate-spin" />
                                    <span>إضافة ...</span>
                                </>
                            ) : (
                                <span>إضافة جلسة مغادرة</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>


        {/* مكون تأكيد الحذف */}
        {deleteItem && (
            <div 
                className="fixed inset-0 flex items-center justify-center" 
                data-delete-popup 
                style={{ 
                    pointerEvents: 'auto',
                    zIndex: 9999999,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    isolation: 'isolate'
                }}
            >
                <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteItem(null)} />
                <div 
                    className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6" 
                    dir="rtl" 
                    style={{ 
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 10000000,
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                        isolation: 'isolate'
                    }}
                >
                    <p className="text-gray-700 text-right mb-4">
                        هل أنت متأكد من الحذف؟
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setDeleteItem(null)
                            }}
                            className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium"
                            style={{ pointerEvents: 'auto' }}
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                deleteItem.onDelete()
                            }}
                            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium"
                            style={{ pointerEvents: 'auto' }}
                        >
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default AddDepartureSession
