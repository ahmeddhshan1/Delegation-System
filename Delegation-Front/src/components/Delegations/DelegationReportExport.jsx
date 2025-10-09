import { exportToExcel, exportToPDF } from '../../utils'
import { Icon } from '@iconify/react/dist/iconify.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { members } from '../../data'
import SmartCombinedReportPDF from '../PDF Templates/SmartCombinedReportPDF'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from "file-saver";

const DelegationReportExport = ({data}) => {
    


    const exportCombinedReport = async () => {
        try {
            const filteredMembers = members.filter(member => 
                data.some(d => d.id === member.delegation?.id)
            );
            
            // 1. طباعة التقرير الشامل
            const combinedBlob = await pdf(<SmartCombinedReportPDF delegationData={data} membersData={filteredMembers} showDelegations={true} showMembers={true} />).toBlob();
            saveAs(combinedBlob, "تقرير شامل.pdf");
            
            // 2. طباعة تقرير الوفود المنفصل
            const delegationBlob = await pdf(<SmartCombinedReportPDF delegationData={data} membersData={[]} showDelegations={true} showMembers={false} />).toBlob();
            saveAs(delegationBlob, "تقرير الوفود.pdf");
            
            // 3. طباعة تقرير الأعضاء المنفصل
            const membersBlob = await pdf(<SmartCombinedReportPDF delegationData={[]} membersData={filteredMembers} showDelegations={false} showMembers={true} />).toBlob();
            saveAs(membersBlob, "تقرير الأعضاء.pdf");
            
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