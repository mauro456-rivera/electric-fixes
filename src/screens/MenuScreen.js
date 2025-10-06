import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const MenuScreen = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              await signOut();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              await signOut();
              router.replace('/login');
            }
          },
        },
      ]
    );
  };

  const menuOptions = [
    {
      id: 1,
      title: 'Registrar problema/solución',
      icon: 'document-text-outline',
      route: '/register-problem',
      gradient: [colors.primary, '#1E7ACC'],
    },
    {
      id: 2,
      title: 'Ver Registros',
      subtitle: 'Consulta problemas y soluciones aplicadas',
      icon: 'list-outline',
      route: '/view-records',
      gradient: ['#00C853', '#00952F'],
    },
    {
      id: 3,
      title: 'Buscar Soluciones',
      subtitle: 'Encuentra soluciones para tus problemas',
      icon: 'search-outline',
      route: '/search-solutions',
      gradient: [colors.secondary, '#CC6F00'],
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
                      <Text style={styles.subtitlel}>MECANIC-FIXES</Text>
          
        </View>

        <TouchableOpacity 
          style={styles.userInfoButton} 
          onPress={() => setShowUserMenu(true)}
          activeOpacity={0.7}
        >
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Usuario'}
            </Text>
            <Text style={styles.userPosition} numberOfLines={1}>
              {user?.position || ''}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color={colors.text} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        {menuOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => router.push(option.route)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={option.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.menuCard}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={option.icon} size={28} color={colors.text} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.menuTitle}>{option.title}</Text>
                {option.subtitle && (
                  <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

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
                  {user?.name} {user?.lastname}
                </Text>
                <Text style={styles.userMenuEmail}>{user?.businessEmail}</Text>
                {user?.position && (
                  <Text style={styles.userMenuPosition}>{user?.position}</Text>
                )}
              </View>
            </View>

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
    subtitlel: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "400",
    color: colors.text,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  userInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 25,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    marginRight: 8,
    maxWidth: 120,
  },
  userName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  userPosition: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    color: colors.text,
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
    backgroundColor: colors.primary,
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
});

export default MenuScreen;