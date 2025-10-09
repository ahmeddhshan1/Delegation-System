import AddDelegation from "./AddDelegation"
import { Input } from "@/components/ui/input"
import DelegationReportExport from "./DelegationReportExport"
import DelegationFilter from "./DelegationFilter"
import { useMemo } from "react"
import { PermissionElement } from "../Permissions/PermissionGuard"
import { PERMISSIONS } from "../../utils/permissions"


const DelegationTableToolbar = ({ table, data, subEventId }) => {
    const filteredData = table.getState().columnFilters.length === 0 
        ? data
        : table.getFilteredRowModel().rows.map(row => row.original)
    

    return (
        <div className="flex items-center gap-4 justify-between py-4">
            <Input
                placeholder="بحث ..."
                // value={(table.getColumn("delegationHead")?.getFilterValue()) ?? ""}
                // onChange={(event) =>table.getColumn("delegationHead")?.setFilterValue(event.target.value)}
                value={table.getState().globalFilter ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="max-w-sm !ring-0"
            />
            <div className="flex items-center gap-2">
                <PermissionElement permission={PERMISSIONS.USE_FILTERS}>
                    <DelegationFilter table={table} data={data} />
                </PermissionElement>
                <PermissionElement permission={PERMISSIONS.EXPORT_REPORTS}>
                    <DelegationReportExport data={filteredData} />
                </PermissionElement>
                <PermissionElement permission={PERMISSIONS.ADD_DELEGATIONS}>
                    <AddDelegation subEventId={subEventId} />
                </PermissionElement>
            </div>
        </div>
    )
}

export default DelegationTableToolbar