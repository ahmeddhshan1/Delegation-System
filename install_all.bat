@echo off
chcp 65001 >nul
cls
echo ================================================================
echo    Delegation Management System - Install All Requirements
echo ================================================================
echo.

echo [1/8] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo OK: Python installed successfully
echo.

echo [2/8] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
node --version
npm --version
echo OK: Node.js installed successfully
echo.

echo ================================================================
echo    Backend Setup
echo ================================================================
echo [3/8] Setting up Backend (Python)...
cd /d "%~dp0"

if exist "Delegation-Backend" (
    cd Delegation-Backend
) else (
    echo ERROR: Delegation-Backend folder not found
    pause
    exit /b 1
)

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo OK: Virtual environment created successfully
) else (
    echo OK: Virtual environment already exists
)

echo Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo Upgrading pip to latest version...
python -m pip install --upgrade pip --quiet
echo.

echo Installing Python packages...
if exist "requirements.txt" (
    echo Installing from Backend requirements.txt...
    pip install -r requirements.txt
) else (
    cd ..
    if exist "requirements_all.txt" (
        echo Installing from root requirements_all.txt...
        pip install -r requirements_all.txt
        cd Delegation-Backend
    ) else if exist "requirements.txt" (
        echo Installing from root requirements.txt...
        pip install -r requirements.txt
        cd Delegation-Backend
    ) else (
        echo ERROR: No requirements.txt or requirements_all.txt found
        pause
        exit /b 1
    )
)

if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python packages
    pause
    exit /b 1
)
echo OK: Python packages installed successfully
echo.

echo ================================================================
echo    Frontend Setup
echo ================================================================
echo [4/8] Setting up Frontend (Node.js)...
cd ..

if exist "Delegation-Front" (
    cd Delegation-Front
) else (
    echo ERROR: Delegation-Front folder not found
    pause
    exit /b 1
)

echo Installing Node.js packages...
if exist "package.json" (
    echo Please wait... This may take a few minutes...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Node.js packages
        pause
        exit /b 1
    )
    echo OK: Node.js packages installed successfully
) else (
    echo WARNING: package.json not found
)
echo.

echo ================================================================
echo    Database Setup
echo ================================================================
echo [5/8] Setting up Database...
cd ..

if exist "Delegation-Backend" (
    cd Delegation-Backend
) else (
    echo ERROR: Delegation-Backend folder not found
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

if not exist ".env" (
    echo Creating .env file...
    (
        echo # Django Settings
        echo SECRET_KEY=django-insecure-5gzz2rq(dx!(!d6_91v!!ddfj1e6vk^zf6y)atq%%h56i7=kr_w
        echo DEBUG=True
        echo ALLOWED_HOSTS=localhost,127.0.0.1,*
        echo.
        echo # Database Settings
        echo DB_NAME=delegation_system
        echo DB_USER=postgres
        echo DB_PASSWORD=722003
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo.
        echo # Redis Settings (Optional)
        echo REDIS_HOST=127.0.0.1
        echo REDIS_PORT=6379
        echo REDIS_DB=1
        echo.
        echo # CORS Settings
        echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
        echo.
        echo # Security Settings
        echo CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000,http://localhost:3000,http://localhost:5173
    ) > .env
    echo OK: .env file created
) else (
    echo OK: .env file already exists
)
echo.

echo Running database migrations...
python manage.py makemigrations --quiet
python manage.py migrate --no-input
if %errorlevel% neq 0 (
    echo WARNING: Database connection issues detected
    echo Please ensure PostgreSQL is running and connection details in .env are correct
)
echo.

echo ================================================================
echo    Create Admin User
echo ================================================================
echo [6/8] Creating Admin User...
if exist "add_admin_user.py" (
    python add_admin_user.py
    echo.
) else (
    echo WARNING: add_admin_user.py not found
    echo You can create an admin user manually using: python manage.py createsuperuser
)
echo.

echo ================================================================
echo    Collect Static Files
echo ================================================================
echo [7/8] Collecting static files...
python manage.py collectstatic --no-input --quiet
echo OK: Static files collected successfully
echo.

echo ================================================================
echo    Installation Summary
echo ================================================================
echo [8/8] Installation completed successfully!
echo.
echo ================================================================
echo    Summary
echo ================================================================
echo.
echo Backend (Python):
echo    - Virtual environment: venv\
echo    - All packages installed
echo    - Database: Configured
echo.
echo Frontend (Node.js):
echo    - All packages installed in node_modules\
echo.
echo ================================================================
echo    How to Run
echo ================================================================
echo.
echo Option 1: Run both servers automatically
echo    run_all.bat
echo.
echo Option 2: Run manually
echo.
echo    Backend:
echo    cd Delegation-Backend
echo    call venv\Scripts\activate.bat
echo    python manage.py runserver
echo.
echo    Frontend:
echo    cd Delegation-Front
echo    npm run dev
echo.
echo ================================================================
echo    Access URLs
echo ================================================================
echo.
echo Backend API:    http://localhost:8000/api/
echo Django Admin:   http://localhost:8000/admin/
echo Frontend:       http://localhost:5173/
echo.
echo ================================================================
echo.

pause

