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
    // Datos del Camión separados
    truckBrand: '',
    truckModel: '',
    truckYear: '',
    workOrder: '',
    // Información Básica
    mainSymptom: '',
    urgency: 'Media',
    estimatedDiagnosticTime: '',
  });

  // Estados para síntomas y herramientas
  const [reportedSymptoms, setReportedSymptoms] = useState([
    { id: Date.now(), text: '' }
  ]);

  const [requiredTools, setRequiredTools] = useState({
    diagnostic: [{ id: Date.now(), text: '' }],
    tools: [{ id: Date.now() + 1, text: '' }],
    safety: [{ id: Date.now() + 2, text: '' }],
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

      console.log('📥 Datos cargados de Firestore:', {
        truckBrand: data.generalData?.truckBrand,
        truckModel: data.generalData?.truckModel,
        truckYear: data.generalData?.truckYear,
        mainSymptom: data.generalData?.mainSymptom,
        urgency: data.generalData?.urgency,
        reportedSymptoms: data.generalData?.reportedSymptoms,
        requiredTools: data.generalData?.requiredTools,
      });

      setGeneralData({
        topic: data.generalData?.topic || '',
        // Datos del Camión (priorizar campos separados)
        truckBrand: data.generalData?.truckBrand || '',
        truckModel: data.generalData?.truckModel || '',
        truckYear: data.generalData?.truckYear || '',
        workOrder: data.generalData?.workOrder || '',
        // Información Básica
        mainSymptom: data.generalData?.mainSymptom || '',
        urgency: data.generalData?.urgency || 'Media',
        estimatedDiagnosticTime: data.generalData?.estimatedDiagnosticTime || '',
      });

      // Cargar Work Order completo si existe
      if (data.generalData?.workOrderDetails) {
        setSelectedWorkOrder(data.generalData.workOrderDetails);
      }

      // Cargar síntomas reportados
      if (data.generalData?.reportedSymptoms && data.generalData.reportedSymptoms.length > 0) {
        setReportedSymptoms(data.generalData.reportedSymptoms);
      }

      // Cargar herramientas requeridas
      if (data.generalData?.requiredTools) {
        setRequiredTools({
          diagnostic: data.generalData.requiredTools.diagnostic?.length > 0
            ? data.generalData.requiredTools.diagnostic
            : [{ id: Date.now(), text: '' }],
          tools: data.generalData.requiredTools.tools?.length > 0
            ? data.generalData.requiredTools.tools
            : [{ id: Date.now() + 1, text: '' }],
          safety: data.generalData.requiredTools.safety?.length > 0
            ? data.generalData.requiredTools.safety
            : [{ id: Date.now() + 2, text: '' }],
        });
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

  // Funciones para manejar Síntomas Reportados
  const addSymptom = () => {
    setReportedSymptoms([...reportedSymptoms, { id: Date.now(), text: '' }]);
  };

  const updateSymptom = (id, text) => {
    setReportedSymptoms(reportedSymptoms.map(symptom =>
      symptom.id === id ? { ...symptom, text } : symptom
    ));
  };

  const removeSymptom = (id) => {
    if (reportedSymptoms.length > 1) {
      setReportedSymptoms(reportedSymptoms.filter(symptom => symptom.id !== id));
    }
  };

  // Funciones para manejar Herramientas Requeridas
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
    if (requiredTools[category].length > 1) {
      setRequiredTools({
        ...requiredTools,
        [category]: requiredTools[category].filter(tool => tool.id !== id)
      });
    }
  };

  const validateForm = () => {
    if (!generalData.topic.trim()) {
      setValidationError('El tópico es requerido');
      return false;
    }

    if (!generalData.mainSymptom.trim()) {
      setValidationError('El síntoma principal es requerido');
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

      // Filtrar síntomas y herramientas que no estén vacíos
      const filteredSymptoms = reportedSymptoms.filter(s => s.text.trim() !== '');
      const filteredTools = {
        diagnostic: requiredTools.diagnostic.filter(t => t.text.trim() !== ''),
        tools: requiredTools.tools.filter(t => t.text.trim() !== ''),
        safety: requiredTools.safety.filter(t => t.text.trim() !== ''),
      };

      // Actualizar el documento
      const docRef = doc(db, collectionName, problemId);
      await updateDoc(docRef, {
        'generalData.topic': generalData.topic,
        'generalData.truckBrand': generalData.truckBrand,
        'generalData.truckModel': generalData.truckModel,
        'generalData.truckYear': generalData.truckYear,
        'generalData.truckData': `${generalData.truckBrand} ${generalData.truckModel} ${generalData.truckYear}`.trim(),
        'generalData.workOrder': generalData.workOrder,
        'generalData.workOrderDetails': selectedWorkOrder || null,
        'generalData.mainSymptom': generalData.mainSymptom,
        'generalData.urgency': generalData.urgency,
        'generalData.estimatedDiagnosticTime': generalData.estimatedDiagnosticTime,
        'generalData.reportedSymptoms': filteredSymptoms,
        'generalData.requiredTools': filteredTools,
        problems: problems.map(prob => ({
          problemTitle: prob.problemTitle,
          problemDescription: prob.problemDescription,
          problemFiles: [],
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
    { id: 'basicInfo', type: 'basicInfo' },
    { id: 'symptoms', type: 'symptoms' },
    { id: 'tools', type: 'tools' },
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

              <Text style={styles.sublabel}>Marca</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Freightliner"
                placeholderTextColor={colors.textSecondary}
                value={generalData.truckBrand}
                onChangeText={(text) => updateGeneralData('truckBrand', text)}
              />

              <Text style={[styles.sublabel, { marginTop: 12 }]}>Modelo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Cascadia"
                placeholderTextColor={colors.textSecondary}
                value={generalData.truckModel}
                onChangeText={(text) => updateGeneralData('truckModel', text)}
              />

              <Text style={[styles.sublabel, { marginTop: 12 }]}>Año</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 2020"
                placeholderTextColor={colors.textSecondary}
                value={generalData.truckYear}
                onChangeText={(text) => updateGeneralData('truckYear', text)}
                keyboardType="numeric"
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

      case 'basicInfo':
        if (currentProblemIndex !== 0) return null;
        return (
          <View style={styles.generalSection}>
            <Text style={styles.generalTitle}>Información Básica</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Síntoma Principal *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Motor no arranca"
                placeholderTextColor={colors.textSecondary}
                value={generalData.mainSymptom}
                onChangeText={(text) => updateGeneralData('mainSymptom', text)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Urgencia</Text>
              <View style={styles.urgencyContainer}>
                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    generalData.urgency === 'Crítica' && styles.urgencyButtonCritical,
                  ]}
                  onPress={() => updateGeneralData('urgency', 'Crítica')}
                >
                  <Text
                    style={[
                      styles.urgencyButtonText,
                      generalData.urgency === 'Crítica' && styles.urgencyButtonTextActive,
                    ]}
                  >
                    Crítica
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    generalData.urgency === 'Media' && styles.urgencyButtonMedium,
                  ]}
                  onPress={() => updateGeneralData('urgency', 'Media')}
                >
                  <Text
                    style={[
                      styles.urgencyButtonText,
                      generalData.urgency === 'Media' && styles.urgencyButtonTextActive,
                    ]}
                  >
                    Media
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    generalData.urgency === 'Leve' && styles.urgencyButtonLow,
                  ]}
                  onPress={() => updateGeneralData('urgency', 'Leve')}
                >
                  <Text
                    style={[
                      styles.urgencyButtonText,
                      generalData.urgency === 'Leve' && styles.urgencyButtonTextActive,
                    ]}
                  >
                    Leve
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Tiempo Estimado de Diagnóstico</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 2 horas"
                placeholderTextColor={colors.textSecondary}
                value={generalData.estimatedDiagnosticTime}
                onChangeText={(text) => updateGeneralData('estimatedDiagnosticTime', text)}
              />
            </View>
          </View>
        );

      case 'symptoms':
        if (currentProblemIndex !== 0) return null;
        return (
          <View style={styles.generalSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.generalTitle}>Síntomas Reportados</Text>
              <TouchableOpacity onPress={addSymptom} style={styles.addButton}>
                <Ionicons name="add-circle" size={28} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            {reportedSymptoms.map((symptom, index) => (
              <View key={symptom.id} style={styles.dynamicItemContainer}>
                <View style={styles.dynamicItemContent}>
                  <Text style={styles.dynamicItemNumber}>{index + 1}.</Text>
                  <TextInput
                    style={styles.dynamicInput}
                    placeholder="Describe el síntoma"
                    placeholderTextColor={colors.textSecondary}
                    value={symptom.text}
                    onChangeText={(text) => updateSymptom(symptom.id, text)}
                  />
                </View>
                {reportedSymptoms.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeSymptom(symptom.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        );

      case 'tools':
        if (currentProblemIndex !== 0) return null;
        return (
          <View style={styles.generalSection}>
            <Text style={styles.generalTitle}>Herramientas Requeridas</Text>

            {/* Equipos de Diagnóstico */}
            <View style={styles.section}>
              <View style={styles.toolCategoryHeader}>
                <Ionicons name="medkit-outline" size={20} color={colors.secondary} />
                <Text style={styles.toolCategoryTitle}>Equipos de Diagnóstico</Text>
                <TouchableOpacity
                  onPress={() => addTool('diagnostic')}
                  style={styles.addSmallButton}
                >
                  <Ionicons name="add-circle" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              {requiredTools.diagnostic.map((tool, index) => (
                <View key={tool.id} style={styles.dynamicItemContainer}>
                  <View style={styles.dynamicItemContent}>
                    <Text style={styles.dynamicItemNumber}>{index + 1}.</Text>
                    <TextInput
                      style={styles.dynamicInput}
                      placeholder="Ej: Scanner OBD2"
                      placeholderTextColor={colors.textSecondary}
                      value={tool.text}
                      onChangeText={(text) => updateTool('diagnostic', tool.id, text)}
                    />
                  </View>
                  {requiredTools.diagnostic.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeTool('diagnostic', tool.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Herramientas */}
            <View style={styles.section}>
              <View style={styles.toolCategoryHeader}>
                <Ionicons name="construct-outline" size={20} color={colors.secondary} />
                <Text style={styles.toolCategoryTitle}>Herramientas</Text>
                <TouchableOpacity onPress={() => addTool('tools')} style={styles.addSmallButton}>
                  <Ionicons name="add-circle" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              {requiredTools.tools.map((tool, index) => (
                <View key={tool.id} style={styles.dynamicItemContainer}>
                  <View style={styles.dynamicItemContent}>
                    <Text style={styles.dynamicItemNumber}>{index + 1}.</Text>
                    <TextInput
                      style={styles.dynamicInput}
                      placeholder="Ej: Llave de torque"
                      placeholderTextColor={colors.textSecondary}
                      value={tool.text}
                      onChangeText={(text) => updateTool('tools', tool.id, text)}
                    />
                  </View>
                  {requiredTools.tools.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeTool('tools', tool.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Equipo de Seguridad */}
            <View style={styles.section}>
              <View style={styles.toolCategoryHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.secondary} />
                <Text style={styles.toolCategoryTitle}>Equipo de Seguridad</Text>
                <TouchableOpacity onPress={() => addTool('safety')} style={styles.addSmallButton}>
                  <Ionicons name="add-circle" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              {requiredTools.safety.map((tool, index) => (
                <View key={tool.id} style={styles.dynamicItemContainer}>
                  <View style={styles.dynamicItemContent}>
                    <Text style={styles.dynamicItemNumber}>{index + 1}.</Text>
                    <TextInput
                      style={styles.dynamicInput}
                      placeholder="Ej: Guantes dieléctricos"
                      placeholderTextColor={colors.textSecondary}
                      value={tool.text}
                      onChangeText={(text) => updateTool('safety', tool.id, text)}
                    />
                  </View>
                  {requiredTools.safety.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeTool('safety', tool.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
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
            onPress: () => {
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
  sublabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  urgencyButtonCritical: {
    backgroundColor: colors.danger + '20',
    borderColor: colors.danger,
  },
  urgencyButtonMedium: {
    backgroundColor: '#FF8C00' + '20',
    borderColor: '#FF8C00',
  },
  urgencyButtonLow: {
    backgroundColor: '#4CAF50' + '20',
    borderColor: '#4CAF50',
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  urgencyButtonTextActive: {
    color: colors.text,
  },
  dynamicItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dynamicItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dynamicItemNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    minWidth: 24,
  },
  dynamicInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    padding: 8,
  },
  toolCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  toolCategoryTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addSmallButton: {
    padding: 4,
  },
});

export default EditProblemScreen;
