@echo off
echo ========================================
echo    Django Admin User Creation Fix
echo ========================================

cd /d "C:\Users\ahmed\OneDrive\Desktop\najibe\Delegation-System\Delegation-Backend"

echo.
echo Activating virtual environment...
call .\venv\Scripts\activate

echo.
echo Checking current users...
python list_all_users.py

echo.
echo ========================================
echo    SOLUTION
echo ========================================
echo.
echo The issue is that you're trying to add a user with username 'ahmed'
echo but there might be a conflict or validation issue.
echo.
echo To add a new user in Django Admin:
echo 1. Go to: http://localhost:8000/admin/accounts/user/add/
echo 2. Use one of these available usernames:
echo    - ahmed (should work now)
echo    - ahmed_new
echo    - test_user
echo    - user123
echo.
echo 3. Use a strong password like: Test123!@#
echo 4. Set role to USER or ADMIN as needed
echo.
echo Current users in system:
echo    - najibe (Super Admin)
echo    - ahmed_user (Regular User)
echo.
echo Press any key to close...
pause >nul
