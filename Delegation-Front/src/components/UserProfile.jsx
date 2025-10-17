import { Icon } from '@iconify/react/dist/iconify.js'
import { NavLink, useNavigate } from 'react-router'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/Auth/AuthProvider"
import { toast } from "sonner"
import { authService } from "@/services/auth"

const UserProfile = () => {
    const navigate = useNavigate()
    const { user: currentUser, logout } = useAuth()
    
    const handleLogout = async () => {
        try {
            await logout()
            toast.success("تم تسجيل الخروج بنجاح")
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error("حدث خطأ في تسجيل الخروج")
            // حتى لو فشل الطلب، نوجه المستخدم لصفحة تسجيل الدخول
            navigate('/login')
        }
    }

    const handleOpenAdminDashboard = () => {
        try {
            const adminUrl = localStorage.getItem('adminUrl')
            if (adminUrl) {
                // فتح في نفس التبويب
                window.location.href = `http://localhost:8000${adminUrl}`
            } else {
                toast.error("Admin session not found. Please login again.")
            }
        } catch (error) {
            console.error('Failed to open admin dashboard:', error)
            toast.error(error.message || "حدث خطأ في فتح لوحة التحكم")
        }
    }
    return (
        <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className='rounded-lg !ring-0 transition-all ease-out flex items-center gap-2 cursor-pointer p-1.5 px-4 h-full data-[state=open]:bg-neutral-100'>
                    <Avatar className="size-8 grid place-items-center">
                        <AvatarImage src="/images/star.svg" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col items-start capitalize'>
                        <span className='text-sm text-neutral-950'>
                            {currentUser?.full_name || 'المستخدم'}
                        </span>
                        <span className='text-xs text-neutral-500'>
                            {currentUser?.role === 'SUPER_ADMIN' ? 'مدير النظام' : 
                             currentUser?.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" >
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <NavLink to='/'>
                        <DropdownMenuItem>
                            <Icon icon="solar:user-linear" />
                            <span>الملف الشخصي</span>
                        </DropdownMenuItem>
                    </NavLink>
                    {/* زر إعدادات النظام - يفتح Django Admin للـ Super Admin أو صفحة عادية للآخرين */}
                    {currentUser?.is_super_admin && authService.hasAdminSession() ? (
                        <DropdownMenuItem onClick={handleOpenAdminDashboard}>
                            <Icon icon="material-symbols:admin-panel-settings-outline" />
                            <span>إعدادات النظام</span>
                        </DropdownMenuItem>
                    ) : (
                        <NavLink to='/'>
                            <DropdownMenuItem>
                                <Icon icon="material-symbols:settings-outline-rounded" />
                                <span>إعدادات النظام</span>
                            </DropdownMenuItem>
                        </NavLink>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <Icon icon="solar:logout-outline" />
                    <span>تسجيل خروج</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserProfile