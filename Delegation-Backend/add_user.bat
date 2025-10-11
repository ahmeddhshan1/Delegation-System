@echo off
echo ========================================
echo    Adding New User to System
echo ========================================

cd /d "C:\Users\ahmed\OneDrive\Desktop\najibe\Delegation-System\Delegation-Backend"

echo.
echo Activating virtual environment...
call .\venv\Scripts\activate

echo.
echo Adding user...
python add_user_simple.py

echo.
echo ========================================
echo    User Addition Complete
echo ========================================
echo.
echo You can now login with:
echo   Username: ahmed
echo   Password: Ahmed123!@#
echo.
echo Django Admin: http://localhost:8000/admin
echo Frontend: http://localhost:5173/login
echo.
echo Press any key to close...
pause >nul
