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
import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSelector, useDispatch } from 'react-redux'
import { updateDelegation } from '../../store/slices/delegationsSlice'
import { fetchNationalities, createNationality } from '../../store/slices/nationalitiesSlice'
import { fetchAirports, createAirport } from '../../store/slices/airportsSlice'
import { fetchAirlines, createAirline } from '../../store/slices/airlinesSlice'
import { fetchCities, createCity } from '../../store/slices/citiesSlice'

const EditDelegation = ({ delegation, children }) => {
    const dispatch = useDispatch()
    
    // Redux selectors
    const { nationalities: nationalitiesList } = useSelector(state => state.nationalities)
    const { airports: airportsList } = useSelector(state => state.airports)
    const { airlines: airlinesList } = useSelector(state => state.airlines)
    const { cities: citiesList } = useSelector(state => state.cities)
    
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [selectedNationality, setSelectedNationality] = useState("")
    const [showAddNationality, setShowAddNationality] = useState(false)
    const [newNationality, setNewNationality] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    
    // مطارات
    const [selectedAirport, setSelectedAirport] = useState("")
    const [showAddAirport, setShowAddAirport] = useState(false)
    const [newAirport, setNewAirport] = useState("")
    const [airportSearchTerm, setAirportSearchTerm] = useState("")
    
    // شركات الطيران
    const [selectedAirline, setSelectedAirline] = useState("")
    const [showAddAirline, setShowAddAirline] = useState(false)
    const [newAirline, setNewAirline] = useState("")
    const [airlineSearchTerm, setAirlineSearchTerm] = useState("")

    // قادمة من
    const [selectedOrigin, setSelectedOrigin] = useState("")
    const [showAddOrigin, setShowAddOrigin] = useState(false)
    const [newOrigin, setNewOrigin] = useState("")
    const [originSearchTerm, setOriginSearchTerm] = useState("")
    
    // Derived state from Redux
    const availableNationalities = nationalitiesList.map(n => n.name).filter(Boolean)
    const availableAirports = airportsList.map(a => a.name).filter(Boolean)
    const availableAirlines = airlinesList.map(a => a.name).filter(Boolean)
    const availableOrigins = citiesList.map(c => c.city_name).filter(Boolean)

    // تحميل البيانات المرجعية عند فتح النموذج
    useEffect(() => {
        if (open) {
            dispatch(fetchNationalities())
            dispatch(fetchAirports())
            dispatch(fetchAirlines())
            dispatch(fetchCities())
        }
    }, [open, dispatch])

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

    // تحويل نوع الوفد من API إلى قيمة السيلكت
    const mapApiTypeToSelect = (apiType) => {
        if (!apiType) return ""
        return apiType === 'MILITARY' ? 'military' : apiType === 'CIVILIAN' ? 'civil' : ''
    }


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

    const handleAddOrigin = async () => {
        const name = newOrigin.trim()
        if (!name) { return }
        try {
            const result = await dispatch(createCity({ city_name: name })).unwrap()
            setSelectedOrigin(result.city_name)
            setValue('arrivalOrigin', result.city_name)
            setNewOrigin("")
            setShowAddOrigin(false)
            setOriginSearchTerm("")
        } catch { }
    }

    const handleAddNewNationality = async () => {
        const name = newNationality.trim()
        if (!name) { return }
        try {
            const result = await dispatch(createNationality({ name })).unwrap()
            setSelectedNationality(result.name)
            setValue('nationality', result.name)
            setNewNationality("")
            setShowAddNationality(false)
            setSearchTerm("")
        } catch { }
    }

    const handleAddNewAirport = async () => {
        const name = newAirport.trim()
        if (!name) { return }
        try {
            const result = await dispatch(createAirport({ name })).unwrap()
            setSelectedAirport(result.name)
            setValue('arrivalHall', result.name)
            setNewAirport("")
            setShowAddAirport(false)
            setAirportSearchTerm("")
        } catch { }
    }

    const handleAddNewAirline = async () => {
        const name = newAirline.trim()
        if (!name) { return }
        try {
            const result = await dispatch(createAirline({ name })).unwrap()
            setSelectedAirline(result.name)
            setValue('arrivalAirline', result.name)
            setNewAirline("")
            setShowAddAirline(false)
            setAirlineSearchTerm("")
        } catch { }
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
        if (!selectedNationality || !selectedAirport || !selectedAirline || !selectedOrigin) {
            setLoading(false)
            return
        }
        
        try {
            // استخراج المعرفات من القوائم
            console.log('البحث عن المعرفات:', {
                selectedNationality,
                selectedAirport,
                selectedAirline,
                selectedOrigin,
                nationalitiesList: nationalitiesList.length,
                airportsList: airportsList.length,
                airlinesList: airlinesList.length,
                citiesList: citiesList.length
            })
            
            const nat = nationalitiesList.find(x => x.name === selectedNationality)
            const ap = airportsList.find(x => x.name === selectedAirport)
            const al = airlinesList.find(x => x.name === selectedAirline)
            const ci = citiesList.find(x => x.city_name === selectedOrigin)
            
            console.log('المعرفات المستخرجة:', { nat, ap, al, ci })

            const timeStr = (data.arrivalTime || '').trim()
            const formattedTime = timeStr && timeStr.length === 4 ? `${timeStr.slice(0,2)}:${timeStr.slice(2)}` : null

            // التحقق من عدد الأعضاء
            const newMemberCount = parseInt(data.membersCount) || 0
            const currentMembers = delegation.current_members || 0
            
            console.log('Validation check:', { newMemberCount, currentMembers, delegation })
            
            if (newMemberCount < currentMembers) {
                setLoading(false)
                return
            }

            const payload = {
                nationality_id: nat ? nat.id : null,
                airport_id: ap ? ap.id : null,
                airline_id: al ? al.id : null,
                city_id: ci ? ci.id : null,
                delegation_leader_name: data.delegationHead,
                member_count: newMemberCount,
                flight_number: data.arrivalFlightNumber,
                type: data.delegationType === 'military' ? 'MILITARY' : 'CIVILIAN',
                arrive_date: data.arrivalDate || null,
                arrive_time: formattedTime,
                receiver_name: data.arrivalReceptor,
                going_to: data.arrivalDestination, // الوجهة (الفندق)
                goods: data.arrivalShipments,
            }

            await dispatch(updateDelegation({ delegationId: delegation.id, delegationData: payload })).unwrap()

            setLoading(false)
            setOpen(false)
        } catch (error) {
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
                delegationType: delegation.delegationType || mapApiTypeToSelect(delegation.type) || "",
            })
            const initialType = delegation.delegationType || mapApiTypeToSelect(delegation.type) || ""
            if (initialType) {
                setValue('delegationType', initialType, { shouldValidate: false })
            }
            
            // تعيين القيم المختارة من البيانات المحملة
            console.log('تعيين القيم المختارة:', {
                nationality: delegation.nationality,
                arrivalHall: delegation.arrivalInfo?.arrivalHall,
                arrivalAirline: delegation.arrivalInfo?.arrivalAirline,
                arrivalOrigin: delegation.arrivalInfo?.arrivalOrigin
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
                            <Icon name="Edit" size={24} className="text-white" />
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
                                    <Icon name="User" size={16} className="text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-800">المعلومات الأساسية</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="delegationHead" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="User" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.delegationHead.message}
                                    </span>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="Globe" size={16} className="text-primary-500" />
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
                                                <Icon name="Check" size={16} />
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
                                                <Icon name="X" size={16} />
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
                                                                <Icon name="Plus" size={16} />
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
                                                                <Icon name="Plus" size={16} />
                                                                إضافة جنسية جديدة
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                    {errors.nationality && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.nationality.message}
                                    </span>}
                            </div>
                            </div>
                        </div>
                        {/* معلومات الوفد */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Icon name="Users" size={16} className="text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-800">معلومات الوفد</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="Plane" size={16} className="text-primary-500" />
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
                                                                <Icon name="Plus" size={16} />
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
                                                                <Icon name="Plus" size={16} />
                                                                إضافة مطار جديد
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                    {errors.arrivalHall && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.arrivalHall.message}
                                    </span>}
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="h-6 flex items-center">
                                        <Label htmlFor="membersCount" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                            <Icon name="Users" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.membersCount.message}
                                    </span>}
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="h-6 flex items-center">
                                        <Label className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                            <Icon name="Badge" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.delegationType.message}
                                    </span>}
                            </div>
                            </div>
                        </div>
                        {/* معلومات الرحلة */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Icon name="PlaneTakeoff" size={16} className="text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-800">معلومات الرحلة</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalFlightNumber" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="Ticket" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.arrivalFlightNumber.message}
                                    </span>}
                            </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalAirline" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="Plane" size={16} className="text-primary-500" />
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
                                                        <Icon name="Plus" size={16} />
                                                        إضافة شركة طيران جديدة
                                                    </div>
                                                </SelectItem>
                                            </div>
                                        </SelectContent>
                                    </Select>
                                    {errors.arrivalAirline && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon name="AlertCircle" size={14} />
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
                                                <Icon name="X" size={16} />
                                            </Button>
                                        </div>
                                    )}
                        </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalOrigin" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="MapPin" size={16} className="text-primary-500" />
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
                                                                <Icon name="Plus" size={16} />
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
                                                                <Icon name="Plus" size={16} />
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
                                                <Icon name="X" size={16} />
                                            </Button>
                                        </div>
                                    )}
                                    {errors.arrivalOrigin && <span className="text-sm text-red-500 block flex items-center gap-1">
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.arrivalOrigin.message}
                                    </span>}
                        </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalTime" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="Clock" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.arrivalTime.message}
                                    </span>}
                            </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalDate" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="Calendar" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.arrivalDate.message}
                                    </span>}
                            </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalReceptor" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="MapPin" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.arrivalReceptor.message}
                                    </span>}
                        </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="arrivalDestination" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="MapPin" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.arrivalDestination.message}
                                    </span>}
                            </div>
                                
                                <div className="space-y-3 md:col-span-2">
                                    <Label htmlFor="arrivalShipments" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                                        <Icon name="Package" size={16} className="text-primary-500" />
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
                                        <Icon name="AlertCircle" size={14} />
                                        {errors.arrivalShipments.message}
                                    </span>}
                            </div>
                        </div>
                    </div>
                    </div>
                    <DialogFooter className="mt-6 pt-4 border-t border-neutral-200 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                        <DialogClose asChild>
                            <Button disabled={loading} variant="outline" className="cursor-pointer min-w-28 h-10 border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400">
                                <Icon name="X" size={20} className="mr-2" />
                                إلغاء
                            </Button>
                        </DialogClose>
                        <Button disabled={loading} type="button" className="cursor-pointer min-w-28 h-10 bg-primary-500 hover:bg-primary-600 text-white shadow-lg" onClick={onSubmit}>
                            {loading ? (
                                <>
                                    <Icon name="RefreshCw" size={20} className="animate-spin mr-2" />
                                    <span>جاري التحديث...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="Save" size={20} className="mr-2" />
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