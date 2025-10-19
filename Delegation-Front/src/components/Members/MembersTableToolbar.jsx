import { Input } from "@/components/ui/input"
import MembersFilter from "./MembersFilter"
import MembersReportExport from "./MembersReportExport"
import AddMemberToDelegation from "./AddMemberToDelegation"
import { useMemo } from "react"
import { PermissionElement } from "../Permissions/PermissionGuard"

const MembersTableToolbar = ({ table, data, showDelegationInfo = true }) => {
    const filteredData = useMemo(() => {
        // الحصول على حالة الجدول
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

    return (
        <div className="flex items-center gap-4 justify-between py-4">
            <Input
                placeholder="بحث ..."
                value={table.getState().globalFilter ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="max-w-sm !ring-0"
            />
            <div className="flex items-center gap-2">
                <PermissionElement permission="USE_FILTERS">
                    {showDelegationInfo && <MembersFilter table={table} data={data} />}
                </PermissionElement>
                <PermissionElement permission="EXPORT_REPORTS">
                    <MembersReportExport data={data} filteredData={filteredData} />
                </PermissionElement>
                <PermissionElement permission="ADD_MEMBERS">
                    {showDelegationInfo && <AddMemberToDelegation />}
                </PermissionElement>
            </div>
        </div>
    )
}

export default MembersTableToolbar