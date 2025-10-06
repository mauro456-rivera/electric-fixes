import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const ViewRecordsScreen = () => {
  const router = useRouter();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await FirebaseFirestoreService.getAllProblems();
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
    const firstProblem = item.problems && item.problems[0];
    const problemCount = item.problems ? item.problems.length : 0;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleProblemPress(item)}
      >
        {/* Header del card */}
        <View style={styles.cardHeader}>
          <View style={styles.topicContainer}>
            <Ionicons name="pricetag" size={16} color={colors.primary} />
            <Text style={styles.topic}>{item.generalData?.topic || 'Sin tópico'}</Text>
          </View>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Título del primer problema */}
        <Text style={styles.problemTitle} numberOfLines={2}>
          {firstProblem?.problemTitle || 'Sin título'}
        </Text>

        {/* Información adicional */}
        <View style={styles.cardInfo}>
          {item.generalData?.workOrder && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.infoText}>{item.generalData.workOrder}</Text>
            </View>
          )}
          {item.generalData?.truckData && (
            <View style={styles.infoRow}>
              <Ionicons name="car-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.infoText}>{item.generalData.truckData}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.userInfo}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.userName}>{item.registeredBy?.name || 'Desconocido'}</Text>
          </View>
          {problemCount > 1 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{problemCount} problemas</Text>
            </View>
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
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topic: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  cardInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  badge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
});

export default ViewRecordsScreen;