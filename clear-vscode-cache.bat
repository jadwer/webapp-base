@echo off
echo 🧹 Limpiando cache de VSCode (preservando extensiones)...

echo.
echo ⏸️  Cerrando VSCode...
taskkill /f /im "Code.exe" 2>nul

echo ✅ Limpiando cache de workspace...
if exist "%APPDATA%\Code\User\workspaceStorage\" (
    rmdir /s /q "%APPDATA%\Code\User\workspaceStorage\"
    echo ✅ Cache de workspace eliminado
)

echo ✅ Limpiando cache de TypeScript...
if exist "%APPDATA%\Code\CachedExtensions\" (
    rmdir /s /q "%APPDATA%\Code\CachedExtensions\"
    echo ✅ Cache de TypeScript eliminado
)

echo ✅ Limpiando logs...
if exist "%APPDATA%\Code\logs\" (
    rmdir /s /q "%APPDATA%\Code\logs\"
    echo ✅ Logs eliminados
)

echo.
echo 🚀 Cache limpiado exitosamente!
echo 💡 Ahora abre VSCode de nuevo en este directorio
pause