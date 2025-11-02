import Icon from '../ui/Icon';
import { useState, useMemo } from "react"
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
    const [filters, setFilters] = useState({
        rank: '',
        job_title: '',
        equivalent_job_name: '',
        memberStatus: '',
        mainEvent: '',
        subEvent: '',
        arrivalDate: '',
        departureDate: '',
    })

    // فلترة الأحداث الرئيسية حسب الحدث الفرعي المختار
    const uniqueMainEvents = useMemo(() => {
        if (filters.subEvent && filters.subEvent !== 'empty') {
            // إذا كان هناك حدث فرعي مختار، اعرض فقط الحدث الرئيسي المرتبط به
            const selectedSubEvent = data.find(el => el.subEvent?.name === filters.subEvent)
            const mainEventName = selectedSubEvent?.subEvent?.mainEventName
            return mainEventName ? [mainEventName] : []
        } else {
            // إذا لم يكن هناك حدث فرعي مختار، اعرض جميع الأحداث الرئيسية
            return [...new Set(data.map(el => el.subEvent?.mainEventName).filter(Boolean))]
        }
    }, [data, filters.subEvent])
    
    // فلترة الأحداث الفرعية حسب الحدث الرئيسي المختار
    const uniqueSubEvents = useMemo(() => {
        if (filters.mainEvent && filters.mainEvent !== 'empty') {
            // إذا كان هناك حدث رئيسي مختار، اعرض فقط الأحداث الفرعية المرتبطة به
            return [...new Set(data
                .filter(el => el.subEvent?.mainEventName === filters.mainEvent)
                .map(el => el.subEvent?.name)
                .filter(Boolean)
            )]
        } else {
            // إذا لم يكن هناك حدث رئيسي مختار، اعرض جميع الأحداث الفرعية
            return [...new Set(data.map(el => el.subEvent?.name).filter(Boolean))]
        }
    }, [data, filters.mainEvent])

    const applyFilter = (val, fieldName) => {
        // تحديث الفلاتر فقط بدون تطبيقها على الجدول
        if (fieldName === 'mainEvent' && val !== filters.mainEvent) {
            setFilters({ ...filters, [fieldName]: val, subEvent: '' })
        } 
        // إذا تم اختيار حدث فرعي جديد، اختر الحدث الرئيسي تلقائياً
        else if (fieldName === 'subEvent' && val !== filters.subEvent) {
            // البحث عن الحدث الرئيسي للحدث الفرعي المختار
            const selectedSubEvent = data.find(el => el.subEvent?.name === val)
            const mainEventName = selectedSubEvent?.subEvent?.mainEventName
            
            setFilters({ 
                ...filters, 
                [fieldName]: val, 
                mainEvent: mainEventName || '' 
            })
        } 
        else {
            setFilters({ ...filters, [fieldName]: val })
        }
    }

    const applyFiltersToTable = () => {
        // تطبيق جميع الفلاتر على الجدول
        Object.entries(filters).forEach(([fieldName, value]) => {
            if (value && value !== '') {
                if (value === "empty") {
                    // للقيم الفارغة، نبحث عن القيم الفارغة أو "-"
                    table.getColumn(fieldName)?.setFilterValue("empty")
                } else {
                    table.getColumn(fieldName)?.setFilterValue(value)
                }
            } else {
                table.getColumn(fieldName)?.setFilterValue(undefined)
            }
        })
        setOpen(false) // إغلاق نافذة الفلتر
    }



    const clearFilter = () => {
        setFilters({
            rank: '',
            job_title: '',
            equivalent_job_name: '',
            memberStatus: '',
            mainEvent: '',
            subEvent: '',
            arrivalDate: '',
            departureDate: '',
        })
        table.resetColumnFilters()
        // لا نغلق النافذة - setOpen(false) تم حذفها
    }

    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="mr-auto !ring-0">
                    <Icon name="Filter" size={20} />
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
                        <Icon name="X" size={16} />
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
                                {data.some(el => !el.rank || el.rank === "") && (
                                    <SelectItem value="empty">فارغ</SelectItem>
                                )}
                                {
                                    [...new Set(data.map(el => el.rank).filter(Boolean))]
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
                        <Select dir='rtl' value={filters.job_title} onValueChange={val => applyFilter(val, 'job_title')}>
                            <SelectTrigger className="w-full !ring-0 col-span-2 h-8">
                                <SelectValue placeholder="اختر الوظيفة" />
                            </SelectTrigger>
                            <SelectContent>
                                {data.some(el => !el.job_title || el.job_title === "") && (
                                    <SelectItem value="empty">فارغ</SelectItem>
                                )}
                                {
                                    [...new Set(data.map(el => el.job_title).filter(Boolean))]
                                        .map((jobTitle, index) => (
                                            <SelectItem key={index} value={jobTitle}>
                                                {jobTitle}
                                            </SelectItem>
                                        ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    {/* المنصب المعادل */}
                    <div className="grid grid-cols-3 items-center gap-1.5">
                        <Label className="text-sm font-medium text-right">المنصب المعادل</Label>
                        <Select dir='rtl' value={filters.equivalent_job_name} onValueChange={val => applyFilter(val, 'equivalent_job_name')}>
                            <SelectTrigger className="w-full !ring-0 col-span-2 h-8">
                                <SelectValue placeholder="اختر المنصب المعادل" />
                            </SelectTrigger>
                            <SelectContent>
                                {data.some(el => !el.equivalent_job_name || el.equivalent_job_name === "") && (
                                    <SelectItem value="empty">فارغ</SelectItem>
                                )}
                                {
                                    [...new Set(data.map(el => el.equivalent_job_name).filter(Boolean))]
                                        .map((equivalentJobName, index) => (
                                            <SelectItem key={index} value={equivalentJobName}>
                                                {equivalentJobName}
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
                                {data.some(el => !el.subEvent?.mainEventName || el.subEvent?.mainEventName === "") && (
                                    <SelectItem value="empty">فارغ</SelectItem>
                                )}
                                {uniqueMainEvents.map((mainEvent, index) => (
                                    <SelectItem key={index} value={mainEvent}>
                                        {mainEvent}
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
                                {data.some(el => !el.subEvent?.name || el.subEvent?.name === "") && (
                                    <SelectItem value="empty">فارغ</SelectItem>
                                )}
                                {uniqueSubEvents.map((subEvent, index) => (
                                    <SelectItem key={index} value={subEvent}>
                                        {subEvent}
                                    </SelectItem>
                                ))}
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

                    {(filters.rank || filters.job_title || filters.equivalent_job_name || 
                      filters.memberStatus || filters.mainEvent || filters.subEvent || 
                      filters.arrivalDate || filters.departureDate) && (
                        <div className="pt-2 border-t mt-2">
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 h-8 text-xs !ring-0 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={applyFiltersToTable}
                                >
                                    <Icon name="Filter" size={20} className="ml-1" />
                                    تطبيق الفلتر
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 h-8 text-xs !ring-0 bg-yellow-400 border-yellow-400 text-white hover:bg-yellow-500 hover:border-yellow-500"
                                    onClick={clearFilter}
                                >
                                    <Icon name="X" size={20} className="ml-1" />
                                    حذف جميع الفلاتر
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AllMembersFilter
