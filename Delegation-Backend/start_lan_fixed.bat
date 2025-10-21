@echo off
echo ========================================
echo    تشغيل خادم Django للشبكة المحلية (LAN)
echo ========================================
echo.

REM تفعيل البيئة الافتراضية
echo تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat

REM تثبيت psycopg2-binary إذا لم يكن مثبت
echo التحقق من psycopg2-binary...
venv\Scripts\python.exe -c "import psycopg2" 2>nul || (
    echo تثبيت psycopg2-binary...
    venv\Scripts\python.exe -m pip install psycopg2-binary
)

REM تشغيل الخادم
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

venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000

pause
