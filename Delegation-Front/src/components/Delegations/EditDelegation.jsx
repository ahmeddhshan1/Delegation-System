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
// import DeleteConfirm from "../ui/delete-confirm"

const EditDelegation = ({ delegation, children }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [selectedNationality, setSelectedNationality] = useState("")
    const [showAddNationality, setShowAddNationality] = useState(false)
    const [newNationality, setNewNationality] = useState("")
    const [availableNationalities, setAvailableNationalities] = useState(() => {
        const savedNationalities = localStorage.getItem('nationalities')
        if (savedNationalities) {
            return JSON.parse(savedNationalities)
        }
        return nationalities
    })
    const [searchTerm, setSearchTerm] = useState("")
    
    // مطارات
    const [selectedAirport, setSelectedAirport] = useState("")
    const [showAddAirport, setShowAddAirport] = useState(false)
    const [newAirport, setNewAirport] = useState("")
    const [availableAirports, setAvailableAirports] = useState(() => {
        const savedAirports = localStorage.getItem('airports')
        if (savedAirports) {
            return JSON.parse(savedAirports)
        }
        return hallOptions.map(option => option.label)
    })
    const [airportSearchTerm, setAirportSearchTerm] = useState("")
    
    // شركات الطيران
    const [selectedAirline, setSelectedAirline] = useState("")
    const [showAddAirline, setShowAddAirline] = useState(false)
    const [newAirline, setNewAirline] = useState("")
    const [availableAirlines, setAvailableAirlines] = useState(() => {
        const savedAirlines = localStorage.getItem('airlines')
        if (savedAirlines) {
            return JSON.parse(savedAirlines)
        }
        return [
            "مصر للطيران", "الخطوط الجوية السعودية", "طيران الإمارات", "الخطوط الجوية القطرية",
            "الخطوط الجوية الكويتية", "الخطوط الجوية البحرينية", "الخطوط الجوية العمانية",
            "الخطوط الجوية الأردنية", "الخطوط الجوية اللبنانية", "الخطوط الجوية السورية",
            "الخطوط الجوية العراقية", "الخطوط الجوية الليبية", "الخطوط الجوية الجزائرية",
            "الخطوط الجوية المغربية", "الخطوط الجوية التونسية", "الخطوط الجوية السودانية",
            "الخطوط الجوية اليمنية", "الخطوط الجوية الصومالية", "الخطوط الجوية الموريتانية",
            "الخطوط الجوية الجيبوتية", "الخطوط الجوية الكينية", "الخطوط الجوية الإثيوبية",
            "الخطوط الجوية التركية", "الخطوط الجوية الألمانية", "الخطوط الجوية الفرنسية",
            "الخطوط الجوية البريطانية", "الخطوط الجوية الإيطالية", "الخطوط الجوية الإسبانية",
            "الخطوط الجوية الأمريكية", "الخطوط الجوية الكندية", "الخطوط الجوية الأسترالية"
        ]
    })
    const [airlineSearchTerm, setAirlineSearchTerm] = useState("")

    // قادمة من
    const [selectedOrigin, setSelectedOrigin] = useState("")
    const [showAddOrigin, setShowAddOrigin] = useState(false)
    const [newOrigin, setNewOrigin] = useState("")
    const [availableOrigins, setAvailableOrigins] = useState(() => {
        const savedOrigins = localStorage.getItem('origins')
        if (savedOrigins) {
            return JSON.parse(savedOrigins)
        }
        return [
            "الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة",
            "دبي", "أبو ظبي", "الشارقة", "عجمان", "رأس الخيمة",
            "القاهرة", "الإسكندرية", "الأقصر", "أسوان", "شرم الشيخ",
            "لندن", "باريس", "برلين", "روما", "مدريد",
            "نيويورك", "لوس أنجلوس", "شيكاغو", "هيوستن", "فينيكس",
            "طوكيو", "سيول", "بكين", "شنغهاي", "هونغ كونغ",
            "سيدني", "ملبورن", "بريسبان", "بيرث", "أديلايد"
        ]
    })
    const [originSearchTerm, setOriginSearchTerm] = useState("")


    // الاستماع لتغييرات localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            // تحديث الجنسيات
            const savedNationalities = localStorage.getItem('nationalities')
            if (savedNationalities) {
                setAvailableNationalities(JSON.parse(savedNationalities))
            }
            
            // تحديث المطارات
            const savedAirports = localStorage.getItem('airports')
            if (savedAirports) {
                setAvailableAirports(JSON.parse(savedAirports))
            }
            
            // تحديث شركات الطيران
            const savedAirlines = localStorage.getItem('airlines')
            if (savedAirlines) {
                setAvailableAirlines(JSON.parse(savedAirlines))
            }
            
            // تحديث المدن
            const savedOrigins = localStorage.getItem('origins')
            if (savedOrigins) {
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
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('nationalitiesUpdated', handleStorageChange)
            window.removeEventListener('airportsUpdated', handleStorageChange)
            window.removeEventListener('airlinesUpdated', handleStorageChange)
            window.removeEventListener('originsUpdated', handleStorageChange)
        }
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

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            delegationHead: "",
            membersCount: "",
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

    // تحميل البيانات من localStorage عند فتح النموذج
    useEffect(() => {
        if (open) {
            // تحميل الجنسيات من localStorage
            const savedNationalities = localStorage.getItem('nationalities')
            if (savedNationalities) {
                setAvailableNationalities(JSON.parse(savedNationalities))
            }
            
            // تحميل المطارات من localStorage
            const savedAirports = localStorage.getItem('airports')
            if (savedAirports) {
                setAvailableAirports(JSON.parse(savedAirports))
            }
        }
    }, [open])


    const handleNationalityChange = (value) => {
        setSelectedNationality(value)
        if (value === "add_new") {
            setShowAddNationality(true)
        } else {
            setValue('nationality', value)
            setSearchTerm("")
        }
    }

    const handleAirportChange = (value) => {
        setSelectedAirport(value)
        if (value === "add_new") {
            setShowAddAirport(true)
        } else {
            setValue('arrivalHall', value)
            setAirportSearchTerm("")
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

    const handleAddOrigin = () => {
        if (newOrigin.trim() && !availableOrigins.includes(newOrigin.trim())) {
            const updatedOrigins = [...availableOrigins, newOrigin.trim()].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableOrigins(updatedOrigins)
            localStorage.setItem('origins', JSON.stringify(updatedOrigins))
            // إرسال custom event لتحديث الفورمات الأخرى
            window.dispatchEvent(new CustomEvent('originsUpdated'))
            setSelectedOrigin(newOrigin.trim())
            setValue('arrivalOrigin', newOrigin.trim())
            setNewOrigin("")
            setShowAddOrigin(false)
            setOriginSearchTerm("")
            toast.success("تم إضافة المدينة الجديدة بنجاح")
        } else if (availableOrigins.includes(newOrigin.trim())) {
            toast.error("هذه المدينة موجودة بالفعل")
        } else {
            toast.error("يرجى إدخال اسم المدينة")
        }
    }

    const handleAddNewNationality = () => {
        if (newNationality.trim() && !availableNationalities.includes(newNationality.trim())) {
            const updatedNationalities = [...availableNationalities, newNationality.trim()].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableNationalities(updatedNationalities)
            localStorage.setItem('nationalities', JSON.stringify(updatedNationalities))
            // إرسال custom event لتحديث الفورمات الأخرى
            window.dispatchEvent(new CustomEvent('nationalitiesUpdated'))
            setSelectedNationality(newNationality.trim())
            setValue('nationality', newNationality.trim())
            setNewNationality("")
            setShowAddNationality(false)
            setSearchTerm("")
            toast.success("تم إضافة الجنسية الجديدة بنجاح")
        } else if (availableNationalities.includes(newNationality.trim())) {
            toast.error("هذه الجنسية موجودة بالفعل")
        } else {
            toast.error("يرجى إدخال اسم الجنسية")
        }
    }

    const handleAddNewAirport = () => {
        if (newAirport.trim() && !availableAirports.includes(newAirport.trim())) {
            const updatedAirports = [...availableAirports, newAirport.trim()].sort((a, b) => a.localeCompare(b, 'ar'))
            setAvailableAirports(updatedAirports)
            localStorage.setItem('airports', JSON.stringify(updatedAirports))
            // إرسال custom event لتحديث الفورمات الأخرى
            window.dispatchEvent(new CustomEvent('airportsUpdated'))
            setSelectedAirport(newAirport.trim())
            setValue('arrivalHall', newAirport.trim())
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
            // إرسال custom event لتحديث الفورمات الأخرى
            window.dispatchEvent(new CustomEvent('airlinesUpdated'))
            setSelectedAirline(newAirline.trim())
            setValue('arrivalAirline', newAirline.trim())
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

    const onSubmit = handleSubmit((data) => {
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
            // الحصول على البيانات الحالية من localStorage
            const existingDelegations = JSON.parse(localStorage.getItem('delegations') || '[]')
            
            // تحديث الوفد
            const updatedDelegation = {
                ...delegation,
                delegationHead: data.delegationHead,
                membersCount: parseInt(data.membersCount),
                delegationType: data.delegationType,
                type: data.delegationType, // إضافة type للتوافق مع حساب الإحصائيات
                nationality: selectedNationality,
                arrivalInfo: {
                    arrivalHall: selectedAirport,
                    arrivalAirline: selectedAirline,
                    arrivalFlightNumber: data.arrivalFlightNumber,
                    arrivalOrigin: selectedOrigin,
                    arrivalDate: data.arrivalDate,
                    arrivalTime: data.arrivalTime,
                    arrivalReceptor: data.arrivalReceptor,
                    arrivalDestination: data.arrivalDestination,
                    arrivalShipments: data.arrivalShipments
                },
                updatedAt: new Date().toISOString()
            }
            
            // تحديث الوفود
            const updatedDelegations = existingDelegations.map(d => 
                d.id === delegation.id ? updatedDelegation : d
            )
            
            // حفظ البيانات في localStorage
            localStorage.setItem('delegations', JSON.stringify(updatedDelegations))
            
            // تحديث الأعضاء المرتبطة بالوفد
            try {
                const savedMembers = localStorage.getItem('members')
                if (savedMembers) {
                    const members = JSON.parse(savedMembers)
                    console.log('EditDelegation: Before update - members with old delegation data:', 
                        members.filter(m => m.delegation && m.delegation.id === delegation.id).map(m => ({
                            name: m.name,
                            delegation: m.delegation
                        }))
                    )
                    
                    const updatedMembers = members.map(member => {
                        if (member.delegation && member.delegation.id === delegation.id) {
                            const updatedMember = {
                                ...member,
                                delegation: {
                                    ...member.delegation,
                                    nationality: selectedNationality,
                                    delegationHead: data.delegationHead,
                                    delegationType: data.delegationType,
                                    membersCount: parseInt(data.membersCount),
                                    arrivalInfo: {
                                        arrivalHall: selectedAirport,
                                        arrivalAirline: data.arrivalAirline,
                                        arrivalFlightNumber: data.arrivalFlightNumber,
                                        arrivalOrigin: data.arrivalOrigin,
                                        arrivalDate: data.arrivalDate,
                                        arrivalTime: data.arrivalTime,
                                        arrivalReceptor: data.arrivalReceptor,
                                        arrivalDestination: data.arrivalDestination,
                                        arrivalShipments: data.arrivalShipments
                                    }
                                }
                            }
                            console.log('EditDelegation: Updated member delegation data for:', member.name, 'from', member.delegation, 'to', updatedMember.delegation)
                            return updatedMember
                        }
                        return member
                    })
                    
                    console.log('EditDelegation: After update - members with new delegation data:', 
                        updatedMembers.filter(m => m.delegation && m.delegation.id === delegation.id).map(m => ({
                            name: m.name,
                            delegation: m.delegation
                        }))
                    )
                    
                    localStorage.setItem('members', JSON.stringify(updatedMembers))
                    console.log('EditDelegation: Updated members with new delegation data')
                }
            } catch (error) {
                console.error('خطأ في تحديث بيانات الأعضاء:', error)
            }
            
            // إرسال حدث لتحديث المكونات الأخرى
            window.dispatchEvent(new CustomEvent('delegationUpdated', { detail: updatedDelegation }))
            window.dispatchEvent(new CustomEvent('memberUpdated'))
            window.dispatchEvent(new CustomEvent('localStorageUpdated'))
            
            setTimeout(() => {
                toast.success("تم تحديث الوفد بنجاح")
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
            }, 1000)
        } catch (error) {
            console.error('Error updating delegation:', error)
            toast.error("حدث خطأ أثناء تحديث الوفد")
            setLoading(false)
        }
    })

    useEffect(() => {
        if (open && delegation) {
            reset({
                delegationHead: delegation.delegationHead || "",
                membersCount: delegation.membersCount?.toString() || "",
                arrivalAirline: delegation.arrivalInfo?.arrivalAirline || "",
                arrivalFlightNumber: delegation.arrivalInfo?.arrivalFlightNumber || "",
                arrivalOrigin: delegation.arrivalInfo?.arrivalOrigin || "",
                arrivalDate: delegation.arrivalInfo?.arrivalDate || "",
                arrivalTime: delegation.arrivalInfo?.arrivalTime || "",
                arrivalReceptor: delegation.arrivalInfo?.arrivalReceptor || "",
                arrivalDestination: delegation.arrivalInfo?.arrivalDestination || "",
                arrivalShipments: delegation.arrivalInfo?.arrivalShipments || "",
                delegationType: delegation.delegationType || "",
            })
            
            setSelectedNationality(delegation.nationality || "")
            setSelectedAirport(delegation.arrivalInfo?.arrivalHall || "")
            setSelectedAirline(delegation.arrivalInfo?.arrivalAirline || "")
            setSelectedOrigin(delegation.arrivalInfo?.arrivalOrigin || "")
        } else if (!open) {
            // فقط لما النموذج يتقفل، نمسح البيانات
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
        }
    }, [open, delegation, reset])

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[95vh] [&_[data-slot='dialog-close']]:!right-[95%] overflow-auto scrollbar-hide">
                <DialogHeader className="!text-start !py-6 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                            <Icon icon="material-symbols:edit-outline-rounded" fontSize={24} className="text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-primary-600">
                                تعديل بيانات الوفد
                            </DialogTitle>
                            <DialogDescription className="text-neutral-600 mt-1">
                                يمكنك تعديل بيانات الوفد {delegation?.nationality} من هنا، حينما تنتهي من التعديل قم بالضغط على حفظ.
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
                                                                 <span className="w-full">{nationality}</span>
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
                                                                 <span className="w-full">{airport}</span>
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
                                                         <span className="w-full">{airline}</span>
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
                                                                 <span className="w-full">{origin}</span>
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
                                    <span>جاري التحديث...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon="material-symbols:save" className="mr-2" />
                                    <span>حفظ التعديلات</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        </>
    )
}

export default EditDelegation