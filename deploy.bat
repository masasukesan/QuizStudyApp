@echo off
cd /d "%~dp0"

echo === Deploy QuizStudyApp ===
echo.

if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock"  del /f ".git\HEAD.lock"

git add -A
git status --short

set /p MSG="Commit message (Enter to skip): "
if "%MSG%"=="" set MSG=update

git commit -m "%MSG%"
git push

echo.
echo Done! https://quiz-study-app-omega.vercel.app
echo.
pause
