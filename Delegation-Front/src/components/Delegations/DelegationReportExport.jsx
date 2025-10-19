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
import { memberService, departureSessionService } from '../../services/api'

const DelegationReportExport = ({data}) => {
    


    const exportCombinedReport = async () => {
        try {
            // جلب الأعضاء من API
            const allMembers = await memberService.getMembers()
            const members = Array.isArray(allMembers?.results) ? allMembers.results : Array.isArray(allMembers) ? allMembers : []
            
            // جلب جلسات المغادرة
            const allDepartureSessions = await departureSessionService.getDepartureSessions()
            const departureSessions = Array.isArray(allDepartureSessions?.results) ? allDepartureSessions.results : Array.isArray(allDepartureSessions) ? allDepartureSessions : []
            
            // فلترة الأعضاء حسب الوفود المفلترة فقط (data هنا هو filteredData من toolbar)
            const filteredMembers = members.filter(member => 
                data.some(d => d.id === member.delegation_id)
            );
            
            // ربط بيانات جلسات المغادرة بالأعضاء
            const membersWithDepartureData = filteredMembers.map(member => {
                // البحث عن جلسة المغادرة التي تحتوي على هذا العضو
                const memberDepartureSession = departureSessions.find(session => 
                    session.members && session.members.some(m => m.id === member.id)
                );
                
                // إضافة بيانات المغادرة للعضو
                if (memberDepartureSession) {
                    return {
                        ...member,
                        delegation_id: member.delegation_id, // تأكد من وجود delegation_id
                        departure_destination: memberDepartureSession.city_name || '-',
                        departure_time: memberDepartureSession.checkout_time ? 
                            memberDepartureSession.checkout_time.replace(':', '') : '-',
                        departure_flight_number: memberDepartureSession.flight_number || '-',
                        departure_airline: memberDepartureSession.airline_name || '-',
                    };
                }
                
                return {
                    ...member,
                    delegation_id: member.delegation_id, // تأكد من وجود delegation_id
                };
            });
            
            // طباعة التقرير الشامل الواحد فقط - استخدام البيانات المفلترة
            const combinedBlob = await pdf(<SmartCombinedReportPDF delegationData={data} membersData={membersWithDepartureData} showDelegations={true} showMembers={true} />).toBlob();
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