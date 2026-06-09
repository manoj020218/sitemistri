@echo off
:: ─────────────────────────────────────────────────────────────────
:: SiteMitra — Deploy Script
:: VPS: 154.61.69.200  |  User: root  |  Pass: YOUR_VPS_PASSWORD_HERE
:: PuTTY tools: plink.exe + pscp.exe (C:\Program Files\PuTTY\)
:: ─────────────────────────────────────────────────────────────────

SET VPS=root@154.61.69.200
SET PASS=YOUR_VPS_PASSWORD_HERE
SET PLINK="C:\Program Files\PuTTY\plink.exe"
SET PSCP="C:\Program Files\PuTTY\pscp.exe"
SET WEB_ROOT=/root/projects/SiteMitra/web
SET FRONTEND=D:\IOT Device\SiteMistri\SiteMitra\sitework\frontend
SET STATIC=D:\IOT Device\SiteMistri\SiteMitra\sitemitra-web

IF "%1"=="" GOTO HELP

:: ── deploy-frontend ───────────────────────────────────────────────
IF "%1"=="frontend" (
    echo [1/3] Building React app...
    cd /d "%FRONTEND%"
    pnpm run build
    IF ERRORLEVEL 1 ( echo BUILD FAILED & EXIT /B 1 )

    echo [2/3] Uploading dist to VPS...
    %PSCP% -pw "%PASS%" -r "%FRONTEND%\dist\*" %VPS%:%WEB_ROOT%/

    echo [3/3] Re-uploading /join page (build may have overwritten it)...
    %PSCP% -pw "%PASS%" -P 22 "%STATIC%\join\index.html" %VPS%:%WEB_ROOT%/join/index.html

    echo DONE. Visit https://sitemitra.iotsoft.in
    GOTO END
)

:: ── deploy-dist (skip build, just upload existing dist/) ─────────
IF "%1"=="dist" (
    echo Uploading existing dist/ to VPS...
    %PSCP% -pw "%PASS%" -r "%FRONTEND%\dist\*" %VPS%:%WEB_ROOT%/
    echo Re-uploading /join...
    %PSCP% -pw "%PASS%" -P 22 "%STATIC%\join\index.html" %VPS%:%WEB_ROOT%/join/index.html
    echo DONE.
    GOTO END
)

:: ── deploy-landing ────────────────────────────────────────────────
IF "%1"=="landing" (
    echo Uploading landing page to VPS...
    %PSCP% -pw "%PASS%" -P 22 "%STATIC%\index.html" %VPS%:%WEB_ROOT%/landing/index.html
    echo DONE.
    GOTO END
)

:: ── deploy-backend ────────────────────────────────────────────────
IF "%1"=="backend" (
    echo Uploading backend src/ to VPS...
    %PSCP% -pw "%PASS%" -r "D:\IOT Device\SiteMistri\SiteMitra\sitework\backend\src\*" %VPS%:/root/projects/SiteMitra/backend/src/
    echo Restarting PM2...
    %PLINK% -pw "%PASS%" -batch %VPS% "pm2 restart sitemitra-api"
    echo DONE.
    GOTO END
)

:: ── restart ───────────────────────────────────────────────────────
IF "%1"=="restart" (
    %PLINK% -pw "%PASS%" -batch %VPS% "pm2 restart sitemitra-api"
    GOTO END
)

:: ── logs ─────────────────────────────────────────────────────────
IF "%1"=="logs" (
    %PLINK% -pw "%PASS%" -batch %VPS% "pm2 logs sitemitra-api --lines 80 --nostream"
    GOTO END
)

:: ── ssh ───────────────────────────────────────────────────────────
IF "%1"=="ssh" (
    "C:\Program Files\PuTTY\putty.exe" -pw "%PASS%" %VPS%
    GOTO END
)

:: ── status ────────────────────────────────────────────────────────
IF "%1"=="status" (
    %PLINK% -pw "%PASS%" -batch %VPS% "pm2 status && echo --- && df -h / && echo --- && free -m"
    GOTO END
)

:HELP
echo.
echo  Usage:  deploy.bat [command]
echo.
echo  Commands:
echo    frontend    — build + upload React app + re-upload /join page
echo    dist        — upload existing dist/ only (skip build)
echo    landing     — upload sitemitra-web/index.html to /landing/
echo    backend     — upload backend src/ + restart PM2
echo    restart     — restart PM2 process only
echo    logs        — tail last 80 lines of PM2 logs
echo    ssh         — open PuTTY SSH session
echo    status      — PM2 status + disk + memory
echo.
echo  VPS: 154.61.69.200  ^|  Web root: %WEB_ROOT%
echo.

:END
