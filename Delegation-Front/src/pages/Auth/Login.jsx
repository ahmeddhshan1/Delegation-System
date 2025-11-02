import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { useDispatch } from "react-redux"
import Icon from '../../components/ui/Icon';
import { NavLink, useNavigate, useLocation } from "react-router"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/Auth/AuthProvider"
import { authService } from "@/plugins/auth"


const Login = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    
    // الحصول على الصفحة المطلوبة للعودة إليها
    const from = location.state?.from?.pathname || "/"

    const validationSchema = yup.object({
        username: yup.string().required("هذا الحقل لا يجب ان يكون فارغا"),
        password: yup.string().required("هذا الحقل لا يجب ان يكون فارغا")
    })

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    const onSubmit = handleSubmit(async (data) => {
        setLoading(true)
        setError("")
        
        try {
            const response = await login({ ...data, rememberMe })
            
            // التحقق من نجاح تسجيل الدخول
            if (response.success) {
                // التحقق من دور المستخدم
                if (response.user.is_super_admin) {
                    // توجيه Super Admin مباشرة إلى Django Admin
                    try {
                        const adminUrl = localStorage.getItem('adminUrl')
                        if (adminUrl) {
                        // توجيه مباشر إلى Django Admin
                        const adminBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                            ? 'http://localhost:8000' 
                            : `http://${window.location.hostname}:8000`
                        window.location.href = `${adminBaseUrl}${adminUrl}`
                        } else {
                            // إذا لم يتم إنشاء admin session، توجيه للصفحة الرئيسية
                            navigate(from, { replace: true })
                        }
                    } catch (adminError) {
                        console.error('Failed to redirect to Django Admin:', adminError)
                        // حتى لو فشل، نوجه إلى الصفحة الرئيسية
                        navigate(from, { replace: true })
                    }
                } else {
                    // العودة إلى الصفحة المطلوبة أو الصفحة الرئيسية للمستخدمين العاديين
                    navigate(from, { replace: true })
                }
            }
        } catch (error) {
            console.error("Login error:", error)
            setError(error.message || "حدث خطأ في تسجيل الدخول")
        } finally {
            setLoading(false)
        }
    })
    return (
        <div className='login-page bg-white w-1/4 flex flex-col gap-2 p-8 px-12 justify-center'>
            <div className="mx-auto mb-2">
                <img src="/images/logo.png" className="w-46" alt="Logo Image" />
            </div>

            <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
                <div className="flex flex-col items-center gap-2 text-center mb-4">
                    <h1 className="font-bold text-2xl">تسجيل الدخول</h1>
                    <p>
                        منظومة تسجيل الوفود و الاعضاء لمعرض ايديكس
                    </p>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full">
                            {error}
                        </div>
                    )}
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        placeholder="ادخل اسم المستخدم" 
                        {...register('username')} 
                        className="h-10 w-full px-4 rounded-lg border border-neutral-300 transition-all ease-out focus:border-primary-600"
                    />
                    {errors.username && <span className="text-sm text-rose-400 block">{errors.username.message}</span>}
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="password">كلمة السر</Label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            id="password" 
                            name="password" 
                            placeholder="ادخل كلمة السر" 
                            {...register('password')} 
                            className="h-10 w-full pr-4 pl-10 rounded-lg border border-neutral-300 transition-all ease-out focus:border-primary-600"
                        />
                        <button 
                            type="button" 
                            className="absolute inset-y-0 left-0 px-3 text-gray-600 hover:text-gray-900"
                            onClick={() => setShowPassword(prev => !prev)}
                            aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                        >
                            <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
                        </button>
                    </div>
                    {errors.password && <span className="text-sm text-rose-400 block">{errors.password.message}</span>}
                </div>
                <div className="flex items-center gap-2 justify-between">
                    <NavLink to={'/'} className='hover:underline'>نسيت كلمة المرور؟</NavLink>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={(val) => setRememberMe(!!val)} />
                        <Label htmlFor="rememberMe">تذكرني</Label>
                    </div>
                </div>
                <Button disabled={loading} type="submit" className="cursor-pointer mt-4" onClick={onSubmit}>
                    {
                        loading
                            ?
                            <>
                                <Icon name="RefreshCw" size={20} className="animate-spin" />
                                <span>تحميل ...</span>
                            </>
                            :
                            <span>تسجيل دخول</span>
                    }
                </Button>
            </form>
        </div>
    )
}

export default Login
