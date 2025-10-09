import * as XLSX from "xlsx"
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";


export const exportMembersToExcel = (data, fileName = "EDEX - Members report.xlsx") => {
    // Create a mapping from English keys → Arabic headers for members
    const headerMap = {
        rank: "الرتبة",
        name: "الاسم",
        role: "الوظيفة",
        memberStatus: "حالة العضو",
    };

    // Convert data keys to Arabic headers
    const arabicData = data.map((item) => {
        let newItem = {};
        for (const key in item) {
            if (headerMap[key]) {
                // Convert memberStatus to Arabic text
                if (key === 'memberStatus') {
                    const statusMap = {
                        'departed': 'غادر',
                        'not_departed': 'لم يغادر'
                    };
                    newItem[headerMap[key]] = statusMap[item[key]] || item[key] || 'غير محدد';
                } else {
                    newItem[headerMap[key]] = item[key];
                }
            }
        }
        return newItem;
    });

    // Generate worksheet
    const worksheet = XLSX.utils.json_to_sheet(arabicData);

    // Generate workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الجدول");

    // Export to Excel
    XLSX.writeFile(workbook, fileName);
};

export const exportToExcel = (data, fileName = "EDEX - Delegations report.xlsx") => {
    // Create a mapping from English keys → Arabic headers
    const headerMap = {
        nationality: "الجنسية",
        delegationHead: "رئيس الوفد",
        membersCount: "عدد الاعضاء",
        hall: "الصالة",
        delegationStatus: "حالة الوفد",
        date: "التاريخ",
        time: "سعت",
        receptor: "المستقبل",
        destination: "وجهة الرحلة",
        shipments: "الشحنات",
    };

    // Convert data keys to Arabic headers
    const arabicData = data.map((item) => {
        let newItem = {};
        for (const key in item) {
            if (headerMap[key]) {
                // Convert delegationStatus to Arabic text
                if (key === 'delegationStatus') {
                    const statusMap = {
                        'all_departed': 'تم مغادرة الوفد',
                        'partial_departed': 'لم يغادر جزء من الوفد',
                        'not_departed': 'لم يغادر أحد'
                    };
                    newItem[headerMap[key]] = statusMap[item[key]] || item[key];
                } else {
                    newItem[headerMap[key]] = item[key];
                }
            }
        }
        return newItem;
    });

    // Generate worksheet
    const worksheet = XLSX.utils.json_to_sheet(arabicData);

    // Generate workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الجدول");

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