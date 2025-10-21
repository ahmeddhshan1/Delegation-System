@echo off
echo ========================================
echo    تشغيل Frontend للشبكة المحلية
echo ========================================
echo.

REM التحقق من Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo خطأ: Node.js غير مثبت
    pause
    exit /b 1
)

REM تثبيت المتطلبات إذا لزم الأمر
if not exist "node_modules" (
    echo تثبيت المتطلبات...
    npm install
)

REM تشغيل الخادم
echo.
echo ========================================
echo    Frontend جاهز للاستخدام
echo ========================================
echo.
echo الوصول المحلي: http://localhost:5173
echo الوصول من الشبكة: http://10.10.10.35:5173
echo.
echo اضغط Ctrl+C لإيقاف الخادم
echo.

npm run dev
