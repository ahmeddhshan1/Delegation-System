@echo off
echo ========================================
echo    تشغيل نظام إدارة الوفود
echo ========================================
echo.

echo بدء تشغيل النظام...
echo.

REM تشغيل Backend
echo [1/2] تشغيل Backend...
start "Django Backend" cmd /k "cd /d Delegation-Backend && start_lan_fixed.bat"

REM انتظار قليل
timeout /t 3 /nobreak >nul

REM تشغيل Frontend
echo [2/2] تشغيل Frontend...
start "React Frontend" cmd /k "cd /d Delegation-Front && start_lan_fixed.bat"

echo.
echo ========================================
echo    النظام جاهز للاستخدام
echo ========================================
echo.
echo الوصول المحلي:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   Admin:    http://localhost:8000/admin
echo.
echo الوصول من الشبكة:
echo   Frontend: http://10.10.10.35:5173
echo   Backend:  http://10.10.10.35:8000
echo   Admin:    http://10.10.10.35:8000/admin
echo.
echo اضغط أي مفتاح للخروج...
pause >nul
