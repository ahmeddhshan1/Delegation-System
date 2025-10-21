@echo off
echo ========================================
echo    تشغيل خادم Django للشبكة المحلية
echo ========================================
echo.

REM تفعيل البيئة الافتراضية
call venv\Scripts\activate.bat

REM التحقق من psycopg2-binary
venv\Scripts\python.exe -c "import psycopg2" 2>nul || (
    echo تثبيت psycopg2-binary...
    venv\Scripts\python.exe -m pip install psycopg2-binary
)

REM جمع الـ static files
echo جمع الـ static files...
venv\Scripts\python.exe manage.py collectstatic --noinput

REM تشغيل الخادم
echo.
echo ========================================
echo    الخادم جاهز للاستخدام
echo ========================================
echo.
echo الوصول المحلي: http://localhost:8000
echo الوصول من الشبكة: http://10.10.10.35:8000
echo.
echo اضغط Ctrl+C لإيقاف الخادم
echo.

venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
