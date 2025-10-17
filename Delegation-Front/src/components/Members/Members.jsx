import {
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
import { useState, useEffect } from "react"
import { Icon } from "@iconify/react/dist/iconify.js"
import DataTable from "../DataTable"
import DeletePopup from "../DeletePopup"
import EditMember from "./EditMember"
import MembersTableToolbar from "./MembersTableToolbar"
// import { members } from "../../data" // تم إزالة البيانات الوهمية
import { usePermissions } from "../../store/hooks"
import { memberService } from "../../services/api"

export const columns = [
    {
        accessorKey: "status",
        header: () => <div className="text-center">حالة العضو</div>,
        cell: ({ row }) => {
            const status = row.getValue("status")
            let statusIcon = ""
            let iconColor = ""
            
            switch(status) {
                case "DEPARTED":
                    statusIcon = "material-symbols:check-circle"
                    iconColor = "text-lime-600"
                    break
                case "NOT_DEPARTED":
                    statusIcon = "material-symbols:cancel"
                    iconColor = "text-red-600"
                    break
                default:
                    statusIcon = "material-symbols:cancel"
                    iconColor = "text-red-600"
            }
            
            return (
                <div className="flex justify-center">
                    <Icon icon={statusIcon} fontSize={20} className={iconColor} />
                </div>
            )
        },
    },
    {
        accessorKey: "rank",
        header: () => <div className="text-center">الرتبة</div>,
        cell: ({ row }) => {
            const rank = row.getValue("rank")
            return (
                <div className="text-center">
                    {rank || <span className="text-neutral-400">-</span>}
                </div>
            )
        },
    },
    {
        accessorKey: "name",
        header: () => <div className="text-center">الاسم</div>,
    },
    {
        accessorKey: "job_title",
        header: () => <div className="text-center">الوظيفة</div>,
        cell: ({ row }) => {
            const jobTitle = row.getValue("job_title")
            return (
                <div className="text-center">
                    {jobTitle || <span className="text-neutral-400">-</span>}
                </div>
            )
        },
    },
    {
        accessorKey: "equivalent_job_name",
        header: () => <div className="text-center">الوظيفة المعادلة</div>,
        cell: ({ row }) => {
            const equivalentJobName = row.getValue("equivalent_job_name")
            return (
                <div className="text-center">
                    {equivalentJobName || <span className="text-neutral-400">-</span>}
                </div>
            )
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const equivalentJobName = row.getValue(columnId)
            return equivalentJobName && equivalentJobName.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        accessorKey: "departure_date",
        header: ({ column }) => {
            return (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-auto p-0 font-medium"
                    >
                        تاريخ المغادرة
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const departureDate = row.getValue("departure_date")
            return (
                <div className="text-center">
                    {departureDate ? (
                        <span className="text-sm text-neutral-600">
                            {new Date(departureDate).toLocaleDateString('en-GB')}
                        </span>
                    ) : (
                        <span className="text-sm text-neutral-400">-</span>
                    )}
                </div>
            )
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true
            const departureDate = row.getValue(columnId)
            if (!departureDate) return false
            return departureDate.toLowerCase().includes(filterValue.toLowerCase())
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            // جلب صلاحيات المستخدم من Redux
            const { checkPermission } = usePermissions()
            
            // إخفاء أزرار التعديل والحذف عن USER
            if (!checkPermission('EDIT_MEMBERS') && !checkPermission('DELETE_MEMBERS')) {
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
                        {checkPermission('EDIT_MEMBERS') && (
                            <EditMember member={row.original}>
                                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                    <Icon icon={'material-symbols:edit-outline-rounded'} />
                                    <span>تعديل</span>
                                </DropdownMenuItem>
                            </EditMember>
                        )}
                        {checkPermission('DELETE_MEMBERS') && (
                            <DeletePopup 
                                item={row} 
                                onDelete={async (memberId) => {
                                    try {
                                        await memberService.deleteMember(memberId)
                                        // إطلاق إشارة لإعادة تحميل البيانات
                                        window.dispatchEvent(new CustomEvent('delegationUpdated'))
                                    } catch (error) {
                                        throw error // سيتم التعامل مع الخطأ في DeletePopup
                                    }
                                }}
                            >
                                <DropdownMenuItem variant="destructive" onSelect={e => e.preventDefault()}>
                                    <Icon icon={'material-symbols:delete-outline-rounded'} />
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

const Members = ({ members: data = [], showDelegationInfo = false }) => {
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState("")

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
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
            <MembersTableToolbar table={table} data={data} showDelegationInfo={showDelegationInfo} />
            <DataTable table={table} columns={columns} clickableRow={false} />
        </div>
    )
}

export default Members
