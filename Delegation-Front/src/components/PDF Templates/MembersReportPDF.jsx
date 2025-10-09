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
    padding: 8,
    fontSize: 10,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontSize: 12,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  serialCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 9,
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    width: '8%',
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
});

// Example: distribute widths evenly (10 columns → 10%)
const cellWidths = ["10%", "10%", "10%", "10%", "10%", "10%", "10%", "10%", "10%", "10%"];


// ✅ Headers in Arabic
const headers = [
  "م",
  "الرتبة",
  "الاسم",
  "الوظيفة",
  "حالة العضو",
  "تاريخ الوصول",
  "تاريخ المغادرة"
];

const MembersReportPDF = ({ data }) => {
  return (
    <Document>
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
        <Text style={styles.header}>تقرير الاعضاء</Text>

        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.row}>
            {headers.map((h, i) => (
              <View key={i} style={[
                i === 0 ? styles.serialCell : [styles.cell, styles.headerCell],
                i === 0 ? { width: '8%' } : { width: i === 1 ? '18%' : i === 2 ? '20%' : i === 3 ? '18%' : i === 4 ? '16%' : i === 5 ? '10%' : '10%' }
              ]}>
                <Text>{h}</Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {data.map((row, i) => (
            <View style={styles.row} key={i}>
              <View style={[styles.serialCell]}>
                <Text>{i + 1}</Text>
              </View>
              <View style={[styles.cell, { width: '18%' }]}>
                <Text>{row.rank}</Text>
              </View>
              <View style={[styles.cell, { width: '20%' }]}>
                <Text>{row.name}</Text>
              </View>
              <View style={[styles.cell, { width: '18%' }]}>
                <Text>{row.role}</Text>
              </View>
              <View style={[styles.cell, { width: '16%' }]}>
                <Text>
                  {row.memberStatus === 'departed' ? 'غادر' :
                   row.memberStatus === 'not_departed' ? 'لم يغادر' : 
                   'غير محدد'}
                </Text>
              </View>
              <View style={[styles.cell, { width: '10%' }]}>
                <Text>
                  {row.arrivalDate ? new Date(row.arrivalDate).toLocaleDateString('en-GB') : 
                   row.delegation?.arrivalInfo?.arrivalDate ? new Date(row.delegation.arrivalInfo.arrivalDate).toLocaleDateString('en-GB') :
                   'غير محدد'}
                </Text>
              </View>
              <View style={[styles.cell, { width: '10%' }]}>
                <Text>
                  {row.departureDate ? new Date(row.departureDate).toLocaleDateString('en-GB') : 'لم يغادر'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export default MembersReportPDF