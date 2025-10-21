@echo off
echo ========================================
echo    تشغيل خادم Django للشبكة المحلية
echo ========================================
echo.

REM تفعيل البيئة الافتراضية
call venv\Scripts\activate.bat

REM تشغيل الخادم
echo تشغيل الخادم...
python manage.py runserver 0.0.0.0:8000

pause
