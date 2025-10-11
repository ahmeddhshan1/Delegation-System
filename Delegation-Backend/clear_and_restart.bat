@echo off
echo ========================================
echo    Clear Ahmed User and Restart Server
echo ========================================

cd /d "C:\Users\ahmed\OneDrive\Desktop\najibe\Delegation-System\Delegation-Backend"

echo.
echo Activating virtual environment...
call .\venv\Scripts\activate

echo.
echo Deleting all ahmed users...
python delete_ahmed_user.py

echo.
echo Starting Django server...
start cmd /k "python manage.py runserver 127.0.0.1:8000"

echo.
echo ========================================
echo    Ready to Create New User
echo ========================================
echo.
echo Django Admin is now ready!
echo.
echo To create a new user with username 'ahmed':
echo 1. Go to: http://localhost:8000/admin
echo 2. Login with: najibe / 722003
echo 3. Go to: Accounts > Users > Add user
echo 4. Username: ahmed
echo 5. Password: Test123!@#
echo 6. Fill other fields and save
echo.
echo The username 'ahmed' is now available!
echo.
pause
