import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  Platform,
  Linking
} from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import AppFooter from '../components/AppFooter';
import CustomAlert from '../components/CustomAlert';
import { useAuth } from '../context/AuthContext';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProblemDetailScreen = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { problemId } = useLocalSearchParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [allMediaFiles, setAllMediaFiles] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showNoPermissionAlert, setShowNoPermissionAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [workOrderExpanded, setWorkOrderExpanded] = useState(false);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [workOrderModalVisible, setWorkOrderModalVisible] = useState(false);

  // Variables para zoom
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  useEffect(() => {
    loadProblemDetail();
  }, [problemId]);

  // Recargar cuando la pantalla recibe el foco (después de editar)
  useFocusEffect(
    useCallback(() => {
      loadProblemDetail();
    }, [problemId])
  );

  const loadProblemDetail = async () => {
    try {
      setLoading(true);
      const data = await FirebaseFirestoreService.getProblemById(problemId);
      setProblem(data);
    } catch (error) {
      console.error('Error cargando detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.m4v', '.webm'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isDocument = (url) => {
    if (!url) return false;
    const docExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
    return docExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isImage = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Detectar si un string es una ruta o URL de archivo
  const isFilePathOrUrl = (value) => {
    if (!value || typeof value !== 'string') return false;
    // Contiene http (URL completa) o tiene extensión de archivo
    return value.includes('http') ||
           isDocument(value) ||
           isImage(value) ||
           isVideo(value);
  };

  const openMediaViewer = (url, allFiles = []) => {
    const currentIndex = allFiles.findIndex(file => file === url);
    setCurrentMediaIndex(currentIndex >= 0 ? currentIndex : 0);
    setAllMediaFiles(allFiles);
    setSelectedMedia(url);
    setMediaViewerVisible(true);
  };

  const navigateMedia = (direction) => {
    if (allMediaFiles.length === 0) return;

    let newIndex = currentMediaIndex + direction;
    if (newIndex < 0) newIndex = allMediaFiles.length - 1;
    if (newIndex >= allMediaFiles.length) newIndex = 0;

    setCurrentMediaIndex(newIndex);
    setSelectedMedia(allMediaFiles[newIndex]);
    setImageLoading(true);
    // Reset zoom al cambiar de imagen
    scale.value = 1;
    savedScale.value = 1;
  };

  const closeMediaViewer = () => {
    setMediaViewerVisible(false);
    setSelectedMedia(null);
    setCurrentMediaIndex(0);
    setAllMediaFiles([]);
    setShowFileInfo(false);
    setImageLoading(true);
    // Reset zoom
    scale.value = 1;
    savedScale.value = 1;
  };

  // Función para volver de forma segura
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  // Función para compartir archivo
  const shareFile = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('No disponible', 'Compartir no está disponible en web');
        return;
      }

      const url = selectedMedia;
      const fileName = `archivo_${Date.now()}${isVideo(url) ? '.mp4' : '.jpg'}`;

      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // Usar Share nativo
        await Share.share({
          message: 'Compartir archivo',
          url: url,
          title: 'Compartir archivo'
        });
      }
    } catch (error) {
      console.error('Error compartiendo archivo:', error);
      Alert.alert('Error', 'No se pudo compartir el archivo');
    }
  };

  // Función para obtener nombre del archivo
  const getFileName = (url) => {
    if (!url) return 'archivo';
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return decodeURIComponent(fileName.split('?')[0]);
  };

  // Función para obtener tipo de archivo
  const getFileType = (url) => {
    if (isVideo(url)) return 'Video';
    return 'Imagen';
  };

  // Handler para el gesto de pinch (zoom) - API moderna
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Si el zoom es muy pequeño, resetear
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      }
      // Limitar zoom máximo
      if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Reset zoom con doble tap
  const resetZoom = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
  };

  // Abrir documento PDF o archivo
  const openDocument = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir este documento');
      }
    } catch (error) {
      console.error('Error abriendo documento:', error);
      Alert.alert('Error', 'No se pudo abrir el documento');
    }
  };

  // Verificar si el usuario puede editar este problema
  const canEditProblem = () => {
    if (!user || !problem) return false;

    // Admin puede editar todo
    if (isAdmin) return true;

    // El usuario es el propietario y tiene permiso para editar
    return problem.registeredBy?.userId === user.id && user.permissions?.canEdit;
  };

  // Verificar si el usuario puede eliminar este problema
  const canDeleteProblem = () => {
    if (!user || !problem) return false;

    // Admin puede eliminar todo
    if (isAdmin) return true;

    // El usuario es el propietario y tiene permiso para eliminar
    return problem.registeredBy?.userId === user.id && user.permissions?.canDelete;
  };

  // Función para eliminar (soft delete)
  const handleDelete = () => {
    if (!canDeleteProblem()) {
      setAlertMessage('No tienes permiso para eliminar este registro');
      setShowNoPermissionAlert(true);
      return;
    }

    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await FirebaseFirestoreService.softDeleteProblem(problem.id, problem.collectionName);
      setAlertMessage('Registro eliminado correctamente');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error eliminando:', error);
      setAlertMessage('No se pudo eliminar el registro');
      setShowNoPermissionAlert(true);
    }
  };

  // Función para editar
  const handleEdit = () => {
    if (!canEditProblem()) {
      setAlertMessage('No tienes permiso para editar este registro');
      setShowNoPermissionAlert(true);
      return;
    }

    // Navegar a la pantalla de edición pasando el problema completo
    router.push({
      pathname: '/edit-problem',
      params: {
        problemId: problem.id,
        collectionName: problem.collectionName || 'mechanical-problems'
      }
    });
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </View>
    );
  }

  if (!problem) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={colors.error} />
          <Text style={styles.errorText}>Problema no encontrado</Text>
        </View>
      </View>
    );
  }

  const currentProblem = problem.problems?.[selectedProblemIndex];

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="flash" size={18} color="#FFD700" />
            <Text style={styles.headerTitle}>Detalles del Problema</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {canEditProblem() && (
            <TouchableOpacity onPress={handleEdit} style={styles.headerActionButton}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          {canDeleteProblem() && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerActionButton}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Información General</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tópico:</Text>
              <Text style={styles.value}>{problem.generalData?.topic || 'N/A'}</Text>
            </View>
            {problem.generalData?.truckData && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Camión:</Text>
                <Text style={styles.value}>{problem.generalData.truckData}</Text>
              </View>
            )}
            {problem.generalData?.workOrder && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Work Order:</Text>
                <Text style={styles.value}>{problem.generalData.workOrder}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Registrado por:</Text>
              <Text style={styles.value}>{problem.registeredBy?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{formatDate(problem.createdAt)}</Text>
            </View>
          </View>
        </View>

        {problem.problems && problem.problems.length > 1 && (
          <View style={styles.problemNav}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {problem.problems.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.problemTab,
                    selectedProblemIndex === index && styles.problemTabActive,
                  ]}
                  onPress={() => setSelectedProblemIndex(index)}
                >
                  <Ionicons 
                    name="construct" 
                    size={14} 
                    color={selectedProblemIndex === index ? colors.text : colors.textSecondary} 
                  />
                  <Text
                    style={[
                      styles.problemTabText,
                      selectedProblemIndex === index && styles.problemTabTextActive,
                    ]}
                  >
                    Problema {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {currentProblem && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="construct" size={18} color={colors.secondary} />
                </View>
                <Text style={styles.sectionTitle}>Problema</Text>
              </View>

              {/* Card de Título y Descripción del Problema */}
              <View style={styles.problemCard}>
                <View style={styles.problemTitleContainer}>
                  <Text style={styles.problemTitleLabel}>Título del problema:</Text>
                  <Text style={styles.problemTitle}>{currentProblem.problemTitle}</Text>
                </View>
                {currentProblem.problemDescription && (
                  <View style={styles.problemDescriptionContainer}>
                    <Text style={styles.problemDescriptionLabel}>Descripción:</Text>
                    <Text style={styles.problemDescription}>{currentProblem.problemDescription}</Text>
                  </View>
                )}
              </View>

              {/* Card de Archivos del Problema */}
              {currentProblem.problemFiles && currentProblem.problemFiles.length > 0 && (
                <View style={styles.filesCard}>
                  <View style={styles.filesHeader}>
                    <Ionicons name="images-outline" size={18} color={colors.secondary} />
                    <Text style={styles.filesCardTitle}>Archivos adjuntos ({currentProblem.problemFiles.length})</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {currentProblem.problemFiles.map((url, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => openMediaViewer(url, currentProblem.problemFiles)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.mediaContainer}>
                          {isVideo(url) ? (
                            <>
                              <Image
                                source={{ uri: url }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                              />
                              <View style={styles.playIconOverlay}>
                                <Ionicons name="play-circle" size={40} color="#fff" />
                              </View>
                            </>
                          ) : (
                            <Image
                              source={{ uri: url }}
                              style={styles.thumbnail}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="hammer" size={18} color="#FFD700" />
                </View>
                <Text style={styles.sectionTitle}>Actividades Realizadas</Text>
              </View>

              {currentProblem.activities?.map((activity, index) => (
                <View key={index} style={styles.activityWrapper}>
                  {/* Card de Título de la Actividad */}
                  <View style={styles.activityCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.activityNumber}>Actividad {index + 1}</Text>
                    </View>
                    <View style={styles.activityTitleContainer}>
                      <Text style={styles.activityTitleLabel}>Descripción de la actividad:</Text>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                    </View>
                  </View>

                  {/* Card de Archivos de la Actividad */}
                  {activity.files && activity.files.length > 0 && (
                    <View style={styles.activityFilesCard}>
                      <View style={styles.filesHeader}>
                        <Ionicons name="images-outline" size={16} color="#FFD700" />
                        <Text style={styles.filesCardTitle}>Archivos de la actividad ({activity.files.length})</Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {activity.files.map((url, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => openMediaViewer(url, activity.files)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.mediaContainer}>
                              {isVideo(url) ? (
                                <>
                                  <Image
                                    source={{ uri: url }}
                                    style={styles.thumbnail}
                                    resizeMode="cover"
                                  />
                                  <View style={styles.playIconOverlay}>
                                    <Ionicons name="play-circle" size={40} color="#fff" />
                                  </View>
                                </>
                              ) : (
                                <Image
                                  source={{ uri: url }}
                                  style={styles.thumbnail}
                                  resizeMode="cover"
                                />
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconBadge}>
                  <Ionicons name="bulb" size={18} color="#FFD700" />
                </View>
                <Text style={styles.sectionTitle}>Soluciones Aplicadas</Text>
              </View>
              {currentProblem.solutions?.map((solution, index) => (
                <View key={index} style={styles.solutionWrapper}>
                  {/* Card de Título de la Solución */}
                  <View style={styles.solutionCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.solutionNumber}>Solución {index + 1}</Text>
                    </View>
                    <View style={styles.solutionTitleContainer}>
                      <Text style={styles.solutionTitleLabel}>Descripción de la solución:</Text>
                      <Text style={styles.solutionTitle}>{solution.title}</Text>
                    </View>
                  </View>

                  {/* Card de Archivos de la Solución */}
                  {solution.files && solution.files.length > 0 && (
                    <View style={styles.solutionFilesCard}>
                      <View style={styles.filesHeader}>
                        <Ionicons name="images-outline" size={16} color="#FFD700" />
                        <Text style={styles.filesCardTitle}>Archivos de la solución ({solution.files.length})</Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {solution.files.map((url, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => openMediaViewer(url, solution.files)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.mediaContainer}>
                              {isVideo(url) ? (
                                <>
                                  <Image
                                    source={{ uri: url }}
                                    style={styles.thumbnail}
                                    resizeMode="cover"
                                  />
                                  <View style={styles.playIconOverlay}>
                                    <Ionicons name="play-circle" size={40} color="#fff" />
                                  </View>
                                </>
                              ) : (
                                <Image
                                  source={{ uri: url }}
                                  style={styles.thumbnail}
                                  resizeMode="cover"
                                />
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {currentProblem.otherData && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="document-text" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Información Adicional</Text>
                </View>
                <View style={styles.otherDataCard}>
                  <Text style={styles.otherDataText}>{currentProblem.otherData}</Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* Sección de Work Order - Solo si está en el primer problema */}
        {selectedProblemIndex === 0 && problem.generalData?.workOrderDetails && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.workOrderHeader}
              onPress={() => setWorkOrderExpanded(!workOrderExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.workOrderHeaderLeft}>
                <View style={[styles.iconBadge, styles.workOrderIconBadge]}>
                  <Ionicons name="briefcase" size={18} color={colors.warning} />
                </View>
                <View>
                  <Text style={styles.workOrderHeaderTitle}>Orden de Trabajo</Text>
                  <Text style={styles.workOrderHeaderSubtitle}>
                    Información adicional
                  </Text>
                </View>
              </View>
              <View style={styles.workOrderHeaderRight}>
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setWorkOrderModalVisible(true);
                  }}
                >
                  <Ionicons name="expand-outline" size={20} color={colors.warning} />
                </TouchableOpacity>
                <Ionicons
                  name={workOrderExpanded ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.text}
                />
              </View>
            </TouchableOpacity>

            {workOrderExpanded && (
              <View style={styles.workOrderContent}>
                <View style={styles.workOrderCard}>
                  {/* Buscar campos de forma flexible */}
                  {(() => {
                    const woDetails = problem.generalData.workOrderDetails;

                    // Buscar fecha (creation, fecha, date, createdAt, etc.)
                    const fechaKey = Object.keys(woDetails).find(k =>
                      k.toLowerCase().includes('creation') ||
                      k.toLowerCase().includes('fecha') ||
                      k.toLowerCase().includes('date') ||
                      k.toLowerCase().includes('created')
                    );

                    // Buscar nombre cliente (clientName, cliente, customer, etc.)
                    const clienteKey = Object.keys(woDetails).find(k =>
                      k.toLowerCase().includes('clientname') ||
                      k.toLowerCase().includes('cliente') ||
                      k.toLowerCase().includes('customer')
                    );

                    // Buscar estado/status
                    const statusKey = Object.keys(woDetails).find(k =>
                      k.toLowerCase().includes('status') || k.toLowerCase().includes('estado')
                    );

                    // Buscar receptor
                    const receptorKey = Object.keys(woDetails).find(k =>
                      k.toLowerCase().includes('receptor') || k.toLowerCase().includes('receiver')
                    );

                    // Recopilar TODAS las URLs y rutas de archivos
                    const imagenes = [];
                    const documentos = [];

                    Object.entries(woDetails).forEach(([key, value]) => {
                      const lowerKey = key.toLowerCase();

                      // Excluir campos que ya mostramos como texto
                      if (lowerKey.includes('creation') ||
                          lowerKey.includes('fecha') ||
                          lowerKey.includes('status') ||
                          lowerKey.includes('receptor') ||
                          lowerKey.includes('clientname')) {
                        return;
                      }

                      // Si es un string con URL o ruta de archivo
                      if (typeof value === 'string' && isFilePathOrUrl(value)) {
                        // Solo mostrar si tiene URL completa (con http)
                        // El campo "bucket" es solo una ruta interna, no lo mostramos
                        if (!value.includes('http')) {
                          console.log(`⚠️ Ruta sin URL completa ignorada (${key}):`, value);
                          return;
                        }

                        if (isImage(value) || isVideo(value)) {
                          console.log(`📸 Imagen encontrada (${key}):`, value.substring(0, 80) + '...');
                          imagenes.push(value);
                        } else if (isDocument(value)) {
                          console.log(`📄 Documento encontrado (${key}):`, value.substring(0, 80) + '...');
                          documentos.push(value);
                        }
                      }
                      // Si es un array de URLs
                      else if (Array.isArray(value) && value.length > 0) {
                        console.log(`📦 Array encontrado (${key}): ${value.length} elementos`);
                        value.forEach(item => {
                          if (typeof item === 'string' && isFilePathOrUrl(item) && item.includes('http')) {
                            if (isImage(item) || isVideo(item)) {
                              imagenes.push(item);
                            } else if (isDocument(item)) {
                              documentos.push(item);
                            }
                          }
                        });
                      }
                    });

                    console.log(`✅ TOTAL: ${imagenes.length} imagen(es) + ${documentos.length} documento(s)`);

                    return (
                      <>
                        {/* Fecha */}
                        {fechaKey && woDetails[fechaKey] && (
                          <View style={styles.workOrderRow}>
                            <View style={styles.workOrderLabelContainer}>
                              <Ionicons name="calendar-outline" size={16} color={colors.warning} />
                              <Text style={styles.workOrderLabel}>Fecha:</Text>
                            </View>
                            <Text style={styles.workOrderValue}>
                              {(() => {
                                const fechaValue = woDetails[fechaKey];
                                if (typeof fechaValue === 'string' && fechaValue.includes('T')) {
                                  try {
                                    return new Date(fechaValue).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    });
                                  } catch (e) {
                                    return fechaValue;
                                  }
                                }
                                return String(fechaValue);
                              })()}
                            </Text>
                          </View>
                        )}

                        {/* Nombre Cliente */}
                        {clienteKey && woDetails[clienteKey] && (
                          <View style={styles.workOrderRow}>
                            <View style={styles.workOrderLabelContainer}>
                              <Ionicons name="person-outline" size={16} color={colors.warning} />
                              <Text style={styles.workOrderLabel}>Nombre Cliente:</Text>
                            </View>
                            <Text style={styles.workOrderValue}>{woDetails[clienteKey]}</Text>
                          </View>
                        )}

                        {/* Receptor */}
                        {receptorKey && woDetails[receptorKey] && (
                          <View style={styles.workOrderRow}>
                            <View style={styles.workOrderLabelContainer}>
                              <Ionicons name="person-circle-outline" size={16} color={colors.warning} />
                              <Text style={styles.workOrderLabel}>Receptor:</Text>
                            </View>
                            <Text style={styles.workOrderValue}>{woDetails[receptorKey]}</Text>
                          </View>
                        )}

                        {/* Estado */}
                        {statusKey && woDetails[statusKey] && (
                          <View style={styles.workOrderRow}>
                            <View style={styles.workOrderLabelContainer}>
                              <Ionicons name="flag-outline" size={16} color={colors.warning} />
                              <Text style={styles.workOrderLabel}>Estado:</Text>
                            </View>
                            <Text style={styles.workOrderValue}>{woDetails[statusKey]}</Text>
                          </View>
                        )}

                        {/* Imágenes */}
                        {imagenes.length > 0 && (
                          <View style={styles.workOrderRow}>
                            <View style={styles.workOrderLabelContainer}>
                              <Ionicons name="images-outline" size={16} color={colors.warning} />
                              <Text style={styles.workOrderLabel}>Imágenes:</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 22 }}>
                              {imagenes.map((url, index) => (
                                <TouchableOpacity
                                  key={index}
                                  onPress={() => openMediaViewer(url, imagenes)}
                                  activeOpacity={0.8}
                                >
                                  <View style={styles.mediaContainer}>
                                    {isVideo(url) ? (
                                      <>
                                        <Image
                                          source={{ uri: url }}
                                          style={styles.thumbnail}
                                          resizeMode="cover"
                                        />
                                        <View style={styles.playIconOverlay}>
                                          <Ionicons name="play-circle" size={40} color="#fff" />
                                        </View>
                                      </>
                                    ) : (
                                      <Image
                                        source={{ uri: url }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                      />
                                    )}
                                  </View>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}

                        {/* Documentos */}
                        {documentos.length > 0 && (
                          <View style={styles.workOrderRow}>
                            <View style={styles.workOrderLabelContainer}>
                              <Ionicons name="document-attach-outline" size={16} color={colors.warning} />
                              <Text style={styles.workOrderLabel}>Documentos:</Text>
                            </View>
                            <View style={{ paddingLeft: 22, width: '100%' }}>
                              {documentos.map((url, index) => (
                                <TouchableOpacity
                                  key={index}
                                  onPress={() => openDocument(url)}
                                  style={styles.documentItem}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons name="document-text" size={24} color={colors.primary} />
                                  <Text style={styles.documentName} numberOfLines={1}>
                                    {getFileName(url)}
                                  </Text>
                                  <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}
                      </>
                    );
                  })()}
                </View>

                <View style={styles.workOrderFooter}>
                  <Ionicons name="information-circle" size={14} color={colors.textSecondary} />
                  <Text style={styles.workOrderFooterText}>
                    Información capturada del Work Order
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Visor de Medios Premium */}
      <Modal
        visible={mediaViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMediaViewer}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            {/* Header mejorado */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeMediaViewer} style={styles.closeButton}>
                <Ionicons name="close-circle" size={36} color="#fff" />
              </TouchableOpacity>

              <View style={styles.modalHeaderCenter}>
                <View style={styles.modalCounter}>
                  <Text style={styles.modalCounterText}>
                    {currentMediaIndex + 1} / {allMediaFiles.length}
                  </Text>
                </View>
              </View>

              <View style={styles.modalHeaderActions}>
                <TouchableOpacity
                  onPress={() => setShowFileInfo(!showFileInfo)}
                  style={styles.actionButton}
                >
                  <Ionicons
                    name={showFileInfo ? "information-circle" : "information-circle-outline"}
                    size={28}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={shareFile} style={styles.actionButton}>
                  <Ionicons name="share-outline" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Información del archivo (opcional) */}
            {showFileInfo && selectedMedia && (
              <View style={styles.fileInfoPanel}>
                <View style={styles.fileInfoRow}>
                  <Ionicons name="document-text" size={16} color="#fff" />
                  <Text style={styles.fileInfoText} numberOfLines={1}>
                    {getFileName(selectedMedia)}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Ionicons name="image" size={16} color="#fff" />
                  <Text style={styles.fileInfoText}>{getFileType(selectedMedia)}</Text>
                </View>
              </View>
            )}

            {/* Contenido del media con zoom */}
            <View style={styles.mediaViewerContent}>
              {selectedMedia && (
                <>
                  {isVideo(selectedMedia) ? (
                    <Video
                      source={{ uri: selectedMedia }}
                      style={styles.fullscreenMedia}
                      useNativeControls
                      resizeMode="contain"
                      shouldPlay={false}
                    />
                  ) : (
                    <GestureDetector gesture={pinchGesture}>
                      <Animated.View style={[styles.imageContainer, animatedStyle]}>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={resetZoom}
                          disabled={scale.value === 1}
                        >
                          <Image
                            source={{ uri: selectedMedia }}
                            style={styles.fullscreenMedia}
                            resizeMode="contain"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                          />
                        </TouchableOpacity>
                      </Animated.View>
                    </GestureDetector>
                  )}

                  {/* Indicador de carga */}
                  {imageLoading && !isVideo(selectedMedia) && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  )}

                  {/* Indicador de zoom */}
                  {!isVideo(selectedMedia) && scale.value > 1 && (
                    <View style={styles.zoomIndicator}>
                      <Ionicons name="search" size={16} color="#fff" />
                      <Text style={styles.zoomText}>
                        {Math.round(scale.value * 100)}%
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Controles de navegación */}
            {allMediaFiles.length > 1 && (
              <>
                <View style={styles.navigationControls}>
                  <TouchableOpacity
                    onPress={() => navigateMedia(-1)}
                    style={styles.navButton}
                  >
                    <Ionicons name="chevron-back" size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigateMedia(1)}
                    style={styles.navButton}
                  >
                    <Ionicons name="chevron-forward" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Galería de miniaturas */}
                <View style={styles.thumbnailGallery}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbnailScrollContent}
                  >
                    {allMediaFiles.map((fileUrl, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setCurrentMediaIndex(index);
                          setSelectedMedia(fileUrl);
                          setImageLoading(true);
                          scale.value = 1;
                          savedScale.value = 1;
                        }}
                        style={[
                          styles.thumbnailItem,
                          currentMediaIndex === index && styles.thumbnailItemActive,
                        ]}
                      >
                        <Image
                          source={{ uri: fileUrl }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                        {isVideo(fileUrl) && (
                          <View style={styles.thumbnailVideoIcon}>
                            <Ionicons name="play-circle" size={20} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        </GestureHandlerRootView>
      </Modal>

      {/* Alert de Confirmación de Eliminación */}
      <CustomAlert
        visible={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        type="warning"
        title="Eliminar Registro"
        message="¿Estás seguro de eliminar este registro? El registro será movido a la Papelera y solo un administrador podrá restaurarlo."
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setShowDeleteAlert(false)
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: confirmDelete
          }
        ]}
      />

      {/* Alert de Éxito */}
      <CustomAlert
        visible={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        title="Éxito"
        message={alertMessage}
        buttons={[
          {
            text: 'OK',
            onPress: goBack
          }
        ]}
      />

      {/* Alert de Sin Permiso / Error */}
      <CustomAlert
        visible={showNoPermissionAlert}
        onClose={() => setShowNoPermissionAlert(false)}
        type="error"
        title="Error"
        message={alertMessage}
        buttons={[
          {
            text: 'OK',
            style: 'cancel'
          }
        ]}
      />

      {/* Modal de Work Order Premium */}
      <Modal
        visible={workOrderModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setWorkOrderModalVisible(false)}
      >
        <View style={styles.woModalContainer}>
          {/* Header del Modal */}
          <View style={styles.woModalHeader}>
            <View>
              <Text style={styles.woModalTitle}>Orden de Trabajo</Text>
              <Text style={styles.woModalSubtitle}>
                Información adicional
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setWorkOrderModalVisible(false)}
              style={styles.woModalCloseButton}
            >
              <Ionicons name="close-circle" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.woModalContent} showsVerticalScrollIndicator={false}>
            {problem?.generalData?.workOrderDetails && (() => {
              const woDetails = problem.generalData.workOrderDetails;

              // Buscar campos específicos
              const fechaKey = Object.keys(woDetails).find(k =>
                k.toLowerCase().includes('creation') ||
                k.toLowerCase().includes('fecha') ||
                k.toLowerCase().includes('date') ||
                k.toLowerCase().includes('created')
              );

              const clienteKey = Object.keys(woDetails).find(k =>
                k.toLowerCase().includes('clientname') ||
                k.toLowerCase().includes('cliente') ||
                k.toLowerCase().includes('customer')
              );

              const statusKey = Object.keys(woDetails).find(k =>
                k.toLowerCase().includes('status') || k.toLowerCase().includes('estado')
              );

              const receptorKey = Object.keys(woDetails).find(k =>
                k.toLowerCase().includes('receptor') || k.toLowerCase().includes('receiver')
              );

              // Recopilar TODAS las URLs y rutas de archivos
              const imagenes = [];
              const documentos = [];

              Object.entries(woDetails).forEach(([key, value]) => {
                const lowerKey = key.toLowerCase();

                // Excluir campos que ya mostramos como texto
                if (lowerKey.includes('creation') ||
                    lowerKey.includes('fecha') ||
                    lowerKey.includes('status') ||
                    lowerKey.includes('receptor') ||
                    lowerKey.includes('clientname')) {
                  return;
                }

                // Si es un string con URL o ruta de archivo
                if (typeof value === 'string' && isFilePathOrUrl(value)) {
                  // Solo mostrar si tiene URL completa (con http)
                  if (!value.includes('http')) {
                    return;
                  }

                  if (isImage(value) || isVideo(value)) {
                    imagenes.push(value);
                  } else if (isDocument(value)) {
                    documentos.push(value);
                  }
                }
                // Si es un array de URLs
                else if (Array.isArray(value) && value.length > 0) {
                  value.forEach(item => {
                    if (typeof item === 'string' && isFilePathOrUrl(item) && item.includes('http')) {
                      if (isImage(item) || isVideo(item)) {
                        imagenes.push(item);
                      } else if (isDocument(item)) {
                        documentos.push(item);
                      }
                    }
                  });
                }
              });

              console.log(`🔍 Modal - TOTAL: ${imagenes.length} imagen(es) + ${documentos.length} documento(s)`);

              return (
                <>
                  {/* Tarjeta Principal */}
                  <View style={styles.woMainCard}>
                    <View style={styles.woMainCardHeader}>
                      <View style={styles.woIconCircle}>
                        <Ionicons name="briefcase" size={32} color={colors.warning} />
                      </View>
                      <View style={styles.woMainCardInfo}>
                        <Text style={styles.woCodeText}>Orden de Trabajo</Text>
                        {fechaKey && woDetails[fechaKey] && (
                          <Text style={styles.woIdText}>
                            {(() => {
                              const fechaValue = woDetails[fechaKey];
                              if (typeof fechaValue === 'string' && fechaValue.includes('T')) {
                                try {
                                  return new Date(fechaValue).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch (e) {
                                  return fechaValue;
                                }
                              }
                              return String(fechaValue);
                            })()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Información del Work Order */}
                  <View style={styles.woCategorySection}>
                    <View style={styles.woCategoryHeader}>
                      <Ionicons name="information-circle" size={20} color={colors.primary} />
                      <Text style={styles.woCategoryTitle}>Información</Text>
                    </View>
                    <View style={styles.woFieldsGrid}>
                      {/* Fecha */}
                      {fechaKey && woDetails[fechaKey] && (
                        <View style={styles.woFieldCard}>
                          <View style={styles.woFieldHeader}>
                            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                            <Text style={styles.woFieldLabel}>Fecha</Text>
                          </View>
                          <Text style={styles.woFieldValue}>
                            {(() => {
                              const fechaValue = woDetails[fechaKey];
                              if (typeof fechaValue === 'string' && fechaValue.includes('T')) {
                                try {
                                  return new Date(fechaValue).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch (e) {
                                  return fechaValue;
                                }
                              }
                              return String(fechaValue);
                            })()}
                          </Text>
                        </View>
                      )}

                      {/* Nombre Cliente */}
                      {clienteKey && woDetails[clienteKey] && (
                        <View style={styles.woFieldCard}>
                          <View style={styles.woFieldHeader}>
                            <Ionicons name="person-outline" size={16} color={colors.primary} />
                            <Text style={styles.woFieldLabel}>Nombre Cliente</Text>
                          </View>
                          <Text style={styles.woFieldValue}>{woDetails[clienteKey]}</Text>
                        </View>
                      )}

                      {/* Receptor */}
                      {receptorKey && woDetails[receptorKey] && (
                        <View style={styles.woFieldCard}>
                          <View style={styles.woFieldHeader}>
                            <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                            <Text style={styles.woFieldLabel}>Receptor</Text>
                          </View>
                          <Text style={styles.woFieldValue}>{woDetails[receptorKey]}</Text>
                        </View>
                      )}

                      {/* Estado */}
                      {statusKey && woDetails[statusKey] && (
                        <View style={styles.woFieldCard}>
                          <View style={styles.woFieldHeader}>
                            <Ionicons name="flag-outline" size={16} color={colors.error} />
                            <Text style={styles.woFieldLabel}>Estado</Text>
                          </View>
                          <Text style={styles.woFieldValue}>{woDetails[statusKey]}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Imágenes */}
                  {imagenes.length > 0 && (
                    <View style={styles.woCategorySection}>
                      <View style={styles.woCategoryHeader}>
                        <Ionicons name="images" size={20} color={colors.warning} />
                        <Text style={styles.woCategoryTitle}>Imágenes ({imagenes.length})</Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.woImagesGrid}>
                          {imagenes.map((url, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => openMediaViewer(url, imagenes)}
                              activeOpacity={0.8}
                              style={styles.woImageCard}
                            >
                              <Image
                                source={{ uri: url }}
                                style={styles.woImageThumbnail}
                                resizeMode="cover"
                              />
                              <View style={styles.woImageOverlay}>
                                <Ionicons name="eye-outline" size={24} color="#fff" />
                              </View>
                              {isVideo(url) && (
                                <View style={[styles.woImageOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                  <Ionicons name="play-circle" size={32} color="#fff" />
                                </View>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  )}

                  {/* Documentos */}
                  {documentos.length > 0 && (
                    <View style={styles.woCategorySection}>
                      <View style={styles.woCategoryHeader}>
                        <Ionicons name="document-attach" size={20} color={colors.primary} />
                        <Text style={styles.woCategoryTitle}>Documentos ({documentos.length})</Text>
                      </View>
                      <View style={styles.woFieldsGrid}>
                        {documentos.map((url, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => openDocument(url)}
                            style={styles.woDocumentCard}
                            activeOpacity={0.7}
                          >
                            <View style={styles.woDocumentIcon}>
                              <Ionicons name="document-text" size={32} color={colors.primary} />
                            </View>
                            <View style={styles.woDocumentInfo}>
                              <Text style={styles.woDocumentName} numberOfLines={1}>
                                {getFileName(url)}
                              </Text>
                              <Text style={styles.woDocumentAction}>Toca para abrir</Text>
                            </View>
                            <Ionicons name="open-outline" size={24} color={colors.textSecondary} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Footer Info */}
                  <View style={styles.woModalFooter}>
                    <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
                    <Text style={styles.woModalFooterText}>
                      Información capturada del Work Order
                    </Text>
                  </View>
                </>
              );
            })()}
          </ScrollView>
        </View>
      </Modal>

      <AppFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 120,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  problemNav: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  problemTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  problemTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  problemTabText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  problemTabTextActive: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  problemCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  problemTitleContainer: {
    marginBottom: 12,
  },
  problemTitleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  problemDescriptionContainer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  problemDescriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  problemDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  filesCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 0,
  },
  filesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filesCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filesSection: {
    marginTop: 12,
  },
  filesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  filesSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  mediaContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.border,
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 8,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  activityWrapper: {
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityFilesCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    marginBottom: 8,
  },
  activityNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityTitleContainer: {
    marginTop: 8,
  },
  activityTitleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 21,
  },
  smallThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.border,
  },
  smallPlayIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 8,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  solutionWrapper: {
    marginBottom: 16,
  },
  solutionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  solutionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  solutionTitleContainer: {
    marginTop: 8,
  },
  solutionTitleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  solutionTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 21,
  },
  solutionFilesCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  otherDataCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  otherDataText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  
  // Modal Styles - Premium
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fileInfoPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fileInfoText: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
  },
  mediaViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  zoomText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  thumbnailGallery: {
    paddingBottom: 30,
    paddingTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  thumbnailScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  thumbnailItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  thumbnailItemActive: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailVideoIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  // Work Order Expandible Styles
  workOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.warning + '40',
    marginBottom: 4,
  },
  workOrderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  workOrderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  workOrderIconBadge: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning + '40',
  },
  workOrderHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  workOrderHeaderSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  workOrderContent: {
    marginTop: 8,
  },
  workOrderCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workOrderRow: {
    marginBottom: 16,
  },
  workOrderLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  workOrderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workOrderValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
    paddingLeft: 22,
  },
  workOrderValueDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingLeft: 22,
  },
  workOrderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  workOrderFooterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },

  // Work Order Modal Premium Styles
  woModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  woModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  woModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  woModalSubtitle: {
    fontSize: 16,
    color: colors.warning,
    fontWeight: '600',
  },
  woModalCloseButton: {
    padding: 4,
  },
  woModalContent: {
    flex: 1,
    padding: 20,
  },
  woMainCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.warning + '40',
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  woMainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  woIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.warning + '40',
  },
  woMainCardInfo: {
    flex: 1,
  },
  woCodeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  woIdText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  woDescriptionBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  woDescriptionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  woCategorySection: {
    marginBottom: 24,
  },
  woCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  woCategoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  woFieldsGrid: {
    gap: 12,
  },
  woFieldCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  woFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  woFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  woFieldValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 22,
  },
  woFieldValueLong: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  woModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    marginBottom: 40,
  },
  woModalFooterText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Document Styles for Work Order
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },

  // Work Order Images Grid
  woImagesGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  woImageCard: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  woImageThumbnail: {
    width: 140,
    height: 140,
    backgroundColor: colors.border,
  },
  woImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Work Order Document Card
  woDocumentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  woDocumentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  woDocumentInfo: {
    flex: 1,
  },
  woDocumentName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  woDocumentAction: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ProblemDetailScreen;