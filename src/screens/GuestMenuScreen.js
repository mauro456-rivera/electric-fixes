import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../components/CustomAlert';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const GuestMenuScreen = () => {
  const router = useRouter();
  const { user, signOut, deleteAccount, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showDeleteAccountAlert, setShowDeleteAccountAlert] = useState(false);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);

  // ✅ Acceso libre sin login - Vista de invitado disponible para todos

  // Mostrar alerta de bienvenida al cargar la pantalla
  React.useEffect(() => {
    if (!loading && user) {
      // Pequeño delay para que la animación sea suave
      const timer = setTimeout(() => {
        setShowWelcomeAlert(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  const handleLogout = () => {
    setShowUserMenu(false);
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      router.replace('/login');
    }
  };

  const handleDeleteAccount = () => {
    setShowUserMenu(false);
    setShowDeleteAccountAlert(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setShowDeleteAccountAlert(false);
      await deleteAccount();
      router.replace('/login');
    } catch (error) {
      console.error('❌ Error al eliminar cuenta:', error);
      // Mostrar error al usuario
      alert(error.message || 'Error al eliminar la cuenta. Por favor, intenta nuevamente.');
    }
  };

  // Función para navegar - verifica si hay usuario para "Aportar conocimientos"
  const handleNavigation = (route) => {
    if (route === '/contribute' && !user) {
      // Si intenta aportar sin login, redirigir al login
      router.push('/login');
    } else {
      router.push(route);
    }
  };

  // Opciones de menú solo para invitados
  const guestMenuOptions = [
    {
      id: 1,
      title: 'Soluciones Eléctricas',
      subtitle: '',
      icon: 'flash-outline',
      route: '/guest-solutions?type=electrical',
      gradient: ['#5a3a1e', '#8c5a2d'],
      iconBg: colors.electrical,
    },
    {
      id: 2,
      title: 'Soluciones Mecánicas',
      subtitle: '',
      icon: 'construct-outline',
      route: '/guest-solutions?type=mechanical',
      gradient: ['#1e4d3a', '#2d7a5f'],
      iconBg: colors.mechanical,
    },
    {
      id: 3,
      title: 'Aportar conocimientos',
      subtitle: '¡Comparte tu experiencia!',
      icon: 'bulb-outline',
      route: '/contribute',
      gradient: ['#4a1e5a', '#7a2d8c'],
      iconBg: '#9333ea',
    },
  ];

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.headerTitle}>
            <Text style={styles.logoDiesel}>DIESEL</Text>
            <Text style={styles.logoSoft}>SOFT</Text>
          </Text>
          <Text style={styles.headerSubtitle}>TRUCK RALLY TEAM</Text>
          <View style={styles.appNamesContainer}>
            <Text style={styles.mechanicText}>MECANIC-FIXES</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.electricText}>ELECTRIC-FIXES</Text>
          </View>
          <View style={styles.guestBadge}>
            <Ionicons name="person-outline" size={14} color="#ffffff" />
            <Text style={styles.guestBadgeText}>Usuario Invitado</Text>
          </View>
        </View>

        {user ? (
          <TouchableOpacity
            style={styles.userAvatarButton}
            onPress={() => setShowUserMenu(true)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {(user?.name || 'I').charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color="#ffffff" />
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuContainer}>
          {guestMenuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleNavigation(option.route)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={option.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.menuCard}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.iconBg }]}>
                  <Ionicons name={option.icon} size={28} color="#ffffff" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>{option.title}</Text>
                  {option.subtitle && (
                    <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.7)" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserMenu(false)}
        >
          <View style={styles.userMenuContainer}>
            <View style={styles.userMenuHeader}>
              <View style={styles.userMenuAvatar}>
                <Ionicons name="person" size={40} color={colors.text} />
              </View>
              <View style={styles.userMenuInfo}>
                <Text style={styles.userMenuName}>
                  {user?.name || 'Usuario'}
                </Text>
                <Text style={styles.userMenuEmail}>{user?.email}</Text>
                <Text style={styles.userMenuPosition}>
                  👤 Usuario Invitado
                </Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
              <Text style={styles.userMenuItemTextDelete}>Eliminar Cuenta</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
              <Text style={styles.userMenuItemTextLogout}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />


          </View>
        </TouchableOpacity>
      </Modal>

      <CustomAlert
        visible={showWelcomeAlert}
        onClose={() => setShowWelcomeAlert(false)}
        type="info"
        title={`Bienvenido, ${user?.name || 'Invitado'}`}
        message="Como usuario invitado tienes acceso a consultar todas las soluciones eléctricas y mecánicas registradas en el sistema. ¡Explora y aprende!"
        buttons={[
          {
            text: 'Entendido',
            onPress: () => setShowWelcomeAlert(false)
          }
        ]}
      />

      <CustomAlert
        visible={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        type="warning"
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        buttons={[
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: confirmLogout
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]}
      />

      <CustomAlert
        visible={showDeleteAccountAlert}
        onClose={() => setShowDeleteAccountAlert(false)}
        type="error"
        title="Eliminar Cuenta"
        message="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción NO se puede deshacer y perderás acceso a todas las soluciones."
        buttons={[
          {
            text: 'Eliminar Cuenta',
            style: 'destructive',
            onPress: confirmDeleteAccount
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoDiesel: {
    color: colors.primary,
  },
  logoSoft: {
    color: colors.secondary,
  },
  appNamesContainer: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mechanicText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.mechanical,
    letterSpacing: 0.3,
  },
  separator: {
    fontSize: 11,
    fontWeight: "300",
    color: colors.textSecondary,
  },
  electricText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.electrical,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  guestBadge: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  guestBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  userAvatarButton: {
    padding: 4,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  userMenuContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: 280,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  userMenuHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  userMenuAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userMenuInfo: {
    flex: 1,
  },
  userMenuName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userMenuEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  userMenuPosition: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  userMenuItemText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  userMenuItemTextLogout: {
    color: colors.error,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
  userMenuItemTextDelete: {
    color: '#ff6b6b',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
});

export default GuestMenuScreen;
