import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
  Image
} from "@react-pdf/renderer";
import { formatTime } from '../../utils';
import { formatArabicDate } from "../../utils";

// ✅ Register Arabic font
Font.register({
  family: "Cairo",
  src: "/fonts/Cairo-Regular.ttf",
});

// ✅ Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Cairo",
    direction: "rtl" // Right-to-left for Arabic
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between", // logo left + logo right
    alignItems: "center",
    marginBottom: 20
  },
  logo: {
    width: 80,
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold"
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  row: {
    flexDirection: "row-reverse" // ✅ make it RTL
  },
  cell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
    fontSize: 9,
    textAlign: "center",
    minHeight: 25,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontSize: 12,
    fontWeight: "bold"
  },
  delegationInfo: {
    marginTop: 10,
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    alignSelf: "flex-end" // makes width shrink to fit content
  },
  nationalityBox: {
    marginBottom: 20
  },
  sectionDivider: {
    marginTop: 30,
    marginBottom: 20,
    borderTop: 2,
    borderTopColor: "#333",
    borderTopStyle: "solid",
    paddingTop: 20
  },
  sectionTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
    color: "#333"
  }
});

// ✅ Headers for Delegation Report with flexible widths
const delegationHeaders = [
  { text: "الجنسية", width: "8%" },           // Short text - nationality
  { text: "رئيس الوفد", width: "12%" },       // Medium text - delegation head name
  { text: "عدد الاعضاء", width: "6%" },       // Short number - members count
  { text: "الصالة", width: "8%" },           // Short text - hall
  { text: "شركة الطيران", width: "12%" },     // Medium text - airline
  { text: "رقم الرحلة", width: "8%" },        // Short text - flight number
  { text: "قادمة من", width: "8%" },          // Short text - origin
  { text: "نوع الحركة", width: "10%" },       // Medium text - movement type
  { text: "التاريخ", width: "8%" },           // Short date - date
  { text: "سعت", width: "6%" },              // Short time - time
  { text: "المستقبل", width: "10%" },         // Medium text - receptor
  { text: "وجهة الرحلة", width: "10%" },       // Medium text - destination
  { text: "الشحنات", width: "8%" }            // Medium text - shipments
];

// ✅ Headers for Full Report with flexible widths
const fullReportHeaders = [
  { text: "الرتبة", width: "8%" },            // Short text - rank
  { text: "الاسم", width: "15%" },            // Long text - name
  { text: "الوظيفة", width: "12%" },          // Medium text - role
  { text: "الوصول من / المغادرة الى", width: "15%" }, // Long text - destination
  { text: "تاريخ الوصول / المغادرة", width: "10%" }, // Medium text - date
  { text: "سعت الوصول / المغادرة", width: "8%" },   // Short time - time
  { text: "رقم الرحلة", width: "8%" },        // Short text - flight number
  { text: "شركة الطيران", width: "12%" }      // Medium text - airline
];

const CombinedReportPDF = ({ 
  delegationData, 
  fullReportData, 
  showDelegationReport = true, 
  showFullReport = true 
}) => {
  return (
    <Document key={'combined-report'}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Logos + Title Row */}
        <View style={styles.headerRow}>
          <Image src="/images/logo.png" style={styles.logo} />
          <View style={{ flexDirection: "column", alignItems: 'flex-end', marginLeft: 20, marginRight: 20, fontSize: 12, fontWeight: "bold" }}>
            <Text>
              ادارة النقــــــــــــــــــــــــــــل
            </Text>
            <Text>
              فوج تشهيلات مطــارات ق.م
            </Text>
            <View style={{ flexDirection: "row-reverse", gap: '8px' }} >
              <Text>
                : التـــــــــــــاريخ
              </Text>
              <Text>
                {formatArabicDate(new Date())}
              </Text>
            </View>
          </View>
        </View>

        {/* Delegation Report Section */}
        {showDelegationReport && delegationData && (
          <>
            <Text style={styles.header}>تقرير الوفود</Text>
            
            <View style={styles.table}>
              <View style={styles.row}>
                {delegationHeaders.map((header, i) => (
                  <Text key={i} style={[styles.cell, styles.headerCell, { width: header.width }]}>
                    {header.text}
                  </Text>
                ))}
              </View>

              {delegationData.map((row, i) => (
                <View style={styles.row} key={i}>
                  <Text style={[styles.cell, { width: delegationHeaders[0].width }]}>{row.nationality || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[1].width }]}>{row.delegationHead || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[2].width }]}>{row.membersCount || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[3].width }]}>{row.arrivalInfo?.arrivalHall || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[4].width }]}>{row.arrivalInfo?.arrivalAirline || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[5].width }]}>{row.arrivalInfo?.arrivalFlightNumber || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[6].width }]}>{row.arrivalInfo?.arrivalOrigin || 'غير محدد'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[7].width }]}>
                    {row.delegationStatus === 'all_departed' ? 'تم مغادرة الوفد' :
                     row.delegationStatus === 'partial_departed' ? 'لم يغادر جزء من الوفد' :
                     row.delegationStatus === 'not_departed' ? 'لم يغادر أحد' : row.delegationStatus || '-'}
                  </Text>
                  <Text style={[styles.cell, { width: delegationHeaders[8].width }]}>{row.arrivalInfo?.arrivalDate || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[9].width }]}>{row.arrivalInfo?.arrivalTime ? row.arrivalInfo.arrivalTime.replace(':', '') : '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[10].width }]}>{row.arrivalInfo?.arrivalReceptor || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[11].width }]}>{row.arrivalInfo?.arrivalDestination || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[12].width }]}>{row.arrivalInfo?.arrivalShipments || '-'}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Section Divider */}
        {/* {showDelegationReport && showFullReport && (
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>═══════════════════════════════════════</Text>
          </View>
        )} */}

        {/* Full Report Section */}
        {showFullReport && fullReportData && (
          <>
            <Text style={styles.header}>تقرير شامل باعضاء الوفود</Text>
            
            {/* Loop over nationalities */}
            {Object.entries(fullReportData).map(([nationality, members], idx) => (
              <View key={idx} style={styles.nationalityBox}>
                <Text style={styles.delegationInfo}>
                  {`الوفد: ${nationality} - ${members[0].delegation.delegationHead}`}
                </Text>

                <View style={styles.table}>
                  <View style={styles.row}>
                    {fullReportHeaders.map((header, i) => (
                      <Text
                        key={i}
                        style={[styles.cell, styles.headerCell, { width: header.width }]}
                      >
                        {header.text}
                      </Text>
                    ))}
                  </View>

                  {members.map((row, i) => (
                    <View style={styles.row} key={i}>
                      <Text style={[styles.cell, { width: fullReportHeaders[0].width }]}>{row.rank || '-'}</Text>
                      <Text style={[styles.cell, { width: fullReportHeaders[1].width }]}>{row.name || '-'}</Text>
                      <Text style={[styles.cell, { width: fullReportHeaders[2].width }]}>{row.role || '-'}</Text>
                      <Text style={[styles.cell, { width: fullReportHeaders[3].width }]}>{row.delegation.arrivalInfo?.arrivalDestination || '-'}</Text>
                      <Text style={[styles.cell, { width: fullReportHeaders[4].width }]}>{row.delegation.arrivalInfo?.arrivalDate || '-'}</Text>
                      <Text style={[styles.cell, { width: fullReportHeaders[5].width }]}>{row.delegation.arrivalInfo?.arrivalTime ? row.delegation.arrivalInfo.arrivalTime.replace(':', '') : '-'}</Text>
                      <Text style={[styles.cell, { width: fullReportHeaders[6].width }]}>{row.delegation.arrivalInfo?.arrivalFlightNumber || '-'}</Text>
                      <Text style={[styles.cell, { width: fullReportHeaders[7].width }]}>{row.delegation.arrivalInfo?.arrivalAirline || '-'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}

export default CombinedReportPDF
