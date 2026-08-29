@echo off
cd /d "%~dp0"
where python >nul 2>nul && (python iniciar_demo.py & goto :fin)
where py >nul 2>nul && (py -3 iniciar_demo.py & goto :fin)
echo Necesitas Python 3 instalado (python.org) para iniciar la demo.
pause
:fin
