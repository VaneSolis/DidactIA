@echo off
echo ========================================
echo    Instalacion de MySQL para DidactIA
echo ========================================
echo.

echo Verificando si MySQL esta instalado...
mysql --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MySQL ya esta instalado
    goto :configure
) else (
    echo ❌ MySQL no esta instalado
    echo.
    echo Opciones de instalacion:
    echo 1. XAMPP (Recomendado para desarrollo)
    echo 2. MySQL Community Server
    echo 3. Docker
    echo.
    echo Por favor instala MySQL manualmente y vuelve a ejecutar este script.
    echo.
    echo Instrucciones detalladas en: docs/INSTALL_MYSQL.md
    pause
    exit /b 1
)

:configure
echo.
echo Configurando la base de datos...
cd /d "%~dp0..\backend"
npm run setup-db

if %errorlevel% == 0 (
    echo.
    echo ✅ ¡Configuracion completada!
    echo.
    echo Para iniciar el servidor:
    echo   npm start
    echo.
    echo Para probar en Postman:
    echo   http://localhost:4000/maestros
) else (
    echo.
    echo ❌ Error en la configuracion
    echo Verifica que MySQL este ejecutandose y las credenciales sean correctas
)

pause
