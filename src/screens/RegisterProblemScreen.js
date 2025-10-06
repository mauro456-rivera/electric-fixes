import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import ActivityItem from '../components/ActivityItem';
import CustomButton from '../components/CustomButton';
import FileUploader from '../components/FileUploader';
import SolutionItem from '../components/SolutionItem';
import WorkOrderAutocomplete from '../components/WorkOrderAutocomplete';
import { useAuth } from '../context/AuthContext';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

// CustomAlert Component
const CustomAlert = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'success',
  buttons = []
}) => {
  const getIcon = () => {
    switch(type) {
      case 'success':
        return { name: 'checkmark-circle', color: colors.success };
      case 'error':
        return { name: 'close-circle', color: colors.error };
      case 'warning':
        return { name: 'warning', color: colors.warning };
      default:
        return { name: 'information-circle', color: colors.primary };
    }
  };

  const icon = getIcon();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={alertStyles.overlay}>
        <View style={alertStyles.alertContainer}>
          <View style={[alertStyles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Ionicons name={icon.name} size={48} color={icon.color} />
          </View>
          
          <Text style={alertStyles.title}>{title}</Text>
          {message && <Text style={alertStyles.message}>{message}</Text>}
          
          <View style={alertStyles.buttonsContainer}>
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    alertStyles.button,
                    button.style === 'cancel' && alertStyles.cancelButton,
                    button.style === 'destructive' && alertStyles.destructiveButton,
                    buttons.length === 1 && alertStyles.singleButton
                  ]}
                  onPress={() => {
                    onClose();
                    button.onPress?.();
                  }}
                >
                  <Text style={[
                    alertStyles.buttonText,
                    button.style === 'cancel' && alertStyles.cancelButtonText,
                    button.style === 'destructive' && alertStyles.destructiveButtonText
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity style={alertStyles.singleButton} onPress={onClose}>
                <Text style={alertStyles.buttonText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const RegisterProblemScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showMinActivityAlert, setShowMinActivityAlert] = useState(false);
  const [showMinSolutionAlert, setShowMinSolutionAlert] = useState(false);
  const [showMinProblemAlert, setShowMinProblemAlert] = useState(false);
  const [validationError, setValidationError] = useState('');

  // DATOS GENERALES (SE LLENAN UNA SOLA VEZ)
  const [generalData, setGeneralData] = useState({
    topic: '',
    truckData: '',
    workOrder: '',
  });

  // ARRAY DE PROBLEMAS (SIN CAMPOS GENERALES)
  const [problems, setProblems] = useState([
    {
      id: Date.now(),
      problemTitle: '',
      problemDescription: '',
      problemFiles: [],
      activities: [{ id: Date.now(), title: '', files: [] }],
      solutions: [{ id: Date.now() + 1, title: '', files: [] }],
      otherData: '',
    }
  ]);

  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const currentProblem = problems[currentProblemIndex];

  // ACTUALIZAR DATOS GENERALES
  const updateGeneralData = (field, value) => {
    setGeneralData({
      ...generalData,
      [field]: value,
    });
  };

  // ACTUALIZAR PROBLEMA ACTUAL
  const updateProblemField = (field, value) => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex] = {
      ...updatedProblems[currentProblemIndex],
      [field]: value,
    };
    setProblems(updatedProblems);
  };

  // ACTIVIDADES
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
      setShowMinActivityAlert(true);
      return;
    }
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].activities.splice(index, 1);
    setProblems(updatedProblems);
  };

  // SOLUCIONES
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
      setShowMinSolutionAlert(true);
      return;
    }
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].solutions.splice(index, 1);
    setProblems(updatedProblems);
  };

  // AGREGAR NUEVO PROBLEMA (SIN CAMPOS GENERALES)
  const addProblem = () => {
    const newProblem = {
      id: Date.now(),
      problemTitle: '',
      problemDescription: '',
      problemFiles: [],
      activities: [{ id: Date.now(), title: '', files: [] }],
      solutions: [{ id: Date.now() + 1, title: '', files: [] }],
      otherData: '',
    };
    setProblems([...problems, newProblem]);
    setCurrentProblemIndex(problems.length);
  };

  // ELIMINAR PROBLEMA
  const removeProblem = () => {
    if (problems.length === 1) {
      setShowMinProblemAlert(true);
      return;
    }
    setShowDeleteAlert(true);
  };

  const confirmDeleteProblem = () => {
    const updatedProblems = problems.filter((_, idx) => idx !== currentProblemIndex);
    setProblems(updatedProblems);
    setCurrentProblemIndex(Math.max(0, currentProblemIndex - 1));
  };

  // VALIDACIÓN
  const validateForm = () => {
    if (!generalData.topic.trim()) {
      setValidationError('El tópico es requerido');
      return false;
    }

    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      if (!problem.problemTitle.trim()) {
        setValidationError(`Problema ${i + 1}: El título del problema es requerido`);
        return false;
      }
    }
    return true;
  };

  // GUARDAR
  const handleSave = async () => {
    if (!validateForm()) {
      setShowErrorAlert(true);
      return;
    }

    setLoading(true);

    try {
      const problemId = await FirebaseFirestoreService.saveProblem(
        generalData,
        problems,
        user
      );

      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error guardando:', error);
      setValidationError('No se pudo guardar el problema. Intenta de nuevo.');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // SECCIONES DEL FORMULARIO PARA FLATLIST
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
          <>
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
                <Text style={styles.label}>Work Order</Text>
                <WorkOrderAutocomplete
                  value={generalData.workOrder}
                  onSelect={(displayText, workOrderObject) => {
                    updateGeneralData('workOrder', displayText);
                    setSelectedWorkOrder(workOrderObject);
                  }}
                  placeholder="Buscar Work Order..."
                />
              </View>
            </View>
            <View style={styles.separator} />
          </>
        );

      case 'problem':
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

            <FileUploader
              files={currentProblem.problemFiles}
              onFilesChange={(files) => updateProblemField('problemFiles', files)}
              label="Adjuntar archivos del problema"
            />
          </>
        );

      case 'activities':
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
            <CustomButton
              title="Agregar Problema +"
              onPress={addProblem}
              variant="secondary"
              style={styles.addProblemButton}
            />
            <View style={styles.actionButtons}>
              <CustomButton
                title="Guardar"
                onPress={handleSave}
                variant="secondary"
                style={styles.saveButton}
                loading={loading}
                disabled={loading}
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
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Problema</Text>
        {problems.length > 1 && (
          <TouchableOpacity onPress={removeProblem} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        )}
        {problems.length === 1 && <View style={{ width: 24 }} />}
      </View>

      {/* NAVEGACIÓN ENTRE PROBLEMAS */}
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

      {/* FORMULARIO CON FLATLIST */}
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

      {/* Alert de Éxito */}
      <CustomAlert
        visible={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        title="Éxito"
        message="Problemas registrados correctamente en Firebase"
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

      {/* Alert de Eliminar Problema */}
      <CustomAlert
        visible={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        type="warning"
        title="Eliminar Problema"
        message="¿Estás seguro de eliminar este problema?"
        buttons={[
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: confirmDeleteProblem
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]}
      />

      {/* Alert Mínimo de Actividades */}
      <CustomAlert
        visible={showMinActivityAlert}
        onClose={() => setShowMinActivityAlert(false)}
        type="info"
        title="Aviso"
        message="Debe haber al menos una actividad"
      />

      {/* Alert Mínimo de Soluciones */}
      <CustomAlert
        visible={showMinSolutionAlert}
        onClose={() => setShowMinSolutionAlert(false)}
        type="info"
        title="Aviso"
        message="Debe haber al menos una solución"
      />

      {/* Alert Mínimo de Problemas */}
      <CustomAlert
        visible={showMinProblemAlert}
        onClose={() => setShowMinProblemAlert(false)}
        type="info"
        title="Aviso"
        message="Debe haber al menos un problema"
      />
    </View>
  );
};

const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  singleButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  destructiveButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
  destructiveButtonText: {
    color: colors.text,
  },
});

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
  deleteButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
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
  separator: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: 20,
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
  addProblemButton: {
    marginBottom: 12,
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

export default RegisterProblemScreen;