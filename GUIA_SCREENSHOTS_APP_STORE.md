# Guía de Capturas de Pantalla para App Store

## ⚠️ IMPORTANTE - Cómo evitar el rechazo 2.3.10 (Accurate Metadata)

Apple rechaza apps cuando las capturas de pantalla NO muestran las funcionalidades reales de la app. Debes mostrar **exactamente** lo que hace tu app.

---

## 📱 Capturas de Pantalla Requeridas (en orden)

### 1. **Pantalla de Login**
- Mostrar el formulario de login
- Debe verse profesional y limpio
- **Importante**: NO uses datos falsos visibles, mejor pantalla vacía o con placeholders

### 2. **Dashboard de Administrador**
Después del login como admin, mostrar el menú principal con opciones:
- ✅ Registrar Problemas
- ✅ Ver Registros
- ✅ Buscar Soluciones
- ✅ Gestionar Usuarios
- ✅ Ver Registro por Usuarios
- ✅ Papelera

### 3. **Registrar Problema - Formulario**
- Pantalla donde el técnico puede registrar un problema
- Debe mostrar campos para:
  - Descripción del problema
  - Botones para agregar fotos
  - Botón para grabar audio
  - Botón para video (si aplica)

### 4. **Registrar Problema - Con Foto**
- Misma pantalla pero mostrando una foto de ejemplo de un auto/motor
- Esto demuestra la funcionalidad de captura de fotos

### 5. **Ver Registros - Lista**
- Pantalla mostrando lista de problemas/reparaciones registrados
- Debe incluir:
  - Fecha
  - Descripción breve
  - Usuario que lo registró
  - Estado o categoría

### 6. **Detalle de Registro**
- Vista completa de un registro específico
- Mostrando:
  - Fotos del vehículo/reparación
  - Descripción completa
  - Audio/video si tiene
  - Fecha y técnico

### 7. **Buscar Soluciones**
- Pantalla de búsqueda donde se pueden buscar problemas similares
- Puede mostrar resultados de búsqueda o el buscador

### 8. **Gestionar Usuarios** (solo para admin)
- Lista de usuarios registrados en el sistema
- Mostrando roles (admin/técnico)

---

## 🎯 Consejos Importantes

### ✅ HAZ ESTO:
1. **Usa datos reales pero no sensibles** (nombres genéricos, placas borrosas)
2. **Muestra TODAS las funcionalidades principales** en las capturas
3. **Usa el idioma que configuraste en App Store** (español)
4. **Captura en dispositivo real o simulador de alta calidad**
5. **Asegúrate que las capturas sean claras y legibles**
6. **Captura en modo claro (light mode)** - se ve mejor

### ❌ NO HAGAS ESTO:
1. ❌ NO uses screenshots de otras apps
2. ❌ NO agregues marcos decorativos o texto marketing sobre las capturas
3. ❌ NO muestres funcionalidades que NO existen
4. ❌ NO incluyas datos personales reales de clientes
5. ❌ NO uses screenshots pixelados o de baja calidad
6. ❌ NO uses pantallas de errores o crashes

---

## 📐 Especificaciones Técnicas

### Tamaños Requeridos para iPhone:
- **6.7" (iPhone 14 Pro Max, 15 Pro Max)**: 1290 x 2796 px
- **6.5" (iPhone 11 Pro Max, XS Max)**: 1242 x 2688 px
- **5.5" (iPhone 8 Plus)**: 1242 x 2208 px

### Cantidad:
- **Mínimo**: 3 capturas
- **Recomendado**: 6-8 capturas
- **Máximo**: 10 capturas

### Formato:
- JPG o PNG
- RGB (no CMYK)
- Sin transparencias

---

## 🔄 Orden Recomendado para tu App "Mechanic Fixes"

1. **Login** → Muestra cómo entran los usuarios
2. **Dashboard Admin** → Muestra el menú principal con todas las opciones
3. **Formulario de Registro** → Funcionalidad principal
4. **Registro con Foto** → Demuestra captura de imágenes
5. **Lista de Registros** → Historial de trabajos
6. **Detalle Completo** → Vista completa de un registro
7. **Buscar Soluciones** → Funcionalidad de búsqueda
8. **Gestión de Usuarios** → Panel administrativo

---

## 📝 Descripción de App Store

Ya actualicé tu descripción en `app.json`. Cuando subas a App Store Connect, usa esta:

**Español:**
```
Sistema de gestión profesional para talleres mecánicos que permite documentar y organizar reparaciones de vehículos.

FUNCIONALIDADES PRINCIPALES:

Para Administradores:
• Registrar problemas y reparaciones con fotos, videos y audio
• Ver todos los registros del taller
• Buscar soluciones a problemas comunes
• Gestionar usuarios y técnicos
• Ver historial por usuario
• Administrar papelera de registros eliminados

Para Técnicos:
• Registrar problemas encontrados en vehículos
• Documentar reparaciones con multimedia
• Ver historial de sus propios trabajos
• Buscar soluciones en la base de datos

La app permite a los talleres mecánicos mantener un registro organizado de todos los trabajos realizados, facilitando el seguimiento y la consulta de reparaciones anteriores.
```

---

## 🚀 Pasos para Subir a App Store Connect

1. **Tomar las capturas** siguiendo esta guía
2. **Ir a App Store Connect** → Tu App → Preparar para envío
3. **En "Capturas de pantalla de iPhone"**:
   - Subir capturas en orden (1 a 8)
   - Agregar descripciones breves a cada una (opcional pero recomendado)
4. **En "Descripción"**: Pegar la descripción de arriba
5. **En "Palabras clave"**: `taller,mecánico,reparaciones,vehículos,auto,documentación,gestión`
6. **En "URL de Soporte"**: Debe tener un email o sitio web de contacto
7. **Guardar** y **Enviar para revisión**

---

## ❓ Preguntas de Apple que debes contestar

Al enviar, Apple puede preguntar:

**"Does your app access user data?"**
✅ YES - Email, nombre, fotos/videos (para funcionalidad de la app)

**"Does your app use advertising?"**
❌ NO

**"Does your app track users?"**
❌ NO

**"Content Rights"**
✅ Tu taller tiene los derechos del contenido que suben los técnicos

---

**✅ Con estos cambios, tu app debería pasar la revisión de Apple.**

Cualquier duda, revisa el correo de rechazo y asegúrate que las capturas muestren EXACTAMENTE lo que dice tu descripción.
