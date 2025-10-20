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
    justifyContent: "space-between",
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
    borderBottomWidth: 0,
    marginBottom: 20
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
    fontSize: 9,
    textAlign: "center",
    width: '100%'
  },
  headerCell: {
    backgroundColor: "#f0f0f0",
    fontSize: 11,
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
    alignSelf: "flex-end"
  },
});

// ✅ Headers in Arabic - مع معلومات الوصول والمغادرة
const headers = [
  "الرتبة",
  "الاسم",
  "الوظيفة",
  "حالة المغادرة",
  "وجهة الوصول",
  "تاريخ الوصول",
  "سعت الوصول",
  "رقم رحلة الوصول",
  "شركة طيران الوصول",
  "وجهة المغادرة",
  "تاريخ المغادرة",
  "سعت المغادرة",
  "رقم رحلة المغادرة",
  "شركة طيران المغادرة"
];

const DelegationMembersReportPDF = ({ data }) => {
  // تجميع البيانات حسب الوفد (وليس الجنسية)
  const groupedByDelegation = data.reduce((acc, member) => {
    const delegationId = member.delegation.id;
    const delegationName = `${member.delegation.nationality} - ${member.delegation.delegationHead}`;
    
    if (!acc[delegationId]) {
      acc[delegationId] = {
        name: delegationName,
        members: []
      };
    }
    
    acc[delegationId].members.push(member);
    return acc;
  }, {});

  return (
    <Document key={'delegation-members-report'}>
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
        
        <Text style={styles.header}>تقرير شامل للوصول والمغادرة - الأعضاء حسب الوفد</Text>
        
        {/* Loop over delegations */}
        {Object.entries(groupedByDelegation).map(([delegationId, delegationData], idx) => (
          <View key={idx} style={styles.nationalityBox}>
            <Text style={styles.delegationInfo}>
              {`الوفد: ${delegationData.name}`}
            </Text>

            <View style={styles.table}>
              <View style={styles.row}>
                {headers.map((h, i) => (
                  <Text
                    key={i}
                    style={[styles.cell, styles.headerCell]}
                  >
                    {h}
                  </Text>
                ))}
              </View>

              {delegationData.members.map((member, i) => (
                <View style={styles.row} key={i}>
                  <Text style={styles.cell}>{member.rank}</Text>
                  <Text style={styles.cell}>{member.name}</Text>
                  <Text style={styles.cell}>{member.role}</Text>
                  <Text style={styles.cell}>
                    {member.memberStatus === 'departed' ? 'غادر' :
                     member.memberStatus === 'not_departed' ? 'لم يغادر' : 'غير محدد'}
                  </Text>
                  <Text style={styles.cell}>{member.delegation.arrivalInfo?.arrivalDestination}</Text>
                  <Text style={styles.cell}>{member.delegation.arrivalInfo?.arrivalDate}</Text>
                  <Text style={styles.cell}>{member.delegation.arrivalInfo?.arrivalTime ? member.delegation.arrivalInfo.arrivalTime.replace(':', '') : ''}</Text>
                  <Text style={styles.cell}>{member.delegation.arrivalInfo?.arrivalFlightNumber}</Text>
                  <Text style={styles.cell}>{member.delegation.arrivalInfo?.arrivalAirline}</Text>
                  
                  {/* معلومات المغادرة */}
                  <Text style={styles.cell}>
                    {member.delegation.departureInfo?.departureSessions?.[0]?.destination || '-'}
                  </Text>
                  <Text style={styles.cell}>
                    {member.delegation.departureInfo?.departureSessions?.[0]?.date || '-'}
                  </Text>
                  <Text style={styles.cell}>
                    {member.delegation.departureInfo?.departureSessions?.[0]?.time ? 
                     member.delegation.departureInfo.departureSessions[0].time.replace(':', '') : '-'}
                  </Text>
                  <Text style={styles.cell}>
                    {member.delegation.departureInfo?.departureSessions?.[0]?.flightNumber || '-'}
                  </Text>
                  <Text style={styles.cell}>
                    {member.delegation.departureInfo?.departureSessions?.[0]?.airline || '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  )
}

export default DelegationMembersReportPDF
