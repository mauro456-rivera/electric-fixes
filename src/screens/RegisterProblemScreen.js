import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import ActivityItem from '../components/ActivityItem';
import AppFooter from '../components/AppFooter';
import CustomAlert from '../components/CustomAlert';
import CustomButton from '../components/CustomButton';
import FileUploader from '../components/FileUploader';
import SolutionItem from '../components/SolutionItem';
import WorkOrderAutocomplete from '../components/WorkOrderAutocomplete';
import { useAuth } from '../context/AuthContext';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const RegisterProblemScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [problemType, setProblemType] = useState('mechanical'); // 'mechanical' o 'electrical'
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showMinActivityAlert, setShowMinActivityAlert] = useState(false);
  const [showMinSolutionAlert, setShowMinSolutionAlert] = useState(false);
  const [showMinProblemAlert, setShowMinProblemAlert] = useState(false);
  const [showUploadingAlert, setShowUploadingAlert] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [isCustomTopic, setIsCustomTopic] = useState(false);

  const topicOptions = [
    'Diagnostico Freno Motor',
    'Diagnostico Retarder',
    'Diagnostico Sistema de Combustible',
    'Diagnostico Frenos',
    'Diagnostico Suspension',
    'Diagnostico Luces',
    'Diagnostico AdBlue',
    'Diagnostico Potencia Motor',
    'Otro'
  ];

  const [generalData, setGeneralData] = useState({
    topic: '',
    truckData: '',
    workOrder: 'WO-TA-',
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

  // Manejar selección de tópico
  const handleTopicSelection = (topic) => {
    if (topic === 'Otro') {
      setIsCustomTopic(true);
      updateGeneralData('topic', '');
      setShowTopicModal(false); // Cerrar dropdown al seleccionar "Otro"
    } else {
      setIsCustomTopic(false);
      updateGeneralData('topic', topic);
      setShowTopicModal(false); // Cerrar dropdown al seleccionar
    }
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
    setShowUploadingAlert(true); // Mostrar alerta de subiendo datos

    try {
      // Preparar datos generales con Work Order completo
      const generalDataWithWorkOrder = {
        ...generalData,
        workOrderDetails: selectedWorkOrder || null, // Guardar el objeto completo del Work Order
      };

      const problemId = await FirebaseFirestoreService.saveProblem(
        generalDataWithWorkOrder,
        problems,
        user,
        problemType // Pasar el tipo de problema
      );

      setShowUploadingAlert(false); // Ocultar alerta de subiendo
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error guardando:', error);
      setValidationError('No se pudo guardar el problema. Intenta de nuevo.');
      setShowUploadingAlert(false); // Ocultar alerta de subiendo
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // SECCIONES DEL FORMULARIO PARA FLATLIST
  const formSections = [
    { id: 'type-selector', type: 'type-selector' },
    { id: 'general', type: 'general' },
    { id: 'problem', type: 'problem' },
    { id: 'activities', type: 'activities' },
    { id: 'solutions', type: 'solutions' },
    { id: 'other', type: 'other' },
    { id: 'buttons', type: 'buttons' },
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      case 'type-selector':
        if (currentProblemIndex !== 0) return null;
        return (
          <View style={styles.typeSelectorSection}>
            <Text style={styles.typeSelectorTitle}>Tipo de Problema</Text>
            <View style={styles.typeOptions}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  problemType === 'mechanical' && styles.typeOptionActive,
                ]}
                onPress={() => setProblemType('mechanical')}
              >
                <Ionicons
                  name="construct"
                  size={32}
                  color={problemType === 'mechanical' ? colors.mechanical : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    problemType === 'mechanical' && styles.typeOptionTextActiveMechanical,
                  ]}
                >
                  Mecánico
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  problemType === 'electrical' && styles.typeOptionActiveElectrical,
                ]}
                onPress={() => setProblemType('electrical')}
              >
                <Ionicons
                  name="flash"
                  size={32}
                  color={problemType === 'electrical' ? colors.electrical : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    problemType === 'electrical' && styles.typeOptionTextActiveElectrical,
                  ]}
                >
                  Eléctrico
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'general':
        if (currentProblemIndex !== 0) return null;
        return (
          <>
            <View style={styles.generalSection}>
              <Text style={styles.generalTitle}>Información General</Text>
              
              <View style={[styles.section, styles.topicSection]}>
                <Text style={styles.label}>Tópico *</Text>
                <TouchableOpacity
                  activeOpacity={isCustomTopic ? 1 : 0.7}
                  onPress={() => !isCustomTopic && setShowTopicModal(!showTopicModal)}
                  style={styles.topicTouchableContainer}
                >
                  <View style={styles.topicInputWrapper}>
                    <TextInput
                      style={[styles.input, styles.topicInputField]}
                      placeholder={isCustomTopic ? "Escriba el tópico" : "Seleccione tópico"}
                      placeholderTextColor={colors.textSecondary}
                      value={generalData.topic}
                      onChangeText={(text) => updateGeneralData('topic', text)}
                      editable={isCustomTopic}
                      pointerEvents={isCustomTopic ? 'auto' : 'none'}
                    />
                    <View style={styles.topicIconContainer}>
                      <Ionicons
                        name={showTopicModal ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={[styles.section, styles.lowerSection]}>
                <Text style={styles.label}>Datos del Camión</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese datos del camión"
                  placeholderTextColor={colors.textSecondary}
                  value={generalData.truckData}
                  onChangeText={(text) => updateGeneralData('truckData', text)}
                />
              </View>

              <View style={[styles.section, styles.lowerSection]}>
                <Text style={styles.label}>Work Order</Text>
                <WorkOrderAutocomplete
                  value={generalData.workOrder}
                  onSelect={(displayText, workOrderObject) => {
                    updateGeneralData('workOrder', displayText);
                    setSelectedWorkOrder(workOrderObject);
                  }}
                  placeholder="WO-TA-####"
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
                variant="primary"
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

      {/* Modal de Dropdown de Tópicos */}
      <Modal
        visible={showTopicModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTopicModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTopicModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.topicDropdownModal}>
              <Text style={styles.dropdownTitle}>Seleccione un tópico</Text>
              <FlatList
                data={topicOptions}
                keyExtractor={(item, index) => `topic-${index}`}
                showsVerticalScrollIndicator={true}
                bounces={true}
                renderItem={({ item: topic }) => (
                  <TouchableOpacity
                    style={[
                      styles.topicDropdownItem,
                      generalData.topic === topic && !isCustomTopic && styles.topicDropdownItemSelected
                    ]}
                    onPress={() => handleTopicSelection(topic)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.topicDropdownText,
                      generalData.topic === topic && !isCustomTopic && styles.topicDropdownTextSelected
                    ]}>
                      {topic}
                    </Text>
                    {generalData.topic === topic && !isCustomTopic && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Alert de Subiendo Datos */}
      <CustomAlert
        visible={showUploadingAlert}
        onClose={() => {}}
        type="loading"
        title="Subiendo Datos"
        message="Guardando problema y archivos..."
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
    overflow: 'visible',
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
    zIndex: 1,
  },
  topicSection: {
    zIndex: 1000,
  },
  lowerSection: {
    zIndex: 0,
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
  typeSelectorSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeOptionActiveElectrical: {
    borderColor: colors.electrical,
    backgroundColor: colors.electrical + '10',
  },
  typeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  typeOptionTextActive: {
    color: colors.text,
  },
  typeOptionTextActiveMechanical: {
    color: colors.mechanical,
    fontWeight: '700',
  },
  typeOptionTextActiveElectrical: {
    color: colors.electrical,
    fontWeight: '700',
  },
  topicTouchableContainer: {
    width: '100%',
  },
  topicInputWrapper: {
    position: 'relative',
    width: '100%',
  },
  topicInputField: {
    paddingRight: 40,
  },
  topicIconContainer: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '60%',
  },
  topicDropdownModal: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    maxHeight: 400,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  topicDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topicDropdownItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  topicDropdownText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  topicDropdownTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RegisterProblemScreen;