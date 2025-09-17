@echo off
echo 🐘 Starting PostgreSQL for TeleTabib...
echo.

cd /d "C:\Program Files\PostgreSQL\17\bin"

echo 🔍 Checking if PostgreSQL is already running...
pg_isready -h localhost -p 5432 > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PostgreSQL is already running on localhost:5432
    goto :end
)

echo 🚀 Starting PostgreSQL server...
pg_ctl -D "C:\Program Files\PostgreSQL\17\data" -l "C:\Program Files\PostgreSQL\17\data\server.log" start

echo.
echo ⏳ Waiting for server to start...
timeout /t 3 > nul

pg_isready -h localhost -p 5432 > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PostgreSQL started successfully!
    echo 📊 Database: MedicalApp
    echo 🌐 Host: localhost:5432
    echo 👤 User: postgres
) else (
    echo ❌ Failed to start PostgreSQL
    echo 📋 Check the log file: C:\Program Files\PostgreSQL\17\data\server.log
)

:end
echo.
pause