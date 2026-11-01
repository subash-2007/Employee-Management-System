@echo off
echo Starting Auspify Technologies EMS Backend on port 8005...
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8005 --reload
pause
