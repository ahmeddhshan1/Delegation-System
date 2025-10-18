// دالة لحذف جميع البيانات المرتبطة بالحدث الفرعي
export const deleteSubEventData = (subEventId) => {
    try {
        // ملاحظة: تم إزالة حذف البيانات من localStorage لأنها تُحمل من API الآن
        
        // إرسال أحداث التحديث
        window.dispatchEvent(new CustomEvent('delegationDeleted'))
        window.dispatchEvent(new CustomEvent('memberDeleted'))
        
        return {
            success: true,
            message: 'تم حذف جميع البيانات المرتبطة بالحدث الفرعي بنجاح'
        }
        
    } catch (error) {
        console.error('خطأ في حذف البيانات المرتبطة:', error)
        return {
            success: false,
            message: 'حدث خطأ أثناء حذف البيانات المرتبطة'
        }
    }
}

// دالة لحذف جميع البيانات المرتبطة بالوفد (الأعضاء وجلسات المغادرة)
export const deleteDelegationData = (delegationId) => {
    try {
        // ملاحظة: تم إزالة حذف البيانات من localStorage لأنها تُحمل من API الآن
        
        // إرسال أحداث التحديث
        window.dispatchEvent(new CustomEvent('memberDeleted'))
        
        return {
            success: true,
            message: 'تم حذف جميع البيانات المرتبطة بالوفد بنجاح'
        }
        
    } catch (error) {
        console.error('خطأ في حذف البيانات المرتبطة بالوفد:', error)
        return {
            success: false,
            message: 'حدث خطأ أثناء حذف البيانات المرتبطة بالوفد'
        }
    }
}

// دالة لحذف جميع البيانات المرتبطة بالحدث الرئيسي
export const deleteMainEventData = (mainEventId) => {
    try {
        // ملاحظة: تم إزالة حذف البيانات من localStorage لأنها تُحمل من API الآن
        
        // إرسال أحداث التحديث
        window.dispatchEvent(new CustomEvent('delegationDeleted'))
        window.dispatchEvent(new CustomEvent('memberDeleted'))
        
        return {
            success: true,
            message: 'تم حذف الحدث الرئيسي وجميع البيانات المرتبطة به بنجاح',
            stats: {
                subEvents: 0,
                delegations: 0,
                members: 0
            }
        }
        
    } catch (error) {
        console.error('خطأ في حذف البيانات المرتبطة بالحدث الرئيسي:', error)
        return {
            success: false,
            message: 'حدث خطأ أثناء حذف البيانات المرتبطة بالحدث الرئيسي'
        }
    }
}
