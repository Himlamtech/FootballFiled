@echo off
echo ===================================================
echo    Football Field Management System Startup
echo ===================================================
echo.

REM Check if .env file exists, create it if not
IF NOT EXIST .env (
  echo Creating .env file...
  (
    echo PORT=9002
    echo NODE_ENV=development
    echo DB_HOST=localhost
    echo DB_PORT=3306
    echo DB_NAME=FootballField
    echo DB_USER=root
    echo DB_PASSWORD=Himlam04@
    echo JWT_SECRET=football_field_management_jwt_secret_key
    echo JWT_EXPIRES_IN=24h
    echo CORS_ORIGIN=http://localhost:9001
  ) > .env
  echo .env file created. Please update with your database credentials if needed.
  echo.
)

REM Install dependencies if node_modules doesn't exist
IF NOT EXIST node_modules (
  echo Installing backend dependencies...
  call npm install
  echo.
)

REM Check if frontend dependencies are installed
IF NOT EXIST frontend\node_modules (
  echo Installing frontend dependencies...
  cd frontend && call npm install && cd ..
  echo.
)

REM Initialize database
echo Initializing database...
IF EXIST backend\database\.db_initialized (
  echo Database already initialized. To reinitialize, delete the file:
  echo backend\database\.db_initialized
  echo.

  SET /P ANSWER="Do you want to reinitialize the database? (y/n): "
  IF /I "%ANSWER%"=="y" (
    echo Removing database flag file...
    del /f backend\database\.db_initialized
    echo Running database initialization script...
    cd backend\database && node init-database.js
    IF %ERRORLEVEL% NEQ 0 (
      echo Database initialization failed. Please check the error messages above.
      exit /b 1
    )
    cd ..\..
    echo.
  )
) ELSE (
  echo Running database initialization script...
  cd backend\database && node init-database.js
  IF %ERRORLEVEL% NEQ 0 (
    echo Database initialization failed. Please check the error messages above.
    exit /b 1
  )
  cd ..\..
  echo.
)

echo Starting backend server...
start cmd /k "title Football Field Backend && cd backend && npm run dev"

echo Starting frontend server...
start cmd /k "title Football Field Frontend && cd frontend && npm start"

echo.
echo ===================================================
echo    Football Field Management System is running!
echo ===================================================
echo.
echo Backend: http://localhost:9002
echo Frontend: http://localhost:9001
echo.
echo Admin credentials:
echo Username: admin
echo Password: admin
echo.
echo Please close the terminal windows manually when you're done.
echo Press any key to exit this window...