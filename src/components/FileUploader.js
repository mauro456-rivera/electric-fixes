import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';

// CustomActionSheet Component
const CustomActionSheet = ({ visible, onClose, title, options }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{title}</Text>
              
              {options.map((option, index) => {
                if (option.style === 'cancel') {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.cancelButton}
                      onPress={() => {
                        onClose();
                        option.onPress?.();
                      }}
                    >
                      <Text style={styles.cancelText}>{option.text}</Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.option}
                    onPress={() => {
                      onClose();
                      option.onPress?.();
                    }}
                  >
                    {option.icon && (
                      <Ionicons name={option.icon} size={22} color={colors.text} />
                    )}
                    <Text style={styles.optionText}>{option.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// FileUploader Component
const FileUploader = ({ files = [], onFilesChange, label = "Seleccionar archivo" }) => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert('Permisos requeridos', 'Necesitamos acceso a la cámara y galería.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newFile = {
        id: Date.now(),
        uri: result.assets[0].uri,
        type: 'image',
        name: `image_${Date.now()}.jpg`,
      };
      onFilesChange([...files, newFile]);
    }
  };

  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newFile = {
        id: Date.now(),
        uri: result.assets[0].uri,
        type: 'image',
        name: `photo_${Date.now()}.jpg`,
      };
      onFilesChange([...files, newFile]);
    }
  };

  const pickVideo = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newFile = {
        id: Date.now(),
        uri: result.assets[0].uri,
        type: 'video',
        name: `video_${Date.now()}.mp4`,
      };
      onFilesChange([...files, newFile]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const newFile = {
          id: Date.now(),
          uri: result.assets[0].uri,
          type: 'document',
          name: result.assets[0].name,
        };
        onFilesChange([...files, newFile]);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  const removeFile = (fileId) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const showOptions = () => {
    setShowActionSheet(true);
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'video':
        return { name: 'videocam', color: colors.error };
      case 'document':
        return { name: 'document-text', color: colors.warning };
      default:
        return { name: 'image', color: colors.primary };
    }
  };

  return (
    <View style={styles.uploaderContainer}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.uploadButton} 
        onPress={showOptions}
        activeOpacity={0.7}
      >
        <View style={styles.uploadTextContainer}>
          <Text style={styles.uploadTitle}>Agregar archivos</Text>
          <Text style={styles.uploadSubtitle}>Imagen, video o documento</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>

      {files.length > 0 && (
        <View style={styles.filesContainer}>
          <View style={styles.filesHeader}>
            <Text style={styles.filesCount}>{files.length} archivo{files.length !== 1 ? 's' : ''}</Text>
            <TouchableOpacity onPress={() => onFilesChange([])}>
              <Text style={styles.clearAll}>Limpiar todo</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            style={styles.filesList} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filesListContent}
          >
            {files.map((file) => {
              const icon = getFileIcon(file.type);
              return (
                <View key={file.id} style={styles.fileItem}>
                  <View style={styles.filePreview}>
                    {file.type === 'image' ? (
                      <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                    ) : (
                      <View style={[styles.iconPlaceholder, { backgroundColor: icon.color + '20' }]}>
                        <Ionicons 
                          name={icon.name} 
                          size={36} 
                          color={icon.color} 
                        />
                      </View>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeFile(file.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle" size={26} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  {file.type !== 'image' && (
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      <CustomActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={label}
        options={[
          { 
            text: 'Tomar Foto', 
            icon: 'camera',
            onPress: takePhoto 
          },
          { 
            text: 'Elegir Imagen', 
            icon: 'image',
            onPress: pickImage 
          },
          { 
            text: 'Elegir Video', 
            icon: 'videocam',
            onPress: pickVideo 
          },
          { 
            text: 'Elegir Documento', 
            icon: 'document-text',
            onPress: pickDocument 
          },
          { 
            text: 'Cancelar', 
            style: 'cancel' 
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // CustomActionSheet styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // FileUploader styles
  uploaderContainer: {
    marginBottom: 20,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    marginBottom: 10,
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  uploadSubtitle: {
    color: colors.text + 'CC',
    fontSize: 13,
  },
  filesContainer: {
    marginTop: 16,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  clearAll: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  filesList: {
    marginHorizontal: -4,
  },
  filesListContent: {
    paddingHorizontal: 4,
  },
  fileItem: {
    marginRight: 12,
    width: 100,
  },
  filePreview: {
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.background,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fileName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
});

export default FileUploader;