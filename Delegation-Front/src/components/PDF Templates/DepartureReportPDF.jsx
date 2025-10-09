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
    width: '12.5%'
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontSize: 12,
    fontWeight: "bold"
  },
  sessionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
    backgroundColor: "#e3f2fd",
    padding: 8,
    borderRadius: 4
  },
  membersList: {
    fontSize: 10,
    marginTop: 5,
    padding: 5,
    backgroundColor: "#f5f5f5",
    borderRadius: 3
  }
});

// ✅ Headers in Arabic for departure sessions
const headers = [
  "التاريخ",
  "سعت",
  "المطار",
  "شركة الطيران",
  "رقم الرحلة",
  "الوجهة",
  "المستقبل",
  "الشحنات"
];

const DepartureReportPDF = ({ delegation }) => {
  // Get all departure sessions from the delegation
  const departureSessions = delegation.departureSessions || [];
  
  // If no departure sessions, show a message
  if (departureSessions.length === 0) {
    return (
      <Document key={'departure-report'} id={'departure-report'}>
        <Page size="A4" orientation="landscape" style={styles.page}>
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
          <Text style={styles.header}>تقرير مغادرات الوفد - {delegation.nationality}</Text>
          <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 50 }}>
            لا توجد جلسات مغادرة مسجلة لهذا الوفد
          </Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document key={'departure-report'} id={'departure-report'}>
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
        <Text style={styles.header}>تقرير مغادرات الوفد - {delegation.nationality}</Text>

        {/* Render each departure session */}
        {departureSessions.map((session, sessionIndex) => (
          <View key={session.id}>
            <Text style={styles.sessionHeader}>
              جلسة مغادرة #{sessionIndex + 1}
            </Text>
            
            <View style={styles.table}>
              {/* Header row */}
              <View style={styles.row}>
                {headers.map((h, i) => (
                  <Text key={i} style={[styles.cell, styles.headerCell]}>
                    {h}
                  </Text>
                ))}
              </View>

              {/* Data row for this session */}
              <View style={styles.row}>
                <Text style={styles.cell}>{session.date}</Text>
                <Text style={styles.cell}>{session.time ? session.time.replace(':', '') : ''}</Text>
                <Text style={styles.cell}>{session.hall}</Text>
                <Text style={styles.cell}>{session.airline}</Text>
                <Text style={styles.cell}>{session.flightNumber}</Text>
                <Text style={styles.cell}>{session.destination}</Text>
                <Text style={styles.cell}>{session.receptor}</Text>
                <Text style={styles.cell}>{session.shipments}</Text>
              </View>
            </View>

            {/* Members list */}
            <View style={styles.membersList}>
              <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>الأعضاء المغادرون:</Text>
              {session.members.map(memberId => {
                const member = delegation.members?.find(m => m.id === memberId);
                return member ? (
                  <Text key={memberId} style={{ marginLeft: 10 }}>
                    • {member.rank} {member.name}
                  </Text>
                ) : (
                  <Text key={memberId} style={{ marginLeft: 10 }}>
                    • عضو #{memberId}
                  </Text>
                );
              })}
            </View>

            {/* Notes if any */}
            {session.notes && (
              <View style={[styles.membersList, { marginTop: 5 }]}>
                <Text style={{ fontWeight: 'bold', marginBottom: 3 }}>ملاحظات:</Text>
                <Text style={{ marginLeft: 10 }}>{session.notes}</Text>
              </View>
            )}
          </View>
        ))}
      </Page>
    </Document>
  )
}

export default DepartureReportPDF
