# 📸🎥 Guía - Visualizador de Imágenes y Videos

## ✅ Funcionalidades Implementadas

### 1. **Visualización de Imágenes en Pantalla Completa**
- Al tocar cualquier imagen, se abre en pantalla completa
- Modal con fondo oscuro para mejor visualización
- Botón de cierre en la esquina superior derecha
- Zoom natural con gestos (pellizcar para acercar/alejar)

### 2. **Reproducción de Videos**
- Detecta automáticamente archivos de video
- Muestra icono de "play" sobre el thumbnail
- Al tocar, abre el reproductor en pantalla completa
- Controles nativos del sistema (play, pausa, volumen, etc.)

### 3. **Detección Automática de Tipo de Archivo**
- **Imágenes**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- **Videos**: `.mp4`, `.mov`, `.avi`, `.mkv`, `.wmv`, `.flv`, `.webm`, `.m4v`
- **Otros archivos**: Se intentan abrir en el navegador

---

## 🎨 Cambios Implementados

### Archivo: `src/screens/problem-detail.js`

#### ✅ Nuevas importaciones:
```javascript
import { Video } from 'expo-av';
import { Modal, Dimensions, Linking } from 'react-native';
```

#### ✅ Estados agregados:
```javascript
const [selectedMedia, setSelectedMedia] = useState(null);
const [showMediaModal, setShowMediaModal] = useState(false);
```

#### ✅ Funciones nuevas:

1. **`getFileType(url)`** - Detecta el tipo de archivo por extensión
2. **`handleMediaPress(url)`** - Maneja el clic en imágenes/videos
3. **`closeMediaModal()`** - Cierra el modal de visualización

#### ✅ Componentes actualizados:

**Antes (solo imagen):**
```jsx
<Image
  source={{ uri: url }}
  style={styles.thumbnail}
  resizeMode="cover"
/>
```

**Ahora (clickeable con soporte para video):**
```jsx
<TouchableOpacity onPress={() => handleMediaPress(url)}>
  {fileType === 'video' ? (
    <View style={styles.thumbnail}>
      <Video source={{ uri: url }} ... />
      <View style={styles.playIconOverlay}>
        <Ionicons name="play-circle" size={48} color="white" />
      </View>
    </View>
  ) : (
    <Image source={{ uri: url }} ... />
  )}
</TouchableOpacity>
```

#### ✅ Modal de visualización:
```jsx
<Modal visible={showMediaModal} transparent={true}>
  <View style={styles.modalOverlay}>
    <TouchableOpacity onPress={closeMediaModal}>
      <Ionicons name="close-circle" size={40} color="white" />
    </TouchableOpacity>

    {selectedMedia?.type === 'image' && (
      <Image source={{ uri: selectedMedia.url }} ... />
    )}

    {selectedMedia?.type === 'video' && (
      <Video
        source={{ uri: selectedMedia.url }}
        useNativeControls
        shouldPlay={true}
        ...
      />
    )}
  </View>
</Modal>
```

---

## 📦 Dependencia Instalada

### `expo-av` v16.0.7
- Paquete oficial de Expo para audio y video
- Compatible con Expo SDK 54
- Instalado con: `npx expo install expo-av`

**Ya incluido en `package.json`:**
```json
{
  "dependencies": {
    "expo-av": "~16.0.7"
  }
}
```

---

## 🧪 Cómo Probar

### 1. Reiniciar el servidor de desarrollo:
```bash
# Detén el servidor actual (Ctrl+C)
npx expo start --clear
```

### 2. Navegar a un problema existente:
1. Inicia sesión en la app
2. Ve a "Ver Problemas" o la lista de problemas
3. Selecciona cualquier problema que tenga archivos adjuntos

### 3. Probar imágenes:
- **Toca cualquier imagen** → Se abre en pantalla completa
- **Pellizca para hacer zoom** (gestos nativos)
- **Toca el botón ✕** para cerrar

### 4. Probar videos:
- Los videos muestran un **icono de play ▶️** sobre el thumbnail
- **Toca el video** → Se abre el reproductor en pantalla completa
- **Usa los controles nativos**:
  - ▶️ Play/Pausa
  - 🔊 Control de volumen
  - ⏩ Adelantar/Retroceder
  - 📱 Pantalla completa (en dispositivos compatibles)
- **Toca el botón ✕** para cerrar

### 5. Ubicaciones donde se muestran archivos:
- ✅ **Archivos del problema** (sección principal)
- ✅ **Archivos de actividades**
- ✅ **Archivos de soluciones**

---

## 🎯 Funcionalidades Adicionales

### Gestos Soportados:

**Para Imágenes:**
- Pellizcar para zoom
- Arrastrar para mover (cuando está en zoom)
- Doble toque para zoom automático

**Para Videos:**
- Controles nativos del sistema
- Toca la pantalla para mostrar/ocultar controles
- Barra de progreso interactiva

### Indicadores Visuales:

**Videos:**
- Icono de play blanco semitransparente
- Fondo oscuro semitransparente sobre el thumbnail

**Modal:**
- Fondo negro 95% opaco
- Botón de cierre con fondo semitransparente
- Imagen/video centrado en pantalla

---

## 🔧 Personalización

### Cambiar el tamaño del modal:
```javascript
// En los estilos
fullImage: {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT * 0.8,  // 80% de la altura
}
```

### Cambiar la opacidad del fondo:
```javascript
modalOverlay: {
  backgroundColor: 'rgba(0, 0, 0, 0.95)',  // 95% opaco
}
```

### Cambiar el icono de play:
```javascript
<Ionicons
  name="play-circle"      // Cambia el icono
  size={48}               // Cambia el tamaño
  color="white"           // Cambia el color
/>
```

---

## 🐛 Solución de Problemas

### El video no se reproduce:

**Causa 1**: Formato no soportado
- **Solución**: Usa formatos `.mp4`, `.mov` o `.m4v`

**Causa 2**: URL inválida
- **Solución**: Verifica que la URL esté correcta en Firebase Storage

**Causa 3**: Permisos de red
- **Solución**: Verifica que la app tenga permisos de red

### La imagen no se muestra:

**Causa 1**: URL no accesible
- **Solución**: Verifica las reglas de Firebase Storage
- Las reglas deben permitir lectura a usuarios autenticados

**Causa 2**: Formato no soportado
- **Solución**: Usa formatos `.jpg`, `.png`, `.gif`

### El modal no se cierra:

**Causa**: Conflicto de gestos
- **Solución**: Toca el botón ✕ en la esquina superior derecha

---

## 📊 Estructura de Archivos Soportados

### En Firebase Storage:
```
problems/
  └── problem_1234567890/
      ├── problem_0/
      │   ├── files/
      │   │   ├── 1234_image.jpg     ← Imagen
      │   │   └── 5678_video.mp4     ← Video
      │   ├── activities/
      │   │   └── activity_0/
      │   │       └── 9012_photo.jpg
      │   └── solutions/
      │       └── solution_0/
      │           └── 3456_clip.mp4
```

### Detección automática:
```javascript
getFileType("https://...image.jpg")  // → 'image'
getFileType("https://...video.mp4")  // → 'video'
getFileType("https://...doc.pdf")    // → 'unknown' (abre en navegador)
```

---

## 🎬 Ejemplos de Uso

### Caso 1: Ver imagen de un problema
```
1. Usuario registra problema con fotos
2. Fotos se suben a Firebase Storage
3. Usuario abre detalle del problema
4. Toca la imagen → Se abre en pantalla completa
5. Hace zoom con gestos → Imagen se amplía
6. Toca ✕ → Modal se cierra
```

### Caso 2: Reproducir video de una solución
```
1. Usuario registra solución con video
2. Video se sube a Firebase Storage (5MB)
3. Usuario abre detalle del problema
4. Ve thumbnail del video con icono ▶️
5. Toca el video → Reproductor se abre
6. Presiona play → Video se reproduce con controles nativos
7. Toca ✕ → Reproductor se cierra
```

---

## ✨ Mejoras Futuras Sugeridas

1. **Galería con navegación**
   - Deslizar para ver siguiente/anterior imagen
   - Contador de imágenes (1/5)

2. **Controles avanzados de video**
   - Velocidad de reproducción
   - Subtítulos (si aplica)
   - Descargar video

3. **Compartir archivos**
   - Botón para compartir imagen/video
   - Exportar a galería del dispositivo

4. **Miniaturas optimizadas**
   - Generar thumbnails de videos
   - Lazy loading para listas grandes

5. **Soporte para documentos PDF**
   - Visor de PDF integrado
   - Vista previa de documentos

---

## 📞 Siguiente Paso

**¡Todo está listo!** Ahora puedes:

1. ✅ Ver imágenes en pantalla completa
2. ✅ Reproducir videos con controles nativos
3. ✅ Navegar entre archivos de problemas, actividades y soluciones

**Para empezar:**
```bash
npx expo start --clear
```

Luego navega a cualquier problema con archivos adjuntos y prueba la funcionalidad.

---

**¡Disfruta de la nueva funcionalidad de visualización!** 🚀📸🎥
