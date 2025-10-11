@echo off
echo ========================================
echo    إضافة مستخدم Admin للقاعدة
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
    echo خطأ: البيئة الافتراضية غير موجودة
    echo يرجى تشغيل start_backend.bat أولاً
    pause
    exit /b 1
)

REM تفعيل البيئة الافتراضية
echo تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat

REM تشغيل السكريبت
echo إضافة مستخدم Admin...
python add_admin_user.py

echo.
echo تم الانتهاء!
pause
