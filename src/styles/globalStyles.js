import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
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

  label: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },


});