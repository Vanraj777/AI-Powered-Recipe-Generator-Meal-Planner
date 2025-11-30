@echo off
echo Starting AI Recipe Generator...
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "server\.env" (
    echo WARNING: server\.env file not found!
    echo Please create it with your configuration (see SETUP.md)
    echo.
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Starting application...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.

REM Start both servers
start "Recipe Generator - Backend" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "Recipe Generator - Frontend" cmd /k "cd client && npm start"

echo.
echo Application started!
echo Close the terminal windows to stop the servers.
pause

