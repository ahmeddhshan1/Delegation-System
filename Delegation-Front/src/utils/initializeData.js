// تهيئة البيانات الافتراضية في localStorage
export const initializeDefaultData = () => {
    // مسح البيانات القديمة أولاً
    localStorage.removeItem('delegations')
    localStorage.removeItem('members')
    
    // مسح البيانات القديمة من الأحداث أيضاً
    const existingEvents = localStorage.getItem('mainEvents')
    if (existingEvents) {
        try {
            const events = JSON.parse(existingEvents)
            // تحديث إحصائيات الأحداث الفرعية لتكون صفر
            events.forEach(event => {
                if (event.sub_events) {
                    event.sub_events.forEach(subEvent => {
                        subEvent.delegationCount = 0
                        subEvent.membersCount = 0
                    })
                }
            })
            localStorage.setItem('mainEvents', JSON.stringify(events))
        } catch (error) {
            console.error('خطأ في تحديث إحصائيات الأحداث:', error)
        }
    }
    
    // تهيئة الأحداث الرئيسية - فارغة للبداية
    const defaultMainEvents = []

    // حفظ البيانات في localStorage
    // الأحداث: احتفظ بالبيانات الموجودة أو ابدأ فارغ
    if (!localStorage.getItem('mainEvents') || localStorage.getItem('mainEvents') === '[]') {
        localStorage.setItem('mainEvents', JSON.stringify(defaultMainEvents))
    }
    
    // الوفود: فارغة
    localStorage.setItem('delegations', JSON.stringify([]))
    
    // الأعضاء: فارغة
    localStorage.setItem('members', JSON.stringify([]))

    // تهيئة المناصب العسكرية
    const defaultMilitaryPositions = [
        "قائد وحدة",
        "ضابط عمليات",
        "ضابط استخبارات",
        "ضابط لوجستي",
        "ضابط اتصالات",
        "ضابط طبي",
        "ضابط هندسي",
        "ضابط أمني"
    ]

    if (!localStorage.getItem('militaryPositions')) {
        localStorage.setItem('militaryPositions', JSON.stringify(defaultMilitaryPositions))
    }

    // تهيئة الجنسيات
    const defaultNationalities = [
        "مصري",
        "سعودي",
        "ألماني",
        "تركي",
        "أمريكي",
        "هندي",
        "صيني",
        "فرنسي",
        "قطري",
        "إماراتي"
    ]

    if (!localStorage.getItem('nationalities')) {
        localStorage.setItem('nationalities', JSON.stringify(defaultNationalities))
    }
}