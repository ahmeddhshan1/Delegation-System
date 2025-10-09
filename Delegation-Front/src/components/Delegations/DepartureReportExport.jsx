import { exportToPDF } from '../../utils'
import DepartureReportPDF from '../PDF Templates/DepartureReportPDF'
import { Icon } from '@iconify/react/dist/iconify.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { pdf } from '@react-pdf/renderer'
import { saveAs } from "file-saver"

const DepartureReportExport = ({ delegation }) => {
    const exportDepartureReport = async () => {
        const blob = await pdf(<DepartureReportPDF delegation={delegation} />).toBlob();
        saveAs(blob, `EDEX - تقرير مغادرات الوفد ${delegation.nationality}.pdf`);
    }

    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="!ring-0">
                    <Icon icon={'mi:export'} />
                    <span>تصدير تقرير المغادرات</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={e => exportDepartureReport()}>
                    <Icon icon={'hugeicons:pdf-02'} className="text-[#ef5350]" />
                    <span>تقرير PDF</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default DepartureReportExport




