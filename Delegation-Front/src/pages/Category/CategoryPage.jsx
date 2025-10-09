import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button } from "@/components/ui/button"
import { getEventCategories, addEventToCategory } from '../../utils/eventCategories'
import EventsList from '../../components/Events/EventsList'
import AddEvent from '../../components/Events/AddEvent'

const CategoryPage = () => {
    const { categoryId } = useParams()
    const navigate = useNavigate()
    const [category, setCategory] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const categories = getEventCategories()
        const foundCategory = categories.find(cat => cat.id === categoryId)
        
        if (foundCategory) {
            setCategory(foundCategory)
        } else {
            // إذا لم توجد الفئة، ارجع للصفحة الرئيسية
            navigate('/')
        }
        setLoading(false)
    }, [categoryId, navigate])

    const handleEventAdded = (eventData) => {
        // إضافة الحدث الجديد للفئة
        const newEvent = addEventToCategory(categoryId, eventData)
        
        // تحديث البيانات المحلية
        const categories = getEventCategories()
        const updatedCategory = categories.find(cat => cat.id === categoryId)
        setCategory(updatedCategory)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Icon icon="jam:refresh" className="animate-spin text-4xl text-primary-600" />
            </div>
        )
    }

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <Icon icon="material-symbols:error-outline" className="text-6xl text-rose-400 mb-4" />
                <h2 className="text-2xl font-bold text-neutral-700 mb-2">الفئة غير موجودة</h2>
                <p className="text-neutral-600 mb-4">الفئة المطلوبة غير موجودة أو تم حذفها</p>
                <Button onClick={() => navigate('/')} className="cursor-pointer">
                    <Icon icon="material-symbols:home" className="mr-2" />
                    العودة للرئيسية
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-primary-400 to-primary-600 grid place-items-center">
                            <Icon icon={category.icon} fontSize={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-800">{category.name}</h1>
                            <p className="text-neutral-600 mt-1">
                                {category.events.length} حدث متاح
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            onClick={() => navigate('/')} 
                            variant="outline" 
                            className="cursor-pointer"
                        >
                            <Icon icon="material-symbols:arrow-back" className="mr-2" />
                            العودة
                        </Button>
                    </div>
                </div>
            </div>

            {/* إضافة حدث جديد */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-300">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-neutral-800">إضافة حدث جديد</h2>
                    <AddEvent onEventAdded={handleEventAdded} />
                </div>
                <p className="text-neutral-600">
                    أضف حدث جديد إلى فئة {category.name} من خلال النموذج أعلاه
                </p>
            </div>

            {/* قائمة الأحداث */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-300">
                <h2 className="text-xl font-bold text-neutral-800 mb-4">الأحداث المتاحة</h2>
                {category.events.length > 0 ? (
                    <EventsList events={category.events} categoryId={categoryId} />
                ) : (
                    <div className="text-center py-12">
                        <Icon icon="material-symbols:event-busy" className="text-6xl text-neutral-400 mb-4" />
                        <h3 className="text-xl font-medium text-neutral-600 mb-2">لا توجد أحداث بعد</h3>
                        <p className="text-neutral-500">ابدأ بإضافة أول حدث لهذه الفئة</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CategoryPage
