# Guía Rápida: Subir Manualmente a Play Store

## Paso 1: Descargar tu build .aab

Ejecuta este comando para ver tus builds:

```bash
eas build:list --platform android
```

O ve directamente a:
https://expo.dev/accounts/jbian/projects/mechanic-fixes/builds

**Descarga el archivo .aab** del último build (el más reciente).

## Paso 2: Subir a Play Console

1. Ve a tu app en https://play.google.com/console

2. En el menú izquierdo, busca **"Versiones" → "Producción"**

3. Clic en **"Crear nueva versión"**

4. **Arrastra el archivo .aab** que descargaste

5. Agrega las **Notas de la versión** (en español):
   ```
   Primera versión de Mechanic Fixes
   • Sistema completo de gestión de reparaciones
   • Control de inventario
   • Gestión de clientes y vehículos
   • Sistema de roles y permisos
   • Galería de fotos
   • Reportes en tiempo real
   ```

6. Clic en **"Guardar"** (todavía no envíes a revisión)

## Paso 3: Completar requisitos obligatorios

Play Console te mostrará una lista de cosas que faltan. Debes completar:

### 📝 Ficha de la tienda

**Descripción corta:**
```
Gestión profesional de reparaciones automotrices
```

**Descripción completa:**
```
Mechanic Fixes es la aplicación líder para gestionar tu taller mecánico de forma profesional.

🔧 Funcionalidades principales:
• Gestión completa de órdenes de reparación
• Control de inventario de repuestos
• Administración de clientes y vehículos
• Sistema de roles (Admin, Mecánico, Recepcionista)
• Galería de fotos para documentar reparaciones
• Reportes y estadísticas en tiempo real
• Notificaciones automáticas

💼 Ideal para:
- Talleres mecánicos pequeños y medianos
- Centros de servicio automotriz
- Mecánicos independientes

✨ Características destacadas:
• Interfaz intuitiva y fácil de usar
• Sincronización en tiempo real
• Seguridad con Firebase
• Multiusuario con diferentes roles

Descarga Mechanic Fixes hoy y lleva tu taller al siguiente nivel.
```

**Categoría:** Productividad o Empresa

### 📸 Gráficos requeridos:

1. **Ícono 512x512** - Usa `assets/images/mecanic-fixes.png`
2. **Feature Graphic 1024x500** - Banner promocional (necesitas crearlo)
3. **Capturas de pantalla** - Mínimo 2 (1080x1920 recomendado)

### 🔐 Clasificación de contenido

1. Ir a **"Clasificación de contenido"**
2. Completar cuestionario:
   - Categoría: Utilidad/Productividad
   - No violencia, no lenguaje adulto, etc.
3. Enviar

### 👥 Público objetivo

- Ir a **"Público objetivo"**
- Seleccionar: Mayores de 18 años
- Sin anuncios

### 🔒 Privacidad de datos

1. Ir a **"Seguridad de datos"**
2. Declarar qué datos recopilas:
   - Información personal (nombre, email)
   - Fotos (para documentar reparaciones)
3. Explicar que se usa Firebase
4. Link a política de privacidad: `https://[tu-dominio]/privacy-policy.html`

### 🔑 Acceso a la app (si requiere login)

Ir a **"Acceso a la app"** y proporcionar:
- Usuario de prueba
- Contraseña de prueba
- Instrucciones para revisores de Google

## Paso 4: Enviar a revisión

Una vez completado todo:
1. Vuelve a **"Producción"**
2. Verifica que todos los requisitos estén ✅
3. Clic en **"Enviar para revisión"**

**Tiempo de revisión:** 1-7 días (usualmente 24-48 horas)

## ✅ Checklist

- [ ] Archivo .aab subido
- [ ] Notas de versión agregadas
- [ ] Descripción corta y completa
- [ ] Ícono 512x512 subido
- [ ] Feature Graphic subido
- [ ] Capturas de pantalla (mín. 2)
- [ ] Clasificación de contenido completada
- [ ] Público objetivo definido
- [ ] Política de privacidad agregada
- [ ] Declaración de datos completada
- [ ] Credenciales de prueba (si aplica)
- [ ] Enviado a revisión

---

**¡Listo!** Tu app estará en revisión y disponible en 1-3 días. 🎉
