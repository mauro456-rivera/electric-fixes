# Documentacion del Proyecto Mechanic Fixes

## Informacion General

Este es un proyecto de aplicacion movil desarrollado con React Native y Expo para documentar y gestionar reparaciones mecanicas y electricas de vehiculos. La aplicacion permite a los tecnicos capturar fotos, videos y notas de audio sobre diagnosticos y trabajos realizados.

**Nombre:** Mechanic Fixes
**Version:** 1.0.4
**Plataformas:** iOS, Android
**Bundle ID iOS:** com.mecanicfixes.ds2025
**Package Android:** mecanic_ixes.ds_2025

## Estructura del Proyecto

```
mecanic-fixes/
├── app/                          # Rutas de la aplicacion (Expo Router)
├── src/                          # Codigo fuente principal
├── components/                   # Componentes UI de Expo
├── constants/                    # Constantes y temas
├── hooks/                        # Custom hooks de React
├── assets/                       # Imagenes, iconos, fuentes
├── android/                      # Configuracion nativa Android
├── scripts/                      # Scripts de utilidades
├── .expo/                        # Archivos temporales de Expo
├── node_modules/                 # Dependencias instaladas
├── app.json                      # Configuracion de Expo
├── package.json                  # Dependencias del proyecto
├── firebase.json                 # Configuracion de Firebase
├── firestore.rules              # Reglas de seguridad Firestore
├── firebase-storage.rules       # Reglas de seguridad Storage
└── tsconfig.json                 # Configuracion de TypeScript
```

## Carpeta app/ - Navegacion y Rutas

La carpeta app/ utiliza Expo Router con enrutamiento basado en archivos. Cada archivo representa una pantalla o ruta de la aplicacion.

### Archivos principales:

- **_layout.tsx** - Layout principal de la aplicacion, envuelve toda la app
- **index.tsx** - Pantalla inicial, punto de entrada de la aplicacion
- **login.tsx** - Pantalla de inicio de sesion
- **menu.tsx** - Menu principal de la aplicacion
- **register-problem.tsx** - Pantalla para registrar problemas mecanicos o electricos
- **view-records.tsx** - Pantalla para ver todos los registros guardados
- **search-solutions.tsx** - Pantalla para buscar soluciones a problemas
- **problem-detail.jsx** - Pantalla de detalle de un problema especifico
- **edit-problem.tsx** - Pantalla para editar problemas existentes
- **manage-users.tsx** - Pantalla de gestion de usuarios (solo administradores)
- **user-registrations.tsx** - Pantalla de estadisticas de registros por usuario
- **trash.tsx** - Pantalla de papelera de registros eliminados
- **modal.tsx** - Modal generico

### Subcarpeta (tabs)/:
- **_layout.tsx** - Layout de tabs
- **explore.tsx** - Pantalla de exploracion

## Carpeta src/ - Codigo Fuente

### src/config/
Archivos de configuracion:
- **firebase.js** - Configuracion e inicializacion de Firebase

### src/context/
Contextos de React para manejo de estado global:
- **AuthContext.js** - Contexto de autenticacion, maneja login, logout y datos del usuario
- **WorkOrderContext.js** - Contexto para gestionar Work Orders

### src/services/
Servicios para comunicacion con backend:
- **firebaseFirestore.js** - Servicio para operaciones con Firestore (guardar, obtener, eliminar problemas)
- **firebaseStorage.js** - Servicio para subir archivos a Firebase Storage
- **userService.js** - Servicio para gestion de usuarios (roles, permisos)

### src/screens/
Pantallas principales de la aplicacion:
- **LoginScreen.js** - Pantalla de login
- **MenuScreen.js** - Pantalla de menu principal
- **RegisterProblemScreen.js** - Pantalla de registro de problemas
- **ViewRecordsScreen.js** - Pantalla de visualizacion de registros
- **SearchSolutionsScreen.js** - Pantalla de busqueda de soluciones
- **EditProblemScreen.js** - Pantalla de edicion de problemas
- **ManageUsersScreen.js** - Pantalla de gestion de usuarios
- **UserRegistrationsScreen.js** - Pantalla de estadisticas por usuario
- **TrashScreen.js** - Pantalla de papelera
- **problem-detail.js** - Pantalla de detalle de problema

### src/components/
Componentes reutilizables:
- **ActivityItem.js** - Componente para mostrar/editar una actividad realizada
- **SolutionItem.js** - Componente para mostrar/editar una solucion aplicada
- **FileUploader.js** - Componente para seleccionar y subir archivos (fotos, videos, documentos)
- **WorkOrderAutocomplete.js** - Componente de autocompletado para Work Orders
- **CustomButton.js** - Boton personalizado
- **CustomAlert.js** - Alerta personalizada
- **CustomActionSheet.js** - Action sheet personalizado
- **LoadingScreen.js** - Pantalla de carga
- **ErrorBoundary.js** - Manejador de errores
- **AppFooter.js** - Footer de la aplicacion

### src/navigation/
Configuracion de navegacion:
- **AppNavigator.js** - Configuracion del navegador principal

### src/styles/
Estilos globales:
- **colors.js** - Paleta de colores del proyecto
- **globalStyles.js** - Estilos globales compartidos

## Carpeta components/ - Componentes UI de Expo

Componentes base de la plantilla de Expo:
- **themed-view.tsx** - View con soporte de temas
- **themed-text.tsx** - Text con soporte de temas
- **parallax-scroll-view.tsx** - ScrollView con efecto parallax
- **hello-wave.tsx** - Componente animado de saludo
- **external-link.tsx** - Componente para links externos
- **haptic-tab.tsx** - Tab con feedback haptico
- **ui/icon-symbol.tsx** - Componentes de iconos
- **ui/collapsible.tsx** - Componente colapsable

## Carpeta constants/
- **theme.ts** - Definicion de temas (colores, fuentes)

## Carpeta hooks/
Custom hooks de React:
- **use-color-scheme.ts** - Hook para detectar modo claro/oscuro
- **use-theme-color.ts** - Hook para obtener colores del tema

## Archivos de Configuracion

### app.json
Configuracion principal de Expo:
- Nombre de la app, version, orientacion
- Configuracion de iOS (bundle ID, permisos)
- Configuracion de Android (package, permisos)
- Plugins de Expo (router, splash screen, image picker, etc.)
- Configuracion de build properties

### package.json
Dependencias del proyecto:
- **expo**: ~54.0.12 - Framework principal
- **react-native**: 0.81.4 - Framework base
- **firebase**: ^12.3.0 - Backend y base de datos
- **expo-router**: ~6.0.10 - Sistema de navegacion
- **expo-image-picker**: ~17.0.8 - Selector de imagenes
- **expo-camera**: ~17.0.8 - Acceso a camara
- **expo-document-picker**: ~14.0.7 - Selector de documentos
- **expo-av**: ~16.0.7 - Audio y video
- Muchas otras dependencias de Expo y React Navigation

### firebase.json
Configuracion de Firebase:
- Reglas de Firestore
- Reglas de Storage
- Indices de Firestore

### firestore.rules
Reglas de seguridad para la base de datos Firestore. Define quien puede leer y escribir datos.

### firebase-storage.rules
Reglas de seguridad para Firebase Storage. Define quien puede subir y descargar archivos.

### tsconfig.json
Configuracion de TypeScript para el proyecto.

### metro.config.js
Configuracion del bundler Metro para React Native.

### eslint.config.js
Configuracion de ESLint para mantener codigo limpio.

## Tecnologias Principales

- **React Native**: Framework para desarrollo movil multiplataforma
- **Expo**: Plataforma y herramientas para React Native
- **Firebase Authentication**: Autenticacion de usuarios
- **Firestore Database**: Base de datos NoSQL en la nube
- **Firebase Storage**: Almacenamiento de archivos multimedia
- **Expo Router**: Sistema de navegacion basado en archivos
- **TypeScript**: Lenguaje con tipado estatico
- **React Navigation**: Navegacion entre pantallas

## Funcionalidades Principales

1. **Autenticacion de usuarios** - Login con email y password
2. **Registro de problemas** - Documentar problemas mecanicos y electricos con fotos, videos y audios
3. **Visualizacion de registros** - Ver todos los problemas registrados
4. **Busqueda de soluciones** - Buscar soluciones a problemas similares
5. **Edicion de problemas** - Modificar registros existentes
6. **Gestion de usuarios** - Crear, editar y gestionar usuarios (solo admin)
7. **Sistema de permisos** - Control de acceso basado en roles
8. **Papelera** - Recuperar registros eliminados
9. **Work Orders** - Asociar problemas con ordenes de trabajo

## Permisos de la Aplicacion

### iOS (infoPlist):
- **NSCameraUsageDescription**: Acceso a camara para fotos de reparaciones
- **NSPhotoLibraryUsageDescription**: Acceso a galeria para seleccionar imagenes
- **NSPhotoLibraryAddUsageDescription**: Permiso para guardar fotos
- **NSMicrophoneUsageDescription**: Acceso a microfono para notas de voz

### Android:
- INTERNET - Conexion a internet
- ACCESS_NETWORK_STATE - Estado de la red
- CAMERA - Acceso a camara
- READ_EXTERNAL_STORAGE - Leer archivos
- READ_MEDIA_IMAGES - Leer imagenes
- RECORD_AUDIO - Grabar audio

## Scripts Disponibles

Ejecutar en la terminal:

- `npm start` - Inicia el servidor de desarrollo de Expo
- `npm run android` - Ejecuta la app en Android
- `npm run ios` - Ejecuta la app en iOS
- `npm run web` - Ejecuta la app en navegador web
- `npm run lint` - Ejecuta el linter para revisar codigo

## Flujo de Trabajo Basico

1. El usuario abre la app y hace login
2. Desde el menu puede:
   - Registrar un nuevo problema mecanico o electrico
   - Ver todos los registros previos
   - Buscar soluciones a problemas
   - (Admin) Gestionar usuarios o ver estadisticas
3. Al registrar un problema:
   - Selecciona tipo (mecanico o electrico)
   - Ingresa datos generales del camion y work order
   - Documenta el problema con fotos/videos
   - Registra actividades realizadas
   - Documenta soluciones aplicadas
4. Los datos se guardan en Firebase (Firestore + Storage)
5. Todos los usuarios autorizados pueden ver y buscar en los registros

## Colecciones de Firestore

- **users** - Datos de usuarios (roles, permisos)
- **mechanical-problems** - Problemas mecanicos registrados
- **electrical-problems** - Problemas electricos registrados
- **work_order_db** - Work orders del sistema de inventario

## Estructura de Almacenamiento (Firebase Storage)

```
problems/
  ├── {problemId}/
  │   ├── problem_0/
  │   │   ├── problem/
  │   │   │   └── imagen1.jpg
  │   │   ├── activity_0/
  │   │   │   └── foto.jpg
  │   │   └── solution_0/
  │   │       └── video.mp4
  │   └── problem_1/
  │       └── ...
```

## Notas Adicionales

- La aplicacion requiere conexion a internet para funcionar
- Los archivos se suben automaticamente a Firebase Storage
- Se valida el tamaño maximo de archivos (50MB)
- El sistema implementa eliminacion suave (soft delete) para recuperacion
- Los administradores tienen permisos completos
- Los usuarios regulares tienen permisos configurables

---

Esta documentacion proporciona una vision general de la estructura y funcionamiento del proyecto Mechanic Fixes. Para informacion mas detallada sobre algun archivo o funcionalidad especifica, revisar el codigo fuente correspondiente.
