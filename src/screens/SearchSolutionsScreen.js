import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AppFooter from '../components/AppFooter';
import CustomAlert from '../components/CustomAlert';
import { useAuth } from '../context/AuthContext';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const SearchSolutionsScreen = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [allProblems, setAllProblems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showAccessDeniedAlert, setShowAccessDeniedAlert] = useState(false);

  useEffect(() => {
    // Verificar si el usuario tiene permiso para ver soluciones de todos
    if (!isAdmin && !user?.permissions?.canViewSolutions) {
      setShowAccessDeniedAlert(true);
      return;
    }
    loadAllProblems();
  }, [user]);

  // Reload problems when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user && (isAdmin || user?.permissions?.canViewSolutions)) {
        loadAllProblems();
      }
    }, [user, isAdmin])
  );

  useEffect(() => {
    if (searchText.trim().length > 2) {
      performSearch(searchText);
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  const loadAllProblems = async () => {
    try {
      setLoading(true);
      const data = await FirebaseFirestoreService.getAllProblems(user);
      setAllProblems(data);
    } catch (error) {
      console.error('Error cargando problemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = (query) => {
    setSearching(true);

    const searchTerms = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .split(/\s+/)
      .filter(term => term.length > 2); 

    if (searchTerms.length === 0) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const results = [];

    allProblems.forEach(problem => {
      let relevanceScore = 0;
      const matchedFields = new Set();

      const normalize = (text) => {
        if (!text) return '';
        return text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      };

      problem.problems?.forEach((prob, probIndex) => {
        const title = normalize(prob.problemTitle);
        searchTerms.forEach(term => {
          if (title.includes(term)) {
            relevanceScore += 10;
            matchedFields.add(`Título del problema ${probIndex + 1}`);
          }
        });

        const description = normalize(prob.problemDescription);
        searchTerms.forEach(term => {
          if (description.includes(term)) {
            relevanceScore += 5;
            matchedFields.add(`Descripción del problema ${probIndex + 1}`);
          }
        });

        prob.activities?.forEach((activity, actIndex) => {
          const activityText = normalize(activity.title);
          searchTerms.forEach(term => {
            if (activityText.includes(term)) {
              relevanceScore += 4;
              matchedFields.add(`Actividad ${actIndex + 1}`);
            }
          });
        });

        prob.solutions?.forEach((solution, solIndex) => {
          const solutionText = normalize(solution.title);
          searchTerms.forEach(term => {
            if (solutionText.includes(term)) {
              relevanceScore += 8;
              matchedFields.add(`Solución ${solIndex + 1}`);
            }
          });
        });

        const otherData = normalize(prob.otherData);
        searchTerms.forEach(term => {
          if (otherData.includes(term)) {
            relevanceScore += 2;
            matchedFields.add('Otros datos');
          }
        });
      });

      const topic = normalize(problem.generalData?.topic);
      const truckData = normalize(problem.generalData?.truckData);
      const workOrder = normalize(problem.generalData?.workOrder);

      searchTerms.forEach(term => {
        if (topic.includes(term)) {
          relevanceScore += 6;
          matchedFields.add('Tópico');
        }
        if (truckData.includes(term)) {
          relevanceScore += 3;
          matchedFields.add('Datos del camión');
        }
        if (workOrder.includes(term)) {
          relevanceScore += 3;
          matchedFields.add('Work Order');
        }
      });

      if (relevanceScore > 0) {
        results.push({
          ...problem,
          relevanceScore,
          matchedFields: Array.from(matchedFields),
        });
      }
    });

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    setSearchResults(results);
    setSearching(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleResultPress = (problem) => {
    router.push({
      pathname: '/problem-detail',
      params: { problemId: problem.id }
    });
  };

  const renderResultCard = ({ item }) => {
    const firstProblem = item.problems?.[0];

    return (
      <TouchableOpacity 
        style={styles.resultCard}
        onPress={() => handleResultPress(item)}
      >
        <View style={styles.relevanceContainer}>
          <View style={styles.relevanceBadge}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.relevanceText}>{item.relevanceScore}%</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.topicContainer}>
            <Ionicons name="pricetag" size={14} color={colors.primary} />
            <Text style={styles.topic}>{item.generalData?.topic || 'Sin tópico'}</Text>
          </View>

          <Text style={styles.problemTitle} numberOfLines={2}>
            {firstProblem?.problemTitle || 'Sin título'}
          </Text>

          <View style={styles.matchedFieldsContainer}>
            <Text style={styles.matchedLabel}>Coincidencias en:</Text>
            <View style={styles.matchedTags}>
              {item.matchedFields.slice(0, 3).map((field, index) => (
                <View key={index} style={styles.matchedTag}>
                  <Text style={styles.matchedTagText}>{field}</Text>
                </View>
              ))}
              {item.matchedFields.length > 3 && (
                <Text style={styles.moreMatches}>+{item.matchedFields.length - 3} más</Text>
              )}
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </View>
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
          <Text style={styles.headerTitle}>Buscar Soluciones</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando base de datos...</Text>
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
        <Text style={styles.headerTitle}>Buscar Soluciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ej: como solucionar fallas en motor..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {searchText.length > 0 && searchText.length <= 2 && (
          <Text style={styles.hint}>Escribe al menos 3 caracteres para buscar</Text>
        )}
      </View>

      {searchText.length > 2 && (
        <>
          {searching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.searchingText}>Buscando...</Text>
            </View>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <>
                  <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>
                      {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <FlatList
                    data={searchResults}
                    renderItem={renderResultCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                  />
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={80} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No se encontraron resultados</Text>
                  <Text style={styles.emptySubText}>Intenta con otras palabras clave</Text>
                </View>
              )}
            </>
          )}
        </>
      )}

      {searchText.length === 0 && (
        <View style={styles.initialContainer}>
          <Ionicons name="bulb-outline" size={80} color={colors.primary} />
          <Text style={styles.initialTitle}>Busca soluciones inteligentemente</Text>
          <Text style={styles.initialText}>
            Escribe palabras clave y encontraremos los problemas más relacionados
          </Text>
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Ejemplos:</Text>
            <Text style={styles.exampleText}>• "fallas en motor"</Text>
            <Text style={styles.exampleText}>• "reparar frenos"</Text>
            <Text style={styles.exampleText}>• "problema eléctrico"</Text>
          </View>
        </View>
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
        message="No tienes permiso para buscar soluciones de todos los usuarios"
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  searchingText: {
    marginLeft: 8,
    color: colors.textSecondary,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBackground,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  relevanceContainer: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  relevanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  relevanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  topic: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  matchedFieldsContainer: {
    marginBottom: 12,
  },
  matchedLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  matchedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  matchedTag: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  matchedTagText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500',
  },
  moreMatches: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
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
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  initialTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  initialText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  examplesContainer: {
    marginTop: 24,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});

export default SearchSolutionsScreen;