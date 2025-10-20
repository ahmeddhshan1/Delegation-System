// أداة لمسح البيانات القديمة من localStorage
// يمكن استخدامها في التطبيق أو في Console المتصفح

/**
 * مسح البيانات القديمة من localStorage
 * @param {boolean} showLogs - عرض رسائل المسح في Console
 * @returns {number} عدد العناصر المحذوفة
 */
export const clearOldLocalStorageData = (showLogs = true) => {
    if (showLogs) {
        console.log('🧹 بدء مسح البيانات القديمة من localStorage...')
    }

    // قائمة البيانات القديمة المراد مسحها
    const oldDataKeys = [
        'mainEvents',
        'nationalities', 
        'airports',
        'airlines',
        'origins',
        'lastEventUpdate',
        'eventsData',
        'subEventsData',
        'cachedEvents',
        'cachedNationalities',
        'cachedAirports',
        'cachedAirlines'
    ]

    let clearedCount = 0

    // مسح كل مفتاح
    oldDataKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key)
            if (showLogs) {
                console.log(`✅ تم مسح: ${key}`)
            }
            clearedCount++
        }
    })

    // مسح أي بيانات أخرى متعلقة بالأحداث
    const allKeys = Object.keys(localStorage)
    const eventRelatedKeys = allKeys.filter(key => 
        key.toLowerCase().includes('event') || 
        key.toLowerCase().includes('delegation') ||
        key.toLowerCase().includes('member') ||
        key.toLowerCase().includes('cached')
    )

    eventRelatedKeys.forEach(key => {
        if (!oldDataKeys.includes(key)) {
            localStorage.removeItem(key)
            if (showLogs) {
                console.log(`✅ تم مسح: ${key}`)
            }
            clearedCount++
        }
    })

    if (showLogs) {
        console.log(`🎉 تم مسح ${clearedCount} عنصر من localStorage`)
        console.log('💡 الآن التطبيق سيستخدم البيانات من قاعدة البيانات مباشرة!')
    }

    return clearedCount
}

/**
 * التحقق من وجود بيانات قديمة
 * @returns {boolean} true إذا كانت هناك بيانات قديمة
 */
export const hasOldData = () => {
    const oldDataKeys = [
        'mainEvents',
        'nationalities', 
        'airports',
        'airlines',
        'origins',
        'lastEventUpdate'
    ]

    return oldDataKeys.some(key => localStorage.getItem(key) !== null)
}

/**
 * مسح البيانات القديمة تلقائياً عند تحميل التطبيق
 */
export const autoClearOldData = () => {
    // التحقق من وجود بيانات قديمة فقط بدون مسحها
    if (hasOldData()) {
        console.log('🔄 تم اكتشاف بيانات قديمة، لكن لن يتم مسحها تلقائياً...')
        console.log('💡 يمكنك مسح البيانات القديمة يدوياً من Console إذا أردت')
        return
    }
}

export default clearOldLocalStorageData
