@echo off
echo 🔍 Verificando sincronización del repositorio...
echo.

echo 📊 Estado actual:
git status
echo.

echo 📜 Últimos 3 commits:
git log --oneline -3
echo.

echo 🌐 Verificando conexión con remoto:
git fetch origin
git status
echo.

echo 📋 Archivos clave del Design System:
echo.
echo ✅ Tokens centralizados:
if exist "src\ui\styles\tokens\_colors.scss" (
    echo   - ✅ _colors.scss
) else (
    echo   - ❌ _colors.scss FALTANTE
)

if exist "src\ui\styles\tokens\_typography.scss" (
    echo   - ✅ _typography.scss
) else (
    echo   - ❌ _typography.scss FALTANTE
)

if exist "src\ui\styles\tokens\_spacing.scss" (
    echo   - ✅ _spacing.scss
) else (
    echo   - ❌ _spacing.scss FALTANTE
)

echo.
echo ✅ Componentes CSS Modules:
if exist "src\ui\styles\modules\Input.module.scss" (
    echo   - ✅ Input.module.scss
) else (
    echo   - ❌ Input.module.scss FALTANTE
)

if exist "src\ui\styles\modules\Checkbox.module.scss" (
    echo   - ✅ Checkbox.module.scss
) else (
    echo   - ❌ Checkbox.module.scss FALTANTE
)

echo.
echo ✅ Componentes base:
if exist "src\ui\components\base\Input.tsx" (
    echo   - ✅ Input.tsx
) else (
    echo   - ❌ Input.tsx FALTANTE
)

if exist "src\ui\components\base\Checkbox.tsx" (
    echo   - ✅ Checkbox.tsx
) else (
    echo   - ❌ Checkbox.tsx FALTANTE
)

echo.
echo 🎯 Todo parece estar en orden! Si VSCode sigue mostrando archivos viejos:
echo    1. Ejecuta clear-vscode-cache.bat
echo    2. Reinicia VSCode completamente
echo    3. Usa Ctrl+Shift+P ^> "Developer: Restart Extension Host"
echo.
pause