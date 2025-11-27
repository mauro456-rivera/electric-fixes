import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import FileUploader from './FileUploader';

const ActivityItem = ({ activity, stepNumber, onUpdate, onRemove, showRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'bug' o 'check'
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [modalContent, setModalContent] = useState('');
  const [menuVisibleNoteId, setMenuVisibleNoteId] = useState(null); // Para controlar qué menú está abierto

  const updateTitle = (title) => {
    onUpdate({ ...activity, title });
  };

  const updateFiles = (files) => {
    onUpdate({ ...activity, files });
  };

  const updateNotes = (notes) => {
    onUpdate({ ...activity, notes });
  };

  const addNote = () => {
    const currentNotes = activity.notes || [];
    updateNotes([...currentNotes, { id: Date.now(), text: '' }]);
  };

  const updateNote = (id, text) => {
    const currentNotes = activity.notes || [];
    updateNotes(currentNotes.map(note => note.id === id ? { ...note, text } : note));
  };

  const removeNote = (id) => {
    const currentNotes = activity.notes || [];
    if (currentNotes.length > 1) {
      updateNotes(currentNotes.filter(note => note.id !== id));
    }
  };

  const toggleMenu = (noteId) => {
    setMenuVisibleNoteId(menuVisibleNoteId === noteId ? null : noteId);
  };

  const openModal = (noteId, type) => {
    // Primero cerramos el menú
    setMenuVisibleNoteId(null);

    // Pequeño delay para que el menú se cierre completamente antes de abrir el modal
    setTimeout(() => {
      const currentNotes = activity.notes || [];
      const note = currentNotes.find(n => n.id === noteId);
      setSelectedNoteId(noteId);
      setModalType(type);
      setModalContent(type === 'bug' ? (note.bugContent || '') : (note.checkContent || ''));
      setModalVisible(true);
    }, 100);
  };

  const saveModalContent = () => {
    const currentNotes = activity.notes || [];
    const updatedNotes = currentNotes.map(note => {
      if (note.id === selectedNoteId) {
        if (modalType === 'bug') {
          return { ...note, bugContent: modalContent };
        } else {
          return { ...note, checkContent: modalContent };
        }
      }
      return note;
    });
    updateNotes(updatedNotes);
    closeModal();
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType(null);
    setSelectedNoteId(null);
    setModalContent('');
  };

  const notes = activity.notes || [];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Actividad {stepNumber}.{activity.index || ''}</Text>
          <Ionicons
            name={isExpanded ? "chevron-down" : "chevron-forward"}
            size={20}
            color="#FFD700"
          />
        </View>
        {showRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            onPressIn={(e) => e.stopPropagation()}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View style={styles.contentSection}>
            <TextInput
              style={styles.input}
              placeholder="Ej: Presion de Turbo (Boost)"
              placeholderTextColor={colors.textSecondary}
              value={activity.title}
              onChangeText={updateTitle}
            />
          </View>

          <View style={styles.notesSection}>
            <View style={styles.notesSectionHeader}>
              <Text style={styles.notesTitle}>Notas/Medidas:</Text>
              <TouchableOpacity onPress={addNote} style={styles.addNoteButton}>
                <Ionicons name="add-circle" size={24} color="#FFD700" />
              </TouchableOpacity>
            </View>

            {notes.map((note, index) => (
              <View key={note.id} style={styles.noteRowContainer}>
                <View style={styles.noteRow}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder={`Ej: ${index === 0 ? 'Ralenti: 0.2 psi' : '1500 rpm: 15-25 psi'}`}
                    placeholderTextColor={colors.textSecondary}
                    value={note.text}
                    onChangeText={(text) => updateNote(note.id, text)}
                  />

                  {/* Botón de menú de 3 puntos */}
                  <TouchableOpacity
                    onPress={() => toggleMenu(note.id)}
                    style={styles.menuButton}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={colors.text}
                    />
                    {/* Indicadores de estado */}
                    {(note.bugContent || note.checkContent) && (
                      <View style={styles.indicatorContainer}>
                        {note.bugContent && <View style={styles.bugIndicator} />}
                        {note.checkContent && <View style={styles.checkIndicator} />}
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Menú desplegable */}
                {menuVisibleNoteId === note.id && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity
                      style={styles.menuOption}
                      onPress={() => openModal(note.id, 'bug')}
                    >
                      <Ionicons
                        name="bug"
                        size={18}
                        color="#EF4444"
                      />
                      <Text style={[styles.menuOptionText, note.bugContent && styles.menuOptionTextActive]}>
                        Reportar Problema
                      </Text>
                      {note.bugContent && (
                        <Ionicons name="checkmark" size={16} color="#EF4444" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuOption}
                      onPress={() => openModal(note.id, 'check')}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#10B981"
                      />
                      <Text style={[styles.menuOptionText, note.checkContent && styles.menuOptionTextActive]}>
                        Validar
                      </Text>
                      {note.checkContent && (
                        <Ionicons name="checkmark" size={16} color="#10B981" />
                      )}
                    </TouchableOpacity>

                    {notes.length > 1 && (
                      <TouchableOpacity
                        style={[styles.menuOption, styles.menuOptionDanger]}
                        onPress={() => {
                          removeNote(note.id);
                          setMenuVisibleNoteId(null);
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={colors.error}
                        />
                        <Text style={[styles.menuOptionText, styles.menuOptionTextDanger]}>
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.fileSection}>
            <FileUploader
              files={activity.files}
              onFilesChange={updateFiles}
              label="Adjuntar archivos"
            />
          </View>
        </>
      )}

      {/* Modal para Bug y Check */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.modalOverlayTouchable}
          activeOpacity={1}
          onPress={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboardView}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Ionicons
                      name={modalType === 'bug' ? 'bug' : 'checkmark-circle'}
                      size={24}
                      color={modalType === 'bug' ? '#EF4444' : '#10B981'}
                    />
                    <Text style={styles.modalTitle}>
                      {modalType === 'bug' ? 'Reportar Problema' : 'Confirmar Validación'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>
                    {modalType === 'bug' ? 'Describe el problema encontrado:' : 'Agrega notas de validación:'}
                  </Text>
                  <TextInput
                    style={styles.modalTextArea}
                    placeholder={modalType === 'bug' ? 'Ej: Lectura fuera de rango, posible fuga...' : 'Ej: Valores dentro de especificación, todo correcto...'}
                    placeholderTextColor={colors.textSecondary}
                    value={modalContent}
                    onChangeText={setModalContent}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={closeModal}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={saveModalContent}
                  >
                    <Text style={styles.modalButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 8,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  contentSection: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
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
  notesSection: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  addNoteButton: {
    padding: 2,
  },
  noteRowContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 10,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuButton: {
    padding: 8,
    position: 'relative',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 2,
  },
  bugIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  checkIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  fileSection: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 180,
    zIndex: 1000,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuOptionDanger: {
    borderBottomWidth: 0,
  },
  menuOptionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  menuOptionTextActive: {
    fontWeight: '600',
  },
  menuOptionTextDanger: {
    color: colors.error,
  },
  // Estilos del Modal
  modalOverlayTouchable: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalKeyboardView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    width: 380,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  modalTextArea: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.textSecondary,
  },
  modalSaveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActivityItem;