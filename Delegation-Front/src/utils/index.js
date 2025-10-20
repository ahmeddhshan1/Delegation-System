import * as XLSX from "xlsx"
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";


export const exportMembersToExcel = (data, fileName = "EDEX - Members report.xlsx") => {
    // ترتيب الأعمدة مطابق لـ PDF تماماً
    const arabicData = data.map((item, index) => {
        return {
            "م": index + 1, // الترقيم
            "الرتبة": item.rank || "",
            "الاسم": item.name || "",
            "الوظيفة": item.job_title || "",
            "حالة العضو": item.status === 'DEPARTED' ? 'غادر' :
                         item.status === 'NOT_DEPARTED' ? 'لم يغادر' : 
                         '-',
            "تاريخ الوصول": item.delegation?.arrival_date ? new Date(item.delegation.arrival_date).toLocaleDateString('en-GB') : '-',
            "تاريخ المغادرة": item.departure_date ? new Date(item.departure_date).toLocaleDateString('en-GB') : '-'
        };
    });

    // Generate worksheet
    const worksheet = XLSX.utils.json_to_sheet(arabicData);

    // Generate workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "تقرير الأعضاء");

    // Export to Excel
    XLSX.writeFile(workbook, fileName);
};

export const exportToExcel = (data, fileName = "EDEX - Delegations report.xlsx") => {
    // ترتيب الأعمدة مطابق لـ PDF تماماً - من اليمين لليسار
    const arabicData = data.map((item, index) => {
        return {
            "الشحنات": item.arrivalInfo?.arrivalShipments || '-',
            "المستقبل": item.arrivalInfo?.arrivalReceptor || '-',
            "الوجهة": item.arrivalInfo?.arrivalDestination || '-',
            "قادمة من": item.arrivalInfo?.arrivalOrigin || '-',
            "رقم الرحلة": item.arrivalInfo?.arrivalFlightNumber || '-',
            "شركة الطيران": item.arrivalInfo?.arrivalAirline || '-',
            "المطار": item.arrivalInfo?.arrivalHall || '-',
            "سعت الوصول": item.arrivalInfo?.arrivalTime ? 
                item.arrivalInfo.arrivalTime.replace(':', '') : '-',
            "تاريخ الوصول": item.arrivalInfo?.arrivalDate || '-',
            "حالة الوفد": item.delegationStatus === 'all_departed' ? 'غادر بالكامل' :
                         item.delegationStatus === 'partial_departed' ? 'غادر جزئياً' : 'لم يغادر',
            "عدد الأعضاء": item.membersCount || 0,
            "رئيس الوفد": item.delegationHead || item.delegation_leader_name || '-',
            "الجنسية": item.nationality || '-'
        };
    });

    // Generate worksheet
    const worksheet = XLSX.utils.json_to_sheet(arabicData);

    // Set RTL direction for the worksheet
    worksheet['!cols'] = Object.keys(arabicData[0] || {}).map(() => ({ wch: 15 }));

    // Generate workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "تقرير الوفود");

    // Export to Excel
    XLSX.writeFile(workbook, fileName);
};


export const exportToPDF = async (PDFComponent, fileName = 'EDEX - report.pdf') => {
    const blob = await pdf(PDFComponent).toBlob();    
    saveAs(blob, fileName);
};


export const formatArabicDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    // Return as Arabic numerals
    return `${year}/${month}/${day}`
        .replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]); // Convert to Arabic digits
};

export const formatTime = (time) => {
    if (!time) return "";
    
    // If it's already in HHMM format (4 digits), return as is
    if (typeof time === 'string' && /^\d{4}$/.test(time)) {
        return time;
    }
    
    // If it's in HH:MM format, remove colon
    if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
        return time.replace(':', '');
    }
    
    // If it's a Date object or time string, format it as HHMM
    const date = new Date(time);
    if (isNaN(date.getTime())) return "";
    
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    
    return `${hours}${minutes}`;
};