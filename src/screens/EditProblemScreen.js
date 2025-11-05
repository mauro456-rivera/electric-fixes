import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import ActivityItem from '../components/ActivityItem';
import AppFooter from '../components/AppFooter';
import CustomAlert from '../components/CustomAlert';
import CustomButton from '../components/CustomButton';
import SolutionItem from '../components/SolutionItem';
import { useAuth } from '../context/AuthContext';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const EditProblemScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { problemId, collectionName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showUploadingAlert, setShowUploadingAlert] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [problem, setProblem] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const [generalData, setGeneralData] = useState({
    topic: '',
    truckData: '',
    workOrder: '',
  });

  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const currentProblem = problems[currentProblemIndex];

  useEffect(() => {
    loadProblemData();
  }, [problemId]);

  const loadProblemData = async () => {
    try {
      setLoading(true);
      const data = await FirebaseFirestoreService.getProblemById(problemId, collectionName);
      setProblem(data);

      setGeneralData({
        topic: data.generalData?.topic || '',
        truckData: data.generalData?.truckData || '',
        workOrder: data.generalData?.workOrder || '',
      });

      // Cargar Work Order completo si existe
      if (data.generalData?.workOrderDetails) {
        setSelectedWorkOrder(data.generalData.workOrderDetails);
      }

      const loadedProblems = data.problems?.map(prob => ({
        id: Date.now() + Math.random(),
        problemTitle: prob.problemTitle || '',
        problemDescription: prob.problemDescription || '',
        problemFiles: [], 
        activities: prob.activities?.map(act => ({
          id: Date.now() + Math.random(),
          title: act.title || '',
          files: []
        })) || [{ id: Date.now(), title: '', files: [] }],
        solutions: prob.solutions?.map(sol => ({
          id: Date.now() + Math.random(),
          title: sol.title || '',
          files: []
        })) || [{ id: Date.now() + 1, title: '', files: [] }],
        otherData: prob.otherData || '',
      })) || [];

      setProblems(loadedProblems);
    } catch (error) {
      console.error('Error cargando problema:', error);
      setValidationError('No se pudo cargar el problema');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const updateGeneralData = (field, value) => {
    setGeneralData({
      ...generalData,
      [field]: value,
    });
  };

  const updateProblemField = (field, value) => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex] = {
      ...updatedProblems[currentProblemIndex],
      [field]: value,
    };
    setProblems(updatedProblems);
  };

  const addActivity = () => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].activities.push({
      id: Date.now(),
      title: '',
      files: [],
    });
    setProblems(updatedProblems);
  };

  const updateActivity = (index, updatedActivity) => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].activities[index] = updatedActivity;
    setProblems(updatedProblems);
  };

  const removeActivity = (index) => {
    if (currentProblem.activities.length === 1) {
      setValidationError('Debe haber al menos una actividad');
      setShowErrorAlert(true);
      return;
    }
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].activities.splice(index, 1);
    setProblems(updatedProblems);
  };

  const addSolution = () => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].solutions.push({
      id: Date.now(),
      title: '',
      files: [],
    });
    setProblems(updatedProblems);
  };

  const updateSolution = (index, updatedSolution) => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].solutions[index] = updatedSolution;
    setProblems(updatedProblems);
  };

  const removeSolution = (index) => {
    if (currentProblem.solutions.length === 1) {
      setValidationError('Debe haber al menos una solución');
      setShowErrorAlert(true);
      return;
    }
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].solutions.splice(index, 1);
    setProblems(updatedProblems);
  };

  const validateForm = () => {
    if (!generalData.topic.trim()) {
      setValidationError('El tópico es requerido');
      return false;
    }

    for (let i = 0; i < problems.length; i++) {
      const prob = problems[i];
      if (!prob.problemTitle.trim()) {
        setValidationError(`Problema ${i + 1}: El título del problema es requerido`);
        return false;
      }
    }
    return true;
  };

  // GUARDAR CAMBIOS
  const handleSave = async () => {
    if (!validateForm()) {
      setShowErrorAlert(true);
      return;
    }

    setSaving(true);
    setShowUploadingAlert(true);

    try {
      // Importar funciones de Firebase
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');

      // Actualizar el documento
      const docRef = doc(db, collectionName, problemId);
      await updateDoc(docRef, {
        'generalData.topic': generalData.topic,
        'generalData.truckData': generalData.truckData,
        'generalData.workOrder': generalData.workOrder,
        'generalData.workOrderDetails': selectedWorkOrder || null, // Actualizar Work Order completo
        problems: problems.map(prob => ({
          problemTitle: prob.problemTitle,
          problemDescription: prob.problemDescription,
          problemFiles: [], // Mantener vacío ya que no editamos archivos
          activities: prob.activities.map(act => ({
            title: act.title,
            files: []
          })),
          solutions: prob.solutions.map(sol => ({
            title: sol.title,
            files: []
          })),
          otherData: prob.otherData,
        }))
      });

      setShowUploadingAlert(false);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error guardando cambios:', error);
      setValidationError('No se pudieron guardar los cambios. Intenta de nuevo.');
      setShowUploadingAlert(false);
      setShowErrorAlert(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Problema</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  // SECCIONES DEL FORMULARIO
  const formSections = [
    { id: 'general', type: 'general' },
    { id: 'problem', type: 'problem' },
    { id: 'activities', type: 'activities' },
    { id: 'solutions', type: 'solutions' },
    { id: 'other', type: 'other' },
    { id: 'buttons', type: 'buttons' },
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      case 'general':
        if (currentProblemIndex !== 0) return null;
        return (
          <View style={styles.generalSection}>
            <Text style={styles.generalTitle}>Información General</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Tópico *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese el tópico"
                placeholderTextColor={colors.textSecondary}
                value={generalData.topic}
                onChangeText={(text) => updateGeneralData('topic', text)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Datos del Camión</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese datos del camión"
                placeholderTextColor={colors.textSecondary}
                value={generalData.truckData}
                onChangeText={(text) => updateGeneralData('truckData', text)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Work Order (No editable)</Text>
              <TextInput
                style={[styles.input, styles.inputReadOnly]}
                placeholder="Work Order"
                placeholderTextColor={colors.textSecondary}
                value={generalData.workOrder}
                editable={false}
              />
              <Text style={styles.helperText}>
                El Work Order no puede modificarse después de registrar el problema
              </Text>
            </View>
          </View>
        );

      case 'problem':
        if (!currentProblem) return null;
        return (
          <>
            <Text style={styles.problemNumber}>Problema {currentProblemIndex + 1}</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Título del Problema *</Text>
              <TextInput
                style={styles.input}
                placeholder="Título del problema"
                placeholderTextColor={colors.textSecondary}
                value={currentProblem.problemTitle}
                onChangeText={(text) => updateProblemField('problemTitle', text)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Descripción del Problema</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe el problema..."
                placeholderTextColor={colors.textSecondary}
                value={currentProblem.problemDescription}
                onChangeText={(text) => updateProblemField('problemDescription', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </>
        );

      case 'activities':
        if (!currentProblem) return null;
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Actividades Realizadas</Text>
              <TouchableOpacity onPress={addActivity} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            {currentProblem.activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={{ ...activity, index: index + 1 }}
                onUpdate={(updated) => updateActivity(index, updated)}
                onRemove={() => removeActivity(index)}
                showRemove={currentProblem.activities.length > 1}
              />
            ))}
          </View>
        );

      case 'solutions':
        if (!currentProblem) return null;
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Soluciones</Text>
              <TouchableOpacity onPress={addSolution} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            {currentProblem.solutions.map((solution, index) => (
              <SolutionItem
                key={solution.id}
                solution={{ ...solution, index: index + 1 }}
                onUpdate={(updated) => updateSolution(index, updated)}
                onRemove={() => removeSolution(index)}
                showRemove={currentProblem.solutions.length > 1}
              />
            ))}
          </View>
        );

      case 'other':
        if (!currentProblem) return null;
        return (
          <View style={styles.section}>
            <Text style={styles.label}>Otros Datos</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Información adicional..."
              placeholderTextColor={colors.textSecondary}
              value={currentProblem.otherData}
              onChangeText={(text) => updateProblemField('otherData', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        );

      case 'buttons':
        return (
          <View style={styles.buttonsContainer}>
            <View style={styles.actionButtons}>
              <CustomButton
                title="Guardar"
                onPress={handleSave}
                variant="primary"
                style={styles.saveButton}
                loading={saving}
                disabled={saving}
              />
              <CustomButton
                title="Cancelar"
                onPress={() => router.back()}
                variant="gray"
                style={styles.cancelButton}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Problema</Text>
        <View style={{ width: 24 }} />
      </View>

      {problems.length > 1 && (
        <View style={styles.problemNav}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {problems.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.problemTab,
                  currentProblemIndex === index && styles.problemTabActive,
                ]}
                onPress={() => setCurrentProblemIndex(index)}
              >
                <Text
                  style={[
                    styles.problemTabText,
                    currentProblemIndex === index && styles.problemTabTextActive,
                  ]}
                >
                  Problema {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <KeyboardAwareFlatList
        data={formSections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <CustomAlert
        visible={showUploadingAlert}
        onClose={() => {}}
        type="loading"
        title="Guardando Cambios"
        message="Actualizando el problema..."
      />

      <CustomAlert
        visible={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        title="Éxito"
        message="Los cambios se guardaron correctamente"
        buttons={[
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]}
      />

      {/* Alert de Error */}
      <CustomAlert
        visible={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        type="error"
        title="Error"
        message={validationError}
        buttons={[
          {
            text: 'OK',
            style: 'cancel'
          }
        ]}
      />

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
  problemNav: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  problemTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
  },
  problemTabActive: {
    backgroundColor: colors.primary,
  },
  problemTabText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  problemTabTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  generalSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  generalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  problemNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputReadOnly: {
    backgroundColor: colors.border + '40',
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    padding: 4,
  },
  buttonsContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});

export default EditProblemScreen;
