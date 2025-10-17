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
import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { hallOptions } from "../../constants"
import { nationalities } from "../../utils/nationalities"
import { delegationService, nationalityService, airportService, airlineService, citiesService } from "../../services/api"
// import DeleteConfirm from "../ui/delete-confirm"

const AddDelegation = ({ subEventId }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [selectedNationality, setSelectedNationality] = useState("")
    const [showAddNationality, setShowAddNationality] = useState(false)
    const [newNationality, setNewNationality] = useState("")
    const [availableNationalities, setAvailableNationalities] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    
    // مطارات
    const [selectedAirport, setSelectedAirport] = useState("")
    const [showAddAirport, setShowAddAirport] = useState(false)
    const [newAirport, setNewAirport] = useState("")
    const [availableAirports, setAvailableAirports] = useState([])
    const [airportSearchTerm, setAirportSearchTerm] = useState("")
    
    // شركات الطيران
    const [selectedAirline, setSelectedAirline] = useState("")
    const [showAddAirline, setShowAddAirline] = useState(false)
    const [newAirline, setNewAirline] = useState("")
    const [availableAirlines, setAvailableAirlines] = useState([])
    const [airlineSearchTerm, setAirlineSearchTerm] = useState("")

    // قادمة من
    const [selectedOrigin, setSelectedOrigin] = useState("")
    const [showAddOrigin, setShowAddOrigin] = useState(false)
    const [newOrigin, setNewOrigin] = useState("")
    const [availableOrigins, setAvailableOrigins] = useState([])
    const [originSearchTerm, setOriginSearchTerm] = useState("")

    // حالات حذف العناصر
    const [deleteItem, setDeleteItem] = useState(null)

    // الاستماع لتغييرات localStorage
    useEffect(() => {
        let isMounted = true // flag لتتبع حالة المكون
        
        const handleStorageChange = () => {
            // التحقق من أن المكون ما زال mounted
            if (!isMounted) return
            
            // تحديث الجنسيات
            const savedNationalities = localStorage.getItem('nationalities')
            if (savedNationalities && isMounted) {
                setAvailableNationalities(JSON.parse(savedNationalities))
            }
            
            // تحديث المطارات
            const savedAirports = localStorage.getItem('airports')
            if (savedAirports && isMounted) {
                setAvailableAirports(JSON.parse(savedAirports))
            }
            
            // تحديث شركات الطيران
            const savedAirlines = localStorage.getItem('airlines')
            if (savedAirlines && isMounted) {
                setAvailableAirlines(JSON.parse(savedAirlines))
            }
            
            // تحديث المدن
            const savedOrigins = localStorage.getItem('origins')
            if (savedOrigins && isMounted) {
                setAvailableOrigins(JSON.parse(savedOrigins))
            }
        }

        // الاستماع للـ storage event (من tabs تانية)
        window.addEventListener('storage', handleStorageChange)
        
        // الاستماع للـ custom events (من نفس الـ tab)
        window.addEventListener('nationalitiesUpdated', handleStorageChange)
        window.addEventListener('airportsUpdated', handleStorageChange)
        window.addEventListener('airlinesUpdated', handleStorageChange)
        window.addEventListener('originsUpdated', handleStorageChange)
        
        return () => {
            isMounted = false // تعيين flag إلى false عند cleanup
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('nationalitiesUpdated', handleStorageChange)
            window.removeEventListener('airportsUpdated', handleStorageChange)
            window.removeEventListener('airlinesUpdated', handleStorageChange)
            window.removeEventListener('originsUpdated', handleStorageChange)
        }
    }, [])

    // تحميل القوائم من قاعدة البيانات (API)
    useEffect(() => {
        let mounted = true
        const loadDropdownsFromAPI = async () => {
            try {
                const [nRes, apRes, alRes, cRes] = await Promise.all([
                    nationalityService.getNationalities(),
                    airportService.getAirports(),
                    airlineService.getAirlines(),
                    citiesService.getCities(),
                ])

                if (!mounted) return

                const toArray = (res, nameKey) => {
                    if (res && Array.isArray(res.results)) return res.results.map(r => r[nameKey]).filter(Boolean)
                    if (Array.isArray(res)) return res.map(r => r[nameKey]).filter(Boolean)
                    return []
                }

                setAvailableNationalities(toArray(nRes, 'name'))
                setAvailableAirports(toArray(apRes, 'name'))
                setAvailableAirlines(toArray(alRes, 'name'))
                setAvailableOrigins(toArray(cRes, 'city_name'))
            } catch (e) {
                // إبقاء القيم الحالية (localStorage / الثوابت) كـ fallback
            }
        }

        loadDropdownsFromAPI()
        return () => { mounted = false }
    }, [])

    const validationSchema = yup.object({
        delegationHead: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        membersCount: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        arrivalAirline: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        arrivalFlightNumber: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        arrivalOrigin: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        arrivalDate: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        arrivalTime: yup.string()
            .required("هذا الحقل لا يمكن ان يكون فارغا")
            .matches(/^[0-9]{4}$/, "يجب أن يكون الوقت بصيغة HHMM (مثل: 1430)"),
        arrivalReceptor: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        arrivalDestination: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        arrivalShipments: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        delegationType: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
    })


    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            nationality: "",
            delegationHead: "",
            membersCount: null,
            arrivalHall: "",
            arrivalAirline: "",
            arrivalFlightNumber: "",
            arrivalOrigin: "",
            arrivalDate: "",
            arrivalTime: "",
            arrivalReceptor: "",
            arrivalDestination: "",
            arrivalShipments: "",
            delegationType: "",
        }
    })


    const handleNationalityChange = (value) => {
        setSelectedNationality(value)
        if (value === "add_new") {
            setShowAddNationality(true)
        } else {
            setValue('nationality', value)
        }
    }

    const handleAirportChange = (value) => {
        setSelectedAirport(value)
        if (value === "add_new") {
            setShowAddAirport(true)
        } else {
            setValue('arrivalHall', value)
        }
    }

    const handleAirlineChange = (value) => {
        setSelectedAirline(value)
        if (value === "add_new") {
            setShowAddAirline(true)
        } else {
            setValue('arrivalAirline', value)
        }
    }

    const handleOriginChange = (value) => {
        setSelectedOrigin(value)
        if (value === "add_new") {
            setShowAddOrigin(true)
        } else {
            setValue('arrivalOrigin', value)
        }
    }

    const handleAddOrigin = async () => {
        const name = newOrigin.trim()
        if (!name) {
            toast.error("يرجى إدخال اسم المدينة")
            return
        }
        try {
            const created = await citiesService.createCity({ city_name: name })
            const updated = [...availableOrigins, created.city_name].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableOrigins(updated)
            setSelectedOrigin(created.city_name)
            setNewOrigin("")
            setShowAddOrigin(false)
            setOriginSearchTerm("")
            toast.success("تم إضافة المدينة الجديدة بنجاح")
        } catch (e) {
            toast.error("تعذر إضافة المدينة. تأكد أن الاسم غير مكرر")
        }
    }

    const handleAddNewNationality = async () => {
        const name = newNationality.trim()
        if (!name) {
            toast.error("يرجى إدخال اسم الجنسية")
            return
        }
        try {
            const created = await nationalityService.createNationality({ name })
            const updated = [...availableNationalities, created.name].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableNationalities(updated)
            setSelectedNationality(created.name)
            setValue('nationality', created.name)
            setNewNationality("")
            setShowAddNationality(false)
            setSearchTerm("")
            toast.success("تم إضافة الجنسية الجديدة بنجاح")
        } catch (e) {
            toast.error("تعذر إضافة الجنسية. تأكد أن الاسم غير مكرر")
        }
    }

    const handleAddNewAirport = async () => {
        const name = newAirport.trim()
        if (!name) {
            toast.error("يرجى إدخال اسم المطار")
            return
        }
        try {
            const created = await airportService.createAirport({ name })
            const updated = [...availableAirports, created.name].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableAirports(updated)
            setSelectedAirport(created.name)
            setValue('arrivalHall', created.name)
            setNewAirport("")
            setShowAddAirport(false)
            setAirportSearchTerm("")
            toast.success("تم إضافة المطار الجديد بنجاح")
        } catch (e) {
            toast.error("تعذر إضافة المطار. تأكد أن الاسم غير مكرر")
        }
    }

    const handleAddNewAirline = async () => {
        const name = newAirline.trim()
        if (!name) {
            toast.error("يرجى إدخال اسم شركة الطيران")
            return
        }
        try {
            const created = await airlineService.createAirline({ name })
            const updated = [...availableAirlines, created.name].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableAirlines(updated)
            setSelectedAirline(created.name)
            setValue('arrivalAirline', created.name)
            setNewAirline("")
            setShowAddAirline(false)
            setAirlineSearchTerm("")
            toast.success("تم إضافة شركة الطيران الجديدة بنجاح")
        } catch (e) {
            toast.error("تعذر إضافة شركة الطيران. تأكد أن الاسم غير مكرر")
        }
    }

    // دوال الحذف
    const handleDeleteNationality = (nationality) => {
        setDeleteItem({
            type: 'nationality',
            name: nationality,
            onDelete: () => {
                // حذف من قائمة الجنسيات
                const updatedNationalities = availableNationalities.filter(n => n !== nationality)
                setAvailableNationalities(updatedNationalities)
                localStorage.setItem('nationalities', JSON.stringify(updatedNationalities))
                
                // مسح الجنسية من الوفود التي تستخدمها (بدون تغيير حالة الوفد)
                const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]')
                const updatedDelegations = existingDelegations.map(delegation => {
                    if (delegation.nationality === nationality) {
                        return {
                            ...delegation,
                            nationality: "" // مسح الجنسية فقط
                        }
                    }
                    return delegation
                })
                localStorage.setItem('delegations', JSON.stringify(updatedDelegations))
                
                window.dispatchEvent(new CustomEvent('nationalitiesUpdated'))
                window.dispatchEvent(new CustomEvent('delegationUpdated'))
                
                if (selectedNationality === nationality) {
                    setSelectedNationality("")
                    setValue('nationality', "")
                }
                toast.success("تم حذف الجنسية بنجاح")
                setDeleteItem(null)
            }
        })
    }

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
                    setValue('arrivalHall', "")
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
                    setValue('arrivalAirline', "")
                }
                toast.success("تم حذف شركة الطيران بنجاح")
                setDeleteItem(null)
            }
        })
    }

    const handleDeleteOrigin = (origin) => {
        setDeleteItem({
            type: 'origin',
            name: origin,
            onDelete: () => {
                // حذف من قائمة المدن
                const updatedOrigins = availableOrigins.filter(o => o !== origin)
                setAvailableOrigins(updatedOrigins)
                localStorage.setItem('origins', JSON.stringify(updatedOrigins))
                
                // مسح المدينة من الوفود التي تستخدمها (بدون تغيير حالة الوفد)
                const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]')
                const updatedDelegations = existingDelegations.map(delegation => {
                    if (delegation.arrivalInfo && delegation.arrivalInfo.arrivalOrigin === origin) {
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
                
                if (selectedOrigin === origin) {
                    setSelectedOrigin("")
                    setValue('arrivalOrigin', "")
                }
                toast.success("تم حذف المدينة بنجاح")
                setDeleteItem(null)
            }
        })
    }

    // تصفية الجنسيات حسب البحث
    const filteredNationalities = availableNationalities.filter(nationality =>
        nationality.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // تصفية المطارات حسب البحث
    const filteredAirports = availableAirports.filter(airport =>
        airport.toLowerCase().includes(airportSearchTerm.toLowerCase())
    )

    // تصفية شركات الطيران حسب البحث
    const filteredAirlines = availableAirlines.filter(airline =>
        airline.toLowerCase().includes(airlineSearchTerm.toLowerCase())
    )

    // تصفية المدن حسب البحث
    const filteredOrigins = availableOrigins.filter(origin =>
        origin.toLowerCase().includes(originSearchTerm.toLowerCase())
    )

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true)
        
        // التحقق من الجنسية والمطار وشركة الطيران وقادمة من
        if (!selectedNationality) {
            toast.error("يرجى اختيار الجنسية")
            setLoading(false)
            return
        }
        
        if (!selectedAirport) {
            toast.error("يرجى اختيار المطار")
            setLoading(false)
            return
        }
        
        if (!selectedAirline) {
            toast.error("يرجى اختيار شركة الطيران")
            setLoading(false)
            return
        }
        
        if (!selectedOrigin) {
            toast.error("يرجى اختيار قادمة من")
            setLoading(false)
            return
        }
        
        try {
            // تجهيز المعرفات من القوائم
            const natRes = await nationalityService.getNationalities()
            const apRes = await airportService.getAirports()
            const alRes = await airlineService.getAirlines()
            const ciRes = await citiesService.getCities()

            const toList = (res) => (res && Array.isArray(res.results)) ? res.results : (Array.isArray(res) ? res : [])
            const nat = toList(natRes).find(x => x.name === selectedNationality)
            const ap = toList(apRes).find(x => x.name === selectedAirport)
            const al = toList(alRes).find(x => x.name === selectedAirline)
            const ci = toList(ciRes).find(x => x.city_name === selectedOrigin)

            // صياغة الوقت HHMM إلى HH:MM
            const timeStr = (data.arrivalTime || '').trim()
            const formattedTime = timeStr && timeStr.length === 4 ? `${timeStr.slice(0,2)}:${timeStr.slice(2)}` : null

            // إعداد بيانات الوفد حسب نموذج الباك إند
            const delegationData = {
                sub_event_id: subEventId,
                nationality_id: nat ? nat.id : null,
                airport_id: ap ? ap.id : null,
                airline_id: al ? al.id : null,
                city_id: ci ? ci.id : null,
                delegation_leader_name: data.delegationHead,
                member_count: parseInt(data.membersCount) || 0,
                flight_number: data.arrivalFlightNumber,
                type: data.delegationType === 'military' ? 'MILITARY' : 'CIVILIAN',
                status: 'NOT_DEPARTED',
                arrive_date: data.arrivalDate || null,
                arrive_time: formattedTime,
                receiver_name: data.arrivalReceptor,
                going_to: selectedOrigin,
                goods: data.arrivalShipments,
            }

            // إرسال البيانات للباك إند
            const newDelegation = await delegationService.createDelegation(delegationData)
            
            // إرسال حدث لتحديث المكونات الأخرى
            console.log('AddDelegation: Dispatching delegationAdded event')
            window.dispatchEvent(new CustomEvent('delegationAdded', { detail: newDelegation }))
            
            toast.success("تم إضافة وفد جديد بنجاح")
            reset()
            setSelectedNationality("")
            setSelectedAirport("")
            setSelectedAirline("")
            setSelectedOrigin("")
            setSearchTerm("")
            setAirportSearchTerm("")
            setAirlineSearchTerm("")
            setOriginSearchTerm("")
            setLoading(false)
            setOpen(false)
            
        } catch (error) {
            console.error('Error adding delegation:', error)
            const errorMessage = error.response?.data?.detail || 
                                error.response?.data?.error || 
                                "حدث خطأ أثناء إضافة الوفد"
            toast.error(errorMessage)
            setLoading(false)
        }
    })

    useEffect(() => {
        reset()
        setSelectedNationality("")
        setSelectedAirport("")
        setSelectedAirline("")
        setSelectedOrigin("")
        setSearchTerm("")
        setAirportSearchTerm("")
        setAirlineSearchTerm("")
        setOriginSearchTerm("")
        setShowAddNationality(false)
        setShowAddAirport(false)
        setShowAddAirline(false)
        setShowAddOrigin(false)
        setNewNationality("")
        setNewAirport("")
        setNewAirline("")
        setNewOrigin("")
    }, [open])

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <Icon icon="qlementine-icons:plus-16" />
                    <span>تسجيل وصول وفد</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[95vh] [&_[data-slot='dialog-close']]:!right-[95%] overflow-auto scrollbar-hide">
                <DialogHeader className="!text-start !py-6 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                            <Icon icon="material-symbols:group-add" fontSize={24} className="text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-primary-600">
                                إضافة وفد جديد
                            </DialogTitle>
                            <DialogDescription className="text-neutral-600 mt-1">
                                يمكنك إضافة وفد جديد من هنا، حينما تنتهي من ملء البيانات قم بالضغط على إضافة.
                    </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="p-6 space-y-6">
                        {/* معلومات أساسية */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Icon icon="material-symbols:person" fontSize={16} className="text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-800">المعلومات الأساسية</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="delegationHead" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:person" fontSize={16} className="text-primary-500" />
                                        رئيس الوفد
                                    </Label>
                                    <input 
                                        type="text" 
                                        id="delegationHead" 
                                        name="delegationHead" 
                                        placeholder="أدخل اسم رئيس الوفد" 
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white"
                                        {...register('delegationHead')} 
                                    />
                                    {errors.delegationHead && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.delegationHead.message}
                                    </span>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:public" fontSize={16} className="text-primary-500" />
                                        الجنسية
                                    </Label>
                                
                                    {showAddNationality && (
                                        <div className="flex gap-2 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                                            <input 
                                                type="text" 
                                                placeholder="أدخل اسم الجنسية الجديدة"
                                                value={newNationality}
                                                onChange={(e) => setNewNationality(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-primary-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
                                            />
                                            <Button 
                                                type="button"
                                                size="sm"
                                                onClick={handleAddNewNationality}
                                                disabled={!newNationality.trim()}
                                                className="bg-primary-600 hover:bg-primary-700 rounded-lg"
                                            >
                                                <Icon icon="material-symbols:check" fontSize={16} />
                                            </Button>
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setShowAddNationality(false)
                                                    setNewNationality("")
                                                }}
                                                className="border-primary-300 text-primary-600 hover:bg-primary-50 rounded-lg"
                                            >
                                                <Icon icon="material-symbols:close" fontSize={16} />
                                            </Button>
                                        </div>
                                    )}
                                
                                    <Select value={selectedNationality} onValueChange={handleNationalityChange} onOpenChange={(open) => {
                                        if (!open) {
                                            setSearchTerm("")
                                        }
                                    }}>
                                        <SelectTrigger className="w-full text-right border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3" dir="rtl">
                                            <SelectValue placeholder="ابحث واختر الجنسية">
                                                {selectedNationality || "ابحث واختر الجنسية"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent 
                                            className="max-h-[300px] text-right" 
                                            dir="rtl"
                                        >
                                            <div className="p-2 border-b">
                                                <input 
                                                    type="text" 
                                                    placeholder="ابحث في الجنسيات..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    onFocus={(e) => e.stopPropagation()}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto">
                                                {filteredNationalities.length > 0 ? (
                                                    <>
                                                        {filteredNationalities.map((nationality, index) => (
                                                            <SelectItem key={index} value={nationality} className="text-right" dir="rtl">
                                                                <div className="flex items-center justify-between w-full gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onPointerDown={(e) => {
                                                                            e.preventDefault()
                                                                            e.stopPropagation()
                                                                            handleDeleteNationality(nationality)
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 p-1 rounded flex-shrink-0"
                                                                        title="حذف الجنسية"
                                                                    >
                                                                        <Icon icon="material-symbols:close" fontSize={16} />
                                                                    </button>
                                                                    <span className="flex-1">{nationality}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="material-symbols:add" fontSize={16} />
                                                                إضافة جنسية جديدة
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-3 text-sm text-neutral-500 text-center">
                                                            لا توجد نتائج للبحث
                                                        </div>
                                                        <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="material-symbols:add" fontSize={16} />
                                                                إضافة جنسية جديدة
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                    {errors.nationality && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.nationality.message}
                                    </span>}
                            </div>
                            </div>
                        </div>
                        {/* معلومات الوفد */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Icon icon="material-symbols:group" fontSize={16} className="text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-800">معلومات الوفد</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:flight" fontSize={16} className="text-primary-500" />
                                        المطار
                                    </Label>
                                    
                                    {showAddAirport && (
                                        <div className="flex gap-2 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                                            <input 
                                                type="text" 
                                                placeholder="أدخل اسم المطار الجديد"
                                                value={newAirport}
                                                onChange={(e) => setNewAirport(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-primary-300 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white"
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
                                    
                                    <Select value={selectedAirport} onValueChange={handleAirportChange} onOpenChange={(open) => {
                                        if (!open) {
                                            setAirportSearchTerm("")
                                        }
                                    }}>
                                        <SelectTrigger className="w-full text-right border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3" dir="rtl">
                                            <SelectValue placeholder="ابحث واختر المطار">
                                                {selectedAirport || "ابحث واختر المطار"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent 
                                            className="max-h-[300px] text-right" 
                                            dir="rtl"
                                        >
                                            <div className="p-2 border-b">
                                                <input 
                                                    type="text" 
                                                    placeholder="ابحث في المطارات..."
                                                    value={airportSearchTerm}
                                                    onChange={(e) => setAirportSearchTerm(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    onFocus={(e) => e.stopPropagation()}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto">
                                                {filteredAirports.length > 0 ? (
                                                    <>
                                                        {filteredAirports.map((airport, index) => (
                                                            <SelectItem key={index} value={airport} className="text-right" dir="rtl">
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
                                                        <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="material-symbols:add" fontSize={16} />
                                                                إضافة مطار جديد
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-3 text-sm text-neutral-500 text-center">
                                                            لا توجد نتائج للبحث
                                                        </div>
                                                        <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="material-symbols:add" fontSize={16} />
                                                                إضافة مطار جديد
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                    {errors.arrivalHall && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalHall.message}
                                    </span>}
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="h-6 flex items-center">
                                        <Label htmlFor="membersCount" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                            <Icon icon="material-symbols:people" fontSize={16} className="text-primary-500" />
                                            عدد الأعضاء
                                        </Label>
                                    </div>
                                    <input 
                                        type="number" 
                                        id="membersCount" 
                                        name="membersCount" 
                                        placeholder="أدخل عدد الأعضاء" 
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white"
                                        {...register('membersCount')} 
                                    />
                                    {errors.membersCount && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.membersCount.message}
                                    </span>}
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="h-6 flex items-center">
                                        <Label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                            <Icon icon="material-symbols:badge" fontSize={16} className="text-primary-500" />
                                            نوع الوفد
                                        </Label>
                                    </div>
                                    <Select value={watch('delegationType')} onValueChange={val => setValue('delegationType', val, { shouldValidate: true })}>
                                        <SelectTrigger className="w-full border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3">
                                            <SelectValue placeholder="اختر نوع الوفد" />
                                    </SelectTrigger>
                                    <SelectContent>
                                            <SelectItem value="military">عسكري</SelectItem>
                                            <SelectItem value="civil">مدني</SelectItem>
                                    </SelectContent>
                                </Select>
                                    {errors.delegationType && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.delegationType.message}
                                    </span>}
                            </div>
                            </div>
                        </div>
                        {/* معلومات الرحلة */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Icon icon="material-symbols:flight-takeoff" fontSize={16} className="text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-800">معلومات الرحلة</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalFlightNumber" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:confirmation-number" fontSize={16} className="text-primary-500" />
                                        رقم الرحلة
                                    </Label>
                                    <input 
                                        type="text" 
                                        id="arrivalFlightNumber" 
                                        name="arrivalFlightNumber" 
                                        placeholder="أدخل رقم الرحلة" 
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white"
                                        {...register('arrivalFlightNumber')} 
                                    />
                                    {errors.arrivalFlightNumber && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalFlightNumber.message}
                                    </span>}
                            </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalAirline" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:airline" fontSize={16} className="text-primary-500" />
                                        شركة الطيران
                                    </Label>
                                    <Select value={selectedAirline} onValueChange={handleAirlineChange} onOpenChange={(open) => {
                                        if (!open) {
                                            setAirlineSearchTerm("")
                                        }
                                    }}>
                                        <SelectTrigger className="w-full h-12 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white text-right" dir="rtl">
                                            <SelectValue placeholder="اختر شركة الطيران" />
                                        </SelectTrigger>
                                        <SelectContent className="text-right" dir="rtl">
                                            <div className="p-2">
                                                <input
                                                    type="text"
                                                    placeholder="ابحث عن شركة الطيران..."
                                                    value={airlineSearchTerm}
                                                    onChange={(e) => setAirlineSearchTerm(e.target.value)}
                                                    className="w-full p-2 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 text-right"
                                                    dir="rtl"
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
                                                <SelectItem value="add_new" className="text-primary-600 font-medium text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Icon icon="material-symbols:add" fontSize={16} />
                                                        إضافة شركة طيران جديدة
                                                    </div>
                                                </SelectItem>
                                            </div>
                                        </SelectContent>
                                    </Select>
                                    {errors.arrivalAirline && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalAirline.message}
                                    </span>}
                                    
                                    {showAddAirline && (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="أدخل اسم شركة الطيران الجديدة"
                                                value={newAirline}
                                                onChange={(e) => setNewAirline(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddNewAirline}
                                                size="sm"
                                                className="px-4"
                                            >
                                                إضافة
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowAddAirline(false)
                                                    setNewAirline("")
                                                }}
                                                size="sm"
                                                className="px-4"
                                            >
                                                <Icon icon="material-symbols:close" fontSize={16} />
                                            </Button>
                                        </div>
                                    )}
                        </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalOrigin" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:place" fontSize={16} className="text-primary-500" />
                                        قادمة من
                                    </Label>
                                    <Select value={selectedOrigin} onValueChange={handleOriginChange} onOpenChange={(open) => {
                                        if (!open) {
                                            setOriginSearchTerm("")
                                        }
                                    }}>
                                        <SelectTrigger className="w-full text-right border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-neutral-50 focus:bg-white px-4 py-3" dir="rtl">
                                            <SelectValue placeholder="ابحث واختر المدينة">
                                                {selectedOrigin || "ابحث واختر المدينة"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent 
                                            className="max-h-[300px] text-right" 
                                            dir="rtl"
                                        >
                                            <div className="p-2 border-b">
                                                <input
                                                    type="text"
                                                    placeholder="ابحث عن مدينة..."
                                                    value={originSearchTerm}
                                                    onChange={(e) => setOriginSearchTerm(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                    onFocus={(e) => e.stopPropagation()}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto">
                                                {filteredOrigins.length > 0 ? (
                                                    <>
                                                        {filteredOrigins.map((origin, index) => (
                                                            <SelectItem key={index} value={origin} className="text-right" dir="rtl">
                                                                <div className="flex items-center justify-between w-full gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onPointerDown={(e) => {
                                                                            e.preventDefault()
                                                                            e.stopPropagation()
                                                                            handleDeleteOrigin(origin)
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 p-1 rounded flex-shrink-0"
                                                                        title="حذف المدينة"
                                                                    >
                                                                        <Icon icon="material-symbols:close" fontSize={16} />
                                                                    </button>
                                                                    <span className="flex-1">{origin}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="material-symbols:add" fontSize={16} />
                                                                إضافة مدينة جديدة
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-3 text-sm text-neutral-500 text-center">
                                                            لا توجد نتائج للبحث
                                                        </div>
                                                        <SelectItem value="add_new" className="text-primary-600 font-medium hover:bg-primary-50 border-t">
                                                            <div className="flex items-center gap-2">
                                                                <Icon icon="material-symbols:add" fontSize={16} />
                                                                إضافة مدينة جديدة
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                    {showAddOrigin && (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="أدخل اسم المدينة الجديدة"
                                                value={newOrigin}
                                                onChange={(e) => setNewOrigin(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddOrigin}
                                                size="sm"
                                                className="px-4"
                                            >
                                                إضافة
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowAddOrigin(false)
                                                    setNewOrigin("")
                                                }}
                                                size="sm"
                                                className="px-4"
                                            >
                                                <Icon icon="material-symbols:close" fontSize={16} />
                                            </Button>
                                        </div>
                                    )}
                                    {errors.arrivalOrigin && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalOrigin.message}
                                    </span>}
                        </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalTime" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:schedule" fontSize={16} className="text-primary-500" />
                                        سعت (HHMM)
                                    </Label>
                                <input 
                                    type="text" 
                                    id="arrivalTime" 
                                    name="arrivalTime" 
                                    {...register('arrivalTime')} 
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
                                    {errors.arrivalTime && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalTime.message}
                                    </span>}
                            </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalDate" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:calendar-month" fontSize={16} className="text-primary-500" />
                                        التاريخ (يوم/شهر/سنة)
                                    </Label>
                                    <input 
                                        type="date" 
                                        id="arrivalDate" 
                                        name="arrivalDate" 
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white"
                                        style={{ direction: 'ltr' }}
                                        {...register('arrivalDate')} 
                                    />
                                    {errors.arrivalDate && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalDate.message}
                                    </span>}
                            </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalReceptor" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:person-pin" fontSize={16} className="text-primary-500" />
                                        المستقبل
                                    </Label>
                                    <input 
                                        type="text" 
                                        id="arrivalReceptor" 
                                        name="arrivalReceptor" 
                                        placeholder="أدخل اسم المستقبل" 
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white"
                                        {...register('arrivalReceptor')} 
                                    />
                                    {errors.arrivalReceptor && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalReceptor.message}
                                    </span>}
                        </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalDestination" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:place" fontSize={16} className="text-primary-500" />
                                        وجهة الرحلة
                                    </Label>
                                    <input 
                                        type="text" 
                                        id="arrivalDestination" 
                                        name="arrivalDestination" 
                                        placeholder="أدخل وجهة الرحلة" 
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white"
                                        {...register('arrivalDestination')} 
                                    />
                                    {errors.arrivalDestination && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalDestination.message}
                                    </span>}
                            </div>
                                
                                <div className="space-y-3 md:col-span-2">
                                    <Label htmlFor="arrivalShipments" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon icon="material-symbols:inventory" fontSize={16} className="text-primary-500" />
                                        الشحنات
                                    </Label>
                                    <input 
                                        type="text" 
                                        id="arrivalShipments" 
                                        name="arrivalShipments" 
                                        placeholder="أدخل الشحنات" 
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 bg-neutral-50 focus:bg-white"
                                        {...register('arrivalShipments')} 
                                    />
                                    {errors.arrivalShipments && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon icon="material-symbols:error" fontSize={14} />
                                        {errors.arrivalShipments.message}
                                    </span>}
                            </div>
                        </div>
                    </div>
                    </div>
                    <DialogFooter className="mt-6 pt-4 border-t border-neutral-200 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                        <DialogClose asChild>
                            <Button disabled={loading} variant="outline" className="cursor-pointer min-w-28 h-10 border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400">
                                <Icon icon="material-symbols:close" className="mr-2" />
                                إلغاء
                            </Button>
                        </DialogClose>
                        <Button disabled={loading} type="button" className="cursor-pointer min-w-28 h-10 bg-primary-500 hover:bg-primary-600 text-white shadow-lg" onClick={onSubmit}>
                            {loading ? (
                                <>
                                    <Icon icon="jam:refresh" className="animate-spin mr-2" />
                                    <span>جاري الإضافة...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon="material-symbols:group-add" className="mr-2" />
                                    <span>إضافة الوفد</span>
                                </>
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
                <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteItem(null)} />
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

export default AddDelegation