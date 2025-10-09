import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Icon } from "@iconify/react/dist/iconify.js"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { addEventCategory, availableEmojis } from "../../utils/eventCategories"

const AddEventCategory = ({ onCategoryAdded }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [selectedEmoji, setSelectedEmoji] = useState(null)

    const validationSchema = yup.object({
        name: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
        englishName: yup.string().required("هذا الحقل لا يمكن ان يكون فارغا"),
    })

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: "",
            englishName: "",
        }
    })

    const onSubmit = handleSubmit((data) => {
        if (!selectedEmoji) {
            toast.error("يجب اختيار أيقونة للفئة")
            return
        }

        setLoading(true)
        setTimeout(() => {
            try {
                const newCategory = addEventCategory({
                    name: data.name,
                    englishName: data.englishName,
                    icon: selectedEmoji.icon
                });
                
                toast.success(`تم إضافة فئة ${data.name} بنجاح`)
                reset()
                setSelectedEmoji(null)
                setLoading(false)
                setOpen(false)
                
                if (onCategoryAdded) {
                    onCategoryAdded(newCategory)
                }
                
                // إرسال custom event لتحديث Header
                window.dispatchEvent(new CustomEvent('eventAdded'))
            } catch (error) {
                toast.error("حدث خطأ أثناء إضافة الفئة")
                setLoading(false)
            }
        }, 1500)
    })

    useEffect(() => {
        if (open) {
            reset()
            setSelectedEmoji(null)
        }
    }, [open, reset])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer w-full mt-4">
                    <Icon icon="qlementine-icons:plus-16" />
                    <span>إضافة فئة حدث</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] [&_[data-slot='dialog-close']]:!right-[95%]">
                <DialogHeader className="!text-start !py-4">
                    <DialogTitle className="text-xl font-bold">إضافة فئة حدث جديدة</DialogTitle>
                    <DialogDescription className="text-neutral-600">
                        أدخل اسم الفئة واختر أيقونة مناسبة لها
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="py-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-medium">اسم الفئة</Label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    placeholder="مثال: المؤتمرات" 
                                    className="w-full p-3 border border-neutral-300 rounded-lg focus:border-primary-600 focus:ring-1 focus:ring-primary-200 transition-all duration-200"
                                    {...register('name')} 
                                />
                                {errors.name && (
                                    <div className="flex items-center gap-2 text-rose-400 text-sm">
                                        <Icon icon="material-symbols:error-rounded" fontSize={16} />
                                        <span>{errors.name.message}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="englishName" className="text-base font-medium">الاسم الإنجليزي (للروابط)</Label>
                                <input 
                                    type="text" 
                                    id="englishName" 
                                    name="englishName" 
                                    placeholder="مثال: conferences" 
                                    className="w-full p-3 border border-neutral-300 rounded-lg focus:border-primary-600 focus:ring-1 focus:ring-primary-200 transition-all duration-200"
                                    {...register('englishName')} 
                                />
                                {errors.englishName && (
                                    <div className="flex items-center gap-2 text-rose-400 text-sm">
                                        <Icon icon="material-symbols:error-rounded" fontSize={16} />
                                        <span>{errors.englishName.message}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-base font-medium">اختيار الأيقونة</Label>
                                <div className="grid grid-cols-8 gap-3 p-4 border border-neutral-300 rounded-lg max-h-64 overflow-y-auto">
                                    {availableEmojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setSelectedEmoji(emoji)}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                                                selectedEmoji?.icon === emoji.icon 
                                                    ? 'border-primary-600 bg-primary-50' 
                                                    : 'border-neutral-200 hover:border-neutral-300'
                                            }`}
                                            title={emoji.name}
                                        >
                                            <Icon 
                                                icon={emoji.icon} 
                                                fontSize={24} 
                                                onError={(e) => {
                                                    console.warn(`Failed to load icon: ${emoji.icon}`);
                                                    // استبدال الأيقونة المعطلة بأيقونة بديلة
                                                    e.target.setAttribute('data-icon', 'material-symbols:star');
                                                    e.target.setAttribute('icon', 'material-symbols:star');
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {selectedEmoji && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <Icon icon="material-symbols:check-circle" fontSize={16} />
                                        <span>تم اختيار: {selectedEmoji.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 pt-4 border-t border-neutral-200">
                        <DialogClose asChild>
                            <Button disabled={loading} variant="outline" className="cursor-pointer flex-1 h-11">الغاء</Button>
                        </DialogClose>
                        <Button disabled={loading} type="button" className="cursor-pointer flex-1 h-11" onClick={onSubmit}>
                            {loading ? (
                                <>
                                    <Icon icon="jam:refresh" className="animate-spin mr-2" />
                                    <span>جاري الإضافة...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon="material-symbols:add-rounded" className="mr-2" />
                                    <span>إضافة الفئة</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddEventCategory