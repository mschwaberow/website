@echo off
cd /d "%~dp0"

if not exist .git (
    echo [1/4] Initializing Git repository...
    git init
    git checkout -b master
    git remote add origin https://github.com/mschwaberow/website.git
)

echo [2/4] Staging files...
git add .

echo [3/4] Committing changes...
git commit -m "Automated website deployment"

echo [4/4] Pushing to GitHub...
git push -u origin master --force

echo.
echo =======================================
echo Deployment successful! kinstay.com will update in a minute.
echo =======================================
echo.
pause
