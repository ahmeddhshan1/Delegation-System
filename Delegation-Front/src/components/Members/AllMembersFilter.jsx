import { Icon } from "@iconify/react/dist/iconify.js"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const AllMembersFilter = ({ table, data }) => {
    const [open, setOpen] = useState(false)
    const [mainEvents, setMainEvents] = useState([])
    const [subEvents, setSubEvents] = useState([])
    const [filters, setFilters] = useState({
        rank: '',
        role: '',
        job: '',
        memberStatus: '',
        mainEvent: '',
        subEvent: '',
        arrivalDate: '',
        departureDate: '',
    })

    // جلب البيانات من localStorage
    useEffect(() => {
        const loadEventsData = () => {
            try {
                // جلب الأحداث الرئيسية من mainEvents (المصدر الحقيقي)
                const savedMainEvents = localStorage.getItem('mainEvents')
                const allSubEvents = []
                
                if (savedMainEvents) {
                    const parsedMainEvents = JSON.parse(savedMainEvents)
                    setMainEvents(parsedMainEvents)
                    
                    // لا نحتاج لأحداث افتراضية - نستخدم الأحداث الحقيقية فقط
                    
                    // إضافة أحداث فرعية من mainEvents.sub_events إذا وجدت (البيانات الحقيقية)
                    parsedMainEvents.forEach(mainEvent => {
                        if (mainEvent.sub_events && Array.isArray(mainEvent.sub_events) && mainEvent.sub_events.length > 0) {
                            mainEvent.sub_events.forEach(subEvent => {
                                allSubEvents.push({
                                    id: subEvent.id,
                                    name: subEvent.name,
                                    mainEventId: mainEvent.id,
                                    mainEventName: mainEvent.name
                                })
                            })
                        }
                    })
                }
                
                console.log('=== بيانات الفلتر (الأحداث الحقيقية) ===')
                console.log('عدد الأحداث الرئيسية:', mainEvents.length)
                console.log('عدد الأحداث الفرعية:', allSubEvents.length)
                if (allSubEvents.length > 0) {
                    console.log('الأحداث الفرعية:')
                    allSubEvents.forEach((subEvent, index) => {
                        console.log(`  ${index + 1}. ${subEvent.name} (ID: ${subEvent.id}) - الحدث الرئيسي: ${subEvent.mainEventName}`)
                    })
                } else {
                    console.log('لا توجد أحداث فرعية - يرجى إضافة أحداث فرعية من صفحة إدارة الأحداث')
                }
                setSubEvents(allSubEvents)
            } catch (error) {
                console.error('خطأ في تحميل بيانات الأحداث:', error)
            }
        }

        loadEventsData()

        // الاستماع لتغييرات localStorage
        const handleStorageChange = () => {
            loadEventsData()
        }

        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('eventAdded', handleStorageChange)
        window.addEventListener('eventUpdated', handleStorageChange)
        window.addEventListener('eventDeleted', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('eventAdded', handleStorageChange)
            window.removeEventListener('eventUpdated', handleStorageChange)
            window.removeEventListener('eventDeleted', handleStorageChange)
        }
    }, [])

    const applyFilter = (val, fieldName) => {
        console.log('تطبيق الفلتر:', { val, fieldName })
        
        // إذا تم اختيار حدث رئيسي جديد، امسح فلتر الحدث الفرعي
        if (fieldName === 'mainEvent' && val !== filters.mainEvent) {
            setFilters({ ...filters, [fieldName]: val, subEvent: '' })
            table.getColumn(fieldName)?.setFilterValue(val === "" ? undefined : val)
            table.getColumn('subEvent')?.setFilterValue(undefined)
        } else {
            setFilters({ ...filters, [fieldName]: val })
            table.getColumn(fieldName)?.setFilterValue(val === "" ? undefined : val)
        }
    }



    const clearFilter = () => {
        setFilters({
            rank: '',
            role: '',
            job: '',
            memberStatus: '',
            mainEvent: '',
            subEvent: '',
            arrivalDate: '',
            departureDate: '',
        })
        table.resetColumnFilters()
        setOpen(false)
    }

    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="mr-auto !ring-0">
                    <Icon icon={'fluent:filter-32-filled'} />
                    <span>فلتر</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] max-h-[75vh] overflow-y-auto [&>button]:hidden p-4">
                <div className="flex items-center justify-between" style={{ marginBottom: '0px' }}>
                    <DialogTitle className="text-right text-lg">فلتر الأعضاء</DialogTitle>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                        onClick={() => setOpen(false)}
                    >
                        <Icon icon="material-symbols:close" fontSize={16} />
                    </Button>
                </div>
                <DialogDescription className="text-right text-sm text-gray-600" style={{ marginBottom: '8px' }}>
                    تصفية الجدول حسب المعايير التالية
                </DialogDescription>
                <div className="grid gap-1.5">
                    {/* الرتبة */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label className="text-sm font-medium text-right">الرتبة</Label>
                        <Select dir='rtl' value={filters.rank} onValueChange={val => applyFilter(val, 'rank')}>
                            <SelectTrigger className="w-full !ring-0 col-span-2 h-8">
                                <SelectValue placeholder="اختر الرتبة" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    [...new Set(data.map(el => el.rank))]
                                        .map((rank, index) => (
                                            <SelectItem key={index} value={rank}>
                                                {rank}
                                            </SelectItem>
                                        ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    {/* الوظيفة */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label className="text-sm font-medium text-right">الوظيفة</Label>
                        <Select dir='rtl' value={filters.role} onValueChange={val => applyFilter(val, 'role')}>
                            <SelectTrigger className="w-full !ring-0 col-span-2 h-8">
                                <SelectValue placeholder="اختر الوظيفة" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    [...new Set(data.map(el => el.role).filter(Boolean))]
                                        .map((role, index) => (
                                            <SelectItem key={index} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    {/* المنصب المعادل */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label className="text-sm font-medium text-right">المنصب المعادل</Label>
                        <Select dir='rtl' value={filters.job} onValueChange={val => applyFilter(val, 'equivalentRole')}>
                            <SelectTrigger className="w-full !ring-0 col-span-2 h-8">
                                <SelectValue placeholder="اختر المنصب المعادل" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    [...new Set(data.map(el => el.equivalentRole).filter(Boolean))]
                                        .map((equivalentRole, index) => (
                                            <SelectItem key={index} value={equivalentRole}>
                                                {equivalentRole}
                                            </SelectItem>
                                        ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    {/* حالة العضو */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label className="text-sm font-medium text-right">حالة العضو</Label>
                        <Select dir='rtl' value={filters.memberStatus} onValueChange={val => applyFilter(val, 'memberStatus')}>
                            <SelectTrigger className="w-full !ring-0 col-span-2 h-8">
                                <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="departed">غادر</SelectItem>
                                <SelectItem value="not_departed">لم يغادر</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* الحدث الرئيسي */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label className="text-sm font-medium text-right">الحدث الرئيسي</Label>
                        <Select dir='rtl' value={filters.mainEvent} onValueChange={val => applyFilter(val, 'mainEvent')}>
                            <SelectTrigger className="w-full !ring-0 col-span-2 h-8">
                                <SelectValue placeholder="اختر الحدث الرئيسي" />
                            </SelectTrigger>
                            <SelectContent>
                                {mainEvents.map((event, index) => (
                                    <SelectItem key={index} value={event.name}>
                                        {event.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* الحدث الفرعي */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label className="text-sm font-medium text-right">الحدث الفرعي</Label>
                        <Select dir='rtl' value={filters.subEvent} onValueChange={val => applyFilter(val, 'subEvent')}>
                            <SelectTrigger className="w-full !ring-0 col-span-2 h-8">
                                <SelectValue placeholder="اختر الحدث الفرعي" />
                            </SelectTrigger>
                            <SelectContent>
                                {(() => {
                                    // إذا كان هناك حدث رئيسي مختار، اعرض فقط الأحداث الفرعية المرتبطة به
                                    if (filters.mainEvent) {
                                        const filteredSubEvents = subEvents.filter(subEvent => 
                                            subEvent.mainEventName === filters.mainEvent
                                        )
                                        return filteredSubEvents.map((event, index) => (
                                            <SelectItem key={index} value={event.name}>
                                                {event.name}
                                            </SelectItem>
                                        ))
                                    }
                                    
                                    // إذا لم يكن هناك حدث رئيسي مختار، اعرض جميع الأحداث الفرعية بدون الحدث الرئيسي
                                    return subEvents.map((event, index) => (
                                        <SelectItem key={index} value={event.name}>
                                            {event.name}
                                        </SelectItem>
                                    ))
                                })()}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* تاريخ الوصول */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label htmlFor="arrivalDate" className="text-sm font-medium text-right">تاريخ الوصول</Label>
                        <input 
                            className="col-span-2 !ring-0 border border-gray-300 rounded-md px-2 py-1 h-8 text-sm" 
                            type="date" 
                            id="arrivalDate" 
                            name="arrivalDate" 
                            value={filters.arrivalDate} 
                            style={{ direction: 'ltr' }}
                            onChange={(e) => {
                                const formattedDate = e.target.value
                                setFilters({ ...filters, arrivalDate: formattedDate });
                                table.getColumn('arrivalDate')?.setFilterValue(formattedDate === "" ? undefined : formattedDate)
                            }} 
                        />
                    </div>

                    {/* تاريخ المغادرة */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label htmlFor="departureDate" className="text-sm font-medium text-right">تاريخ المغادرة</Label>
                        <input 
                            className="col-span-2 !ring-0 border border-gray-300 rounded-md px-2 py-1 h-8 text-sm" 
                            type="date" 
                            id="departureDate" 
                            name="departureDate" 
                            value={filters.departureDate} 
                            style={{ direction: 'ltr' }}
                            onChange={(e) => {
                                const formattedDate = e.target.value
                                setFilters({ ...filters, departureDate: formattedDate });
                                table.getColumn('departureDate')?.setFilterValue(formattedDate === "" ? undefined : formattedDate)
                            }} 
                        />
                    </div>

                    {isFiltered && (
                        <div className="pt-2 border-t mt-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full h-8 text-xs bg-yellow-400 border-yellow-400 text-white hover:bg-yellow-500 hover:border-yellow-500"
                                onClick={clearFilter}
                            >
                                <Icon icon="material-symbols:clear" className="ml-1" fontSize={14} />
                                حذف جميع الفلاتر
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AllMembersFilter
