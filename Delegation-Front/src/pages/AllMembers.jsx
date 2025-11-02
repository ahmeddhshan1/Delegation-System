import { useState, useMemo, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table"
import Icon from '../components/ui/Icon';
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
import { fetchAllMembers, deleteMember, fetchAllDepartureSessions } from '../store/slices/membersSlice'
import { fetchDelegations } from '../store/slices/delegationsSlice'
import { fetchMainEvents } from '../store/slices/eventsSlice'

const AllMembers = () => {
    const dispatch = useDispatch()
    
    // Redux state
    const { members = [], allMembers = [], departureSessions = [] } = useSelector(state => state.members || {})
    const { delegations = [] } = useSelector(state => state.delegations || {})
    const { mainEvents = [] } = useSelector(state => state.events || {})
    
    // Use Redux state directly instead of local state
    const rawData = allMembers.length > 0 ? allMembers : members
    
    
    // Process data for display
    const data = useMemo(() => {
        if (rawData.length === 0) return []
        
        return rawData.map(member => {
            // البحث عن الوفد المرتبط - تحقق من delegation_id أولاً
            let delegation = delegations.find(d => d.id === member.delegation_id)
            
            // إذا لم يوجد، جرب البحث بـ delegation
            if (!delegation) {
                delegation = delegations.find(d => d.id === member.delegation)
            }
            
            // إذا لم يوجد، جرب البحث في members array
            if (!delegation) {
                delegation = delegations.find(d => 
                    d.members && d.members.some(m => m.id === member.id)
                )
            }
            
            
            // البحث عن الحدث الرئيسي المرتبط
            const mainEvent = mainEvents.find(e => e.id === delegation?.main_event_id)
            
            // تحديث حالة المغادرة من API أو من جلسات المغادرة
            let isDeparted = member.status === 'DEPARTED'
            let departureDate = member.departure_date
            
            // إذا لم يكن العضو محدد كمغادر في API، تحقق من جلسات المغادرة
            if (!isDeparted) {
                const memberInDepartureSession = departureSessions.find(session => 
                    session.members && session.members.some(m => 
                        m.id === member.id || 
                        m.id === member.id?.toString() || 
                        m.id?.toString() === member.id?.toString() ||
                        m.member_id === member.id ||
                        m.member_id === member.id?.toString()
                    )
                )
                
                if (memberInDepartureSession) {
                    isDeparted = true
                    departureDate = memberInDepartureSession.checkout_date
                }
            }
            
            return {
                ...member,
                // إضافة بيانات الوفد الكاملة
                delegation: delegation ? {
                    id: delegation.id,
                    delegationHead: delegation.delegationHead || delegation.delegation_leader_name || 'غير محدد',
                    nationality: delegation.nationality || delegation.country || delegation.nationality_name || delegation.country_name || '-',
                    arrive_date: delegation.arrive_date,
                    arrival_date: delegation.arrive_date,
                    arrivalDate: delegation.arrive_date,
                    subEventId: delegation.sub_event_id,
                    main_event_id: delegation.main_event_id,
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
                } : null,
                delegation_name: delegation?.delegationHead || delegation?.delegation_leader_name || 'غير محدد',
                main_event_name: mainEvent?.event_name || 'غير محدد',
                sub_event_name: delegation?.sub_event?.event_name || 'غير محدد',
                // إضافة معلومات إضافية للعرض
                display_name: member.name || 'غير محدد',
                display_nationality: member.nationality?.name || 'غير محدد',
                display_job: member.job || 'غير محدد',
                display_rank: member.rank || 'غير محدد',
                display_phone: member.phone || 'غير محدد',
                display_email: member.email || 'غير محدد',
                display_passport: member.passport_number || 'غير محدد',
                display_status: member.status || 'غير محدد',
                display_created_at: member.created_at ? new Date(member.created_at).toLocaleDateString('ar-EG') : 'غير محدد',
                // إضافة حالة المغادرة وتاريخ المغادرة
                memberStatus: isDeparted ? "departed" : "not_departed",
                departureDate: departureDate,
                // إضافة تاريخ الوصول من الوفد
                arrivalDate: member.arrivalDate || delegation?.arrive_date || null
            }
        })
    }, [rawData, delegations, mainEvents, departureSessions])
    
    // دالة تحديث فوري للبيانات
    const refreshData = useCallback(() => {
        dispatch(fetchAllMembers())
        dispatch(fetchDelegations())
        dispatch(fetchMainEvents())
        
        // إطلاق event للتحديث الفوري
        window.dispatchEvent(new CustomEvent('dataUpdated'))
    }, [dispatch])


    // تحميل البيانات عند تشغيل المكون
    useEffect(() => {
        dispatch(fetchAllMembers())
        dispatch(fetchDelegations())
        dispatch(fetchMainEvents())
        dispatch(fetchAllDepartureSessions())
    }, [dispatch])
    
    
    // تم إزالة auto-refresh - التحديث الفوري كافي

    // الاستماع للتحديثات الفورية - تحديث فوري بدون refresh مع debouncing
    useEffect(() => {
        let debounceTimeout = null
        
        // دالة موحدة للتعامل مع جميع التحديثات مع debouncing
        const handleDataUpdate = () => {
            // Clear previous debounce timeout
            if (debounceTimeout) {
                clearTimeout(debounceTimeout)
            }
            
            // Debounce the update to prevent rapid-fire requests
            debounceTimeout = setTimeout(() => {
                dispatch(fetchAllMembers())
                dispatch(fetchDelegations())
                dispatch(fetchMainEvents())
                dispatch(fetchAllDepartureSessions())
            }, 100) // 100ms debounce - أسرع
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
            'departureSessionAdded',
            'departureSessionUpdated',
            'departureSessionDeleted',
            'localStorageUpdated',
            'dataUpdated',
            'refreshData'
        ]

        // إضافة جميع الـ event listeners
        eventListeners.forEach(eventName => {
            window.addEventListener(eventName, handleDataUpdate)
        })

        // تنظيف الـ event listeners عند إلغاء المكون
        return () => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout)
            }
            eventListeners.forEach(eventName => {
                window.removeEventListener(eventName, handleDataUpdate)
            })
        }
    }, [dispatch]) // استخدام dispatch بدلاً من loadMembers
    
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({
        job: false, // إخفاء عمود الوظيفة افتراضياً
        equivalentRole: true // إظهار عمود المنصب المعادل افتراضياً
    })
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState('')

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
                            statusIcon = "CheckCircle"
                            iconColor = "text-green-600"
                            break
                        case "not_departed":
                            statusIcon = "X"
                            iconColor = "text-red-600"
                            break
                        default:
                            statusIcon = "X"
                            iconColor = "text-red-600"
                    }
                    
                    return (
                        <div className="flex justify-center">
                            <div className="px-1 py-1 rounded-lg text-lg font-medium text-center bg-gray-200 w-fit">
                                <Icon name={statusIcon} size={20} className={iconColor} />
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
                        <span className="text-gray-700 font-medium">{row.getValue("rank") || "-"}</span>
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
                        <span className="text-gray-700 font-medium">{row.getValue("job_title")}</span>
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
                                    <EditMember 
                                        member={row.original}
                                    >
                                        <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                            <Icon name="Edit" size={20} />
                                            <span>تعديل</span>
                                        </DropdownMenuItem>
                                    </EditMember>
                                    <DeletePopup 
                                        item={row} 
                                        onDelete={async (memberId) => {
                                            try {
                                                await dispatch(deleteMember(memberId)).unwrap()
                                                // Redux state will be updated automatically
                                                // إطلاق إشارة لإعادة تحميل البيانات
                                                window.dispatchEvent(new CustomEvent('memberDeleted'))
                                            } catch (error) {
                                                throw error // سيتم التعامل مع الخطأ في DeletePopup
                                            }
                                        }}
                                    >
                                        <DropdownMenuItem variant="destructive" onSelect={e => e.preventDefault()}>
                                            <Icon name="Trash2" size={20} />
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
                        <Icon name="Users" size={28} className="text-blue-600" />
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
                        <Icon name="CheckCircle" size={28} className="text-green-600" />
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
                        <Icon name="X" size={28} className="text-red-600" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className='border p-4 mt-8 border-neutral-300 rounded-2xl bg-white'>
                <AllMembersTableToolbar table={table} data={data} onCleanup={refreshData} />
                <DataTable table={table} columns={columns} clickableRow={false} />
            </div>
            </div>
        </div>
    )
}

export default AllMembers

