import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import FileUploader from './FileUploader';

const ActivityItem = ({ activity, onUpdate, onRemove, showRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true);

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

  const notes = activity.notes || [];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Activida {activity.index || ''}</Text>
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
            <Text style={styles.label}>Lectura:</Text>
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
              <View key={note.id} style={styles.noteRow}>
                <TextInput
                  style={styles.noteInput}
                  placeholder={`Ej: ${index === 0 ? 'Ralenti: 0.2 psi' : '1500 rpm: 15-25 psi'}`}
                  placeholderTextColor={colors.textSecondary}
                  value={note.text}
                  onChangeText={(text) => updateNote(note.id, text)}
                />
                {notes.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeNote(note.id)}
                    style={styles.removeNoteButton}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <FileUploader
            files={activity.files}
            onFilesChange={updateFiles}
            label="Adjuntar archivos"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 12,
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
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  removeNoteButton: {
    padding: 4,
  },
});

export default ActivityItem;