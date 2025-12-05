import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header/Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="construct" size={64} color={colors.primary} />
          </View>
          <Text style={styles.logoTitle}>
            <Text style={styles.logoDiesel}>DIESEL</Text>
            <Text style={styles.logoSoft}>SOFT</Text>
          </Text>
          <Text style={styles.logoSubtitle}>TRUCK RALLY TEAM</Text>
          <View style={styles.appNamesContainer}>
            <Text style={styles.mechanicText}>MECHANIC-FIXES</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.electricText}>ELECTRIC-FIXES</Text>
          </View>
        </View>

        {/* Mensaje de bienvenida */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>¡Bienvenido! 👋</Text>
          <Text style={styles.welcomeText}>
            La comunidad de mecánicos Volvo más grande. Accede a cientos de soluciones
            eléctricas y mecánicas probadas por expertos.
          </Text>
        </View>

        {/* Botón Ver Soluciones (Sin login requerido) */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push('/guest-menu')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2d7a5f', '#1e4d3a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mainButtonGradient}
          >
            <View style={styles.buttonIcon}>
              <Ionicons name="book-outline" size={28} color="#ffffff" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.mainButtonTitle}>Ver soluciones</Text>
              <Text style={styles.mainButtonSubtitle}>Acceso libre, sin registro</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Card motivadora para registro */}
        <View style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <View style={styles.motivationIconContainer}>
              <Ionicons name="star" size={32} color="#fbbf24" />
            </View>
            <Text style={styles.motivationTitle}>¿Eres mecánico Volvo?</Text>
          </View>

          <Text style={styles.motivationDescription}>
            Únete a nuestra comunidad y comparte tu experiencia. Ayuda a otros mecánicos
            y construye tu reputación como experto.
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.benefitText}>Aporta tus soluciones</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.benefitText}>Guarda tus favoritos</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.benefitText}>Construye tu perfil profesional</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={20} color="#ffffff" />
            <Text style={styles.registerButtonText}>Iniciar sesión / Registrarse</Text>
          </TouchableOpacity>
        </View>

        {/* Footer stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>110+</Text>
            <Text style={styles.statLabel}>Soluciones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Mecánicas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>60+</Text>
            <Text style={styles.statLabel}>Eléctricas</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logoDiesel: {
    color: colors.primary,
  },
  logoSoft: {
    color: colors.secondary,
  },
  logoSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  appNamesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mechanicText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mechanical,
    letterSpacing: 0.3,
  },
  separator: {
    fontSize: 12,
    fontWeight: '300',
    color: colors.textSecondary,
  },
  electricText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.electrical,
    letterSpacing: 0.3,
  },
  welcomeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  mainButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  mainButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  buttonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  mainButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  mainButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  motivationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  motivationIconContainer: {
    marginRight: 12,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  motivationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  benefitsList: {
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
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
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
});

export default WelcomeScreen;
