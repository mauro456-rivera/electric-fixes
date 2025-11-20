import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import ActivityItem from '../components/ActivityItem';
import AppFooter from '../components/AppFooter';
import CustomAlert from '../components/CustomAlert';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import FirebaseFirestoreService from '../services/firebaseFirestore';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const RegisterProblemScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [problemType, setProblemType] = useState('mechanical'); // 'mechanical' o 'electrical'
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showMinActivityAlert, setShowMinActivityAlert] = useState(false);
  const [showMinProblemAlert, setShowMinProblemAlert] = useState(false);
  const [showUploadingAlert, setShowUploadingAlert] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [generalData, setGeneralData] = useState({
    diagnosticGuide: '',
    // Datos del Camión separados
    truckBrand: '', // Marca (ej: Freightliner, Kenworth, Peterbilt)
    truckModel: '', // Modelo (ej: Cascadia, T680, 579)
    truckYear: '', // Año (ej: 2020, 2021)
    // Campos de Información Básica (según metodología PDF)
    mainSymptom: '',
    urgency: 'Media', // Crítica/Media/Leve
    estimatedDiagnosticTime: '', // en minutos
  });

  // Estado para Síntomas Reportados (dinámicos)
  const [reportedSymptoms, setReportedSymptoms] = useState([
    { id: Date.now(), text: '' }
  ]);

  // Estado para Herramientas Requeridas (dinámicos)
  const [requiredTools, setRequiredTools] = useState({
    diagnostic: [{ id: Date.now(), text: '' }], // Scanner, multímetro, etc.
    tools: [{ id: Date.now() + 1, text: '' }], // Llaves, sockets específicos
    safety: [{ id: Date.now() + 2, text: '' }], // Guantes, gafas, etc.
  });

  // ARRAY DE PASOS
  const [problems, setProblems] = useState([
    {
      id: Date.now(),
      problemTitle: '',
      activities: [{ id: Date.now(), title: '', files: [], notes: [{ id: Date.now(), text: '' }] }],
      otherData: '',
      isExpanded: true,
    }
  ]);

  // Ya no necesitamos currentProblemIndex, mostraremos todos los PASOS

  // ACTUALIZAR DATOS GENERALES
  const updateGeneralData = (field, value) => {
    setGeneralData({
      ...generalData,
      [field]: value,
    });
  };

  // FUNCIONES PARA SÍNTOMAS REPORTADOS
  const addSymptom = () => {
    setReportedSymptoms([
      ...reportedSymptoms,
      { id: Date.now(), text: '' }
    ]);
  };

  const updateSymptom = (id, text) => {
    setReportedSymptoms(
      reportedSymptoms.map(symptom =>
        symptom.id === id ? { ...symptom, text } : symptom
      )
    );
  };

  const removeSymptom = (id) => {
    if (reportedSymptoms.length === 1) {
      // No permitir eliminar el último síntoma
      return;
    }
    setReportedSymptoms(reportedSymptoms.filter(symptom => symptom.id !== id));
  };

  // FUNCIONES PARA HERRAMIENTAS REQUERIDAS
  const addTool = (category) => {
    setRequiredTools({
      ...requiredTools,
      [category]: [...requiredTools[category], { id: Date.now(), text: '' }]
    });
  };

  const updateTool = (category, id, text) => {
    setRequiredTools({
      ...requiredTools,
      [category]: requiredTools[category].map(tool =>
        tool.id === id ? { ...tool, text } : tool
      )
    });
  };

  const removeTool = (category, id) => {
    if (requiredTools[category].length === 1) {
      // No permitir eliminar el último
      return;
    }
    setRequiredTools({
      ...requiredTools,
      [category]: requiredTools[category].filter(tool => tool.id !== id)
    });
  };


  // ACTUALIZAR PROBLEMA ACTUAL
  const updateProblemField = (problemIndex, field, value) => {
    const updatedProblems = [...problems];
    updatedProblems[problemIndex] = {
      ...updatedProblems[problemIndex],
      [field]: value,
    };
    setProblems(updatedProblems);
  };

  // ACTIVIDADES (agregar al inicio)
  const addActivity = (problemIndex) => {
    const updatedProblems = [...problems];
    updatedProblems[problemIndex].activities.unshift({ // unshift para agregar al inicio (la nueva aparece arriba)
      id: Date.now(),
      title: '',
      files: [],
      notes: [{ id: Date.now(), text: '' }],
    });
    setProblems(updatedProblems);
  };

  const updateActivity = (problemIndex, activityIndex, updatedActivity) => {
    const updatedProblems = [...problems];
    updatedProblems[problemIndex].activities[activityIndex] = updatedActivity;
    setProblems(updatedProblems);
  };

  const removeActivity = (problemIndex, activityIndex) => {
    if (problems[problemIndex].activities.length === 1) {
      setShowMinActivityAlert(true);
      return;
    }
    const updatedProblems = [...problems];
    updatedProblems[problemIndex].activities.splice(activityIndex, 1);
    setProblems(updatedProblems);
  };


  // AGREGAR NUEVO PASO (al inicio del array)
  const addProblem = () => {
    const newProblem = {
      id: Date.now(),
      problemTitle: '',
      activities: [{ id: Date.now(), title: '', files: [], notes: [{ id: Date.now(), text: '' }] }],
      otherData: '',
      isExpanded: true,
    };
    setProblems([newProblem, ...problems]); // Agregar al inicio (el nuevo aparece arriba)
  };

  // ELIMINAR PROBLEMA
  const removeProblem = (problemIndex) => {
    if (problems.length === 1) {
      setShowMinProblemAlert(true);
      return;
    }
    const updatedProblems = problems.filter((_, idx) => idx !== problemIndex);
    setProblems(updatedProblems);
  };

  // VALIDACIÓN
  const validateForm = () => {
    if (!generalData.diagnosticGuide.trim()) {
      setValidationError('La Guía de Diagnóstico es requerida');
      return false;
    }

    if (!generalData.mainSymptom.trim()) {
      setValidationError('El síntoma principal es requerido');
      return false;
    }

    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      if (!problem.problemTitle.trim()) {
        setValidationError(`Paso ${i + 1}: El título del paso es requerido`);
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
      // Preparar datos generales con síntomas y herramientas
      const generalDataWithDetails = {
        ...generalData,
        reportedSymptoms: reportedSymptoms.filter(s => s.text.trim() !== ''), // Solo síntomas con texto
        requiredTools: {
          diagnostic: requiredTools.diagnostic.filter(t => t.text.trim() !== ''),
          tools: requiredTools.tools.filter(t => t.text.trim() !== ''),
          safety: requiredTools.safety.filter(t => t.text.trim() !== ''),
        },
      };

      // Debug: Ver qué datos se están guardando
      console.log('📊 Datos que se van a guardar:', JSON.stringify(generalDataWithDetails, null, 2));

      await FirebaseFirestoreService.saveProblem(
        generalDataWithDetails,
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

  // SECCIONES DEL FORMULARIO PARA FLATLIST (dinámico para todos los PASOS)
  const formSections = [
    { id: 'type-selector', type: 'type-selector' },
    { id: 'general', type: 'general' },
    { id: 'symptoms', type: 'symptoms' },
    { id: 'tools', type: 'tools' },
    // Generar secciones para cada PASO (ahora incluye actividades y otros datos dentro)
    ...problems.map((problem, index) => (
      { id: `problem-${index}`, type: 'problem', problemIndex: index }
    )),
    { id: 'buttons', type: 'buttons' },
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      case 'type-selector':
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
        return (
          <>
            <View style={styles.generalSection}>
              <Text style={styles.generalTitle}>Información General</Text>
              
              <View style={[styles.section, styles.lowerSection]}>
                <Text style={styles.label}>GUÍA DE DIAGNÓSTICO *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: MOTOR NO ARRANCA - VOLVO D13 (2014-2020)"
                  placeholderTextColor={colors.textSecondary}
                  value={generalData.diagnosticGuide}
                  onChangeText={(text) => updateGeneralData('diagnosticGuide', text)}
                />
              </View>

              <View style={[styles.section, styles.lowerSection]}>
                <Text style={styles.label}>Datos del Camión</Text>

                {/* Marca */}
                <View style={styles.truckFieldContainer}>
                  <Text style={styles.truckFieldLabel}>Marca</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Freightliner, Kenworth, Peterbilt"
                    placeholderTextColor={colors.textSecondary}
                    value={generalData.truckBrand}
                    onChangeText={(text) => updateGeneralData('truckBrand', text)}
                  />
                </View>

                {/* Modelo */}
                <View style={styles.truckFieldContainer}>
                  <Text style={styles.truckFieldLabel}>Modelo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Cascadia, T680, 579"
                    placeholderTextColor={colors.textSecondary}
                    value={generalData.truckModel}
                    onChangeText={(text) => updateGeneralData('truckModel', text)}
                  />
                </View>

                {/* Año */}
                <View style={styles.truckFieldContainer}>
                  <Text style={styles.truckFieldLabel}>Año</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 2020, 2021, 2022"
                    placeholderTextColor={colors.textSecondary}
                    value={generalData.truckYear}
                    onChangeText={(text) => updateGeneralData('truckYear', text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* NUEVA SECCIÓN: INFORMACIÓN BÁSICA */}
            <View style={styles.generalSection}>
              <Text style={styles.generalTitle}>Información Básica</Text>

              <View style={[styles.section, styles.lowerSection]}>
                <Text style={styles.label}>Síntoma Principal *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Descripción clara del síntoma principal"
                  placeholderTextColor={colors.textSecondary}
                  value={generalData.mainSymptom}
                  onChangeText={(text) => updateGeneralData('mainSymptom', text)}
                />
              </View>

              <View style={[styles.section, styles.lowerSection]}>
                <Text style={styles.label}>Urgencia</Text>
                <View style={styles.urgencyContainer}>
                  {['Leve', 'Media', 'Crítica'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.urgencyButton,
                        generalData.urgency === level && styles.urgencyButtonActive,
                        generalData.urgency === level && level === 'Crítica' && styles.urgencyButtonCritical,
                        generalData.urgency === level && level === 'Media' && styles.urgencyButtonMedium,
                        generalData.urgency === level && level === 'Leve' && styles.urgencyButtonLow,
                      ]}
                      onPress={() => updateGeneralData('urgency', level)}
                    >
                      <Text
                        style={[
                          styles.urgencyButtonText,
                          generalData.urgency === level && styles.urgencyButtonTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.section, styles.lowerSection]}>
                <Text style={styles.label}>Tiempo Diagnóstico Estimado (minutos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 30, 60, 120"
                  placeholderTextColor={colors.textSecondary}
                  value={generalData.estimatedDiagnosticTime}
                  onChangeText={(text) => updateGeneralData('estimatedDiagnosticTime', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.separator} />
          </>
        );

      case 'symptoms':
        return (
          <>
            <View style={styles.symptomsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.generalTitle}>Síntomas Reportados (+)</Text>
                <TouchableOpacity onPress={addSymptom} style={styles.addButton}>
                  <Ionicons name="add-circle" size={28} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              {reportedSymptoms.map((symptom, index) => (
                <View key={symptom.id} style={styles.symptomItem}>
                  <View style={styles.symptomRow}>
                    <TextInput
                      style={styles.symptomInput}
                      placeholder={`Síntoma ${index + 1} (ej: Luz check engine encendida, Pérdida de potencia)`}
                      placeholderTextColor={colors.textSecondary}
                      value={symptom.text}
                      onChangeText={(text) => updateSymptom(symptom.id, text)}
                    />

                    {reportedSymptoms.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeSymptom(symptom.id)}
                        style={styles.removeSymptomButton}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.separator} />
          </>
        );

      case 'tools':
        return (
          <>
            <View style={styles.toolsSection}>
              <Text style={styles.generalTitle}>Herramientas Requeridas</Text>

              {/* Diagnóstico */}
              <View style={styles.toolCategory}>
                <View style={styles.toolCategoryHeader}>
                  <Ionicons name="medkit-outline" size={20} color={colors.primary} />
                  <Text style={styles.toolCategoryTitle}>Diagnóstico</Text>
                  <TouchableOpacity onPress={() => addTool('diagnostic')} style={styles.addToolButton}>
                    <Ionicons name="add-circle-outline" size={22} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
                {requiredTools.diagnostic.map((tool, index) => (
                  <View key={tool.id} style={styles.toolItemRow}>
                    <TextInput
                      style={styles.toolInput}
                      placeholder={`Ej: Scanner ${index > 0 ? ', Multímetro' : ''}`}
                      placeholderTextColor={colors.textSecondary}
                      value={tool.text}
                      onChangeText={(text) => updateTool('diagnostic', tool.id, text)}
                    />
                    {requiredTools.diagnostic.length > 1 && (
                      <TouchableOpacity onPress={() => removeTool('diagnostic', tool.id)} style={styles.removeToolButton}>
                        <Ionicons name="close-circle" size={20} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Herramientas */}
              <View style={styles.toolCategory}>
                <View style={styles.toolCategoryHeader}>
                  <Ionicons name="construct-outline" size={20} color={colors.primary} />
                  <Text style={styles.toolCategoryTitle}>Herramientas</Text>
                  <TouchableOpacity onPress={() => addTool('tools')} style={styles.addToolButton}>
                    <Ionicons name="add-circle-outline" size={22} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
                {requiredTools.tools.map((tool, index) => (
                  <View key={tool.id} style={styles.toolItemRow}>
                    <TextInput
                      style={styles.toolInput}
                      placeholder={`Ej: Llaves${index > 0 ? ', Sockets' : ''}`}
                      placeholderTextColor={colors.textSecondary}
                      value={tool.text}
                      onChangeText={(text) => updateTool('tools', tool.id, text)}
                    />
                    {requiredTools.tools.length > 1 && (
                      <TouchableOpacity onPress={() => removeTool('tools', tool.id)} style={styles.removeToolButton}>
                        <Ionicons name="close-circle" size={20} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Equipo de Seguridad */}
              <View style={styles.toolCategory}>
                <View style={styles.toolCategoryHeader}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                  <Text style={styles.toolCategoryTitle}>Equipo Seguridad</Text>
                  <TouchableOpacity onPress={() => addTool('safety')} style={styles.addToolButton}>
                    <Ionicons name="add-circle-outline" size={22} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
                {requiredTools.safety.map((tool, index) => (
                  <View key={tool.id} style={styles.toolItemRow}>
                    <TextInput
                      style={styles.toolInput}
                      placeholder={`Ej: Guantes${index > 0 ? ', Gafas' : ''}`}
                      placeholderTextColor={colors.textSecondary}
                      value={tool.text}
                      onChangeText={(text) => updateTool('safety', tool.id, text)}
                    />
                    {requiredTools.safety.length > 1 && (
                      <TouchableOpacity onPress={() => removeTool('safety', tool.id)} style={styles.removeToolButton}>
                        <Ionicons name="close-circle" size={20} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.separator} />
          </>
        );

      case 'problem': {
        const problemIndex = item.problemIndex;
        const problem = problems[problemIndex];
        return (
          <>
            {problemIndex === 0 && (
              <Text style={styles.procedureTitle}>procedimiento diagnostico:</Text>
            )}

            {problemIndex === 0 && (
              <View style={styles.pasosHeaderContainer}>
                <Text style={styles.pasosHeaderLabel}>PASOS:</Text>
                <TouchableOpacity onPress={addProblem} style={styles.addPasoButton}>
                  <Ionicons name="add-circle" size={24} color="#FFD700" />
                </TouchableOpacity>
              </View>
            )}

            {/* Contenedor que agrupa PASO #, ACTIVIDADES y OTROS DATOS */}
            <View style={styles.pasoWithActivitiesContainer}>
              <View style={styles.pasoContainer}>
                <View style={styles.pasoHeader}>
                  <Text style={styles.pasoNumber}>PASO {problems.length - problemIndex}:</Text>
                  <View style={styles.pasoButtonsRow}>
                    {problems.length > 1 && (
                      <TouchableOpacity onPress={() => removeProblem(problemIndex)} style={styles.pasoDeleteButton}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <TextInput
                  style={styles.pasoTitleInput}
                  placeholder="LECTURA DE PARAMETROS"
                  placeholderTextColor="#6B7280"
                  value={problem.problemTitle}
                  onChangeText={(text) => updateProblemField(problemIndex, 'problemTitle', text)}
                />
              </View>

              {/* ACTIVIDADES dentro del mismo contenedor */}
              <View style={styles.activitiesSection}>
                <View style={styles.activitiesHeader}>
                  <Text style={styles.activitiesTitle}>ACTIVIDADES:</Text>
                  <TouchableOpacity onPress={() => addActivity(problemIndex)} style={styles.addActivityButton}>
                    <Ionicons name="add-circle" size={24} color="#FFD700" />
                  </TouchableOpacity>
                </View>

                {problem.activities.map((activity, activityIndex) => (
                  <ActivityItem
                    key={activity.id}
                    activity={{ ...activity, index: problem.activities.length - activityIndex }}
                    onUpdate={(updated) => updateActivity(problemIndex, activityIndex, updated)}
                    onRemove={() => removeActivity(problemIndex, activityIndex)}
                    showRemove={problem.activities.length > 1}
                  />
                ))}
              </View>

              {/* OTROS DATOS dentro del mismo contenedor */}
              <View style={styles.otherDataSection}>
                <Text style={styles.otherDataLabel}>Otros Datos</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Información adicional..."
                  placeholderTextColor={colors.textSecondary}
                  value={problem.otherData}
                  onChangeText={(text) => updateProblemField(problemIndex, 'otherData', text)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </>
        );
      }

      case 'activities': {
        // Ya no se renderiza por separado, se renderiza dentro de 'problem'
        return null;
      }

      case 'other': {
        // Ya no se renderiza por separado, se renderiza dentro de 'problem'
        return null;
      }

      case 'buttons':
        return (
          <View style={styles.buttonsContainer}>
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
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/menu');
                  }
                }}
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
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/menu');
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Guía de Diagnóstico</Text>
        <View style={{ width: 24 }} />
      </View>

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
        message="Guía de diagnóstico registrada correctamente"
        buttons={[
          {
            text: 'OK',
            onPress: () => {
              setShowSuccessAlert(false);
              // Navegar al menú principal o intentar volver si hay historial
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/menu');
              }
            }
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

      {/* Alert Mínimo de Sub-pasos */}
      <CustomAlert
        visible={showMinActivityAlert}
        onClose={() => setShowMinActivityAlert(false)}
        type="info"
        title="Aviso"
        message="Debe haber al menos un sub-paso"
      />

      {/* Alert Mínimo de Pasos */}
      <CustomAlert
        visible={showMinProblemAlert}
        onClose={() => setShowMinProblemAlert(false)}
        type="info"
        title="Aviso"
        message="Debe haber al menos un paso"
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
  },
  lowerSection: {
    marginBottom: 12,
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
  // Estilos para Urgencia
  urgencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
  },
  urgencyButtonActive: {
    borderWidth: 2,
  },
  urgencyButtonCritical: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
  },
  urgencyButtonMedium: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B10',
  },
  urgencyButtonLow: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  urgencyButtonTextActive: {
    fontWeight: '700',
    color: colors.text,
  },
  // Estilos para campos de Datos del Camión
  truckFieldContainer: {
    marginBottom: 12,
  },
  truckFieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  // Estilos para Síntomas Reportados
  symptomsSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  symptomItem: {
    marginBottom: 12,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symptomInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeSymptomButton: {
    padding: 4,
  },
  // Estilos para Herramientas Requeridas
  toolsSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolCategory: {
    marginBottom: 16,
  },
  toolCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  toolCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  addToolButton: {
    padding: 2,
  },
  toolItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  toolInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeToolButton: {
    padding: 4,
  },
  // Estilos para procedimiento diagnostico - ACTUALIZADOS para coincidir con la imagen
  procedureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700', // Amarillo como en la imagen
    marginBottom: 16,
    textTransform: 'lowercase',
  },
  pasosHeaderLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  pasosHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addPasoButton: {
    padding: 4,
  },
  // Contenedor que agrupa PASO y ACTIVIDADES juntos
  pasoWithActivitiesContainer: {
    backgroundColor: '#1E293B', // Fondo oscuro como en la imagen
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  // Estilos para PASOS - ACTUALIZADOS para coincidir con la imagen
  pasoContainer: {
    marginBottom: 16,
  },
  pasoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pasoNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  pasoButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pasoEditButton: {
    backgroundColor: '#FFD700', // Amarillo como en la imagen
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasoDeleteButton: {
    padding: 4,
  },
  pasoTitleInput: {
    backgroundColor: '#0F172A', // Fondo más oscuro para el input
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#334155',
  },
  // Estilos para ACTIVIDADES - ACTUALIZADOS
  activitiesSection: {
    marginBottom: 16,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addActivityButton: {
    padding: 4,
  },
  // Estilos para OTROS DATOS
  otherDataSection: {
    marginTop: 4,
  },
  otherDataLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});

export default RegisterProblemScreen;