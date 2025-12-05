import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const ContributeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    type: 'mechanical', // 'mechanical' o 'electrical'
    problem: '',
    solution: '',
    truck: '',
    category: '',
    severity: 'Media',
    difficulty: 'Media',
    estimatedTime: '',
    tools: [''],
    steps: [{ title: '', description: '' }],
    precautions: [''],
    parts: [{ name: '', partNumber: '', optional: false }],
  });

  const [errors, setErrors] = useState({});

  // Opciones para selectores
  const truckModels = ['Volvo FH', 'Volvo FH16', 'Volvo FM', 'Volvo FMX', 'Otro'];
  const severityLevels = ['Baja', 'Media', 'Alta', 'Crítica'];
  const difficultyLevels = ['Baja', 'Media', 'Alta'];

  const mechanicalCategories = [
    'Motor', 'Transmisión', 'Suspensión', 'Frenos', 'Sistema de enfriamiento',
    'Diferencial', 'Sistema neumático', 'Dirección', 'Sistema de escape',
    'Sistema hidráulico', 'Acople', 'Otro'
  ];

  const electricalCategories = [
    'Sistema eléctrico', 'Control de motor', 'Iluminación', 'Instrumentación',
    'Sistema de emisiones', 'Sensores', 'Cableado', 'Batería y alternador',
    'Seguridad', 'Confort', 'Otro'
  ];

  const categories = formData.type === 'mechanical' ? mechanicalCategories : electricalCategories;

  // Funciones para manejar listas dinámicas
  const addTool = () => {
    setFormData({ ...formData, tools: [...formData.tools, ''] });
  };

  const removeTool = (index) => {
    const newTools = formData.tools.filter((_, i) => i !== index);
    setFormData({ ...formData, tools: newTools.length > 0 ? newTools : [''] });
  };

  const updateTool = (index, value) => {
    const newTools = [...formData.tools];
    newTools[index] = value;
    setFormData({ ...formData, tools: newTools });
  };

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, { title: '', description: '' }] });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps.length > 0 ? newSteps : [{ title: '', description: '' }] });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addPrecaution = () => {
    setFormData({ ...formData, precautions: [...formData.precautions, ''] });
  };

  const removePrecaution = (index) => {
    const newPrecautions = formData.precautions.filter((_, i) => i !== index);
    setFormData({ ...formData, precautions: newPrecautions.length > 0 ? newPrecautions : [''] });
  };

  const updatePrecaution = (index, value) => {
    const newPrecautions = [...formData.precautions];
    newPrecautions[index] = value;
    setFormData({ ...formData, precautions: newPrecautions });
  };

  const addPart = () => {
    setFormData({ ...formData, parts: [...formData.parts, { name: '', partNumber: '', optional: false }] });
  };

  const removePart = (index) => {
    const newParts = formData.parts.filter((_, i) => i !== index);
    setFormData({ ...formData, parts: newParts.length > 0 ? newParts : [{ name: '', partNumber: '', optional: false }] });
  };

  const updatePart = (index, field, value) => {
    const newParts = [...formData.parts];
    newParts[index][field] = value;
    setFormData({ ...formData, parts: newParts });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.problem.trim()) newErrors.problem = 'El problema es requerido';
    if (!formData.solution.trim()) newErrors.solution = 'La solución es requerida';
    if (!formData.truck.trim()) newErrors.truck = 'El modelo del camión es requerido';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';
    if (!formData.estimatedTime.trim()) newErrors.estimatedTime = 'El tiempo estimado es requerido';

    // Validar que al menos un paso tenga contenido
    const validSteps = formData.steps.filter(s => s.title.trim() && s.description.trim());
    if (validSteps.length === 0) {
      newErrors.steps = 'Debes agregar al menos un paso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Formulario incompleto', 'Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      // Limpiar datos antes de enviar
      const cleanedData = {
        ...formData,
        tools: formData.tools.filter(t => t.trim()),
        steps: formData.steps.filter(s => s.title.trim() && s.description.trim()).map((step, idx) => ({
          number: idx + 1,
          ...step
        })),
        precautions: formData.precautions.filter(p => p.trim()),
        parts: formData.parts.filter(p => p.name.trim() || p.partNumber.trim()),
      };

      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'guestContributions'), {
        ...cleanedData,
        contributedBy: user?.id || 'anonymous',
        contributedByName: user?.name || 'Usuario Invitado',
        contributedByEmail: user?.email || '',
        status: 'pending', // pending, approved, rejected
        createdAt: serverTimestamp(),
      });

      console.log('✅ Solución guardada con ID:', docRef.id);

      Alert.alert(
        '¡Gracias por tu aporte! 🎉',
        'Tu solución ha sido enviada y será revisada por nuestro equipo. ¡Tu conocimiento ayudará a muchos mecánicos!',
        [
          {
            text: 'Aportar otra',
            onPress: () => {
              setFormData({
                type: 'mechanical',
                problem: '',
                solution: '',
                truck: '',
                category: '',
                severity: 'Media',
                difficulty: 'Media',
                estimatedTime: '',
                tools: [''],
                steps: [{ title: '', description: '' }],
                precautions: [''],
                parts: [{ name: '', partNumber: '', optional: false }],
              });
              setErrors({});
            }
          },
          {
            text: 'Volver al menú',
            onPress: () => router.back(),
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'Hubo un problema al enviar tu aporte. Por favor intenta nuevamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Aportar conocimientos</Text>
          <Text style={styles.headerSubtitle}>Solución completa</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mensaje motivador */}
        <View style={styles.motivationCard}>
          <View style={styles.motivationIcon}>
            <Ionicons name="heart" size={32} color="#ef4444" />
          </View>
          <Text style={styles.motivationTitle}>¡Tu experiencia vale oro! 🌟</Text>
          <Text style={styles.motivationText}>
            Comparte soluciones completas con pasos detallados. Ayuda a otros mecánicos a resolver problemas de manera profesional.
          </Text>
        </View>

        {/* Tipo de solución */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de solución *</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'mechanical' && styles.typeButtonActive,
                { borderColor: colors.mechanical }
              ]}
              onPress={() => setFormData({ ...formData, type: 'mechanical', category: '' })}
            >
              <Ionicons
                name="construct"
                size={24}
                color={formData.type === 'mechanical' ? colors.mechanical : colors.textSecondary}
              />
              <Text style={[
                styles.typeButtonText,
                formData.type === 'mechanical' && { color: colors.mechanical }
              ]}>
                Mecánica
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'electrical' && styles.typeButtonActive,
                { borderColor: colors.electrical }
              ]}
              onPress={() => setFormData({ ...formData, type: 'electrical', category: '' })}
            >
              <Ionicons
                name="flash"
                size={24}
                color={formData.type === 'electrical' ? colors.electrical : colors.textSecondary}
              />
              <Text style={[
                styles.typeButtonText,
                formData.type === 'electrical' && { color: colors.electrical }
              ]}>
                Eléctrica
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modelo del camión */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Modelo del camión *</Text>
          <View style={styles.chipsContainer}>
            {truckModels.map((truck) => (
              <TouchableOpacity
                key={truck}
                style={[
                  styles.chip,
                  formData.truck === truck && styles.chipActive
                ]}
                onPress={() => setFormData({ ...formData, truck })}
              >
                <Text style={[
                  styles.chipText,
                  formData.truck === truck && styles.chipTextActive
                ]}>
                  {truck}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.truck && <Text style={styles.errorText}>{errors.truck}</Text>}
        </View>

        {/* Categoría */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.chipsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  formData.category === cat && styles.chipActive
                ]}
                onPress={() => setFormData({ ...formData, category: cat })}
              >
                <Text style={[
                  styles.chipText,
                  formData.category === cat && styles.chipTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Severidad y Dificultad */}
        <View style={styles.rowContainer}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Severidad *</Text>
            <View style={styles.chipsContainer}>
              {severityLevels.map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[
                    styles.chipSmall,
                    formData.severity === sev && styles.chipActive
                  ]}
                  onPress={() => setFormData({ ...formData, severity: sev })}
                >
                  <Text style={[
                    styles.chipTextSmall,
                    formData.severity === sev && styles.chipTextActive
                  ]}>
                    {sev}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Dificultad *</Text>
            <View style={styles.chipsContainer}>
              {difficultyLevels.map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.chipSmall,
                    formData.difficulty === diff && styles.chipActive
                  ]}
                  onPress={() => setFormData({ ...formData, difficulty: diff })}
                >
                  <Text style={[
                    styles.chipTextSmall,
                    formData.difficulty === diff && styles.chipTextActive
                  ]}>
                    {diff}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Tiempo estimado */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tiempo estimado *</Text>
          <TextInput
            style={[styles.input, errors.estimatedTime && styles.inputError]}
            placeholder="Ej: 2-3 horas"
            placeholderTextColor={colors.textSecondary}
            value={formData.estimatedTime}
            onChangeText={(text) => setFormData({ ...formData, estimatedTime: text })}
          />
          {errors.estimatedTime && <Text style={styles.errorText}>{errors.estimatedTime}</Text>}
        </View>

        {/* Problema */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Describe el problema *</Text>
          <TextInput
            style={[styles.textArea, errors.problem && styles.inputError]}
            placeholder="Ej: Motor pierde potencia en subidas con carga completa..."
            placeholderTextColor={colors.textSecondary}
            value={formData.problem}
            onChangeText={(text) => setFormData({ ...formData, problem: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.problem && <Text style={styles.errorText}>{errors.problem}</Text>}
        </View>

        {/* Solución */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Describe la solución *</Text>
          <TextInput
            style={[styles.textArea, errors.solution && styles.inputError]}
            placeholder="Ej: Revisar y limpiar filtro de aire, verificar turbocompresor..."
            placeholderTextColor={colors.textSecondary}
            value={formData.solution}
            onChangeText={(text) => setFormData({ ...formData, solution: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.solution && <Text style={styles.errorText}>{errors.solution}</Text>}
        </View>

        {/* Pasos detallados */}
        <View style={styles.formGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pasos detallados *</Text>
            <TouchableOpacity style={styles.addButton} onPress={addStep}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>Agregar paso</Text>
            </TouchableOpacity>
          </View>
          {errors.steps && <Text style={styles.errorText}>{errors.steps}</Text>}

          {formData.steps.map((step, index) => (
            <View key={index} style={styles.dynamicItemCard}>
              <View style={styles.dynamicItemHeader}>
                <Text style={styles.dynamicItemTitle}>Paso {index + 1}</Text>
                {formData.steps.length > 1 && (
                  <TouchableOpacity onPress={() => removeStep(index)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Título del paso"
                placeholderTextColor={colors.textSecondary}
                value={step.title}
                onChangeText={(text) => updateStep(index, 'title', text)}
              />
              <TextInput
                style={[styles.textArea, { marginTop: 8 }]}
                placeholder="Descripción detallada del paso"
                placeholderTextColor={colors.textSecondary}
                value={step.description}
                onChangeText={(text) => updateStep(index, 'description', text)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>

        {/* Herramientas */}
        <View style={styles.formGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Herramientas necesarias</Text>
            <TouchableOpacity style={styles.addButton} onPress={addTool}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {formData.tools.map((tool, index) => (
            <View key={index} style={styles.dynamicInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ej: Escáner de diagnóstico VCADS"
                placeholderTextColor={colors.textSecondary}
                value={tool}
                onChangeText={(text) => updateTool(index, text)}
              />
              {formData.tools.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTool(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Precauciones */}
        <View style={styles.formGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Precauciones de seguridad</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPrecaution}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {formData.precautions.map((precaution, index) => (
            <View key={index} style={styles.dynamicInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ej: Desconectar batería antes de iniciar"
                placeholderTextColor={colors.textSecondary}
                value={precaution}
                onChangeText={(text) => updatePrecaution(index, text)}
              />
              {formData.precautions.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePrecaution(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Refacciones/Partes */}
        <View style={styles.formGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Refacciones/Partes necesarias</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPart}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {formData.parts.map((part, index) => (
            <View key={index} style={styles.dynamicItemCard}>
              <View style={styles.dynamicItemHeader}>
                <Text style={styles.dynamicItemTitle}>Parte {index + 1}</Text>
                {formData.parts.length > 1 && (
                  <TouchableOpacity onPress={() => removePart(index)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la parte"
                placeholderTextColor={colors.textSecondary}
                value={part.name}
                onChangeText={(text) => updatePart(index, 'name', text)}
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Número de parte (opcional)"
                placeholderTextColor={colors.textSecondary}
                value={part.partNumber}
                onChangeText={(text) => updatePart(index, 'partNumber', text)}
              />
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => updatePart(index, 'optional', !part.optional)}
              >
                <Ionicons
                  name={part.optional ? "checkbox" : "square-outline"}
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.checkboxLabel}>Parte opcional</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Botón de envío */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
          <Text style={styles.submitButtonText}>Enviar solución completa</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  motivationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  motivationIcon: {
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.cardBackground,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipSmall: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  chipTextSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  dynamicItemCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dynamicItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dynamicItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dynamicInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  removeButton: {
    padding: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ContributeScreen;
