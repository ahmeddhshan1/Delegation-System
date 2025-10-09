import { useState } from 'react'
import { Icon } from "@iconify/react/dist/iconify.js"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const EquivalentPositionSelector = ({ selectedPosition, onPositionSelect, onEquivalentSelect }) => {
    const [open, setOpen] = useState(false)
    const [selectedEquivalent, setSelectedEquivalent] = useState('')

    const equivalentPositions = {
        'قائد': ['رئيس', 'مدير', 'مشرف'],
        'رئيس': ['قائد', 'مدير', 'مشرف'],
        'مدير': ['قائد', 'رئيس', 'مشرف'],
        'مشرف': ['قائد', 'رئيس', 'مدير'],
        'عضو': ['موظف', 'عامل', 'متدرب'],
        'موظف': ['عضو', 'عامل', 'متدرب'],
        'عامل': ['عضو', 'موظف', 'متدرب'],
        'متدرب': ['عضو', 'موظف', 'عامل']
    }

    const handleSelect = () => {
        if (selectedEquivalent) {
            onEquivalentSelect(selectedEquivalent)
            setOpen(false)
            setSelectedEquivalent('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                    <Icon icon="material-symbols:work" fontSize={16} />
                    <span>اختيار ما يعادلها</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>اختيار ما يعادلها</DialogTitle>
                    <DialogDescription>
                        اختر المنصب المكافئ للوظيفة: {selectedPosition}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-3">
                        <Label htmlFor="equivalent">المنصب المكافئ</Label>
                        <Select value={selectedEquivalent} onValueChange={setSelectedEquivalent}>
                            <SelectTrigger className="w-full text-right" dir="rtl">
                                <SelectValue placeholder="اختر المنصب المكافئ" />
                            </SelectTrigger>
                            <SelectContent className="text-right" dir="rtl">
                                {equivalentPositions[selectedPosition]?.map((position, index) => (
                                    <SelectItem key={index} value={position} className="text-right" dir="rtl">
                                        {position}
                                    </SelectItem>
                                )) || (
                                    <SelectItem value="غير محدد" className="text-right" dir="rtl">
                                        غير محدد
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-3 pt-4 border-t border-neutral-200">
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer flex-1 h-11">الغاء</Button>
                    </DialogClose>
                    <Button 
                        onClick={handleSelect}
                        disabled={!selectedEquivalent}
                        className="cursor-pointer flex-1 h-11"
                    >
                        <Icon icon="material-symbols:check" className="mr-2" />
                        <span>تأكيد</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EquivalentPositionSelector
