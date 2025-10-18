import { exportToExcel, exportToPDF } from '../../utils'
import { Icon } from '@iconify/react/dist/iconify.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import SmartCombinedReportPDF from '../PDF Templates/SmartCombinedReportPDF'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from "file-saver"
import { memberService } from '../../services/api'

const DelegationReportExport = ({data}) => {
    


    const exportCombinedReport = async () => {
        try {
            // جلب الأعضاء من API بدلاً من localStorage
            const allMembers = await memberService.getMembers()
            const members = Array.isArray(allMembers?.results) ? allMembers.results : Array.isArray(allMembers) ? allMembers : []
            
            const filteredMembers = members.filter(member => 
                data.some(d => d.id === member.delegation_id)
            );
            
            // طباعة التقرير الشامل الواحد فقط
            const combinedBlob = await pdf(<SmartCombinedReportPDF delegationData={data} membersData={filteredMembers} showDelegations={true} showMembers={true} />).toBlob();
            saveAs(combinedBlob, "تقرير شامل.pdf");
            
        } catch (error) {
            console.error('Error generating reports:', error);
            alert('حدث خطأ في إنشاء التقارير. يرجى المحاولة مرة أخرى.');
        }
    }


    return (
        <DropdownMenu dir='rtl'>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="!ring-0">
                    <Icon icon={'mi:export'} />
                    <span>تصدير تقرير</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={e => exportCombinedReport()}>
                    <Icon icon={'hugeicons:pdf-02'} className="text-[#ef5350]" />
                    <span>تقرير شامل</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onSelect={e => exportToExcel(data)}>
                    <Icon icon={'hugeicons:xls-02'} className="text-[#33c481]" />
                    <span>Excel ملف</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default DelegationReportExport