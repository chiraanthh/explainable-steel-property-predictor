@echo off
echo =============================================
echo  Explainable Material Property Predictor
echo =============================================
echo.
echo Starting Backend (FastAPI) on port 8080...
start "Backend API" cmd /k "cd /d "%~dp0" && .venv\Scripts\uvicorn.exe backend.app:app --reload --port 8080"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (React) on port 5173...
start "Frontend UI" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =============================================
echo  Both servers starting!
echo  Backend:  http://127.0.0.1:8080
echo  Frontend: http://localhost:5173
echo =============================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:5173
