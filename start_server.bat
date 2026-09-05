@echo off
title Zero Biryani - Restaurant Web Server & Database
echo ===================================================
echo   ZERO BIRYANI - RESTAURANT ENGINE & DATABASE
echo ===================================================
echo Starting SQLite database and local web server...
echo Access in your browser: http://localhost:8000
echo Press Ctrl+C to stop the server at any time.
echo ---------------------------------------------------
start "" http://localhost:8000
python server.py
pause
