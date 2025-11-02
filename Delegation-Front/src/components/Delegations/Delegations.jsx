import {
    filterFns,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useCallback, useMemo } from "react"
import { PermissionElement } from "../Permissions/PermissionGuard"
import Icon from '../ui/Icon';
import DataTable from "../DataTable"
import DelegationTableToolbar from "./DelegationTableToolbar"
import AddDelegation from "./AddDelegation"
import DeletePopup from "../DeletePopup"
import EditDelegation from "./EditDelegation"
// import { dateRangeFilter } from "../../utils"
// import { delegations } from "../../data" // تم إزالة البيانات الوهمية
import { usePermissions } from "../../store/hooks"
import { useSelector, useDispatch } from 'react-redux'
import { fetchDelegations } from '../../store/slices/delegationsSlice'


export const columns = [
    {
        accessorKey: "delegationStatus",
        header: () => <div className="text-center">حالة الوفد</div>,
        cell: ({ row }) => {
            const status = row.getValue("delegationStatus")
            let statusIcon = ""
            let iconColor = ""
            
            switch(status) {
                case "all_departed":
                    statusIcon = "CheckCircle"
                    iconColor = "text-lime-600"
                    break
                case "partial_departed":
                    statusIcon = "Clock"
                    iconColor = "text-primary-600"
                    break
                case "not_departed":
                    statusIcon = "X"
                    iconColor = "text-red-600"
                    break
                default:
                    statusIcon = "X"
                    iconColor = "text-red-600"
            }
            
            return (
                <div className="flex justify-center">
                    <div className="px-1 py-1 rounded-lg text-lg font-medium text-center bg-gray-200 w-fit">
                        <Icon name={statusIcon} size={20} className={iconColor} />
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "nationality",
        header: () => <div className="text-center">الجنسية</div>,
        size: 150,
        minSize: 120,
        maxSize: 180,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const nationality = row.getValue(columnId)
            
            // إذا كان الفلتر "empty" (-)، نعرض فقط القيم الفارغة
            if (filterValue === "empty") {
                return !nationality || nationality === ""
            }
            
            // إذا كان الفلتر له قيمة محددة، نعرض فقط القيم المكتملة التي تطابق
            // التأكد من أن القيمة ليست فارغة قبل المقارنة
            if (!nationality || nationality === "") {
                return false
            }
            return nationality.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "delegationHead",
        header: () => <div className="text-center">رئيس الوفد</div>,
        size: 220,
        minSize: 180,
        maxSize: 280,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const delegationHead = row.getValue(columnId)
            return delegationHead && delegationHead.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "membersCount",
        header: () => <div className="text-center">عدد الاعضاء</div>,
        size: 120,
        minSize: 100,
        maxSize: 150,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const membersCount = row.getValue(columnId)
            return membersCount && membersCount.toString().includes(filterValue)
        },
    },
    {
        accessorKey: "delegationType",
        header: () => <div className="text-center">نوع الوفد</div>,
        size: 120,
        minSize: 100,
        maxSize: 150,
        enableHiding: false,
        enableSorting: false,
        enableColumnFilter: true,
        cell: ({ row }) => {
            const type = row.getValue("delegationType")
            return (
                <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type === 'military' 
                            ? 'bg-blue-100 text-blue-800' 
                            : type === 'civil' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {type === 'military' ? 'عسكري' : type === 'civil' ? 'مدني' : '-'}
                    </span>
                </div>
            )
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const type = row.getValue(columnId)
            return type && type.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalHall",
        header: () => <div className="text-center">المطار</div>,
        size: 140,
        minSize: 120,
        maxSize: 170,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const hall = row.getValue(columnId)
            
            // إذا كان الفلتر "empty" (-)، نعرض فقط القيم الفارغة
            if (filterValue === "empty") {
                return !hall || hall === ""
            }
            
            // إذا كان الفلتر له قيمة محددة، نعرض فقط القيم المكتملة التي تطابق
            // التأكد من أن القيمة ليست فارغة قبل المقارنة
            if (!hall || hall === "") {
                return false
            }
            return hall.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalAirline",
        header: () => <div className="text-center">شركة الطيران</div>,
        size: 170,
        minSize: 150,
        maxSize: 200,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const airline = row.getValue(columnId)
            
            // إذا كان الفلتر "empty" (-)، نعرض فقط القيم الفارغة
            if (filterValue === "empty") {
                return !airline || airline === ""
            }
            
            // إذا كان الفلتر له قيمة محددة، نعرض فقط القيم المكتملة التي تطابق
            // التأكد من أن القيمة ليست فارغة قبل المقارنة
            if (!airline || airline === "") {
                return false
            }
            return airline.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalOrigin",
        header: () => <div className="text-center">قادمة من</div>,
        size: 140,
        minSize: 120,
        maxSize: 170,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const origin = row.getValue(columnId)
            
            // إذا كان الفلتر "empty" (-)، نعرض فقط القيم الفارغة
            if (filterValue === "empty") {
                return !origin || origin === ""
            }
            
            // إذا كان الفلتر له قيمة محددة، نعرض فقط القيم المكتملة التي تطابق
            // التأكد من أن القيمة ليست فارغة قبل المقارنة
            if (!origin || origin === "") {
                return false
            }
            return origin.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalFlightNumber",
        header: () => <div className="text-center">رقم الرحلة</div>,
        size: 140,
        minSize: 120,
        maxSize: 170,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const flightNumber = row.getValue(columnId)
            return flightNumber && flightNumber.toString().includes(filterValue)
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalDate",
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        التاريخ
                        <ArrowUpDown />
                    </Button>
                </div>
            )
        },
        size: 120,
        minSize: 100,
        maxSize: 150,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            
            const rowDateString = row.getValue(columnId)
            if (!rowDateString) return false
            
            const rowDate = new Date(rowDateString)
            if (isNaN(rowDate.getTime())) return false
            
            // Date range filter
            if (filterValue.start || filterValue.end) {
                const { start, end } = filterValue
                
                if (start) {
                    const startDate = new Date(start)
                    if (isNaN(startDate.getTime())) return false
                    if (rowDate < startDate) return false
                }
                
                if (end) {
                    const endDate = new Date(end)
                    if (isNaN(endDate.getTime())) return false
                    if (rowDate > endDate) return false
                }
                
                return true
            }
            
            // Single date filter
            if (typeof filterValue === 'string') {
                const filterDate = new Date(filterValue)
                if (isNaN(filterDate.getTime())) return false
                return rowDate.toDateString() === filterDate.toDateString()
            }
            
            return true
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalTime",
        header: () => <div className="text-center">سعت</div>,
        size: 100,
        minSize: 80,
        maxSize: 120,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const time = row.getValue(columnId)
            return time && time.toString().includes(filterValue)
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalReceptor",
        header: () => <div className="text-center">المودع</div>,
        size: 140,
        minSize: 120,
        maxSize: 170,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const receptor = row.getValue(columnId)
            return receptor && receptor.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalDestination",
        header: () => <div className="text-center">الوجهة</div>,
        size: 140,
        minSize: 120,
        maxSize: 170,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const destination = row.getValue(columnId)
            return destination && destination.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "arrivalInfo.arrivalShipments",
        header: () => <div className="text-center">الشحنات</div>,
        size: 140,
        minSize: 120,
        maxSize: 170,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const shipments = row.getValue(columnId)
            return shipments && shipments.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            // جلب صلاحيات المستخدم من Redux
            const { checkPermission } = usePermissions()
            
            // إخفاء أزرار التعديل والحذف عن USER
            if (!checkPermission('EDIT_DELEGATIONS') && !checkPermission('DELETE_DELEGATIONS')) {
                return null
            }
            
            return (
                <DropdownMenu dir='rtl'>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 !ring-0">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {checkPermission('EDIT_DELEGATIONS') && (
                            <EditDelegation delegation={row.original}>
                                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                    <Icon name="Edit" size={20} />
                                    <span>تعديل</span>
                                </DropdownMenuItem>
                            </EditDelegation>
                        )}
                        {checkPermission('DELETE_DELEGATIONS') && (
                            <DeletePopup item={row}>
                                <DropdownMenuItem variant="destructive" onSelect={e => e.preventDefault()}>
                                    <Icon name="Trash2" size={20} />
                                    <span>حذف</span>
                                </DropdownMenuItem>
                            </DeletePopup>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
const Delegations = ({ subEventId }) => {
    const dispatch = useDispatch()
    const { delegations = [] } = useSelector(state => state.delegations || {})
    
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({
        delegationType: false // إخفاء عمود نوع الوفد افتراضياً
    })
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState('')
    
    // تحميل البيانات من Redux (مرة واحدة فقط)
    useEffect(() => {
        dispatch(fetchDelegations(subEventId))
    }, [subEventId, dispatch])
    
    // تحويل بيانات Redux لشكل الجدول مع useMemo
    const data = useMemo(() => {
        const toHHMM = (timeStr) => {
            if (!timeStr) return ''
            const s = String(timeStr).replace(/:/g, '')
            return s.slice(0, 4)
        }
        
        // Filter delegations by subEventId if needed
        const filteredDelegations = delegations.filter(d => {
            const matchesSubEventId = d.sub_event_id?.toString() === subEventId
            const matchesSubEvent = d.sub_event?.toString() === subEventId
            const matchesSubEventIdField = d.sub_event_id === subEventId
            const matchesSubEventField = d.sub_event === subEventId
            
            return matchesSubEventId || matchesSubEvent || matchesSubEventIdField || matchesSubEventField
        })
        
        return filteredDelegations.map(d => ({
            id: d.id,
            type: d.type,
            delegationType: d.type === 'MILITARY' ? 'military' : d.type === 'CIVILIAN' ? 'civil' : 'unknown',
            delegationStatus: d.status === 'FULLY_DEPARTED' ? 'all_departed' : d.status === 'PARTIALLY_DEPARTED' ? 'partial_departed' : 'not_departed',
            nationality: d.nationality_name || '',
            delegationHead: d.delegation_leader_name || '',
            membersCount: d.member_count || 0,
            current_members: d.current_members || 0,
            arrivalInfo: {
                arrivalHall: d.airport_name || '',
                arrivalAirline: d.airline_name || '',
                arrivalOrigin: d.city_name || '',
                arrivalFlightNumber: d.flight_number || '',
                arrivalDate: d.arrive_date || '',
                arrivalTime: toHHMM(d.arrive_time),
                arrivalReceptor: d.receiver_name || '',
                arrivalDestination: d.going_to || '',
                arrivalShipments: d.goods || '',
            },
        }))
    }, [delegations, subEventId])
    
    // الاستماع لإشارة تحديث عامة لإعادة التحميل من Redux مع debouncing
    useEffect(() => {
        let debounceTimeout = null
        
        const reload = () => {
            // Clear previous debounce timeout
            if (debounceTimeout) {
                clearTimeout(debounceTimeout)
            }
            
            // Debounce the reload to prevent rapid-fire requests
            debounceTimeout = setTimeout(() => {
                console.log('🔄 Executing debounced delegation reload...')
                dispatch(fetchDelegations(subEventId))
            }, 300) // 300ms debounce
        }
        
        window.addEventListener('delegationUpdated', reload)
        window.addEventListener('delegationDeleted', reload)
        return () => { 
            if (debounceTimeout) {
                clearTimeout(debounceTimeout)
            }
            window.removeEventListener('delegationUpdated', reload)
            window.removeEventListener('delegationDeleted', reload)
        }
    }, [subEventId, dispatch])
    
    const table = useReactTable({
        data: data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        filterFns: {
            ...filterFns,
            dateRange: (row, columnId, value) => {
                if (!value || (!value.start && !value.end)) return true
                
                const cellValue = row.getValue(columnId)
                const cellDate = new Date(cellValue)
                const startDate = value.start ? new Date(value.start) : null
                const endDate = value.end ? new Date(value.end) : null
                
                if (startDate && endDate) {
                    return cellDate >= startDate && cellDate <= endDate
                } else if (startDate) {
                    return cellDate >= startDate
                } else if (endDate) {
                    return cellDate <= endDate
                }
                return true
            },
            exactDate: (row, columnId, value) => {
                if (!value) return true
                
                const cellValue = row.getValue(columnId)
                const cellDate = new Date(cellValue)
                const filterDate = new Date(value)
                
                return cellDate.toDateString() === filterDate.toDateString()
            }
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString', // or a custom filter fn

        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })
    
    // Show message if no delegations found
    if (data.length === 0) {
        return (
            <div className='border p-8 mt-8 border-neutral-300 rounded-2xl bg-white text-center'>
                <div className="flex flex-col items-center justify-center py-12">
                    <Icon name="Users" size={20} className="text-6xl text-neutral-400 mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-700 mb-2">لم يتم العثور على الوفود</h3>
                    <p className="text-neutral-500 mb-4">لا توجد وفود مسجلة لهذا الحدث الفرعي</p>
                    
                    {/* زر إضافة وفد */}
                    <PermissionElement permission="ADD_DELEGATIONS">
                        <div className="mt-6">
                            <AddDelegation subEventId={subEventId} />
                        </div>
                    </PermissionElement>
                    
                </div>
            </div>
        )
    }

    return (
        <div className='border p-4 mt-8 border-neutral-300 rounded-2xl bg-white'>
            <DelegationTableToolbar table={table} data={data} subEventId={subEventId} />
            <DataTable table={table} columns={columns} clickableRow={true} />
        </div >
    )
}

export default Delegations