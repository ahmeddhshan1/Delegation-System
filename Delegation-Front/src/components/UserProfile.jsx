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

const UserProfile = () => {
    const navigate = useNavigate()
    const handleLogout = () => navigate('/login')
    return (
        <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className='rounded-lg !ring-0 transition-all ease-out flex items-center gap-2 cursor-pointer p-1.5 px-4 h-full data-[state=open]:bg-neutral-100'>
                    <Avatar className="size-8 grid place-items-center">
                        <AvatarImage src="/images/star.svg" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col items-start capitalize'>
                        <span className='text-sm text-neutral-950'>الرائد / احمد عبدالرحمن</span>
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
                    <NavLink to='/'>
                        <DropdownMenuItem>
                            <Icon icon="material-symbols:settings-outline-rounded" />
                            <span>إعدادات النظام</span>
                        </DropdownMenuItem>
                    </NavLink>
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