@echo off
setlocal enabledelayedexpansion

REM Football Field Management System - Windows Startup Script
REM This script provides a simple interface to start the application

REM Check for help flag first
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

REM Print header
call :print_header "Football Field Management System"

REM Check prerequisites
call :check_nodejs

REM Install dependencies
call :install_dependencies

REM Handle different startup options
if "%1"=="--reset-db" (
    call :print_status "Resetting database and starting application..."
    npm run db:reset && npm start
) else if "%1"=="--backend-only" (
    call :print_status "Starting backend only..."
    npm run start:backend
) else if "%1"=="--frontend-only" (
    call :print_status "Starting frontend only..."
    npm run start:frontend
) else (
    call :print_status "Starting application..."
    npm start
)

goto end

REM Function to print header
:print_header
echo ========================================
echo   %~1
echo ========================================
goto :eof

REM Function to print status messages
:print_status
echo [INFO] %~1
goto :eof

REM Function to print success messages
:print_success
echo [SUCCESS] %~1
goto :eof

REM Function to print error messages
:print_error
echo [ERROR] %~1
goto :eof

REM Function to check Node.js installation
:check_nodejs
node --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Node.js is not installed. Please install Node.js first."
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    call :print_error "npm is not installed. Please install npm first."
    pause
    exit /b 1
)

call :print_success "Node.js and npm are installed"
goto :eof

REM Function to install dependencies
:install_dependencies
call :print_status "Checking dependencies..."

REM Install root dependencies if node_modules doesn't exist
if not exist node_modules (
    call :print_status "Installing root dependencies..."
    npm install
)

REM Install backend dependencies if they don't exist
if not exist backend\node_modules (
    call :print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
)

REM Install frontend dependencies if they don't exist
if not exist frontend\node_modules (
    call :print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
)

call :print_success "Dependencies ready!"
goto :eof

REM Show usage information
:show_help
echo Football Field Management System - Windows Startup Script
echo.
echo Usage: app.bat [options]
echo.
echo Options:
echo   --reset-db      Reset database before starting
echo   --backend-only  Start only backend server
echo   --frontend-only Start only frontend server
echo   --help          Show this help message
echo.
echo Examples:
echo   app.bat                    # Normal startup
echo   app.bat --reset-db         # Reset DB and start
echo   app.bat --backend-only     # Start backend only
echo.
pause
exit /b 0

:end
pause