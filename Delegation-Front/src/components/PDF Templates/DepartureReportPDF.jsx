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
    width: '10%',
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    width: '10%',
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
    width: '5%',
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  membersCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    fontSize: 10,
    textAlign: "center",
    width: '15%',
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  membersHeaderCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    width: '15%',
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  sessionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4
  },
  membersList: {
    fontSize: 10,
    marginTop: 5,
    padding: 5,
    backgroundColor: "#f5f5f5",
    borderRadius: 3
  },
  noData: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    color: "#666"
  }
});

// ✅ Headers in Arabic for departure sessions
const headers = [
  "م",
  "التاريخ",
  "سعت",
  "المطار",
  "شركة الطيران",
  "رقم الرحلة",
  "الوجهة",
  "المستقبل",
  "الشحنات",
  "الأعضاء المغادرون"
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

        {/* Sessions Table */}
        {departureSessions.length > 0 ? (
          <View style={styles.table}>
            {/* Header row */}
            <View style={styles.row}>
              {headers.map((h, i) => (
                <View key={i} style={[
                  i === 0 ? styles.serialCell : i === headers.length - 1 ? styles.membersHeaderCell : [styles.cell, styles.headerCell]
                ]}>
                  <Text>{h}</Text>
                </View>
              ))}
            </View>

            {/* Data rows */}
            {departureSessions.map((session, sessionIndex) => (
              <View style={styles.row} key={session.id}>
                {/* Serial number */}
                <View style={styles.serialCell}>
                  <Text>{sessionIndex + 1}</Text>
                </View>
                
                {/* Date */}
                <View style={styles.cell}>
                  <Text>{session.checkout_date || session.date}</Text>
                </View>
                
                {/* Time */}
                <View style={styles.cell}>
                  <Text>{session.checkout_time ? session.checkout_time.replace(/:/g, '') : (session.time ? session.time.replace(':', '') : '')}</Text>
                </View>
                
                {/* Airport */}
                <View style={styles.cell}>
                  <Text>{session.airport_name || session.hall}</Text>
                </View>
                
                {/* Airline */}
                <View style={styles.cell}>
                  <Text>{session.airline_name || session.airline}</Text>
                </View>
                
                {/* Flight Number */}
                <View style={styles.cell}>
                  <Text>{session.flight_number || session.flightNumber}</Text>
                </View>
                
                {/* Destination */}
                <View style={styles.cell}>
                  <Text>{session.city_name || session.destination}</Text>
                </View>
                
                {/* Depositor */}
                <View style={styles.cell}>
                  <Text>{session.depositor_name || session.receptor}</Text>
                </View>
                
                {/* Goods */}
                <View style={styles.cell}>
                  <Text>{session.goods || session.shipments}</Text>
                </View>
                
                {/* Members */}
                <View style={styles.membersCell}>
                  <View style={{ textAlign: 'right', direction: 'rtl', alignItems: 'flex-end', width: '100%' }}>
                    {session.members.map((member, index) => {
                      // Handle both object and ID formats
                      if (typeof member === 'object' && member.name) {
                        return (
                          <Text key={member.id || index} style={{ marginBottom: 1, textAlign: 'right' }}>
                            {member.rank || ''} {member.name} •
                          </Text>
                        );
                      } else {
                        const memberId = typeof member === 'object' ? member.id : member;
                        const foundMember = delegation.members?.find(m => m.id === memberId);
                        const memberName = foundMember ? `${foundMember.rank} ${foundMember.name}` : `عضو #${memberId}`;
                        return (
                          <Text key={memberId} style={{ marginBottom: 1, textAlign: 'right' }}>
                            {memberName} •
                          </Text>
                        );
                      }
                    })}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noData}>لا توجد جلسات مغادرة مسجلة لهذا الوفد</Text>
        )}
      </Page>
    </Document>
  )
}

export default DepartureReportPDF
