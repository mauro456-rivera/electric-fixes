import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';

const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  style 
}) => {
  
const getColors = () => {
  if (variant === 'primary') {
    return [colors.primary, '#1E7ACC'];
  } else if (variant === 'secondary') {
    return [colors.secondary, '#CC6F00'];
  } else {
    return ['#4A5568', '#2D3748']; 
  }
};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          (disabled || loading) && styles.disabled
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: 8,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomButton;