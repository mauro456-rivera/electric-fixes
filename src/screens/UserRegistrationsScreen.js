import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AppFooter from '../components/AppFooter';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import userService from '../services/userService';

const UserRegistrationsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProblems, setUserProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);

      // Obtener TODOS los usuarios del sistema
      const allUsers = await userService.getAllUsers();
      console.log(`📊 Total usuarios en sistema: ${allUsers.length}`);

      // Obtener estadísticas de problemas registrados
      const problemStats = await FirebaseFirestoreService.getUserRegistrationStats();
      console.log(`📊 Usuarios con registros: ${problemStats.length}`);

      // Crear un mapa de estadísticas por userId
      const statsMap = {};
      problemStats.forEach(stat => {
        statsMap[stat.userId] = stat.count;
      });

      // Combinar: TODOS los usuarios con sus estadísticas (0 si no han registrado nada)
      const combinedStats = allUsers.map(user => {
        const count = statsMap[user.id] || 0;
        return {
          userId: user.id,
          userName: user.name || 'Usuario sin nombre',
          userEmail: user.email || 'Sin email',
          count: count,
          userData: user
        };
      });

      // Ordenar por cantidad de problemas registrados (descendente)
      combinedStats.sort((a, b) => b.count - a.count);

      setUserStats(combinedStats);
      console.log(`✅ Mostrando ${combinedStats.length} usuarios en total`);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = async (user) => {
    try {
      setLoadingProblems(true);
      setSelectedUser(user);
      const problems = await FirebaseFirestoreService.getProblemsByUser(user.userId);
      setUserProblems(problems);
    } catch (error) {
      console.error('Error cargando problemas del usuario:', error);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setUserProblems([]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getRankingBadge = (index) => {
    if (index === 0) {
      return (
        <View style={[styles.rankBadge, styles.rank1]}>
          <Text style={styles.rankNumber}>1</Text>
        </View>
      );
    } else if (index === 1) {
      return (
        <View style={[styles.rankBadge, styles.rank2]}>
          <Text style={styles.rankNumber}>2</Text>
        </View>
      );
    } else if (index === 2) {
      return (
        <View style={[styles.rankBadge, styles.rank3]}>
          <Text style={styles.rankNumber}>3</Text>
        </View>
      );
    }
    return null;
  };

  const getRankingIcon = (index) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro por Usuario</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </View>
    );
  }

  // Vista de problemas del usuario seleccionado
  if (selectedUser) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {selectedUser.userName}
            </Text>
            <Text style={styles.headerSubtitle}>
              {selectedUser.count} {selectedUser.count === 1 ? 'problema' : 'problemas'}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {loadingProblems ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando problemas...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {userProblems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={60} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No hay problemas registrados</Text>
                <Text style={styles.emptySubtext}>
                  Este usuario aún no ha registrado ningún problema
                </Text>
              </View>
            ) : (
              userProblems.map((problem) => (
                <TouchableOpacity
                  key={problem.id}
                  style={styles.problemCard}
                  onPress={() =>
                    router.push({
                      pathname: '/problem-detail',
                      params: { problemId: problem.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.problemHeader}>
                    <View style={styles.problemTypeContainer}>
                      <Ionicons
                        name={problem.problemType === 'electrical' ? 'flash' : 'construct'}
                        size={16}
                        color={problem.problemType === 'electrical' ? colors.electrical : colors.mechanical}
                      />
                      <Text
                        style={[
                          styles.problemType,
                          problem.problemType === 'electrical'
                            ? styles.electricalType
                            : styles.mechanicalType,
                        ]}
                      >
                        {problem.problemType === 'electrical' ? 'Eléctrico' : 'Mecánico'}
                      </Text>
                    </View>
                    <Text style={styles.problemDate}>{formatDate(problem.createdAt)}</Text>
                  </View>

                  <Text style={styles.problemTopic} numberOfLines={1}>
                    {problem.generalData?.topic || 'Sin tópico'}
                  </Text>

                  {problem.generalData?.truckData && (
                    <View style={styles.problemInfoRow}>
                      <Ionicons name="car-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.problemInfoText}>{problem.generalData.truckData}</Text>
                    </View>
                  )}

                  {problem.generalData?.workOrder && (
                    <View style={styles.problemInfoRow}>
                      <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.problemInfoText}>WO: {problem.generalData.workOrder}</Text>
                    </View>
                  )}

                  <View style={styles.problemFooter}>
                    <Text style={styles.problemCount}>
                      {problem.problems?.length || 0} {problem.problems?.length === 1 ? 'problema' : 'problemas'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
        <AppFooter />
      </View>
    );
  }

  // Vista de lista de usuarios con ranking
  const totalProblems = userStats.reduce((sum, user) => sum + user.count, 0);
  const activeUsers = userStats.filter(user => user.count > 0).length;

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro por Usuario</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Ionicons name="people" size={24} color={colors.primary} />
          <View style={styles.statsInfo}>
            <Text style={styles.statsNumber}>{userStats.length}</Text>
            <Text style={styles.statsLabel}>Total Usuarios</Text>
          </View>
        </View>
        <View style={styles.statsCard}>
          <Ionicons name="person-add" size={24} color={colors.secondary} />
          <View style={styles.statsInfo}>
            <Text style={styles.statsNumber}>{activeUsers}</Text>
            <Text style={styles.statsLabel}>Con Registros</Text>
          </View>
        </View>
        <View style={styles.statsCard}>
          <Ionicons name="document-text" size={24} color={colors.warning} />
          <View style={styles.statsInfo}>
            <Text style={styles.statsNumber}>{totalProblems}</Text>
            <Text style={styles.statsLabel}>Total Problemas</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.listHeaderText}>Ranking de Usuarios</Text>
        </View>

        {userStats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No hay usuarios en el sistema</Text>
          </View>
        ) : (
          userStats.map((user, index) => (
            <TouchableOpacity
              key={user.userId}
              style={[
                styles.userCard,
                index < 3 && user.count > 0 && styles.topUserCard,
                user.count === 0 && styles.inactiveUserCard,
              ]}
              onPress={() => handleUserPress(user)}
              activeOpacity={0.7}
            >
              <View style={styles.userCardLeft}>
                {user.count > 0 && getRankingBadge(index)}
                <View style={[
                  styles.userAvatar,
                  user.count === 0 && styles.inactiveUserAvatar
                ]}>
                  <Ionicons name="person" size={24} color={user.count > 0 ? colors.text : colors.textSecondary} />
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.userName}
                    </Text>
                    {user.count > 0 && getRankingIcon(index) && (
                      <Text style={styles.rankingIcon}>{getRankingIcon(index)}</Text>
                    )}
                  </View>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user.userEmail}
                  </Text>
                </View>
              </View>
              <View style={styles.userCardRight}>
                <View style={styles.countBadge}>
                  <Text style={[
                    styles.countNumber,
                    user.count === 0 && styles.countNumberInactive
                  ]}>
                    {user.count}
                  </Text>
                  <Text style={styles.countLabel}>
                    {user.count === 1 ? 'problema' : 'problemas'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  statsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  statsInfo: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statsLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topUserCard: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  inactiveUserCard: {
    opacity: 0.6,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rank1: {
    backgroundColor: '#FFD700',
  },
  rank2: {
    backgroundColor: '#C0C0C0',
  },
  rank3: {
    backgroundColor: '#CD7F32',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveUserAvatar: {
    backgroundColor: colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  rankingIcon: {
    fontSize: 18,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadge: {
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
  },
  countNumberInactive: {
    color: colors.textSecondary,
  },
  countLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  problemCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  problemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  problemTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  problemType: {
    fontSize: 12,
    fontWeight: '600',
  },
  mechanicalType: {
    color: colors.mechanical,
  },
  electricalType: {
    color: colors.electrical,
  },
  problemDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  problemTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  problemInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  problemInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  problemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  problemCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default UserRegistrationsScreen;
