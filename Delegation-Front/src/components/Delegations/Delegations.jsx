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
import { useState, useEffect, useCallback } from "react"
import { Icon } from "@iconify/react/dist/iconify.js"
import DataTable from "../DataTable"
import DelegationTableToolbar from "./DelegationTableToolbar"
import DeletePopup from "../DeletePopup"
import EditDelegation from "./EditDelegation"
// import { dateRangeFilter } from "../../utils"
import { delegations } from "../../data"


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
                    statusIcon = "material-symbols:check-circle"
                    iconColor = "text-lime-600"
                    break
                case "partial_departed":
                    statusIcon = "material-symbols:schedule"
                    iconColor = "text-primary-600"
                    break
                case "not_departed":
                    statusIcon = "material-symbols:cancel"
                    iconColor = "text-red-600"
                    break
                default:
                    statusIcon = "material-symbols:cancel"
                    iconColor = "text-red-600"
            }
            
            return (
                <div className="flex justify-center">
                    <div className="px-1 py-1 rounded-lg text-lg font-medium text-center bg-gray-200 w-fit">
                        <Icon icon={statusIcon} fontSize={20} className={iconColor} />
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
            return nationality && nationality.toLowerCase().includes(filterValue.toLowerCase())
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
        accessorKey: "arrivalInfo.arrivalHall",
        header: () => <div className="text-center">المطار</div>,
        size: 140,
        minSize: 120,
        maxSize: 170,
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const hall = row.getValue(columnId)
            return hall && hall.toLowerCase().includes(filterValue.toLowerCase())
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
            return airline && airline.toLowerCase().includes(filterValue.toLowerCase())
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
            return origin && origin.toLowerCase().includes(filterValue.toLowerCase())
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
            return (
                <DropdownMenu dir='rtl'>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 !ring-0">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <EditDelegation delegation={row.original}>
                            <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                <Icon icon={'material-symbols:edit-outline-rounded'} />
                                <span>تعديل</span>
                            </DropdownMenuItem>
                        </EditDelegation>
                        <DeletePopup item={row}>
                            <DropdownMenuItem variant="destructive" onSelect={e => e.preventDefault()}>
                                <Icon icon={'mynaui:trash'} />
                                <span>حذف</span>
                            </DropdownMenuItem>
                        </DeletePopup>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
const Delegations = ({ subEventId }) => {
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState('')
    const [data, setData] = useState([])
    
    // تحميل البيانات الحقيقية
    const loadDelegations = () => {
        
        // إذا تم تمرير subEventId، فلترة الوفود حسب الحدث الفرعي
        if (subEventId) {
            const savedDelegations = localStorage.getItem('delegations')
            if (savedDelegations) {
                try {
                    const allDelegations = JSON.parse(savedDelegations)
                    const filtered = allDelegations.filter(delegation => 
                        delegation.subEventId === subEventId || delegation.subEventId === parseInt(subEventId)
                    )
                    setData(filtered)
                } catch (error) {
                    console.error('خطأ في تحليل بيانات الوفود:', error)
                    setData([])
                }
            } else {
                setData([])
            }
            return
        }
        
        // الحالة العادية - تحميل جميع الوفود
        const savedDelegations = localStorage.getItem('delegations')
        if (savedDelegations) {
            try {
                const parsedDelegations = JSON.parse(savedDelegations)
                setData(parsedDelegations)
            } catch (error) {
                console.error('خطأ في تحليل بيانات الوفود:', error)
                setData([])
            }
        } else {
            setData([])
        }
    }
    
    // الاستماع لتغييرات localStorage
    useEffect(() => {
        const handleStorageChange = (event) => {
            loadDelegations()
        }
        
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('delegationAdded', handleStorageChange)
        window.addEventListener('delegationDeleted', handleStorageChange)
        window.addEventListener('delegationUpdated', handleStorageChange)
        window.addEventListener('memberAdded', handleStorageChange)
        window.addEventListener('memberDeleted', handleStorageChange)
        window.addEventListener('memberUpdated', handleStorageChange)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('delegationAdded', handleStorageChange)
            window.removeEventListener('delegationDeleted', handleStorageChange)
            window.removeEventListener('delegationUpdated', handleStorageChange)
            window.removeEventListener('memberAdded', handleStorageChange)
            window.removeEventListener('memberDeleted', handleStorageChange)
            window.removeEventListener('memberUpdated', handleStorageChange)
        }
    }, [])
    
    // استدعاء loadDelegations عند التحميل الأول
    useEffect(() => {
        loadDelegations()
    }, [subEventId])
    
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
    
    return (
        <div className='border p-4 mt-8 border-neutral-300 rounded-2xl bg-white'>
            <DelegationTableToolbar table={table} data={data} subEventId={subEventId} />
            <DataTable table={table} columns={columns} clickableRow={true} />
        </div >
    )
}

export default Delegations