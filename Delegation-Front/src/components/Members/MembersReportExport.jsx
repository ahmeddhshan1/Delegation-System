import { exportToExcel, exportToPDF, exportMembersToExcel } from '../../utils'
import { Icon } from '@iconify/react/dist/iconify.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import MembersReportPDF from '../PDF Templates/MembersReportPDF'

const MembersReportExport = ({data}) => {
    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="!ring-0">
                    <Icon icon={'mi:export'} />
                    <span>تصدير تقرير</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={e => exportToPDF(<MembersReportPDF data={data} />, "EDEX - Members report.pdf")}>
                    <Icon icon={'hugeicons:pdf-02'} className="text-[#ef5350]" />
                    <span>PDF file</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={e => exportMembersToExcel(data)}>
                    <Icon icon={'hugeicons:xls-02'} className="text-[#33c481]" />
                    <span>Excel file</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default MembersReportExport