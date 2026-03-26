@echo off
echo Starting Confessly...
echo.
echo If you see errors, make sure:
echo 1. MongoDB is running (mongod)
echo 2. Node.js is installed
echo.
echo Opening PowerShell to run start script...
powershell -NoExit -Command "& 'R:\confessly\start-all.ps1'"
