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
    padding: 5,
    fontSize: 10,
    textAlign: "center",
    width: '10%'
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontSize: 12,
    fontWeight: "bold"
  }
});



// ✅ Headers in Arabic
const headers = [
  "الجنسية",
  "رئيس الوفد",
  "عدد الاعضاء",
  "مطار الوصول",
  "شركة طيران الوصول",
  "رقم رحلة الوصول",
  "حالة الوفد",
  "تاريخ الوصول",
  "سعت الوصول",
  "مستقبل الوصول",
  "وجهة الوصول",
  "شحنات الوصول"
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
            {headers.map((h, i) => (
              <Text key={i} style={[styles.cell, styles.headerCell, { width: '10%' }]}>
                {h}
              </Text>
            ))}
          </View>

          {data.map((row, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell]}>{row.nationality}</Text>
              <Text style={[styles.cell]}>{row.delegationHead}</Text>
              <Text style={[styles.cell]}>{row.membersCount}</Text>
              <Text style={[styles.cell]}>{row.arrivalInfo?.arrivalHall}</Text>
              <Text style={[styles.cell]}>{row.arrivalInfo?.arrivalAirline}</Text>
              <Text style={[styles.cell]}>{row.arrivalInfo?.arrivalFlightNumber}</Text>
              <Text style={[styles.cell]}>
                {row.delegationStatus === 'all_departed' ? 'الوفد غادر' :
                 row.delegationStatus === 'partial_departed' ? 'جزء منه غادر' :
                 row.delegationStatus === 'not_departed' ? 'الوفد ما غادرش' : row.delegationStatus}
              </Text>
              <Text style={[styles.cell]}>{row.arrivalInfo?.arrivalDate}</Text>
              <Text style={[styles.cell]}>{row.arrivalInfo?.arrivalTime ? row.arrivalInfo.arrivalTime.replace(':', '') : ''}</Text>
              <Text style={[styles.cell]}>{row.arrivalInfo?.arrivalReceptor}</Text>
              <Text style={[styles.cell]}>{row.arrivalInfo?.arrivalDestination}</Text>
              <Text style={[styles.cell]}>{row.arrivalInfo?.arrivalShipments}</Text>
            </View>
          ))}
        </View>

      </Page>
    </Document>
  )
}

export default DelegationReportPDF