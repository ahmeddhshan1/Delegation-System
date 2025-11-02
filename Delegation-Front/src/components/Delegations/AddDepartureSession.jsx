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
import Icon from '../ui/Icon';
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import { useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { fetchAirports, createAirport, deleteAirport } from '../../store/slices/airportsSlice'
import { fetchAirlines, createAirline, deleteAirline } from '../../store/slices/airlinesSlice'
import { fetchCities, createCity, deleteCity } from '../../store/slices/citiesSlice'
import { createDepartureSession } from '../../store/slices/delegationsSlice'
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
    const dispatch = useDispatch()
    
    // Redux selectors
    const { airports } = useSelector(state => state.airports)
    const { airlines } = useSelector(state => state.airlines)
    const { cities } = useSelector(state => state.cities)
    
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedMembers, setSelectedMembers] = useState([])

    // Local UI state
    const [selectedAirport, setSelectedAirport] = useState("")
    const [airportSearchTerm, setAirportSearchTerm] = useState("")
    
    const [selectedAirline, setSelectedAirline] = useState("")
    const [airlineSearchTerm, setAirlineSearchTerm] = useState("")
    
    const [selectedDestination, setSelectedDestination] = useState("")
    
    // Derived state from Redux
    const availableAirports = airports.map(a => a.name)
    const airportNameToId = airports.reduce((acc, a) => { acc[a.name] = a.id; return acc }, {})
    
    const availableAirlines = airlines.map(a => a.name)
    const airlineNameToId = airlines.reduce((acc, a) => { acc[a.name] = a.id; return acc }, {})
    
    const availableDestinations = cities.map(c => c.city_name)
    const cityNameToId = cities.reduce((acc, c) => { acc[c.city_name] = c.id; return acc }, {})
    
    const [destinationSearchTerm, setDestinationSearchTerm] = useState("")

    // UI states for add/delete operations
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
    const handleAddNewAirport = async () => {
        const name = newAirport.trim()
        if (!name) {
            toast.error("يرجى إدخال اسم المطار")
            return
        }
        if (availableAirports.includes(name)) {
            toast.error("هذا المطار موجود بالفعل")
            return
        }
        
        try {
            const created = await dispatch(createAirport({ name })).unwrap()
            setSelectedAirport(created.name)
            setValue('hall', created.name)
            setNewAirport("")
            setShowAddAirport(false)
            setAirportSearchTerm("")
            toast.success("تم إضافة المطار الجديد بنجاح")
        } catch (error) {
            toast.error("تعذر إضافة المطار. تأكد أن الاسم غير مكرر")
        }
    }

    const handleAddNewAirline = async () => {
        const name = newAirline.trim()
        if (!name) {
            toast.error("يرجى إدخال اسم شركة الطيران")
            return
        }
        if (availableAirlines.includes(name)) {
            toast.error("هذه شركة الطيران موجودة بالفعل")
            return
        }
        
        try {
            const created = await dispatch(createAirline({ name })).unwrap()
            setSelectedAirline(created.name)
            setValue('airline', created.name)
            setNewAirline("")
            setShowAddAirline(false)
            setAirlineSearchTerm("")
            toast.success("تم إضافة شركة الطيران الجديدة بنجاح")
        } catch (error) {
            toast.error("تعذر إضافة شركة الطيران. تأكد أن الاسم غير مكرر")
        }
    }

    const handleAddNewDestination = async () => {
        const name = newDestination.trim()
        if (!name) {
            toast.error("يرجى إدخال اسم الوجهة")
            return
        }
        if (availableDestinations.includes(name)) {
            toast.error("هذه الوجهة موجودة بالفعل")
            return
        }
        
        try {
            const created = await dispatch(createCity({ city_name: name })).unwrap()
            setSelectedDestination(created.city_name)
            setValue('destination', created.city_name)
            setNewDestination("")
            setShowAddDestination(false)
            setDestinationSearchTerm("")
            toast.success("تم إضافة الوجهة الجديدة بنجاح")
        } catch (error) {
            toast.error("تعذر إضافة الوجهة. تأكد أن الاسم غير مكرر")
        }
    }

    // إضافة handlers للحذف
    const handleDeleteAirport = (airport) => {
        setDeleteItem({
            type: 'airport',
            name: airport,
            onDelete: async () => {
                try {
                    const airportId = airportNameToId[airport]
                    if (airportId) {
                        await dispatch(deleteAirport(airportId)).unwrap()
                    }
                    
                    if (selectedAirport === airport) {
                        setSelectedAirport("")
                        setValue('hall', "")
                    }
                    
                    toast.success("تم حذف المطار بنجاح")
                    setDeleteItem(null)
                } catch (error) {
                    toast.error("حدث خطأ في حذف المطار")
                    setDeleteItem(null)
                }
            }
        })
    }

    const handleDeleteAirline = (airline) => {
        setDeleteItem({
            type: 'airline',
            name: airline,
            onDelete: async () => {
                try {
                    const airlineId = airlineNameToId[airline]
                    if (airlineId) {
                        await dispatch(deleteAirline(airlineId)).unwrap()
                    }
                    
                    if (selectedAirline === airline) {
                        setSelectedAirline("")
                        setValue('airline', "")
                    }
                    
                    toast.success("تم حذف شركة الطيران بنجاح")
                    setDeleteItem(null)
                } catch (error) {
                    toast.error("حدث خطأ في حذف شركة الطيران")
                    setDeleteItem(null)
                }
            }
        })
    }

    const handleDeleteDestination = (destination) => {
        setDeleteItem({
            type: 'destination',
            name: destination,
            onDelete: async () => {
                try {
                    const cityId = cityNameToId[destination]
                    if (cityId) {
                        await dispatch(deleteCity(cityId)).unwrap()
                    }
                    
                    if (selectedDestination === destination) {
                        setSelectedDestination("")
                        setValue('destination', "")
                    }
                    
                    toast.success("تم حذف الوجهة بنجاح")
                    setDeleteItem(null)
                } catch (error) {
                    toast.error("حدث خطأ في حذف الوجهة")
                    setDeleteItem(null)
                }
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

    // تحميل القوائم من Redux
    useEffect(() => {
        dispatch(fetchAirports())
        dispatch(fetchAirlines())
        dispatch(fetchCities())
    }, [dispatch])

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

    const onSubmit = handleSubmit(async (data) => {
        if (selectedMembers.length === 0) {
            toast.error("يجب اختيار عضو واحد على الأقل")
            return
        }

        if (remainingMembers === 0) {
            toast.error("لا يوجد أعضاء متاحين للمغادرة")
            return
        }
        // ماب الحقول من الواجهة إلى الـ API
        // تحويل الوقت إلى HH:MM:SS
        const timeStr = (data.time || '').trim()
        const hh = timeStr.slice(0, 2)
        const mm = timeStr.slice(2, 4)
        const normalizedTime = (hh && mm) ? `${hh}:${mm}:00` : null

        const payload = {
            delegation_id: delegation.id,
            checkout_date: data.date,
            checkout_time: normalizedTime,
            airport_id: airportNameToId[data.hall] || null,
            airline_id: airlineNameToId[data.airline] || null,
            city_id: cityNameToId[data.destination] || null,
            flight_number: data.flightNumber,
            depositor_name: data.receptor,
            goods: data.shipments,
            notes: data.notes || "",
            members: selectedMembers,
        }

        setLoading(true)
        try {
            await dispatch(createDepartureSession(payload)).unwrap()
            toast.success("تم إضافة جلسة مغادرة جديدة")
            if (onAdd) onAdd()
            setOpen(false)
            reset()
            setSelectedMembers([])
            
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent('departureSessionAdded'))
        } catch (error) {
            toast.error("حدث خطأ في إضافة جلسة المغادرة")
        } finally {
            setLoading(false)
        }
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
                    <Icon name="Plus" size={20} />
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
                                            <Icon name="Check" size={16} />
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
                                            <Icon name="X" size={16} />
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
                                                            <Icon name="X" size={16} />
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
                                                    <Icon name="Plus" size={16} />
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
                                            <Icon name="Check" size={16} />
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
                                            <Icon name="X" size={16} />
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
                                                            <Icon name="X" size={16} />
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
                                                    <Icon name="Plus" size={16} />
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
                                            <Icon name="Check" size={16} />
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
                                            <Icon name="X" size={16} />
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
                                                            <Icon name="X" size={16} />
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
                                                    <Icon name="Plus" size={16} />
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
                                className="border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                isEditing={false}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button disabled={loading} variant="outline" className="cursor-pointer">الغاء</Button>
                        </DialogClose>
                        <Button disabled={loading} type="button" className="cursor-pointer" onClick={onSubmit}>
                            {loading ? (
                                <>
                                    <Icon name="RefreshCw" size={20} className="animate-spin" />
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


