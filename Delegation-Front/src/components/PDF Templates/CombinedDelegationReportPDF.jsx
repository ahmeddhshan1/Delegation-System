import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from "@react-pdf/renderer";
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
    direction: "rtl"
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
    flexDirection: "row-reverse"
  },
  cell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 10,
    textAlign: "center",
    width: '100%'
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
    alignSelf: "flex-end"
  },
  nationalityBox: {
    marginBottom: 20,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 8
  },
});

// ✅ Headers for Delegation Report (Part 1)
const delegationHeaders = [
  "الجنسية",
  "رئيس الوفد",
  "عدد الأعضاء",
  "حالة الوفد",
  "تاريخ الوصول",
  "سعت الوصول",
  "المطار",
  "شركة الطيران",
  "رقم الرحلة",
  "الوجهة",
  "المستقبل",
  "الشحنات"
];

// ✅ Headers for Members Report (Part 2)
const membersHeaders = [
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

const CombinedDelegationReportPDF = ({ delegationData, membersData }) => {
  // تجميع بيانات الأعضاء حسب الوفد
  const groupedByDelegation = membersData.reduce((acc, member) => {
    if (!member.delegation || !member.delegation.id) {
      return acc;
    }
    
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
    <Document key={'combined-delegation-report'}>
      {/* ===== PART 1: DELEGATION REPORT ===== */}
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
        
        <Text style={styles.header}>تقرير الوفود</Text>

        {/* Delegation Table */}
        <View style={styles.table}>
          <View style={styles.row}>
            {delegationHeaders.map((h, i) => (
              <Text
                key={i}
                style={[styles.cell, styles.headerCell]}
              >
                {h}
              </Text>
            ))}
          </View>

          {delegationData.map((row, i) => (
            <View style={styles.row} key={i}>
              <Text style={styles.cell}>{row.nationality || '-'}</Text>
              <Text style={styles.cell}>{row.delegationHead || '-'}</Text>
              <Text style={styles.cell}>{row.membersCount || '-'}</Text>
              <Text style={styles.cell}>
                {row.delegationStatus === 'all_departed' ? 'غادر بالكامل' :
                 row.delegationStatus === 'partial_departed' ? 'غادر جزئياً' : 'لم يغادر'}
              </Text>
              <Text style={styles.cell}>{row.arrivalInfo?.arrivalDate || '-'}</Text>
              <Text style={styles.cell}>{row.arrivalInfo?.arrivalTime ? row.arrivalInfo.arrivalTime.replace(':', '') : '-'}</Text>
              <Text style={styles.cell}>{row.arrivalInfo?.arrivalHall || '-'}</Text>
              <Text style={styles.cell}>{row.arrivalInfo?.arrivalAirline || '-'}</Text>
              <Text style={styles.cell}>{row.arrivalInfo?.arrivalFlightNumber || '-'}</Text>
              <Text style={styles.cell}>{row.arrivalInfo?.arrivalDestination || '-'}</Text>
              <Text style={styles.cell}>{row.arrivalInfo?.arrivalReceptor || '-'}</Text>
              <Text style={styles.cell}>{row.arrivalInfo?.arrivalShipments || '-'}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ===== PART 2: MEMBERS REPORT ===== */}
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
        
        <Text style={styles.header}>تقرير الوصول والمغادرة - الأعضاء حسب الوفد</Text>
        
        {/* Loop over delegations */}
        {Object.entries(groupedByDelegation).map(([delegationId, delegationData], idx) => (
          <View key={idx} style={styles.nationalityBox}>
            <Text style={styles.delegationInfo}>
              {`الوفد: ${delegationData.name || 'غير محدد'}`}
            </Text>

            <View style={styles.table}>
              <View style={styles.row}>
                {membersHeaders.map((h, i) => (
                  <Text
                    key={i}
                    style={[styles.cell, styles.headerCell]}
                  >
                    {h}
                  </Text>
                ))}
              </View>

              {delegationData.members && delegationData.members.map((member, i) => (
                <View style={styles.row} key={i}>
                  <Text style={styles.cell}>{member.rank || '-'}</Text>
                  <Text style={styles.cell}>{member.name || '-'}</Text>
                  <Text style={styles.cell}>{member.role || '-'}</Text>
                  <Text style={styles.cell}>
                    {member.memberStatus === 'departed' ? 'غادر' :
                     member.memberStatus === 'not_departed' ? 'لم يغادر' : 'غير محدد'}
                  </Text>
                  <Text style={styles.cell}>{member.delegation?.arrivalInfo?.arrivalDestination || '-'}</Text>
                  <Text style={styles.cell}>{member.delegation?.arrivalInfo?.arrivalDate || '-'}</Text>
                  <Text style={styles.cell}>{member.delegation?.arrivalInfo?.arrivalTime ? member.delegation.arrivalInfo.arrivalTime.replace(':', '') : '-'}</Text>
                  <Text style={styles.cell}>{member.delegation?.arrivalInfo?.arrivalFlightNumber || '-'}</Text>
                  <Text style={styles.cell}>{member.delegation?.arrivalInfo?.arrivalAirline || '-'}</Text>
                  
                  {/* معلومات المغادرة */}
                  <Text style={styles.cell}>
                    {member.delegation?.departureInfo?.departureSessions?.[0]?.destination || '-'}
                  </Text>
                  <Text style={styles.cell}>
                    {member.delegation?.departureInfo?.departureSessions?.[0]?.date || '-'}
                  </Text>
                  <Text style={styles.cell}>
                    {member.delegation?.departureInfo?.departureSessions?.[0]?.time ? 
                     member.delegation.departureInfo.departureSessions[0].time.replace(':', '') : '-'}
                  </Text>
                  <Text style={styles.cell}>
                    {member.delegation?.departureInfo?.departureSessions?.[0]?.flightNumber || '-'}
                  </Text>
                  <Text style={styles.cell}>
                    {member.delegation?.departureInfo?.departureSessions?.[0]?.airline || '-'}
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

export default CombinedDelegationReportPDF