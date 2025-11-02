@echo off
chcp 65001 >nul
cls
echo ================================================================
echo    Delegation Management System - Run All
echo ================================================================
echo.

echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found
    pause
    exit /b 1
)
echo OK: Python found
echo.

echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)
echo OK: Node.js found
echo.

if not exist "Delegation-Backend" (
    echo ERROR: Delegation-Backend folder not found
    pause
    exit /b 1
)

if not exist "Delegation-Front" (
    echo ERROR: Delegation-Front folder not found
    pause
    exit /b 1
)

if not exist "Delegation-Backend\venv" (
    echo ERROR: Virtual environment not found
    echo Please run install_all.bat first
    pause
    exit /b 1
)

echo [3/4] Checking Django installation...
cd Delegation-Backend
call venv\Scripts\activate.bat
python -c "import django" >nul 2>&1
if %errorlevel% neq 0 (
    echo Django not found. Installing requirements...
    echo This may take a few minutes...
    if exist "requirements.txt" (
        pip install -r requirements.txt --quiet
    ) else (
        cd ..
        if exist "requirements_all.txt" (
            pip install -r requirements_all.txt --quiet
        )
        cd Delegation-Backend
    )
    echo OK: Requirements installed
) else (
    echo OK: Django is installed
)
cd ..
echo.

echo ================================================================
echo    Starting System...
echo ================================================================
echo.

set "ROOT_DIR=%cd%"

echo [4/5] Starting Backend Django server...
start "Backend Server - Django" cmd /k "cd /d "%ROOT_DIR%\Delegation-Backend" && call venv\Scripts\activate.bat && echo Backend running on http://localhost:8000 && echo. && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo [5/5] Starting Frontend React server...
start "Frontend Server - React" cmd /k "cd /d "%ROOT_DIR%\Delegation-Front" && echo Frontend running on http://localhost:5173 && echo. && npm run dev"

echo.
echo ================================================================
echo    System Started Successfully!
echo ================================================================
echo.
echo Access URLs:
echo    - Backend API:   http://localhost:8000/api/
echo    - Django Admin:  http://localhost:8000/admin/
echo    - Frontend:      http://localhost:5173/
echo.
echo Notes:
echo    - Two separate windows will open for Backend and Frontend
echo    - To stop servers: Close windows or press Ctrl+C
echo    - Backend uses Port 8000
echo    - Frontend uses Port 5173
echo.
echo ================================================================

timeout /t 5
exit
