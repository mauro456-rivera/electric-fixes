import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const ProblemDetailScreen = () => {
  const router = useRouter();
  const { problemId } = useLocalSearchParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);

  useEffect(() => {
    loadProblemDetail();
  }, [problemId]);

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

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Problema</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
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
                <Ionicons name="alert-circle" size={20} color={colors.secondary} />
                <Text style={styles.sectionTitle}>Problema</Text>
              </View>
              
              <View style={styles.problemCard}>
                <Text style={styles.problemTitle}>{currentProblem.problemTitle}</Text>
                {currentProblem.problemDescription && (
                  <Text style={styles.problemDescription}>{currentProblem.problemDescription}</Text>
                )}
                
                {currentProblem.problemFiles && currentProblem.problemFiles.length > 0 && (
                  <View style={styles.filesSection}>
                    <Text style={styles.filesTitle}>Archivos adjuntos:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {currentProblem.problemFiles.map((url, index) => (
                        <Image
                          key={index}
                          source={{ uri: url }}
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>Actividades Realizadas</Text>
              </View>
              
              {currentProblem.activities?.map((activity, index) => (
                <View key={index} style={styles.activityCard}>
                  <Text style={styles.activityNumber}>Actividad {index + 1}</Text>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  {activity.files && activity.files.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filesScroll}>
                      {activity.files.map((url, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: url }}
                          style={styles.smallThumbnail}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={20} color={colors.warning} />
                <Text style={styles.sectionTitle}>Soluciones</Text>
              </View>
              {currentProblem.solutions?.map((solution, index) => (
                <View key={index} style={styles.solutionCard}>
                  <Text style={styles.solutionNumber}>Solución {index + 1}</Text>
                  <Text style={styles.solutionTitle}>{solution.title}</Text>
                  {solution.files && solution.files.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filesScroll}>
                      {solution.files.map((url, idx) => (
                        <Image
                          key={idx}
                          source={{ uri: url }}
                          style={styles.smallThumbnail}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
              ))}
            </View>

            {currentProblem.otherData && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text" size={20} color={colors.textSecondary} />
                  <Text style={styles.sectionTitle}>Otros Datos</Text>
                </View>
                <View style={styles.otherDataCard}>
                  <Text style={styles.otherDataText}>{currentProblem.otherData}</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
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
    fontSize: 14,
    color: colors.textSecondary,
  },
  problemTabTextActive: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  problemCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  problemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  problemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.border,
  },
  activityCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  filesScroll: {
    marginTop: 8,
  },
  smallThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.border,
  },
  solutionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  solutionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 4,
  },
  solutionTitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
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
});

export default ProblemDetailScreen;