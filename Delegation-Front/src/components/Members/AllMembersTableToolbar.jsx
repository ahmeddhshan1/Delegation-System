import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react/dist/iconify.js"
import AllMembersFilter from "./AllMembersFilter"
import MembersReportExport from "./MembersReportExport"
import { toast } from "sonner"
import { useMemo } from "react"

const AllMembersTableToolbar = ({ table, data, onCleanup }) => {
    // الحصول على البيانات المفلترة من الجدول
    const filteredData = useMemo(() => {
        const tableState = table.getState()
        const hasGlobalFilter = tableState.globalFilter && tableState.globalFilter.trim() !== ''
        const hasColumnFilters = tableState.columnFilters.length > 0
        const hasAnyFilter = hasGlobalFilter || hasColumnFilters
        
        if (!hasAnyFilter) {
            return data
        }
        
        // إرجاع البيانات المفلترة
        return table.getFilteredRowModel().rows.map(row => row.original)
    }, [table, data, table.getState().globalFilter, table.getState().columnFilters])
    const cleanupOrphanedMembers = () => {
        // تم إزالة هذه الوظيفة لأننا نستخدم API الآن
        toast.info('تم إزالة وظيفة تنظيف الأعضاء المعلقة لأننا نستخدم API الآن')
    }

    const updateMemberEventData = () => {
        // تم إزالة هذه الوظيفة لأننا نستخدم API الآن
        toast.info('تم إزالة وظيفة تحديث بيانات الأعضاء لأننا نستخدم API الآن')
    }


    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between py-4">
            <Input
                placeholder="بحث ..."
                value={table.getState().globalFilter ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="w-full sm:max-w-sm !ring-0"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <AllMembersFilter table={table} data={data} />
                <MembersReportExport data={data} filteredData={filteredData} />
            </div>
        </div>
    )
}

export default AllMembersTableToolbar

