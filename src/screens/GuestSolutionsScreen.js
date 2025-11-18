import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import guestSolutions from '../data/guestSolutions.json';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const GuestSolutionsScreen = () => {
  const router = useRouter();
  const { type } = useLocalSearchParams(); // 'mechanical' o 'electrical'
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');

  // Obtener soluciones según el tipo
  const solutions = type === 'mechanical' ? guestSolutions.mechanical : guestSolutions.electrical;
  const typeLabel = type === 'mechanical' ? 'Mecánicas' : 'Eléctricas';
  const typeColor = type === 'mechanical' ? colors.mechanical : colors.electrical;

  // Filtrar soluciones por búsqueda
  const filteredSolutions = solutions.filter((solution) => {
    const searchLower = searchText.toLowerCase();
    return (
      solution.problem.toLowerCase().includes(searchLower) ||
      solution.solution.toLowerCase().includes(searchLower) ||
      solution.truck.toLowerCase().includes(searchLower) ||
      solution.category.toLowerCase().includes(searchLower)
    );
  });

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

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Soluciones {typeLabel}</Text>
          <Text style={styles.headerSubtitle}>Camiones Volvo</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar problema, solución, categoría..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredSolutions.length} {filteredSolutions.length === 1 ? 'solución encontrada' : 'soluciones encontradas'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredSolutions.map((solution, index) => (
          <View key={solution.id} style={styles.solutionCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                <Ionicons
                  name={type === 'mechanical' ? 'construct' : 'flash'}
                  size={14}
                  color="#ffffff"
                />
                <Text style={styles.typeBadgeText}>{solution.category}</Text>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(solution.severity) }]}>
                <Text style={styles.severityText}>{solution.severity}</Text>
              </View>
            </View>

            <Text style={styles.truckName}>{solution.truck}</Text>

            <View style={styles.problemContainer}>
              <View style={styles.iconLabelContainer}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                <Text style={styles.sectionLabel}>Problema:</Text>
              </View>
              <Text style={styles.problemText}>{solution.problem}</Text>
            </View>

            <View style={styles.solutionContainer}>
              <View style={styles.iconLabelContainer}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                <Text style={styles.sectionLabel}>Solución:</Text>
              </View>
              <Text style={styles.solutionText}>{solution.solution}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.solutionId}>ID: {solution.id}</Text>
            </View>
          </View>
        ))}

        {filteredSolutions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No se encontraron soluciones</Text>
            <Text style={styles.emptySubtext}>Intenta con otros términos de búsqueda</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 12,
  },
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  solutionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  truckName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  problemContainer: {
    marginBottom: 12,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  problemText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 24,
  },
  solutionContainer: {
    marginBottom: 12,
  },
  solutionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 24,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  solutionId: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

export default GuestSolutionsScreen;
