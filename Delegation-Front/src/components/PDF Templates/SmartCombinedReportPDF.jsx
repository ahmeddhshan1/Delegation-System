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

// ✅ Headers for Delegation Report - الشكل القديم
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
  "قادمة من",
  "الوجهة",
  "المستقبل",
  "الشحنات"
];

// ✅ Headers for Members Report - نفس التقرير المنفصل
const membersHeaders = [
  "الرتبة",
  "الاسم",
  "الوظيفة",
  "حالة العضو",
  "قادم من",
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
                {delegationHeaders.map((h, i) => (
                  <Text key={i} style={[styles.cell, styles.headerCell]}>
                    {h}
                  </Text>
                ))}
              </View>

              {delegationData.map((row, i) => (
                <View style={styles.row} key={i}>
                  <Text style={styles.cell}>{row.nationality}</Text>
                  <Text style={styles.cell}>{row.delegationHead}</Text>
                  <Text style={styles.cell}>{row.membersCount}</Text>
                  <Text style={styles.cell}>
                    {row.delegationStatus === 'all_departed' ? 'غادر بالكامل' :
                     row.delegationStatus === 'partial_departed' ? 'غادر جزئياً' : 'لم يغادر'}
                  </Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalDate}</Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalTime ? row.arrivalInfo.arrivalTime.replace(':', '') : ''}</Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalHall}</Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalAirline}</Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalFlightNumber}</Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalOrigin || 'غير محدد'}</Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalDestination}</Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalReceptor}</Text>
                  <Text style={styles.cell}>{row.arrivalInfo?.arrivalShipments}</Text>
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