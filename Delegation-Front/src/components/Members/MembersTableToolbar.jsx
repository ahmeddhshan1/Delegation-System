import { Input } from "@/components/ui/input"
import MembersFilter from "./MembersFilter"
import MembersReportExport from "./MembersReportExport"
import AddMemberToDelegation from "./AddMemberToDelegation"

const MembersTableToolbar = ({ table, data, showDelegationInfo = true }) => {
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
                {showDelegationInfo && <MembersFilter table={table} data={data} />}
                <MembersReportExport data={data} />
                {showDelegationInfo && <AddMemberToDelegation />}
            </div>
        </div>
    )
}

export default MembersTableToolbar