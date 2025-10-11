@echo off
chcp 65001 >nul
title إنشاء مستخدم SUPER_ADMIN - نظام إدارة الوفود

echo.
echo ========================================
echo    نظام إدارة الوفود - SUPER_ADMIN
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ لم يتم العثور على البيئة الافتراضية
    echo يرجى التأكد من وجود مجلد venv في نفس المجلد
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 تفعيل البيئة الافتراضية...
call venv\Scripts\activate.bat

REM Check if Django is installed
python -c "import django" 2>nul
if errorlevel 1 (
    echo ❌ Django غير مثبت
    echo يرجى تثبيت المتطلبات أولاً: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Run the super admin creation script
echo.
echo 🚀 تشغيل سكريبت إنشاء SUPER_ADMIN...
echo.
python create_super_admin.py

echo.
echo ✅ تم الانتهاء من العملية
pause
