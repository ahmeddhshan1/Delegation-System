import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { useDispatch } from "react-redux"
import { Icon } from "@iconify/react/dist/iconify.js"
import { NavLink, useNavigate } from "react-router"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { authService } from "@/services/auth"


const Login = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

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
            const response = await authService.login(data)

            
            // Check if user is Super Admin
            if (response.user.role === 'super_admin') {
                // Redirect to Django Admin
                window.location.href = 'http://localhost:8000/admin/'
            } else {
                // Redirect to normal dashboard
                navigate("/")
            }
        } catch (error) {
            console.error("Login error:", error)
            setError(error.detail || "حدث خطأ في تسجيل الدخول")
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
                    <input type="text" id="username" name="username" placeholder="ادخل اسم المستخدم" {...register('username')} />
                    {errors.username && <span className="text-sm text-rose-400 block">{errors.username.message}</span>}
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="password">كلمة السر</Label>
                    <input type="password" id="password" name="password" placeholder="ادخل كلمة السر" {...register('password')} />
                    {errors.password && <span className="text-sm text-rose-400 block">{errors.password.message}</span>}
                </div>
                <div className="flex items-center gap-2 justify-between">
                    <NavLink to={'/'} className='hover:underline'>نسيت كلمة المرور؟</NavLink>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <Label htmlFor="terms">تذكرني</Label>
                    </div>
                </div>
                <Button disabled={loading} type="submit" className="cursor-pointer mt-4" onClick={onSubmit}>
                    {
                        loading
                            ?
                            <>
                                <Icon icon="jam:refresh" className="animate-spin" />
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
