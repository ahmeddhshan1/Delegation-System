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
  src: "/fonts/Cairo-Regular.ttf", // ⬅️ put your Cairo font file inside /public/fonts/
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
    // height: 80
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
  }
});



// ✅ Headers in Arabic with flexible widths
const headers = [
  { text: "الجنسية", width: "8%" },           // Short text - nationality
  { text: "رئيس الوفد", width: "12%" },       // Medium text - delegation head name
  { text: "عدد الاعضاء", width: "6%" },       // Short number - members count
  { text: "مطار الوصول", width: "10%" },      // Medium text - airport
  { text: "شركة طيران الوصول", width: "12%" }, // Medium text - airline
  { text: "رقم رحلة الوصول", width: "8%" },   // Short text - flight number
  { text: "قادمة من", width: "8%" },          // Short text - origin
  { text: "حالة الوفد", width: "10%" },       // Medium text - status
  { text: "تاريخ الوصول", width: "8%" },      // Short date - arrival date
  { text: "سعت الوصول", width: "6%" },        // Short time - arrival time
  { text: "مستقبل الوصول", width: "10%" },    // Medium text - receptor
  { text: "وجهة الوصول", width: "10%" },      // Medium text - destination
  { text: "شحنات الوصول", width: "8%" }       // Medium text - shipments
];

const DelegationReportPDF = ({ data }) => {
  return (
    <Document key={'delegation-report'} id={'delegation-report'}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Logos + Title Row */}
        <View style={styles.headerRow}>
          <Image src="/images/logo.png" style={styles.logo} />
          {/* <Text style={styles.header}>تقرير الوفود</Text> */}
          {/* <Image
            src="/images/EDEX-logo.jpg"
            style={{
              width: 125
            }}
          /> */}
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
        <Text style={styles.header}>تقرير الوفود</Text>

        <View style={styles.table}>
          <View style={styles.row}>
            {headers.map((header, i) => (
              <Text key={i} style={[styles.cell, styles.headerCell, { width: header.width }]}>
                {header.text}
              </Text>
            ))}
          </View>

          {data.map((row, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, { width: headers[0].width }]}>{row.nationality || '-'}</Text>
              <Text style={[styles.cell, { width: headers[1].width }]}>{row.delegationHead || '-'}</Text>
              <Text style={[styles.cell, { width: headers[2].width }]}>{row.membersCount || '-'}</Text>
              <Text style={[styles.cell, { width: headers[3].width }]}>{row.arrivalInfo?.arrivalHall || '-'}</Text>
              <Text style={[styles.cell, { width: headers[4].width }]}>{row.arrivalInfo?.arrivalAirline || '-'}</Text>
              <Text style={[styles.cell, { width: headers[5].width }]}>{row.arrivalInfo?.arrivalFlightNumber || '-'}</Text>
              <Text style={[styles.cell, { width: headers[6].width }]}>{row.arrivalInfo?.arrivalOrigin || 'غير محدد'}</Text>
              <Text style={[styles.cell, { width: headers[7].width }]}>
                {row.delegationStatus === 'all_departed' ? 'الوفد غادر' :
                 row.delegationStatus === 'partial_departed' ? 'جزء منه غادر' :
                 row.delegationStatus === 'not_departed' ? 'الوفد ما غادرش' : row.delegationStatus || '-'}
              </Text>
              <Text style={[styles.cell, { width: headers[8].width }]}>{row.arrivalInfo?.arrivalDate || '-'}</Text>
              <Text style={[styles.cell, { width: headers[9].width }]}>{row.arrivalInfo?.arrivalTime ? row.arrivalInfo.arrivalTime.replace(':', '') : '-'}</Text>
              <Text style={[styles.cell, { width: headers[10].width }]}>{row.arrivalInfo?.arrivalReceptor || '-'}</Text>
              <Text style={[styles.cell, { width: headers[11].width }]}>{row.arrivalInfo?.arrivalDestination || '-'}</Text>
              <Text style={[styles.cell, { width: headers[12].width }]}>{row.arrivalInfo?.arrivalShipments || '-'}</Text>
            </View>
          ))}
        </View>

      </Page>
    </Document>
  )
}

export default DelegationReportPDF