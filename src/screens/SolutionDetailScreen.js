import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import guestSolutionsDetailed from '../data/guestSolutionsDetailed.json';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const SolutionDetailScreen = () => {
  const router = useRouter();
  const { id, type } = useLocalSearchParams(); // id de la solución y type (mechanical/electrical)

  // Buscar la solución en los datos
  const solutions = type === 'mechanical' ? guestSolutionsDetailed.mechanical : guestSolutionsDetailed.electrical;
  const solution = solutions.find((s) => s.id === id);

  if (!solution) {
    return (
      <View style={globalStyles.container}>
        <Text style={styles.errorText}>Solución no encontrada</Text>
      </View>
    );
  }

  const typeColor = type === 'mechanical' ? colors.mechanical : colors.electrical;
  const typeIcon = type === 'mechanical' ? 'construct' : 'flash';

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Crítica':
        return '#ef4444';
      case 'Alta':
        return '#f59e0b';
      case 'Media':
        return '#3b82f6';
      case 'Baja':
        return '#10b981';
      default:
        return colors.textSecondary;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Alta':
        return '#ef4444';
      case 'Media':
        return '#f59e0b';
      case 'Baja':
        return '#10b981';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* Header Compacto */}
      <View style={styles.header}>
        <LinearGradient
          colors={[typeColor, typeColor + 'dd']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.iconBadge}>
              <Ionicons name={typeIcon} size={16} color="#ffffff" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{solution.category}</Text>
              <Text style={styles.truck}>{solution.truck}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Badges */}
        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: getSeverityColor(solution.severity) }]}>
            <Ionicons name="alert-circle" size={16} color="#ffffff" />
            <Text style={styles.badgeText}>{solution.severity}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getDifficultyColor(solution.difficulty) }]}>
            <Ionicons name="speedometer" size={16} color="#ffffff" />
            <Text style={styles.badgeText}>Dificultad: {solution.difficulty}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Ionicons name="time" size={16} color="#ffffff" />
            <Text style={styles.badgeText}>{solution.estimatedTime}</Text>
          </View>
        </View>

        {/* Problema */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={styles.sectionTitle}>Problema</Text>
          </View>
          <Text style={styles.problemText}>{solution.problem}</Text>
        </View>

        {/* Solución Rápida */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
            <Text style={styles.sectionTitle}>Solución Rápida</Text>
          </View>
          <Text style={styles.solutionText}>{solution.solution}</Text>
        </View>

        {/* Pasos Detallados */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={24} color={typeColor} />
            <Text style={styles.sectionTitle}>Pasos Detallados</Text>
          </View>
          {solution.steps && solution.steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: typeColor }]}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          ))}
        </View>

        {/* Herramientas Necesarias */}
        {solution.tools && solution.tools.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="build-outline" size={24} color={colors.warning} />
              <Text style={styles.sectionTitle}>Herramientas Necesarias</Text>
            </View>
            <View style={styles.toolsContainer}>
              {solution.tools.map((tool, index) => (
                <View key={index} style={styles.toolItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.toolText}>{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Precauciones */}
        {solution.precautions && solution.precautions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning-outline" size={24} color={colors.error} />
              <Text style={styles.sectionTitle}>Precauciones Importantes</Text>
            </View>
            <View style={styles.precautionsContainer}>
              {solution.precautions.map((precaution, index) => (
                <View key={index} style={styles.precautionItem}>
                  <Ionicons name="alert" size={18} color={colors.error} />
                  <Text style={styles.precautionText}>{precaution}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Partes y Repuestos */}
        {solution.parts && solution.parts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube-outline" size={24} color={colors.secondary} />
              <Text style={styles.sectionTitle}>Partes y Repuestos</Text>
            </View>
            {solution.parts.map((part, index) => (
              <View key={index} style={styles.partCard}>
                <View style={styles.partHeader}>
                  <Text style={styles.partName}>{part.name}</Text>
                  {part.optional && (
                    <View style={styles.optionalBadge}>
                      <Text style={styles.optionalText}>Opcional</Text>
                    </View>
                  )}
                </View>
                <View style={styles.partInfo}>
                  <Ionicons name="barcode-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.partNumber}>P/N: {part.partNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Nota Final */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.footerText}>
            Esta guía es de referencia. Siempre consulte el manual de servicio oficial de Volvo para procedimientos completos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  backButton: {
    padding: 0,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  truck: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  problemText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  solutionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  stepCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginLeft: 44,
  },
  toolsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  toolText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  precautionsContainer: {
    backgroundColor: colors.error + '15',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  precautionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  precautionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  partCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  optionalBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  optionalText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
  },
  partInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partNumber: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.primary + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default SolutionDetailScreen;
