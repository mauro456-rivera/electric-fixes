@echo off
echo ====================================
echo DESPLEGANDO REGLAS DE FIRESTORE
echo ====================================
echo.

REM Verificar si Firebase CLI esta instalado
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Firebase CLI no esta instalado
    echo.
    echo Por favor instala Firebase CLI:
    echo npm install -g firebase-tools
    echo.
    echo O usa la consola web de Firebase:
    echo https://console.firebase.google.com/project/mecanic-fixs/firestore/rules
    echo.
    pause
    exit /b 1
)

echo Firebase CLI encontrado
echo.

REM Verificar login
echo Verificando autenticacion...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo No estas autenticado en Firebase
    echo Ejecutando: firebase login
    echo.
    firebase login
)

echo.
echo Desplegando reglas de Firestore...
echo.

firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo EXITO: Reglas desplegadas correctamente
    echo ====================================
    echo.
    echo Ahora puedes:
    echo 1. Reiniciar tu app
    echo 2. Volver a iniciar sesion
    echo.
) else (
    echo.
    echo ====================================
    echo ERROR: No se pudieron desplegar las reglas
    echo ====================================
    echo.
    echo Usa la consola web de Firebase:
    echo https://console.firebase.google.com/project/mecanic-fixs/firestore/rules
    echo.
)

pause
