// components/CustomActionSheet.js
import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';

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
              <Text style={styles.title}>{title}</Text>
              
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

const styles = StyleSheet.create({
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
  title: {
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
});

export default CustomActionSheet;