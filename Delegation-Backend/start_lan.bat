@echo off
echo ========================================
echo    تشغيل خادم Django للشبكة المحلية (LAN)
echo ========================================
echo.

REM التحقق من وجود Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo خطأ: Python غير مثبت أو غير موجود في PATH
    pause
    exit /b 1
)

REM الانتقال إلى مجلد Backend
cd /d "%~dp0"

REM التحقق من وجود البيئة الافتراضية
if not exist "venv" (
    echo إنشاء البيئة الافتراضية...
    python -m venv venv
)

REM تفعيل البيئة الافتراضية
echo تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat

REM تثبيت المتطلبات الأساسية فقط
echo تثبيت المتطلبات الأساسية...
pip install Django==5.2.7 djangorestframework==3.15.2 python-decouple==3.8 django-cors-headers==4.3.1

REM إنشاء ملف .env للشبكة المحلية إذا لم يكن موجوداً
if not exist ".env" (
    echo إنشاء ملف .env للشبكة المحلية...
    echo # Django Settings for LAN Deployment > .env
    echo SECRET_KEY=django-insecure-5gzz2rq(dx!(!d6_91v!!ddfj1e6vk^zf6y)atq%%h56i7=kr_w >> .env
    echo DEBUG=True >> .env
    echo. >> .env
    echo # Allow LAN access >> .env
    echo ALLOWED_HOSTS=localhost,127.0.0.1,testserver,10.10.10.35 >> .env
    echo. >> .env
    echo # Database Settings >> .env
    echo DB_NAME=delegation_system >> .env
    echo DB_USER=postgres >> .env
    echo DB_PASSWORD=722003 >> .env
    echo DB_HOST=localhost >> .env
    echo DB_PORT=5432 >> .env
    echo. >> .env
    echo # CORS Settings for LAN >> .env
    echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://10.10.10.35:3000,http://10.10.10.35:5173 >> .env
    echo. >> .env
    echo # Security Settings for LAN >> .env
    echo CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000,http://localhost:3000,http://localhost:5173,http://10.10.10.35:8000,http://10.10.10.35:3000,http://10.10.10.35:5173 >> .env
)

REM تشغيل migrations (تخطي إذا فشل)
echo تشغيل migrations...
python manage.py makemigrations || echo تحذير: فشل في makemigrations
python manage.py migrate || echo تحذير: فشل في migrate

REM تشغيل الخادم على جميع الواجهات للشبكة المحلية
echo.
echo ========================================
echo    تشغيل خادم Django للشبكة المحلية
echo ========================================
echo.
echo يمكن الوصول للخادم عبر:
echo   - المحلي: http://localhost:8000
echo   - الشبكة المحلية: http://10.10.10.35:8000
echo.
echo يمكن الوصول للـ Admin عبر:
echo   - المحلي: http://localhost:8000/admin
echo   - الشبكة المحلية: http://10.10.10.35:8000/admin
echo.
echo يمكن الوصول للـ API عبر:
echo   - المحلي: http://localhost:8000/api
echo   - الشبكة المحلية: http://10.10.10.35:8000/api
echo.
echo الأجهزة الأخرى على نفس الشبكة يمكنها الوصول عبر:
echo   http://10.10.10.35:8000
echo.
echo اضغط Ctrl+C لإيقاف الخادم
echo.

python manage.py runserver 0.0.0.0:8000

pause

