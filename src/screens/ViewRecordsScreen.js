import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeScreen = SCREEN_WIDTH >= 414;

const ViewRecordsScreen = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAccessDeniedAlert, setShowAccessDeniedAlert] = useState(false);

  useEffect(() => {
    // Verificar si el usuario tiene permiso para ver registros
    if (user?.permissions?.canOnlyRegister && !isAdmin) {
      setShowAccessDeniedAlert(true);
      return;
    }
    loadProblems();
  }, [user]);

  // Reload problems when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user && !(user?.permissions?.canOnlyRegister && !isAdmin)) {
        loadProblems();
      }
    }, [user, isAdmin])
  );

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await FirebaseFirestoreService.getAllProblems(user);
      setProblems(data);
    } catch (error) {
      console.error('Error cargando problemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProblems();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    
    // Convertir Firestore Timestamp a Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleProblemPress = (problem) => {
    // Navegar a la pantalla de detalles pasando el ID
    router.push({
      pathname: '/problem-detail',
      params: { problemId: problem.id }
    });
  };

  const renderProblemCard = ({ item }) => {
    // Detectar si es estructura NUEVA o ANTIGUA
    const isNewStructure = !!item.generalData?.diagnosticGuide;

    // Estructura NUEVA (con steps)
    const firstStep = item.steps && item.steps[0];
    const stepCount = item.steps ? item.steps.length : 0;

    // Estructura ANTIGUA (con problems)
    const firstProblem = item.problems && item.problems[0];
    const problemCount = item.problems ? item.problems.length : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProblemPress(item)}
        activeOpacity={0.7}
      >
        {/* Header del card */}
        <View style={styles.cardHeader}>
          <View style={styles.topicContainer}>
            <Ionicons
              name={isNewStructure ? "book-outline" : "pricetag"}
              size={isSmallScreen ? 14 : 16}
              color={colors.primary}
            />
            <Text style={styles.topic} numberOfLines={1}>
              {isNewStructure
                ? (item.generalData?.diagnosticGuide || 'Sin guía')
                : (item.generalData?.topic || 'Sin tópico')}
            </Text>
          </View>
          <Text style={styles.date} numberOfLines={1}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        {/* Título del primer paso/problema */}
        <Text style={styles.problemTitle} numberOfLines={2}>
          {isNewStructure
            ? (firstStep?.stepTitle || 'Sin título')
            : (firstProblem?.problemTitle || 'Sin título')}
        </Text>

        {/* Información adicional */}
        {(item.generalData?.workOrder || item.generalData?.truckData) && (
          <View style={styles.cardInfo}>
            {item.generalData?.workOrder && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={isSmallScreen ? 12 : 14} color={colors.textSecondary} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.generalData.workOrder}
                </Text>
              </View>
            )}
            {item.generalData?.truckData && (
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={isSmallScreen ? 12 : 14} color={colors.textSecondary} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.generalData.truckData}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.userInfo}>
            <Ionicons name="person-outline" size={isSmallScreen ? 12 : 14} color={colors.textSecondary} />
            <Text style={styles.userName} numberOfLines={1}>
              {item.registeredBy?.name || 'Desconocido'}
            </Text>
          </View>
          {isNewStructure ? (
            stepCount > 1 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stepCount} pasos</Text>
              </View>
            )
          ) : (
            problemCount > 1 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{problemCount} problemas</Text>
              </View>
            )
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ver Registros</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando registros...</Text>
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
        <Text style={styles.headerTitle}>Ver Registros</Text>
        <View style={{ width: 24 }} />
      </View>

      {problems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No hay registros</Text>
          <Text style={styles.emptySubText}>Los problemas registrados aparecerán aquí</Text>
        </View>
      ) : (
        <FlatList
          data={problems}
          renderItem={renderProblemCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
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
        message="No tienes permiso para ver registros"
        buttons={[
          {
            text: 'OK',
            onPress: () => router.back()
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
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingTop: 60,
    paddingBottom: isSmallScreen ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 17 : isMediumScreen ? 18 : 20,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 30 : 40,
  },
  emptyText: {
    fontSize: isSmallScreen ? 16 : 18,
    color: colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: isSmallScreen ? 12 : 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: isSmallScreen ? 10 : 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 12 : 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 10 : 12,
    gap: 8,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: isSmallScreen ? 8 : 10,
    paddingVertical: isSmallScreen ? 3 : 4,
    borderRadius: isSmallScreen ? 10 : 12,
    maxWidth: isSmallScreen ? SCREEN_WIDTH * 0.45 : SCREEN_WIDTH * 0.5,
    flexShrink: 1,
  },
  topic: {
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
    flexShrink: 1,
  },
  date: {
    fontSize: isSmallScreen ? 10 : 11,
    color: colors.textSecondary,
    marginTop: 2,
    flexShrink: 0,
    textAlign: 'right',
  },
  problemTitle: {
    fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: isSmallScreen ? 10 : 12,
    lineHeight: isSmallScreen ? 18 : 22,
  },
  cardInfo: {
    marginBottom: isSmallScreen ? 10 : 12,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexShrink: 1,
  },
  infoText: {
    fontSize: isSmallScreen ? 11 : 12,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: isSmallScreen ? 10 : 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
  },
  userName: {
    fontSize: isSmallScreen ? 11 : 12,
    color: colors.textSecondary,
    marginLeft: 4,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 3 : 4,
    borderRadius: isSmallScreen ? 6 : 8,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: '600',
    color: colors.secondary,
  },
});

export default ViewRecordsScreen;