// سكريبت لمسح البيانات القديمة من localStorage
// يمكن تشغيله في Console المتصفح أو إضافته للتطبيق

console.log('🧹 بدء مسح البيانات القديمة من localStorage...')

// قائمة البيانات القديمة المراد مسحها
const oldDataKeys = [
    'mainEvents',
    'nationalities', 
    'airports',
    'airlines',
    'origins',
    'lastEventUpdate',
    'eventsData',
    'subEventsData'
]

let clearedCount = 0

// مسح كل مفتاح
oldDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        console.log(`✅ تم مسح: ${key}`)
        clearedCount++
    } else {
        console.log(`ℹ️ غير موجود: ${key}`)
    }
})

// مسح أي بيانات أخرى متعلقة بالأحداث
const allKeys = Object.keys(localStorage)
const eventRelatedKeys = allKeys.filter(key => 
    key.toLowerCase().includes('event') || 
    key.toLowerCase().includes('delegation') ||
    key.toLowerCase().includes('member')
)

eventRelatedKeys.forEach(key => {
    if (!oldDataKeys.includes(key)) {
        localStorage.removeItem(key)
        console.log(`✅ تم مسح: ${key}`)
        clearedCount++
    }
})

console.log(`🎉 تم مسح ${clearedCount} عنصر من localStorage`)
console.log('💡 الآن التطبيق سيستخدم البيانات من قاعدة البيانات مباشرة!')

// إعادة تحميل الصفحة لتطبيق التغييرات
if (typeof window !== 'undefined') {
    console.log('🔄 سيتم إعادة تحميل الصفحة...')
    setTimeout(() => {
        window.location.reload()
    }, 2000)
}
