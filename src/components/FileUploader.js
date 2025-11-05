import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';

// CustomMediaPicker Component - Interfaz Visual Moderna
const CustomMediaPicker = ({ visible, onClose, onPickMedia, onTakePhoto, onRecordVideo, onPickDocument }) => {
  const mediaOptions = [
    {
      id: 'camera',
      title: 'Tomar Foto',
      subtitle: 'Captura una imagen',
      icon: 'camera',
      color: colors.primary,
      gradient: ['#4A90E2', '#357ABD'],
      onPress: onTakePhoto,
    },
    {
      id: 'record',
      title: 'Grabar Video',
      subtitle: 'Graba un video nuevo',
      icon: 'videocam',
      color: colors.error,
      gradient: ['#E74C3C', '#C0392B'],
      onPress: onRecordVideo,
    },
    {
      id: 'gallery',
      title: 'Galería',
      subtitle: 'Fotos y videos',
      icon: 'images',
      color: colors.secondary,
      gradient: ['#9B59B6', '#8E44AD'],
      onPress: onPickMedia,
    },
    {
      id: 'document',
      title: 'Documento',
      subtitle: 'PDFs y archivos',
      icon: 'document-text',
      color: colors.warning,
      gradient: ['#F39C12', '#E67E22'],
      onPress: onPickDocument,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modernOverlay}>
        <TouchableOpacity
          style={styles.modernBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modernSheet}>
          <View style={styles.modernHeader}>
            <View>
              <Text style={styles.modernTitle}>Agregar Archivos</Text>
              <Text style={styles.modernSubtitle}>Selecciona una opción</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modernGrid}>
            {mediaOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.modernCard}
                onPress={() => {
                  onClose();
                  option.onPress();
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.modernCardIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons
                    name={option.icon}
                    size={40}
                    color={option.color}
                  />
                </View>
                <Text style={styles.modernCardTitle}>{option.title}</Text>
                <Text style={styles.modernCardSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.modernCancelButton}
            onPress={onClose}
          >
            <Text style={styles.modernCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  // NUEVA FUNCIÓN: Seleccionar de galería (imágenes Y videos)
  const pickMedia = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], // Sintaxis nueva: array de tipos
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const isVideo = asset.type === 'video' || asset.uri.includes('.mp4') || asset.uri.includes('.mov');

      const newFile = {
        id: Date.now(),
        uri: asset.uri,
        type: isVideo ? 'video' : 'image',
        name: isVideo ? `video_${Date.now()}.mp4` : `image_${Date.now()}.jpg`,
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

  // NUEVA FUNCIÓN: Grabar video en tiempo real
  const recordVideo = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'], // Sintaxis nueva: array con solo videos
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 60, // Máximo 60 segundos
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

      <CustomMediaPicker
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        onPickMedia={pickMedia}
        onTakePhoto={takePhoto}
        onRecordVideo={recordVideo}
        onPickDocument={pickDocument}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // CustomMediaPicker styles - Diseño Moderno
  modernOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modernBackdrop: {
    flex: 1,
  },
  modernSheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modernTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  modernSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  modernGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  modernCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 140,
    justifyContent: 'center',
  },
  modernCardIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modernCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  modernCardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modernCancelButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modernCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
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