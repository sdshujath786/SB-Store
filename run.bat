@echo off
echo Starting SB Store Server...
echo.
echo Server will run at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
pause