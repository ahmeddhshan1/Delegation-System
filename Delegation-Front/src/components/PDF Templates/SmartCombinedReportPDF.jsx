import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
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
    alignSelf: "flex-end"
  },
  nationalityBox: {
    marginBottom: 20,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 8
  },
});

// ✅ Headers for Delegation Report with flexible widths
const delegationHeaders = [
  { text: "الجنسية", width: "8%" },           // Short text - nationality
  { text: "رئيس الوفد", width: "12%" },       // Medium text - delegation head name
  { text: "عدد الأعضاء", width: "6%" },       // Short number - members count
  { text: "حالة الوفد", width: "10%" },       // Medium text - status
  { text: "تاريخ الوصول", width: "8%" },      // Short date - arrival date
  { text: "سعت الوصول", width: "6%" },        // Short time - arrival time
  { text: "المطار", width: "10%" },           // Medium text - airport
  { text: "شركة الطيران", width: "12%" },     // Medium text - airline
  { text: "رقم الرحلة", width: "8%" },        // Short text - flight number
  { text: "قادمة من", width: "8%" },          // Short text - origin
  { text: "الوجهة", width: "10%" },           // Medium text - destination
  { text: "المستقبل", width: "10%" },         // Medium text - receptor
  { text: "الشحنات", width: "8%" }            // Medium text - shipments
];

// ✅ Headers for Members Report with flexible widths
const membersHeaders = [
  { text: "الرتبة", width: "8%" },            // Short text - rank
  { text: "الاسم", width: "15%" },            // Long text - name
  { text: "الوظيفة", width: "12%" },          // Medium text - role
  { text: "حالة العضو", width: "10%" },       // Medium text - status
  { text: "قادم من", width: "8%" },           // Short text - origin
  { text: "تاريخ الوصول", width: "8%" },      // Short date - arrival date
  { text: "سعت الوصول", width: "6%" },        // Short time - arrival time
  { text: "رقم رحلة الوصول", width: "8%" },   // Short text - arrival flight
  { text: "شركة طيران الوصول", width: "10%" }, // Medium text - arrival airline
  { text: "وجهة المغادرة", width: "10%" },    // Medium text - departure destination
  { text: "تاريخ المغادرة", width: "8%" },    // Short date - departure date
  { text: "سعت المغادرة", width: "6%" },      // Short time - departure time
  { text: "رقم رحلة المغادرة", width: "8%" }, // Short text - departure flight
  { text: "شركة طيران المغادرة", width: "10%" } // Medium text - departure airline
];

const SmartCombinedReportPDF = ({ 
  delegationData, 
  membersData, 
  showDelegations = true, 
  showMembers = true 
}) => {

  return (
    <Document key={'smart-combined-report'}>
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
        
        {/* ===== DELEGATION REPORT SECTION ===== */}
        {showDelegations && (
          <>
            <Text style={{ fontSize: 24, fontWeight: "900", marginBottom: 15, textAlign: "center" }}>
              بيانات الوفود
            </Text>
            
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
                  <Text style={[styles.cell, { width: delegationHeaders[3].width }]}>
                    {row.delegationStatus === 'all_departed' ? 'غادر بالكامل' :
                     row.delegationStatus === 'partial_departed' ? 'غادر جزئياً' : 'لم يغادر'}
                  </Text>
                  <Text style={[styles.cell, { width: delegationHeaders[4].width }]}>{row.arrivalInfo?.arrivalDate || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[5].width }]}>{row.arrivalInfo?.arrivalTime ? row.arrivalInfo.arrivalTime.replace(':', '') : '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[6].width }]}>{row.arrivalInfo?.arrivalHall || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[7].width }]}>{row.arrivalInfo?.arrivalAirline || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[8].width }]}>{row.arrivalInfo?.arrivalFlightNumber || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[9].width }]}>{row.arrivalInfo?.arrivalOrigin || 'غير محدد'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[10].width }]}>{row.arrivalInfo?.arrivalDestination || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[11].width }]}>{row.arrivalInfo?.arrivalReceptor || '-'}</Text>
                  <Text style={[styles.cell, { width: delegationHeaders[12].width }]}>{row.arrivalInfo?.arrivalShipments || '-'}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ===== MEMBERS REPORT SECTION ===== */}
        {showMembers && (
          <>
            <Text style={{ fontSize: 24, fontWeight: "900", marginBottom: 15, marginTop: 30, textAlign: "center" }}>
              بيانات أعضاء الوفود
            </Text>
          
            {/* Loop over delegations - تجميع حسب الوفد - تظهر فقط الوفود اللي لها أعضاء */}
            {(() => {
              // إذا مفيش delegationData (في حالة تقرير الأعضاء المنفصل)، نجمع حسب الوفود من الأعضاء نفسهم
              if (delegationData.length === 0) {
                const uniqueDelegations = [];
                const seenDelegationIds = new Set();
                
                membersData.forEach(member => {
                  if (member.delegation_id && !seenDelegationIds.has(member.delegation_id)) {
                    seenDelegationIds.add(member.delegation_id);
                    uniqueDelegations.push({
                      id: member.delegation_id,
                      nationality: member.delegation_sub_event || 'غير محدد',
                      delegationHead: 'غير محدد'
                    });
                  }
                });
                
                return uniqueDelegations.map((delegation, delegationIdx) => {
                  const delegationMembers = membersData.filter(member => 
                    member.delegation_id === delegation.id
                  );

                  return (
                    <View key={delegationIdx} style={styles.nationalityBox}>
                      <Text style={styles.delegationInfo}>
                        {`الوفد: ${delegation.nationality} - ${delegation.delegationHead}`}
                      </Text>

                      <View style={styles.table}>
                        <View style={styles.row}>
                          {membersHeaders.map((header, i) => (
                            <Text key={i} style={[styles.cell, styles.headerCell, { width: header.width }]}>
                              {header.text}
                            </Text>
                          ))}
                        </View>

                        {delegationMembers.map((member, i) => {
                          // البحث عن بيانات الوفد المرتبط بالعضو
                          const memberDelegation = delegationData.find(d => d.id === member.delegation_id);
                          
                          return (
                            <View style={styles.row} key={i}>
                              <Text style={[styles.cell, { width: membersHeaders[0].width }]}>{member.rank || '-'}</Text>
                              <Text style={[styles.cell, { width: membersHeaders[1].width }]}>{member.name || '-'}</Text>
                              <Text style={[styles.cell, { width: membersHeaders[2].width }]}>{member.equivalent_job_name || member.job_title || '-'}</Text>
                              <Text style={[styles.cell, { width: membersHeaders[3].width }]}>
                                {member.status === 'DEPARTED' ? 'غادر' :
                                 member.status === 'NOT_DEPARTED' ? 'لم يغادر' : '-'}
                              </Text>
                              {/* قادم من - من بيانات الوفد */}
                              <Text style={[styles.cell, { width: membersHeaders[4].width }]}>{memberDelegation?.arrivalInfo?.arrivalOrigin || '-'}</Text>
                              {/* تاريخ الوصول - من بيانات الوفد */}
                              <Text style={[styles.cell, { width: membersHeaders[5].width }]}>{memberDelegation?.arrivalInfo?.arrivalDate || '-'}</Text>
                              {/* سعت الوصول - من بيانات الوفد */}
                              <Text style={[styles.cell, { width: membersHeaders[6].width }]}>{memberDelegation?.arrivalInfo?.arrivalTime || '-'}</Text>
                              {/* رقم رحلة الوصول - من بيانات الوفد */}
                              <Text style={[styles.cell, { width: membersHeaders[7].width }]}>{memberDelegation?.arrivalInfo?.arrivalFlightNumber || '-'}</Text>
                              {/* شركة طيران الوصول - من بيانات الوفد */}
                              <Text style={[styles.cell, { width: membersHeaders[8].width }]}>{memberDelegation?.arrivalInfo?.arrivalAirline || '-'}</Text>
                            
                            {/* معلومات المغادرة - من جلسة المغادرة المرتبطة بالعضو */}
                            <Text style={[styles.cell, { width: membersHeaders[9].width }]}>
                              {member.status === 'DEPARTED' ? 
                               (member.departure_destination || '-') : '-'}
                            </Text>
                            <Text style={[styles.cell, { width: membersHeaders[10].width }]}>
                              {member.status === 'DEPARTED' ? 
                               (member.departure_date || '-') : '-'}
                            </Text>
                            <Text style={[styles.cell, { width: membersHeaders[11].width }]}>
                              {member.status === 'DEPARTED' ? 
                               (member.departure_time || '-') : '-'}
                            </Text>
                            <Text style={[styles.cell, { width: membersHeaders[12].width }]}>
                              {member.status === 'DEPARTED' ? 
                               (member.departure_flight_number || '-') : '-'}
                            </Text>
                            <Text style={[styles.cell, { width: membersHeaders[13].width }]}>
                              {member.status === 'DEPARTED' ? 
                               (member.departure_airline || '-') : '-'}
                            </Text>
                          </View>
                        );
                        })}
                      </View>
                    </View>
                  );
                });
              }
              
              // الحالة العادية (التقرير الشامل أو تقرير الوفود)
              return delegationData.map((delegation, delegationIdx) => {
                const delegationMembers = membersData.filter(member => 
                  member.delegation_id === delegation.id
                );

                // إذا مفيش أعضاء للوفد، متظهروش
                if (delegationMembers.length === 0) {
                  return null;
                }

                return (
                  <View key={delegationIdx} style={styles.nationalityBox}>
                    <Text style={styles.delegationInfo}>
                      {`الوفد: ${delegation.nationality} - ${delegation.delegationHead}`}
                    </Text>

                    <View style={styles.table}>
                      <View style={styles.row}>
                        {membersHeaders.map((h, i) => (
                          <Text key={i} style={[styles.cell, styles.headerCell]}>
                            {h}
                          </Text>
                        ))}
                      </View>

                      {delegationMembers.map((member, i) => {
                        // البحث عن بيانات الوفد المرتبط بالعضو
                        const memberDelegation = delegationData.find(d => d.id === member.delegation_id);
                        
                        return (
                          <View style={styles.row} key={i}>
                            <Text style={styles.cell}>{member.rank || 'غير محدد'}</Text>
                            <Text style={styles.cell}>{member.name || 'غير محدد'}</Text>
                            <Text style={styles.cell}>{member.equivalent_job_name || member.job_title || 'غير محدد'}</Text>
                            <Text style={styles.cell}>
                              {member.status === 'DEPARTED' ? 'غادر' :
                               member.status === 'NOT_DEPARTED' ? 'لم يغادر' : 'غير محدد'}
                            </Text>
                            {/* قادم من - من بيانات الوفد */}
                            <Text style={styles.cell}>{memberDelegation?.arrivalInfo?.arrivalOrigin || 'غير محدد'}</Text>
                            {/* تاريخ الوصول - من بيانات الوفد */}
                            <Text style={styles.cell}>{memberDelegation?.arrivalInfo?.arrivalDate || 'غير محدد'}</Text>
                            {/* سعت الوصول - من بيانات الوفد */}
                            <Text style={styles.cell}>{memberDelegation?.arrivalInfo?.arrivalTime || 'غير محدد'}</Text>
                            {/* رقم رحلة الوصول - من بيانات الوفد */}
                            <Text style={styles.cell}>{memberDelegation?.arrivalInfo?.arrivalFlightNumber || 'غير محدد'}</Text>
                            {/* شركة طيران الوصول - من بيانات الوفد */}
                            <Text style={styles.cell}>{memberDelegation?.arrivalInfo?.arrivalAirline || 'غير محدد'}</Text>
                          
                          {/* معلومات المغادرة - من جلسة المغادرة المرتبطة بالعضو */}
                          <Text style={styles.cell}>
                            {member.status === 'DEPARTED' ? 
                             (member.departure_destination || 'غير محدد') : 'غير محدد'}
                          </Text>
                          <Text style={styles.cell}>
                            {member.status === 'DEPARTED' ? 
                             (member.departure_date || 'غير محدد') : 'غير محدد'}
                          </Text>
                          <Text style={styles.cell}>
                            {member.status === 'DEPARTED' ? 
                             (member.departure_time || 'غير محدد') : 'غير محدد'}
                          </Text>
                          <Text style={styles.cell}>
                            {member.status === 'DEPARTED' ? 
                             (member.departure_flight_number || 'غير محدد') : 'غير محدد'}
                          </Text>
                          <Text style={styles.cell}>
                            {member.status === 'DEPARTED' ? 
                             (member.departure_airline || 'غير محدد') : 'غير محدد'}
                          </Text>
                        </View>
                      );
                      })}
                    </View>
                  </View>
                );
              });
            })()}
          </>
        )}
      </Page>
    </Document>
  )
}

export default SmartCombinedReportPDF