# 📋 Documentación de SVGs en el Proyecto

## SVGs Documentados y Corregidos ✅

### 1. **🔽 Flecha hacia abajo (Chevron Down) - Select Box Normal**
**Ubicación:** `src/ui/styles/modules/Input.module.scss` (líneas 251-252)

**Descripción:** Bootstrap Icons chevron-down para indicar que el select es desplegable.

**Justificación:** Estándar UX para elementos `<select>` - indica que es un menú desplegable.

**Estados:**
- **Normal:** Color primario (#2563eb)
- **Focus:** Color primario (#2563eb) 
- **Hover:** Color primario más oscuro (#1d4ed8)

### 2. **⚠️ Triángulo de Advertencia - Select Box Error**
**Ubicación:** `src/ui/styles/modules/Input.module.scss` (líneas 316-318)

**Descripción:** Bootstrap Icons exclamation-triangle para indicar error de validación.

**Justificación:** En estado de error, es más importante mostrar el problema que la funcionalidad de desplegable. El ícono de advertencia comunica inmediatamente que hay un error.

**Color:** Rojo de error (#dc2626)

### 3. **✅ Círculo con Check - Select Box Success**  
**Ubicación:** `src/ui/styles/modules/Input.module.scss` (líneas 331-333)

**Descripción:** Bootstrap Icons check-circle-fill para indicar validación exitosa.

**Justificación:** En estado de éxito, es más importante mostrar que la validación fue exitosa que la funcionalidad de desplegable. El check mark comunica inmediatamente que todo está correcto.

**Color:** Verde de éxito (#059669)

## SVGs de Bootstrap (Framework)

Los siguientes SVGs están en archivos CSS generados de Bootstrap y **NO deben modificarse**:
- Form controls (checkboxes, radios, switches)
- Validation icons 
- Navigation (carousel arrows, accordion chevrons)
- UI elements (close buttons, navbar toggler)

## ✅ Estado Actual

**Todos los SVGs del proyecto están documentados con comentarios inline descriptivos que incluyen:**
- 🎯 Emoji identificativo del ícono
- 📝 Nombre del ícono de Bootstrap Icons
- 🎨 Descripción del propósito
- 🔢 Código de color hexadecimal
- 💡 Justificación de por qué se usa ese ícono específico

**Mejoras realizadas:**
- ✅ Comentarios inline claros y descriptivos
- ✅ Íconos apropiados según contexto (chevron/warning/success)
- ✅ Colores consistentes con el Design System
- ✅ Justificación clara para cada ícono usado