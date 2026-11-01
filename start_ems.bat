@echo off
title Auspify Technologies - Employee Management System (EMS)
echo ==============================================================
echo     AUSPIFY TECHNOLOGIES - EMPLOYEE MANAGEMENT SYSTEM (EMS)
echo ==============================================================
echo.
echo Starting Backend (FastAPI on http://127.0.0.1:8005)...
start "Auspify EMS Backend" cmd /c "run_backend.bat"

echo Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo Starting Frontend (React + Vite on http://localhost:5175)...
start "Auspify EMS Frontend" cmd /c "run_frontend.bat"

echo.
echo ==============================================================
echo   Services are booting up!
echo   * Web App:       http://localhost:5175/
echo   * Swagger Docs:  http://127.0.0.1:8005/docs
echo ==============================================================
pause
