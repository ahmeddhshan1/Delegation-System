import { exportToExcel, exportToPDF, exportMembersToExcel } from '../../utils'
import Icon from '../ui/Icon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import MembersReportPDF from '../PDF Templates/MembersReportPDF'

const MembersReportExport = ({data, filteredData}) => {
    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="!ring-0">
                    <Icon name="Download" size={20} />
                    <span>تصدير تقرير</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={e => exportToPDF(<MembersReportPDF data={filteredData || data} />, "EDEX - Members report.pdf")}>
                    <Icon name="FileText" size={20} className="text-[#ef5350]" />
                    <span>PDF file</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={e => exportMembersToExcel(filteredData || data)}>
                    <Icon name="FileSpreadsheet" size={20} className="text-[#33c481]" />
                    <span>Excel file</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default MembersReportExport