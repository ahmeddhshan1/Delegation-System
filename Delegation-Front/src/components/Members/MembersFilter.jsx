import { Icon } from "@iconify/react/dist/iconify.js"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const MembersFilter = ({ table, data }) => {
    const [filters, setFilters] = useState({
        rank: '',
        job_title: '',
        equivalent_job_name: '',
    })

    const applyFilter = (val, fieldName) => {
        table.getColumn(fieldName)?.setFilterValue(val === "" ? undefined : val)
        setFilters({ ...filters, [fieldName]: val })
    }

    const clearFilter = () => {
        setFilters({
            rank: '',
            job_title: '',
            equivalent_job_name: '',
        })
        table.resetColumnFilters()
    }
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="mr-auto !ring-0">
                    <Icon icon={'fluent:filter-32-filled'} />
                    <span>فلتر</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="leading-none font-medium">فلتر</h4>
                        <p className="text-muted-foreground text-sm">
                            يمكنك تصفية الجدول حسب هذة الاعمدة.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4 w-full">
                            <Label htmlFor="width">الوظيفة</Label>
                            <Select dir='rtl' value={filters.job_title} onValueChange={val => applyFilter(val, 'job_title')}>
                                <SelectTrigger className="w-full !ring-0 col-span-2">
                                    <SelectValue placeholder="الوظيفة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        [...new Set(data.map(el => el.job_title).filter(Boolean))]
                                            .map((jobTitle, index) => (
                                            <SelectItem key={index} value={jobTitle}>
                                                {jobTitle}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4 w-full">
                            <Label htmlFor="width">الرتبة</Label>
                            <Select dir='rtl' value={filters.rank} onValueChange={val => applyFilter(val, 'rank')}>
                                <SelectTrigger className="w-full !ring-0 col-span-2">
                                    <SelectValue placeholder="الرتبة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        [...new Set(data.map(el => el.rank).filter(Boolean))]
                                            .map((rank, index) => (
                                                <SelectItem key={index} value={rank}>{rank}</SelectItem>
                                            ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4 w-full">
                            <Label htmlFor="width">الوظيفة المعادلة</Label>
                            <Select dir='rtl' value={filters.equivalent_job_name} onValueChange={val => applyFilter(val, 'equivalent_job_name')}>
                                <SelectTrigger className="w-full !ring-0 col-span-2">
                                    <SelectValue placeholder="الوظيفة المعادلة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        [...new Set(data.map(el => el.equivalent_job_name).filter(Boolean))]
                                            .map((equivalentJobName, index) => (
                                                <SelectItem key={index} value={equivalentJobName}>{equivalentJobName}</SelectItem>
                                            ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {isFiltered && <Button className="w-full cursor-pointer" onClick={clearFilter}>حذف جميع الفلاتر</Button>}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default MembersFilter
