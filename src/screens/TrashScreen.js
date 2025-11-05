import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AppFooter from '../components/AppFooter';
import CustomAlert from '../components/CustomAlert';
import { useAuth } from '../context/AuthContext';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const TrashScreen = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [deletedProblems, setDeletedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // CustomAlert states
  const [showAccessDeniedAlert, setShowAccessDeniedAlert] = useState(false);
  const [showRestoreAlert, setShowRestoreAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);

  useEffect(() => {
    // Verificar si es admin
    if (!isAdmin) {
      setAlertMessage('No tienes permisos para acceder a esta sección');
      setShowAccessDeniedAlert(true);
      return;
    }
    loadDeletedProblems();
  }, [isAdmin]);

  const loadDeletedProblems = async () => {
    try {
      setLoading(true);
      const problems = await FirebaseFirestoreService.getDeletedProblems();
      setDeletedProblems(problems);
    } catch (error) {
      console.error('Error cargando problemas eliminados:', error);
      setAlertMessage('No se pudieron cargar los registros eliminados');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeletedProblems();
  };

  const handleRestore = (problemId, collectionName) => {
    setSelectedProblem({ id: problemId, collectionName });
    setShowRestoreAlert(true);
  };

  const confirmRestore = async () => {
    try {
      await FirebaseFirestoreService.restoreProblem(selectedProblem.id, selectedProblem.collectionName);
      setAlertMessage('Registro restaurado correctamente');
      setShowSuccessAlert(true);
      loadDeletedProblems();
    } catch (error) {
      console.error('Error al restaurar:', error);
      setAlertMessage('No se pudo restaurar el registro');
      setShowErrorAlert(true);
    }
  };

  const handlePermanentDelete = (problemId, collectionName) => {
    setSelectedProblem({ id: problemId, collectionName });
    setShowDeleteAlert(true);
  };

  const confirmPermanentDelete = async () => {
    try {
      await FirebaseFirestoreService.permanentDeleteProblem(selectedProblem.id, selectedProblem.collectionName);
      setAlertMessage('Registro eliminado permanentemente');
      setShowSuccessAlert(true);
      loadDeletedProblems();
    } catch (error) {
      console.error('Error al eliminar:', error);
      setAlertMessage('No se pudo eliminar el registro');
      setShowErrorAlert(true);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const renderProblemItem = ({ item }) => {
    const problemType = item.problemType === 'electrical' ? 'Eléctrico' : 'Mecánico';
    const problemTypeColor = item.problemType === 'electrical' ? colors.secondary : colors.primary;

    return (
      <View style={styles.problemCard}>
        <View style={styles.problemHeader}>
          <View style={styles.problemInfo}>
            <View style={[styles.typeBadge, { backgroundColor: problemTypeColor + '20' }]}>
              <Ionicons
                name={item.problemType === 'electrical' ? 'flash' : 'construct'}
                size={16}
                color={problemTypeColor}
              />
              <Text style={[styles.typeText, { color: problemTypeColor }]}>{problemType}</Text>
            </View>
            <Text style={styles.topicText}>{item.generalData?.topic || 'Sin tópico'}</Text>
          </View>
        </View>

        <View style={styles.problemDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {item.registeredBy?.name || 'Usuario desconocido'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Creado: {formatDate(item.createdAt)}
            </Text>
          </View>

          {item.deletedAt && (
            <View style={styles.detailRow}>
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={[styles.detailText, { color: colors.error }]}>
                Eliminado: {formatDate(item.deletedAt)}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {item.problems?.length || 0} problema(s) registrado(s)
            </Text>
          </View>
        </View>

        <View style={styles.problemActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.restoreButton]}
            onPress={() => handleRestore(item.id, item.collectionName)}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.success} />
            <Text style={[styles.actionButtonText, { color: colors.success }]}>
              Restaurar
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handlePermanentDelete(item.id, item.collectionName)}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>
              Eliminar
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  };

  if (loading && deletedProblems.length === 0) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Papelera</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando registros eliminados...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Papelera</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {deletedProblems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trash-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Papelera vacía</Text>
          <Text style={styles.emptyText}>
            No hay registros eliminados
          </Text>
        </View>
      ) : (
        <FlatList
          data={deletedProblems}
          renderItem={renderProblemItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <AppFooter />

      {/* Alert de Acceso Denegado */}
      <CustomAlert
        visible={showAccessDeniedAlert}
        onClose={() => {
          setShowAccessDeniedAlert(false);
          router.back();
        }}
        type="error"
        title="Acceso denegado"
        message={alertMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]}
      />

      {/* Alert de Confirmación de Restauración */}
      <CustomAlert
        visible={showRestoreAlert}
        onClose={() => setShowRestoreAlert(false)}
        type="warning"
        title="Restaurar Registro"
        message="¿Estás seguro de restaurar este registro?"
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setShowRestoreAlert(false)
          },
          {
            text: 'Restaurar',
            onPress: confirmRestore
          }
        ]}
      />

      {/* Alert de Confirmación de Eliminación Permanente */}
      <CustomAlert
        visible={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        type="error"
        title="Eliminar Permanentemente"
        message="⚠️ ADVERTENCIA: Esta acción NO se puede deshacer. El registro será eliminado permanentemente de la base de datos."
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setShowDeleteAlert(false)
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: confirmPermanentDelete
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
            onPress: () => setShowSuccessAlert(false)
          }
        ]}
      />

      {/* Alert de Error */}
      <CustomAlert
        visible={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
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
  refreshButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  problemCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  problemHeader: {
    marginBottom: 12,
  },
  problemInfo: {
    flexDirection: 'column',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  topicText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  problemDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  problemActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  restoreButton: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.error + '10',
    borderColor: colors.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default TrashScreen;
