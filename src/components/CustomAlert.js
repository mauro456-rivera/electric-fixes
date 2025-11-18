// components/CustomAlert.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';

const CustomAlert = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'success', // 'success', 'error', 'warning', 'info', 'loading'
  buttons = []
}) => {
  const getIcon = () => {
    switch(type) {
      case 'success':
        return { name: 'checkmark-circle', color: colors.success, gradient: ['#10b981', '#059669'] };
      case 'error':
        return { name: 'close-circle', color: colors.error, gradient: ['#ef4444', '#dc2626'] };
      case 'warning':
        return { name: 'warning', color: colors.warning, gradient: ['#f59e0b', '#d97706'] };
      case 'loading':
        return { name: 'hourglass-outline', color: colors.primary, gradient: ['#3b82f6', '#2563eb'] };
      case 'info':
        return { name: 'information-circle', color: '#06b6d4', gradient: ['#06b6d4', '#0891b2'] };
      default:
        return { name: 'information-circle', color: colors.primary, gradient: ['#3b82f6', '#2563eb'] };
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
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <LinearGradient
            colors={icon.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name={icon.name} size={52} color="#ffffff" />
          </LinearGradient>

          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
          
          {type !== 'loading' && (
            <View style={styles.buttonsContainer}>
              {buttons.length > 0 ? (
                buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'cancel' && styles.cancelButton,
                      button.style === 'destructive' && styles.destructiveButton,
                      buttons.length === 1 && styles.singleButton
                    ]}
                    onPress={() => {
                      onClose();
                      button.onPress?.();
                    }}
                  >
                    <Text style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity style={styles.singleButton} onPress={onClose}>
                  <Text style={styles.buttonText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 8,
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

export default CustomAlert;