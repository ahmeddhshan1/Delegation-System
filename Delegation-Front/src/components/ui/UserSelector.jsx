import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { userService } from '../../services/api'

const UserSelector = ({ 
    value, 
    onValueChange, 
    placeholder = "اختر مستخدم...", 
    disabled = false,
    className = "",
    showRole = false 
}) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await userService.getUsers()
                const usersList = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : []
                setUsers(usersList.filter(user => user.is_active))
            } catch (err) {
                console.error('خطأ في جلب المستخدمين:', err)
                setError('فشل في جلب المستخدمين')
                setUsers([])
            } finally {
                setLoading(false)
            }
        }

        loadUsers()
    }, [])

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
