import { exportToPDF } from '../../utils'
import DepartureReportPDF from '../PDF Templates/DepartureReportPDF'
import Icon from '../ui/Icon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { pdf } from '@react-pdf/renderer'
import { saveAs } from "file-saver"

const DepartureReportExport = ({ delegation, departureSessions = [] }) => {
    const exportDepartureReport = async () => {
        const delegationWithSessions = {
            ...delegation,
            departureSessions: departureSessions
        }
        const blob = await pdf(<DepartureReportPDF delegation={delegationWithSessions} />).toBlob();
        saveAs(blob, `EDEX - تقرير مغادرات الوفد ${delegation.nationality}.pdf`);
    }

    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="!ring-0">
                    <Icon name="Download" size={20} />
                    <span>تصدير تقرير المغادرات</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={e => exportDepartureReport()}>
                    <Icon name="FileText" size={20} className="text-[#ef5350]" />
                    <span>تقرير PDF</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default DepartureReportExport




