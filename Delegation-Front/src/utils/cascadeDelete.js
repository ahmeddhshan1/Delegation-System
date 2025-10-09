// دالة لحذف جميع البيانات المرتبطة بالحدث الفرعي
export const deleteSubEventData = (subEventId) => {
    try {
        // 1. حذف الوفود المرتبطة بالحدث الفرعي
        const savedDelegations = localStorage.getItem('delegations')
        if (savedDelegations) {
            const delegations = JSON.parse(savedDelegations)
            const delegationsToDelete = delegations.filter(d => 
                d.subEventId === subEventId || d.subEventId === parseInt(subEventId)
            )
            
            // حذف الوفود
            const remainingDelegations = delegations.filter(d => 
                !(d.subEventId === subEventId || d.subEventId === parseInt(subEventId))
            )
            
            localStorage.setItem('delegations', JSON.stringify(remainingDelegations))

        }
        
        // 2. حذف الأعضاء المرتبطة بالحدث الفرعي
        const savedMembers = localStorage.getItem('members')
        if (savedMembers) {
            const members = JSON.parse(savedMembers)
            const membersToDelete = members.filter(m => 
                m.subEventId === subEventId || m.subEventId === parseInt(subEventId)
            )
            
            // حذف الأعضاء
            const remainingMembers = members.filter(m => 
                !(m.subEventId === subEventId || m.subEventId === parseInt(subEventId))
            )
            
            localStorage.setItem('members', JSON.stringify(remainingMembers))

        }
        
        // 3. إرسال أحداث التحديث
        window.dispatchEvent(new CustomEvent('delegationDeleted'))
        window.dispatchEvent(new CustomEvent('memberDeleted'))
        window.dispatchEvent(new CustomEvent('localStorageUpdated'))
        
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
        // 1. حذف الأعضاء المرتبطة بالوفد
        const savedMembers = localStorage.getItem('members')
        if (savedMembers) {
            const members = JSON.parse(savedMembers)
            const membersToDelete = members.filter(m => 
                m.delegation && m.delegation.id === delegationId
            )
            
            // حذف الأعضاء
            const remainingMembers = members.filter(m => 
                !(m.delegation && m.delegation.id === delegationId)
            )
            
            localStorage.setItem('members', JSON.stringify(remainingMembers))

        }
        
        // 2. إرسال أحداث التحديث
        window.dispatchEvent(new CustomEvent('memberDeleted'))
        window.dispatchEvent(new CustomEvent('localStorageUpdated'))
        
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
        let totalSubEvents = 0
        let totalDelegations = 0
        let totalMembers = 0
        
        // 1. جلب الحدث الرئيسي لمعرفة الأحداث الفرعية
        const savedEvents = localStorage.getItem('mainEvents')
        if (savedEvents) {
            const events = JSON.parse(savedEvents)
            const mainEvent = events.find(e => e.id === mainEventId)
            
            if (mainEvent && mainEvent.sub_events) {
                totalSubEvents = mainEvent.sub_events.length
                
                // 2. حذف جميع الوفود المرتبطة بالأحداث الفرعية
                const savedDelegations = localStorage.getItem('delegations')
                if (savedDelegations) {
                    const delegations = JSON.parse(savedDelegations)
                    const subEventIds = mainEvent.sub_events.map(se => se.id)
                    
                    const delegationsToDelete = delegations.filter(d => 
                        subEventIds.includes(d.subEventId) || subEventIds.includes(parseInt(d.subEventId))
                    )
                    totalDelegations = delegationsToDelete.length
                    
                    // حذف الوفود
                    const remainingDelegations = delegations.filter(d => 
                        !(subEventIds.includes(d.subEventId) || subEventIds.includes(parseInt(d.subEventId)))
                    )
                    
                    localStorage.setItem('delegations', JSON.stringify(remainingDelegations))

                }
                
                // 3. حذف جميع الأعضاء المرتبطة بالأحداث الفرعية
                const savedMembers = localStorage.getItem('members')
                if (savedMembers) {
                    const members = JSON.parse(savedMembers)
                    const subEventIds = mainEvent.sub_events.map(se => se.id)
                    
                    const membersToDelete = members.filter(m => 
                        subEventIds.includes(m.subEventId) || subEventIds.includes(parseInt(m.subEventId))
                    )
                    totalMembers = membersToDelete.length
                    
                    // حذف الأعضاء
                    const remainingMembers = members.filter(m => 
                        !(subEventIds.includes(m.subEventId) || subEventIds.includes(parseInt(m.subEventId)))
                    )
                    
                    localStorage.setItem('members', JSON.stringify(remainingMembers))

                }
            }
        }
        
        // 4. إرسال أحداث التحديث
        window.dispatchEvent(new CustomEvent('delegationDeleted'))
        window.dispatchEvent(new CustomEvent('memberDeleted'))
        window.dispatchEvent(new CustomEvent('localStorageUpdated'))
        
        return {
            success: true,
            message: `تم حذف الحدث الرئيسي وجميع البيانات المرتبطة به بنجاح (${totalSubEvents} حدث فرعي، ${totalDelegations} وفد، ${totalMembers} عضو)`,
            stats: {
                subEvents: totalSubEvents,
                delegations: totalDelegations,
                members: totalMembers
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
