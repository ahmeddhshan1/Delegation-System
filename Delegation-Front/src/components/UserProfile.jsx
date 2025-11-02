import Icon from './ui/Icon';
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
import { authService } from "@/plugins/auth"
import { useSelector } from 'react-redux'

const UserProfile = () => {
    const navigate = useNavigate()
    const { user: currentUser, logout } = useAuth()
    const { userRole, token, isAuthenticated } = useSelector(state => state.auth || {})
    
    
    const handleLogout = async () => {
        try {
            await logout()
            toast.success("تم تسجيل الخروج بنجاح")
            navigate('/login')
        } catch (error) {
            toast.error("حدث خطأ في تسجيل الخروج")
            // حتى لو فشل الطلب، نوجه المستخدم لصفحة تسجيل الدخول
            navigate('/login')
        }
    }

    const handleOpenAdminDashboard = () => {
        try {
            // تحديد URL الإدارة بناءً على البيئة
            const adminBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:8000/' 
                : `http://${window.location.hostname}:8000/`
            
            const adminUrl = `${adminBaseUrl}admin/`
            window.location.href = adminUrl
        } catch (error) {
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
                            <Icon name="User" size={20} />
                            <span>الملف الشخصي</span>
                        </DropdownMenuItem>
                    </NavLink>
                    {/* زر إعدادات النظام - للـ ADMIN و SUPER_ADMIN */}
                    {((currentUser?.is_super_admin && userRole === 'SUPER_ADMIN') || 
                      (currentUser?.role === 'ADMIN' && userRole === 'ADMIN')) && isAuthenticated && (
                        <DropdownMenuItem onClick={handleOpenAdminDashboard}>
                            <Icon name="Settings" size={20} />
                            <span>إعدادات النظام</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <Icon name="LogOut" size={20} />
                    <span>تسجيل خروج</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserProfile