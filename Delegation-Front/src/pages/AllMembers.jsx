import { useState, useMemo, useEffect, useCallback } from "react"
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table"
import { Icon } from "@iconify/react/dist/iconify.js"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import DataTable from "../components/DataTable"
import AllMembersTableToolbar from "../components/Members/AllMembersTableToolbar"
import DeletePopup from "../components/DeletePopup"
import EditMember from "../components/Members/EditMember"
import { members } from "../data"
import { toast } from "sonner"

const AllMembers = () => {
    const [data, setData] = useState([])
    
    // دالة محسنة لتحميل الأعضاء مع تحديث حالة المغادرة
    const loadMembers = useCallback(() => {
        try {
            const savedMembers = localStorage.getItem('members')
            const savedDelegations = localStorage.getItem('delegations')
            const savedEventCategories = localStorage.getItem('eventCategories')

            if (savedMembers && savedMembers !== '[]') {
                const parsedMembers = JSON.parse(savedMembers)
                const parsedDelegations = savedDelegations ? JSON.parse(savedDelegations) : []
                
                // استخراج الأحداث الفرعية من eventCategories
                let parsedSubEvents = []
                if (savedEventCategories) {
                    const eventCategories = JSON.parse(savedEventCategories)
                    eventCategories.forEach(category => {
                        if (category.events && Array.isArray(category.events)) {
                            category.events.forEach(event => {
                                parsedSubEvents.push({
                                    id: event.id,
                                    name: event.name,
                                    mainEventId: category.id,
                                    mainEventName: category.name
                                })
                            })
                        }
                    })
                }

                // تحديث حالة الأعضاء وتواريخ الوصول
                const updatedMembers = parsedMembers.map(member => {
                    // تحديث حالة المغادرة من البيانات المحفوظة مسبقاً
                    if (member.memberStatus && member.departureDate) {
                        return member // البيانات محدثة بالفعل
                    }

                    let updatedMember = { ...member }

                    // البحث عن معلومات الحدث الرئيسي والفرعي من خلال الوفد
                    let subEventId = member.subEventId // من العضو مباشرة
                    
                    // إذا لم يوجد subEventId في العضو، ابحث في الوفد
                    if (!subEventId && member.delegation && member.delegation.id) {
                        const delegation = parsedDelegations.find(d => d.id === member.delegation.id)
                        if (delegation && delegation.subEventId) {
                            subEventId = delegation.subEventId
                        }
                    }
                    
                    if (subEventId) {
                        const subEvent = parsedSubEvents.find(se => se.id == subEventId) // استخدام == للتحويل بين string و number
                        if (subEvent) {
                            updatedMember.subEvent = {
                                id: subEvent.id,
                                name: subEvent.name,
                                mainEventId: subEvent.mainEventId
                            }
                            
                            // البحث عن الحدث الرئيسي (البيانات موجودة بالفعل في subEvent.mainEventName)
                            // لا حاجة للبحث في parsedMainEvents
                        }
                    }

                    // البحث عن حالة المغادرة من جلسات المغادرة
                    if (member.delegation && member.delegation.id) {
                        const delegation = parsedDelegations.find(d => d.id === member.delegation.id)
                        
                        if (delegation) {
                            // تحديث تاريخ الوصول من بيانات الوفد إذا لم يكن موجود للعضو
                            if (!member.arrivalDate && delegation.arrivalInfo && delegation.arrivalInfo.arrivalDate) {
                                updatedMember.arrivalDate = delegation.arrivalInfo.arrivalDate
                            }
                            
                            // تحديث حالة المغادرة
                            if (delegation.departureInfo && delegation.departureInfo.departureSessions) {
                                // البحث عن العضو في جلسات المغادرة
                                let departureDate = null
                                let isInDepartureSession = false
                                
                                for (const session of delegation.departureInfo.departureSessions) {
                                    const memberInSession = session.members.find(sessionMember => {
                                        if (typeof sessionMember === 'object' && sessionMember.id) {
                                            return sessionMember.id === member.id
                                        }
                                        return sessionMember === member.id
                                    })
                                    
                                    if (memberInSession) {
                                        isInDepartureSession = true
                                        departureDate = session.date
                                        break
                                    }
                                }
                                
                                updatedMember.memberStatus = isInDepartureSession ? "departed" : "not_departed"
                                updatedMember.departureDate = departureDate
                            }
                        }
                    }
                    
                    // تعيين القيم الافتراضية
                    updatedMember.memberStatus = updatedMember.memberStatus || "not_departed"
                    updatedMember.departureDate = updatedMember.departureDate || null
                    
                    return updatedMember
                })
                
                console.log('=== بيانات الأعضاء ===')
                console.log('عدد الأعضاء:', updatedMembers.length)
                
                // طباعة تفاصيل الأحداث للأعضاء
                updatedMembers.forEach((member, index) => {
                    console.log(`عضو ${index + 1}: ${member.name}`)
                    console.log('  - subEvent:', member.subEvent)
                    console.log('  - delegation:', member.delegation)
                    console.log('  - subEventId:', member.subEventId)
                })
                
                // طباعة الأحداث الرئيسية
                const mainEvents = JSON.parse(localStorage.getItem('mainEvents') || '[]')
                console.log('=== الأحداث الرئيسية ===')
                console.log('عدد الأحداث الرئيسية:', mainEvents.length)
                mainEvents.forEach(event => {
                    console.log(`الحدث: ${event.name} (ID: ${event.id})`)
                    console.log('  - عدد الأحداث الفرعية:', event.subEvents ? event.subEvents.length : 0)
                    if (event.subEvents) {
                        event.subEvents.forEach(subEvent => {
                            console.log(`    * ${subEvent.name} (ID: ${subEvent.id})`)
                        })
                    }
                })
                
                setData(updatedMembers)
            } else {
                setData([])
            }
        } catch (error) {
            console.error('خطأ في تحليل بيانات الأعضاء:', error)
            setData([])
        }
    }, [])

    // تحميل البيانات عند تشغيل المكون
    useEffect(() => {
        loadMembers()
    }, [loadMembers])

    // الاستماع للتحديثات الفورية - تحديث فوري بدون refresh
    useEffect(() => {
        // دالة موحدة للتعامل مع جميع التحديثات
        const handleDataUpdate = () => {
            console.log('تحديث بيانات الأعضاء...')
            loadMembers()
        }

        // إضافة جميع event listeners للتحديث الفوري
        const eventListeners = [
            'storage',
            'memberAdded', 
            'memberUpdated',
            'memberDeleted',
            'delegationAdded',
            'delegationUpdated',
            'delegationDeleted',
            'localStorageUpdated'
        ]

        // إضافة جميع الـ event listeners
        eventListeners.forEach(eventName => {
            window.addEventListener(eventName, handleDataUpdate)
        })

        // تنظيف الـ event listeners عند إلغاء المكون
        return () => {
            eventListeners.forEach(eventName => {
                window.removeEventListener(eventName, handleDataUpdate)
            })
        }
    }, [loadMembers])
    
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({
        job: false, // إخفاء عمود الوظيفة افتراضياً
        equivalentRole: true // إظهار عمود المنصب المعادل افتراضياً
    })
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState('')
    const [mainEventFilter, setMainEventFilter] = useState('')

    const columns = useMemo(
        () => {
            const cols = [
            {
                accessorKey: "memberStatus",
                header: () => <div className="text-center">حالة العضو</div>,
                cell: ({ row }) => {
                    const status = row.getValue("memberStatus")
                    let statusIcon = ""
                    let iconColor = ""
                    
                    switch(status) {
                        case "departed":
                            statusIcon = "material-symbols:check-circle"
                            iconColor = "text-green-600"
                            break
                        case "not_departed":
                            statusIcon = "material-symbols:cancel"
                            iconColor = "text-red-600"
                            break
                        default:
                            statusIcon = "material-symbols:cancel"
                            iconColor = "text-red-600"
                    }
                    
                    return (
                        <div className="flex justify-center">
                            <div className="px-1 py-1 rounded-lg text-lg font-medium text-center bg-gray-200 w-fit">
                                <Icon icon={statusIcon} fontSize={20} className={iconColor} />
                            </div>
                        </div>
                    )
                },
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const status = row.getValue(columnId)
                    return status === filterValue
                },
            },
            {
                accessorKey: "rank",
                header: () => <div className="text-center">الرتبة</div>,
                cell: ({ row }) => (
                    <div className="text-center">
                        <span className="text-gray-700">{row.getValue("rank")}</span>
                    </div>
                ),
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const rank = row.getValue(columnId)
                    return rank && rank.toLowerCase().includes(filterValue.toLowerCase())
                },
            },
            {
                accessorKey: "name",
                header: () => <div className="text-center">الاسم</div>,
                cell: ({ row }) => (
                    <div className="text-center">
                        <span className="font-medium">{row.getValue("name")}</span>
                    </div>
                ),
            },
            {
                accessorKey: "role",
                header: () => <div className="text-center">الوظيفة</div>,
                cell: ({ row }) => (
                    <div className="text-center">
                        <span className="text-gray-700">{row.getValue("role")}</span>
                    </div>
                ),
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const role = row.getValue(columnId)
                    return role && role.toLowerCase().includes(filterValue.toLowerCase())
                },
            },
            {
                accessorKey: "equivalentRole",
                header: () => <div className="text-center">المنصب العسكري المعادل</div>,
                cell: ({ row }) => (
                    <div className="text-center">
                        <span className="text-gray-700 font-medium">{row.getValue("equivalentRole") || "غير محدد"}</span>
                    </div>
                ),
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const equivalentRole = row.getValue(columnId)
                    return equivalentRole && equivalentRole.toLowerCase().includes(filterValue.toLowerCase())
                },
            },
            {
                accessorKey: "delegation.delegationHead",
                header: () => <div className="text-center">اسم الوفد</div>,
                cell: ({ row }) => {
                    const delegationData = row.original.delegation
                    
                    if (delegationData && delegationData.nationality && delegationData.delegationHead) {
                        const displayText = `${delegationData.nationality} - ${delegationData.delegationHead}`
                        return (
                            <div className="text-center">
                                <span className="text-gray-700 font-medium">
                                    {displayText}
                                </span>
                            </div>
                        )
                    }

                    return (
                        <div className="text-center">
                            <span className="text-gray-400 italic">بدون وفد</span>
                        </div>
                    )
                },
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    
                    const delegationData = row.original.delegation
                    if (!delegationData || !delegationData.nationality || !delegationData.delegationHead) {
                        return false
                    }
                    
                    const delegationDisplayName = `${delegationData.nationality} - ${delegationData.delegationHead}`
                    return delegationDisplayName.toLowerCase().includes(filterValue.toLowerCase())
                },
            },
            // أعمدة مخفية للفلاتر فقط
            {
                accessorKey: "mainEvent",
                header: () => null,
                cell: () => null,
                enableHiding: false,
                enableSorting: false,
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const member = row.original
                    
                    console.log('فلتر الحدث الرئيسي:', {
                        filterValue,
                        memberName: member.name,
                        subEvent: member.subEvent,
                        delegation: member.delegation
                    })
                    
                    // البحث في الأحداث الحقيقية
                    const searchTerm = filterValue.toLowerCase()
                    
                    // البحث في subEvent للمعضو
                    if (member.subEvent && member.subEvent.mainEventName) {
                        const memberMainEvent = member.subEvent.mainEventName.toLowerCase()
                        
                        if (memberMainEvent.includes(searchTerm)) {
                            console.log('تطابق في الحدث الرئيسي من subEvent:', memberMainEvent)
                            return true
                        }
                    }
                    
                    // البحث في delegation.subEventId مع الأحداث الحقيقية
                    if (member.delegation && member.delegation.subEventId) {
                        const savedMainEvents = localStorage.getItem('mainEvents')
                        if (savedMainEvents) {
                            const mainEvents = JSON.parse(savedMainEvents)
                            
                            for (const mainEvent of mainEvents) {
                                if (mainEvent.sub_events && Array.isArray(mainEvent.sub_events)) {
                                    for (const subEvent of mainEvent.sub_events) {
                                        if (subEvent.id === member.delegation.subEventId) {
                                            const mainEventName = mainEvent.name.toLowerCase()
                                            
                                            if (mainEventName.includes(searchTerm)) {
                                                console.log('تطابق في الحدث الرئيسي من الوفد:', mainEventName)
                                                return true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // البحث المباشر في subEventId إذا كان العضو عنده
                    if (member.subEventId) {
                        const savedMainEvents = localStorage.getItem('mainEvents')
                        if (savedMainEvents) {
                            const mainEvents = JSON.parse(savedMainEvents)
                            
                            for (const mainEvent of mainEvents) {
                                if (mainEvent.sub_events && Array.isArray(mainEvent.sub_events)) {
                                    for (const subEvent of mainEvent.sub_events) {
                                        if (subEvent.id === member.subEventId) {
                                            const mainEventName = mainEvent.name.toLowerCase()
                                            
                                            if (mainEventName.includes(searchTerm)) {
                                                console.log('تطابق في الحدث الرئيسي من العضو:', mainEventName)
                                                return true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    console.log('لم يتم العثور على تطابق في الحدث الرئيسي')
                    return false
                },
            },
            {
                accessorKey: "subEvent",
                header: () => null,
                cell: () => null,
                enableHiding: false,
                enableSorting: false,
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const member = row.original
                    
                    console.log('فلتر الحدث الفرعي:', {
                        filterValue,
                        memberName: member.name,
                        subEvent: member.subEvent,
                        delegation: member.delegation,
                        memberSubEventId: member.subEventId
                    })
                    
                    // البحث في الأسماء الحقيقية للأحداث الفرعية
                    console.log('البحث عن الحدث الفرعي:', filterValue)
                    
                    // البحث المباشر في الأسماء
                    const searchTerm = filterValue.toLowerCase()
                    
                    // البحث في subEvent للمعضو
                    if (member.subEvent && member.subEvent.name) {
                        const memberSubEvent = member.subEvent.name.toLowerCase()
                        
                        if (memberSubEvent.includes(searchTerm)) {
                            console.log('تطابق في الحدث الفرعي:', memberSubEvent)
                            return true
                        }
                    }
                    
                    // البحث في delegation.subEventId مع الأحداث الحقيقية
                    if (member.delegation && member.delegation.subEventId) {
                        // البحث في mainEvents للأحداث الحقيقية
                        const savedMainEvents = localStorage.getItem('mainEvents')
                        if (savedMainEvents) {
                            const mainEvents = JSON.parse(savedMainEvents)
                            
                            for (const mainEvent of mainEvents) {
                                if (mainEvent.sub_events && Array.isArray(mainEvent.sub_events)) {
                                    for (const subEvent of mainEvent.sub_events) {
                                        if (subEvent.id === member.delegation.subEventId) {
                                            const eventName = subEvent.name.toLowerCase()
                                            
                                            if (eventName.includes(searchTerm)) {
                                                console.log('تطابق في الحدث الفرعي من الوفد:', eventName)
                                                return true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // البحث المباشر في subEventId إذا كان العضو عنده
                        if (member.subEventId) {
                            const savedMainEvents = localStorage.getItem('mainEvents')
                            if (savedMainEvents) {
                                const mainEvents = JSON.parse(savedMainEvents)
                                
                                for (const mainEvent of mainEvents) {
                                    if (mainEvent.sub_events && Array.isArray(mainEvent.sub_events)) {
                                        for (const subEvent of mainEvent.sub_events) {
                                            if (subEvent.id === member.subEventId) {
                                                const eventName = subEvent.name.toLowerCase()
                                                
                                                if (eventName.includes(searchTerm)) {
                                                    console.log('تطابق في الحدث الفرعي من العضو:', eventName)
                                                    return true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    console.log('لم يتم العثور على تطابق في الحدث الفرعي')
                    return false
                },
            },
            {
                accessorKey: "arrivalDate",
                header: () => <div className="text-center">تاريخ الوصول</div>,
                cell: ({ row }) => {
                    const member = row.original
                    const memberArrivalDate = member.arrivalDate
                    
                    // إذا كان للعضو تاريخ وصول محدد، استخدمه
                    if (memberArrivalDate) {
                        return (
                            <div className="text-center">
                            <span className="text-gray-700">
                                {new Date(memberArrivalDate).toLocaleDateString('en-GB')}
                            </span>
                            </div>
                        )
                    }
                    
                    // إذا لم يكن للعضو تاريخ وصول، استخدم تاريخ وصول الوفد
                    if (member.delegation && member.delegation.arrivalDate) {
                        return (
                            <div className="text-center">
                                <span className="text-gray-700">
                                    {new Date(member.delegation.arrivalDate).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                        )
                    }
                    
                    // إذا لم يوجد تاريخ وصول للوفد أيضاً، ابحث في بيانات الوفد الكاملة
                    try {
                        const savedDelegations = localStorage.getItem('delegations')
                        if (savedDelegations) {
                            const delegations = JSON.parse(savedDelegations)
                            const delegation = delegations.find(d => d.id === member.delegation?.id)
                            
                            if (delegation && delegation.arrivalInfo && delegation.arrivalInfo.arrivalDate) {
                                return (
                                    <div className="text-center">
                                        <span className="text-gray-700">
                                            {new Date(delegation.arrivalInfo.arrivalDate).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                )
                            }
                        }
                    } catch (error) {
                        console.error('خطأ في جلب تاريخ وصول الوفد:', error)
                    }
                    
                    return (
                        <div className="text-center">
                            <span className="text-gray-400">غير محدد</span>
                        </div>
                    )
                },
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    
                    const rowDateString = row.getValue(columnId)
                    if (!rowDateString) return false
                    
                    try {
                        const rowDate = new Date(rowDateString)
                        const filterDate = new Date(filterValue)
                        
                        if (isNaN(rowDate.getTime()) || isNaN(filterDate.getTime())) return false
                        
                        return rowDate.toDateString() === filterDate.toDateString()
                    } catch (error) {
                        return false
                    }
                },
            },
            {
                accessorKey: "departureDate",
                header: () => <div className="text-center">تاريخ المغادرة</div>,
                cell: ({ row }) => {
                    const departureDate = row.getValue("departureDate")
                    const memberStatus = row.original.memberStatus

                    return (
                        <div className="text-center">
                            <span className={departureDate ? "text-gray-700" : "text-gray-400"}>
                                {departureDate ? new Date(departureDate).toLocaleDateString('en-GB') : "لم يغادر"}
                            </span>
                        </div>
                    )
                },
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    
                    const rowDateString = row.getValue(columnId)
                    if (!rowDateString) return false
                    
                    try {
                        const rowDate = new Date(rowDateString)
                        const filterDate = new Date(filterValue)
                        
                        if (isNaN(rowDate.getTime()) || isNaN(filterDate.getTime())) return false
                        
                        return rowDate.toDateString() === filterDate.toDateString()
                    } catch (error) {
                        return false
                    }
                },
            },
            {
                id: "actions",
                enableHiding: false,
                header: () => <div className="text-center">الإجراءات</div>,
                cell: ({ row }) => {
                    return (
                        <div className="flex justify-center">
                            <DropdownMenu dir='rtl'>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 !ring-0">
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <EditMember member={row.original}>
                                        <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                            <Icon icon={'material-symbols:edit-outline-rounded'} />
                                            <span>تعديل</span>
                                        </DropdownMenuItem>
                                    </EditMember>
                                    <DeletePopup item={row}>
                                        <DropdownMenuItem variant="destructive" onSelect={e => e.preventDefault()}>
                                            <Icon icon={'mynaui:trash'} />
                                            <span>حذف</span>
                                        </DropdownMenuItem>
                                    </DeletePopup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
            },
        ]
            return cols
        },
        []
    )

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })
    
    // حساب الإحصائيات
    const totalMembers = data.length
    const departedMembers = data.filter(member => member.memberStatus === "departed").length
    const notDepartedMembers = data.filter(member => member.memberStatus === "not_departed").length


    return (
        <div className="content">
            <div className="p-6 space-y-6">


            {/* Statistics Cards */}
            <div className="flex gap-2 justify-between">
                <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-neutral-600">إجمالي الأعضاء</span>
                        <h2 className="text-blue-700 font-bold text-5xl">{totalMembers}</h2>
                        <span className="text-neutral-400 text-xs">
                            آخر تحديث: {new Date().toLocaleDateString('en-GB')}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 grid place-items-center">
                        <Icon icon="fa:users" fontSize={28} className="text-blue-600" />
                    </div>
                </div>
                <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-neutral-600">الأعضاء المغادرين</span>
                        <h2 className="text-green-700 font-bold text-5xl">{departedMembers}</h2>
                        <span className="text-neutral-400 text-xs">
                            آخر تحديث: {new Date().toLocaleDateString('en-GB')}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 grid place-items-center">
                        <Icon icon="material-symbols:check-circle" fontSize={28} className="text-green-600" />
                    </div>
                </div>
                <div className="box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-neutral-600">الأعضاء الذين لم يغادروا</span>
                        <h2 className="text-red-700 font-bold text-5xl">{notDepartedMembers}</h2>
                        <span className="text-neutral-400 text-xs">
                            آخر تحديث: {new Date().toLocaleDateString('en-GB')}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-100 grid place-items-center">
                        <Icon icon="material-symbols:cancel" fontSize={28} className="text-red-600" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className='border p-4 mt-8 border-neutral-300 rounded-2xl bg-white'>
                <AllMembersTableToolbar table={table} data={data} onCleanup={loadMembers} />
                <DataTable table={table} columns={columns} clickableRow={false} />
            </div>
            </div>
        </div>
    )
}

export default AllMembers
