import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import FileUploader from './FileUploader';

const ActivityItem = ({ activity, onUpdate, onRemove, showRemove }) => {
  
  const updateTitle = (title) => {
    onUpdate({ ...activity, title });
  };

  const updateFiles = (files) => {
    onUpdate({ ...activity, files });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Actividad {activity.index || ''}</Text>
        {showRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Título de la actividad"
        placeholderTextColor={colors.textSecondary}
        value={activity.title}
        onChangeText={updateTitle}
      />

      <FileUploader
        files={activity.files}
        onFilesChange={updateFiles}
        label="Adjuntar archivos"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
});

export default ActivityItem;