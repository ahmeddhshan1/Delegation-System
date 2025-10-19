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
// import { members } from "../data" // تم إزالة البيانات الوهمية
import { toast } from "sonner"
import { memberService, delegationService, eventService } from "../services/api"

const AllMembers = () => {
    const [data, setData] = useState([])
    
    // دالة محسنة لتحميل الأعضاء من API
    const loadMembers = useCallback(async () => {
        try {
            // جلب الأعضاء من API
            const membersResponse = await memberService.getMembers()
            const members = Array.isArray(membersResponse?.results) ? membersResponse.results : Array.isArray(membersResponse) ? membersResponse : []
            
            if (members.length > 0) {
                // جلب الوفود من API
                const delegationsResponse = await delegationService.getDelegations()
                const delegations = Array.isArray(delegationsResponse?.results) ? delegationsResponse.results : Array.isArray(delegationsResponse) ? delegationsResponse : []
                
                // جلب الأحداث من API
                const eventsResponse = await eventService.getMainEvents()
                const mainEvents = Array.isArray(eventsResponse?.results) ? eventsResponse.results : Array.isArray(eventsResponse) ? eventsResponse : []
                
                // استخراج الأحداث الفرعية
                let parsedSubEvents = []
                mainEvents.forEach(mainEvent => {
                    if (mainEvent.sub_events && Array.isArray(mainEvent.sub_events)) {
                        mainEvent.sub_events.forEach(subEvent => {
                            parsedSubEvents.push({
                                id: subEvent.id,
                                name: subEvent.event_name,
                                mainEventId: mainEvent.id,
                                mainEventName: mainEvent.event_name
                            })
                        })
                    }
                })

                // تحديث حالة الأعضاء وتواريخ الوصول
                const updatedMembers = members.map(member => {
                    // تحديث حالة المغادرة من البيانات المحفوظة مسبقاً
                    if (member.memberStatus && member.departureDate) {
                        return member // البيانات محدثة بالفعل
                    }

                    let updatedMember = { ...member }

                    // البحث عن معلومات الحدث الرئيسي والفرعي من خلال الوفد
                    let subEventId = member.sub_event_id // من العضو مباشرة
                    
                    // إذا لم يوجد subEventId في العضو، ابحث في الوفد
                    if (!subEventId && member.delegation_id) {
                        const delegation = delegations.find(d => d.id === member.delegation_id)
                        if (delegation && delegation.sub_event_id) {
                            subEventId = delegation.sub_event_id
                        }
                    }
                    
                    if (subEventId) {
                        const subEvent = parsedSubEvents.find(se => se.id == subEventId) // استخدام == للتحويل بين string و number
                        if (subEvent) {
                            updatedMember.subEvent = {
                                id: subEvent.id,
                                name: subEvent.name,
                                mainEventId: subEvent.mainEventId,
                                mainEventName: subEvent.mainEventName
                            }
                            
                            // البحث عن الحدث الرئيسي (البيانات موجودة بالفعل في subEvent.mainEventName)
                            // لا حاجة للبحث في parsedMainEvents
                        }
                    }

                    // البحث عن حالة المغادرة من جلسات المغادرة
                    if (member.delegation_id) {
                        const delegation = delegations.find(d => d.id === member.delegation_id)
                        
                        if (delegation) {
                            // إضافة بيانات الوفد للعضو
                            updatedMember.delegation = {
                                id: delegation.id,
                                nationality: delegation.nationality || delegation.country || delegation.nationality_name || delegation.country_name || '-',
                                delegationHead: delegation.delegation_leader_name || delegation.delegationHead,
                                arrive_date: delegation.arrive_date,
                                arrival_date: delegation.arrive_date, // للـ PDF
                                arrivalDate: delegation.arrive_date,
                                subEventId: delegation.sub_event_id,
                                arrivalInfo: {
                                    arrivalHall: delegation.airport_name || '',
                                    arrivalAirline: delegation.airline_name || '',
                                    arrivalOrigin: delegation.city_name || '',
                                    arrivalFlightNumber: delegation.flight_number || '',
                                    arrivalDate: delegation.arrive_date || '',
                                    arrivalTime: delegation.arrive_time || '',
                                    arrivalReceptor: delegation.receiver_name || '',
                                    arrivalDestination: delegation.going_to || '',
                                    arrivalShipments: delegation.goods || '',
                                }
                            }
                            
                            // تحديث تاريخ الوصول من بيانات الوفد إذا لم يكن موجود للعضو
                            if (!member.arrivalDate && delegation.arrive_date) {
                                updatedMember.arrivalDate = delegation.arrive_date
                            }
                            
                            // تحديث حالة المغادرة من API
                            updatedMember.memberStatus = member.status === 'DEPARTED' ? "departed" : "not_departed"
                            updatedMember.departureDate = member.departure_date
                        } else {
                            // محاولة البحث عن الوفد بطريقة أخرى
                            const possibleDelegation = delegations.find(d => 
                                d.members && d.members.some(m => m.id === member.id)
                            )
                            
                            if (possibleDelegation) {
                                updatedMember.delegation = {
                                    id: possibleDelegation.id,
                                    nationality: possibleDelegation.nationality || possibleDelegation.country || possibleDelegation.nationality_name || possibleDelegation.country_name || '-',
                                    delegationHead: possibleDelegation.delegation_leader_name || possibleDelegation.delegationHead,
                                    arrive_date: possibleDelegation.arrive_date,
                                    arrivalDate: possibleDelegation.arrive_date,
                                    subEventId: possibleDelegation.sub_event_id
                                }
                            }
                        }
                    }
                    
                    // تعيين القيم الافتراضية
                    updatedMember.memberStatus = updatedMember.memberStatus || "not_departed"
                    updatedMember.departureDate = updatedMember.departureDate || null
                    
                    return updatedMember
                })
                
                setData(updatedMembers)
            } else {
                setData([])
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات الأعضاء:', error)
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
                        <span className="text-gray-700">{row.getValue("rank") || "-"}</span>
                    </div>
                ),
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const rank = row.getValue(columnId)
                    
                    // إذا كان البحث عن القيم الفارغة
                    if (filterValue === "empty") {
                        return !rank || rank === "" || rank === "-"
                    }
                    
                    // للقيم العادية، نتأكد إن القيمة موجودة ومش فارغة
                    if (!rank || rank === "" || rank === "-") {
                        return false
                    }
                    
                    return rank.toLowerCase().includes(filterValue.toLowerCase())
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
                accessorKey: "job_title",
                header: () => <div className="text-center">الوظيفة</div>,
                cell: ({ row }) => (
                    <div className="text-center">
                        <span className="text-gray-700">{row.getValue("job_title")}</span>
                    </div>
                ),
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const role = row.getValue(columnId)
                    
                    // إذا كان البحث عن القيم الفارغة
                    if (filterValue === "empty") {
                        return !role || role === "" || role === "-"
                    }
                    
                    // للقيم العادية، نتأكد إن القيمة موجودة ومش فارغة
                    if (!role || role === "" || role === "-") {
                        return false
                    }
                    
                    return role.toLowerCase().includes(filterValue.toLowerCase())
                },
            },
            {
                accessorKey: "equivalent_job_name",
                header: () => <div className="text-center">المنصب العسكري المعادل</div>,
                cell: ({ row }) => (
                    <div className="text-center">
                        <span className="text-gray-700 font-medium">{row.getValue("equivalent_job_name") || "-"}</span>
                    </div>
                ),
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true
                    const equivalentRole = row.getValue(columnId)
                    
                    // إذا كان البحث عن القيم الفارغة
                    if (filterValue === "empty") {
                        return !equivalentRole || equivalentRole === "" || equivalentRole === "-"
                    }
                    
                    // للقيم العادية، نتأكد إن القيمة موجودة ومش فارغة
                    if (!equivalentRole || equivalentRole === "" || equivalentRole === "-") {
                        return false
                    }
                    
                    return equivalentRole.toLowerCase().includes(filterValue.toLowerCase())
                },
            },
            {
                accessorKey: "delegation.delegationHead",
                header: () => <div className="text-center">اسم الوفد</div>,
                cell: ({ row }) => {
                    const delegationData = row.original.delegation
                    
                    if (delegationData && delegationData.delegationHead) {
                        const nationality = delegationData.nationality || '-'
                        const displayText = `${nationality} - ${delegationData.delegationHead}`
                        const delegationId = delegationData.id
                        
                        const handleDelegationClick = () => {
                            if (delegationId && delegationData.subEventId) {
                                window.location.href = `/alameen/${delegationData.subEventId}/${delegationId}`
                            }
                        }
                        
                        return (
                            <div className="text-center">
                                <span 
                                    className={`font-medium ${delegationId ? 'text-gray-700 hover:text-gray-900 cursor-pointer' : 'text-gray-700'}`}
                                    onClick={delegationId ? handleDelegationClick : undefined}
                                >
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
                    if (!delegationData || !delegationData.delegationHead) {
                        return false
                    }
                    
                    const nationality = delegationData.nationality || '-'
                    const delegationDisplayName = `${nationality} - ${delegationData.delegationHead}`
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
                    
                    // إذا كان البحث عن القيم الفارغة
                    if (filterValue === "empty") {
                        return !member.subEvent?.mainEventName || member.subEvent?.mainEventName === "" || member.subEvent?.mainEventName === "-"
                    }
                    
                    // للقيم العادية، نتأكد إن القيمة موجودة ومش فارغة
                    if (!member.subEvent?.mainEventName || member.subEvent?.mainEventName === "" || member.subEvent?.mainEventName === "-") {
                        return false
                    }
                    
                    // البحث في الأحداث الحقيقية
                    const searchTerm = filterValue.toLowerCase()
                    const memberMainEvent = member.subEvent.mainEventName.toLowerCase()
                    
                    return memberMainEvent.includes(searchTerm)
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
                    
                    // إذا كان البحث عن القيم الفارغة
                    if (filterValue === "empty") {
                        return !member.subEvent?.name || member.subEvent?.name === "" || member.subEvent?.name === "-"
                    }
                    
                    // للقيم العادية، نتأكد إن القيمة موجودة ومش فارغة
                    if (!member.subEvent?.name || member.subEvent?.name === "" || member.subEvent?.name === "-") {
                        return false
                    }
                    
                    // البحث المباشر في الأسماء
                    const searchTerm = filterValue.toLowerCase()
                    const memberSubEvent = member.subEvent.name.toLowerCase()
                    
                    return memberSubEvent.includes(searchTerm)
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
                    
                    // إذا لم يكن للعضو تاريخ وصول، استخدم تاريخ وصول الوفد من arrivalInfo
                    if (member.delegation && member.delegation.arrivalInfo && member.delegation.arrivalInfo.arrivalDate) {
                        return (
                            <div className="text-center">
                                <span className="text-gray-700">
                                    {new Date(member.delegation.arrivalInfo.arrivalDate).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                        )
                    }
                    
                    // fallback للتاريخ القديم
                    if (member.delegation && member.delegation.arrivalDate) {
                        return (
                            <div className="text-center">
                                <span className="text-gray-700">
                                    {new Date(member.delegation.arrivalDate).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                        )
                    }
                    
                    // إذا لم يوجد أي تاريخ وصول، اعرض "-"
                    return (
                        <div className="text-center">
                            <span className="text-gray-400">-</span>
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
                                    <DeletePopup 
                                        item={row} 
                                        onDelete={async (memberId) => {
                                            try {
                                                await memberService.deleteMember(memberId)
                                                // إطلاق إشارة لإعادة تحميل البيانات
                                                window.dispatchEvent(new CustomEvent('memberDeleted'))
                                            } catch (error) {
                                                throw error // سيتم التعامل مع الخطأ في DeletePopup
                                            }
                                        }}
                                    >
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
