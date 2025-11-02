import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector, useDispatch } from 'react-redux'
import { fetchUsers } from '../../store/slices/usersSlice'

const UserSelector = ({ 
    value, 
    onValueChange, 
    placeholder = "اختر مستخدم...", 
    disabled = false,
    className = "",
    showRole = false 
}) => {
    const dispatch = useDispatch()
    const { users: allUsers, loading, error } = useSelector(state => state.users)
    
    // Filter active users only
    const users = allUsers.filter(user => user.is_active)

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    if (loading) {
        return (
            <Select disabled>
                <SelectTrigger className={className}>
                    <SelectValue placeholder="جاري التحميل..." />
                </SelectTrigger>
            </Select>
        )
    }

    if (error) {
        return (
            <Select disabled>
                <SelectTrigger className={className}>
                    <SelectValue placeholder="خطأ في التحميل" />
                </SelectTrigger>
            </Select>
        )
    }

    return (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {users.length === 0 ? (
                    <SelectItem value="" disabled>
                        لا توجد مستخدمين متاحين
                    </SelectItem>
                ) : (
                    users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                            {showRole ? `${user.full_name} (${user.role})` : user.full_name}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    )
}

export default UserSelector
