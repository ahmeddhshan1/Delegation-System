@echo off
echo ========================================
echo    تشغيل Frontend للشبكة المحلية (LAN)
echo ========================================
echo.

REM التحقق من وجود Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo خطأ: Node.js غير مثبت أو غير موجود في PATH
    pause
    exit /b 1
)

REM التحقق من وجود node_modules
if not exist "node_modules" (
    echo تثبيت المتطلبات...
    npm install
)

REM تشغيل خادم التطوير للشبكة المحلية
echo.
echo ========================================
echo    تشغيل Frontend للشبكة المحلية
echo ========================================
echo.
echo يمكن الوصول للتطبيق عبر:
echo   - المحلي: http://localhost:5173
echo   - الشبكة المحلية: http://10.10.10.35:5173
echo.
echo الأجهزة الأخرى على نفس الشبكة يمكنها الوصول عبر:
echo   http://10.10.10.35:5173
echo.
echo تأكد من تشغيل Backend أولاً عبر start_lan_fixed.bat
echo.
echo اضغط Ctrl+C لإيقاف الخادم
echo.

npm run dev

pause
