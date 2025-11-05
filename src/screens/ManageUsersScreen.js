import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AppFooter from '../components/AppFooter';
import CustomAlert from '../components/CustomAlert';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const ManageUsersScreen = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreatingAlert, setShowCreatingAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showAccessDeniedAlert, setShowAccessDeniedAlert] = useState(false);
  const [showChangeRoleAlert, setShowChangeRoleAlert] = useState(false);
  const [showToggleStatusAlert, setShowToggleStatusAlert] = useState(false);
  const [showPermissionSuccessAlert, setShowPermissionSuccessAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionData, setActionData] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
  });

  useEffect(() => {
    // Verificar si es admin
    if (!isAdmin) {
      setErrorMessage('No tienes permisos para acceder a esta sección');
      setShowAccessDeniedAlert(true);
      return;
    }
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersList = await userService.getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setErrorMessage('No se pudieron cargar los usuarios');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailBlur = () => {
    // Si el email no está vacío y no contiene @, agregar @dieselsoft.co
    if (newUser.email && !newUser.email.includes('@')) {
      setNewUser({ ...newUser, email: `${newUser.email}@dieselsoft.co` });
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      setErrorMessage('Por favor completa todos los campos');
      setShowErrorAlert(true);
      return;
    }

    if (newUser.password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      setShowErrorAlert(true);
      return;
    }

    // Cerrar el modal y mostrar alerta de "Creando usuario..."
    setShowAddUserModal(false);
    setCreatingUser(true);
    setShowCreatingAlert(true);

    try {
      await userService.createUser(newUser, user.id);

      // Ocultar alerta de creando y mostrar éxito
      setShowCreatingAlert(false);
      setShowSuccessAlert(true);

      // Limpiar formulario y recargar usuarios
      setNewUser({ email: '', password: '', name: '', role: 'user' });
      loadUsers();
    } catch (error) {
      console.error('Error creando usuario:', error);
      let errMsg = 'No se pudo crear el usuario';

      if (error.code === 'auth/email-already-in-use') {
        errMsg = 'Este correo ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errMsg = 'Correo electrónico inválido';
      } else if (error.code === 'auth/weak-password') {
        errMsg = 'La contraseña es muy débil';
      }

      setShowCreatingAlert(false);
      setErrorMessage(errMsg);
      setShowErrorAlert(true);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionData({ userId, newRole });
    setShowChangeRoleAlert(true);
  };

  const confirmToggleRole = async () => {
    try {
      await userService.updateUserRole(actionData.userId, actionData.newRole);
      loadUsers();
      setSuccessMessage('Rol actualizado correctamente');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      setErrorMessage('No se pudo actualizar el rol');
      setShowErrorAlert(true);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    setActionData({ userId, newStatus });
    setShowToggleStatusAlert(true);
  };

  const confirmToggleStatus = async () => {
    try {
      await userService.toggleUserStatus(actionData.userId, actionData.newStatus);
      loadUsers();
      setSuccessMessage(`Usuario ${actionData.newStatus ? 'activado' : 'desactivado'}`);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setErrorMessage('No se pudo actualizar el estado');
      setShowErrorAlert(true);
    }
  };

  const handleOpenPermissions = (userItem) => {
    setSelectedUser({
      ...userItem,
      permissions: userItem.permissions || userService.getDefaultPermissions(userItem.role || 'user'),
    });
    setShowPermissionsModal(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;

    try {
      await userService.updateUserPermissions(selectedUser.id, selectedUser.permissions);
      loadUsers();
      setShowPermissionsModal(false);
      setSuccessMessage('Permisos actualizados correctamente');
      setShowPermissionSuccessAlert(true);
    } catch (error) {
      console.error('Error actualizando permisos:', error);
      setErrorMessage('No se pudieron actualizar los permisos');
      setShowErrorAlert(true);
    }
  };

  const togglePermission = (permissionKey) => {
    setSelectedUser({
      ...selectedUser,
      permissions: {
        ...selectedUser.permissions,
        [permissionKey]: !selectedUser.permissions[permissionKey],
      },
    });
  };

  const renderUserItem = ({ item }) => {
    const isCurrentUser = item.id === user.id;

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{item.name || 'Sin nombre'}</Text>
            <View style={[
              styles.roleBadge,
              item.role === 'admin' ? styles.adminBadge : styles.userBadge
            ]}>
              <Text style={styles.roleText}>
                {item.role === 'admin' ? '👑 Admin' : '👤 Usuario'}
              </Text>
            </View>
          </View>

          <Text style={styles.userEmail}>{item.email}</Text>

          <View style={styles.userMeta}>
            <View style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={styles.statusText}>
                {item.isActive ? '✓ Activo' : '✗ Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        {!isCurrentUser && (
          <View style={styles.userActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenPermissions(item)}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={colors.secondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleRole(item.id, item.role)}
            >
              <Ionicons
                name={item.role === 'admin' ? 'person' : 'shield-checkmark'}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleStatus(item.id, item.isActive)}
            >
              <Ionicons
                name={item.isActive ? 'close-circle' : 'checkmark-circle'}
                size={20}
                color={item.isActive ? colors.error : colors.success}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <TouchableOpacity
          onPress={() => setShowAddUserModal(true)}
          style={styles.addButton}
        >
          <Ionicons name="person-add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <AppFooter  />

      {/* Modal para agregar usuario */}
      <Modal
        visible={showAddUserModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Usuario</Text>
              <TouchableOpacity onPress={() => setShowAddUserModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Juan Pérez"
                  placeholderTextColor={colors.textSecondary}
                  value={newUser.name}
                  onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo Electrónico *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@dieselsoft.co"
                  placeholderTextColor={colors.textSecondary}
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({ ...newUser, email: text.toLowerCase() })}
                  onBlur={handleEmailBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.textSecondary}
                  value={newUser.password}
                  onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rol</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newUser.role === 'user' && styles.roleOptionActive
                    ]}
                    onPress={() => setNewUser({ ...newUser, role: 'user' })}
                  >
                    <Ionicons
                      name="person"
                      size={20}
                      color={newUser.role === 'user' ? colors.text : colors.textSecondary}
                    />
                    <Text style={[
                      styles.roleOptionText,
                      newUser.role === 'user' && styles.roleOptionTextActive
                    ]}>
                      Usuario
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newUser.role === 'admin' && styles.roleOptionActive
                    ]}
                    onPress={() => setNewUser({ ...newUser, role: 'admin' })}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={20}
                      color={newUser.role === 'admin' ? colors.text : colors.textSecondary}
                    />
                    <Text style={[
                      styles.roleOptionText,
                      newUser.role === 'admin' && styles.roleOptionTextActive
                    ]}>
                      Administrador
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancelar"
                onPress={() => setShowAddUserModal(false)}
                variant="gray"
                style={styles.modalButton}
              />
              <CustomButton
                title="Crear Usuario"
                onPress={handleAddUser}
                variant="secondary"
                style={styles.modalButton}
                loading={creatingUser}
                disabled={creatingUser}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Permisos */}
      <Modal
        visible={showPermissionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPermissionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gestionar Permisos</Text>
              <TouchableOpacity onPress={() => setShowPermissionsModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedUser && (
                <>
                  <View style={styles.userInfoSection}>
                    <Text style={styles.userInfoText}>{selectedUser.name}</Text>
                    <Text style={styles.userInfoEmail}>{selectedUser.email}</Text>
                  </View>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionInfo}>
                      <Ionicons name="create-outline" size={24} color={colors.text} />
                      <View style={styles.permissionTextContainer}>
                        <Text style={styles.permissionTitle}>Editar Registros</Text>
                        <Text style={styles.permissionDescription}>
                          Puede editar sus propios registros
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={selectedUser.permissions?.canEdit || false}
                      onValueChange={() => togglePermission('canEdit')}
                      trackColor={{ false: colors.border, true: colors.secondary }}
                      thumbColor={colors.text}
                    />
                  </View>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionInfo}>
                      <Ionicons name="trash-outline" size={24} color={colors.text} />
                      <View style={styles.permissionTextContainer}>
                        <Text style={styles.permissionTitle}>Eliminar Registros</Text>
                        <Text style={styles.permissionDescription}>
                          Puede eliminar sus propios registros
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={selectedUser.permissions?.canDelete || false}
                      onValueChange={() => togglePermission('canDelete')}
                      trackColor={{ false: colors.border, true: colors.secondary }}
                      thumbColor={colors.text}
                    />
                  </View>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionInfo}>
                      <Ionicons name="eye-outline" size={24} color={colors.text} />
                      <View style={styles.permissionTextContainer}>
                        <Text style={styles.permissionTitle}>Ver Todos los Registros</Text>
                        <Text style={styles.permissionDescription}>
                          Puede ver registros de todos los usuarios
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={selectedUser.permissions?.canViewAll || false}
                      onValueChange={() => togglePermission('canViewAll')}
                      trackColor={{ false: colors.border, true: colors.secondary }}
                      thumbColor={colors.text}
                    />
                  </View>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionInfo}>
                      <Ionicons name="search-outline" size={24} color={colors.text} />
                      <View style={styles.permissionTextContainer}>
                        <Text style={styles.permissionTitle}>Ver Todas las Soluciones</Text>
                        <Text style={styles.permissionDescription}>
                          Puede buscar y ver soluciones de todos
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={selectedUser.permissions?.canViewSolutions || false}
                      onValueChange={() => togglePermission('canViewSolutions')}
                      trackColor={{ false: colors.border, true: colors.secondary }}
                      thumbColor={colors.text}
                    />
                  </View>

                  <View style={styles.permissionItem}>
                    <View style={styles.permissionInfo}>
                      <Ionicons name="lock-closed-outline" size={24} color={colors.error} />
                      <View style={styles.permissionTextContainer}>
                        <Text style={[styles.permissionTitle, { color: colors.error }]}>
                          Solo Registrar
                        </Text>
                        <Text style={styles.permissionDescription}>
                          Solo puede registrar, no puede ver ningún registro
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={selectedUser.permissions?.canOnlyRegister || false}
                      onValueChange={() => togglePermission('canOnlyRegister')}
                      trackColor={{ false: colors.border, true: colors.error }}
                      thumbColor={colors.text}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <CustomButton
                title="Guardar"
                onPress={handleUpdatePermissions}
                variant="primary"
                style={styles.modalButton}
              />
              <CustomButton
                title="Cancelar"
                onPress={() => setShowPermissionsModal(false)}
                variant="gray"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert de Creando Usuario */}
      <CustomAlert
        visible={showCreatingAlert}
        onClose={() => {}}
        type="loading"
        title="Creando Usuario"
        message="Registrando usuario en el sistema..."
      />

      {/* Alert de Acceso Denegado */}
      <CustomAlert
        visible={showAccessDeniedAlert}
        onClose={() => {
          setShowAccessDeniedAlert(false);
          router.back();
        }}
        type="error"
        title="Acceso denegado"
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]}
      />

      {/* Alert de Confirmación de Cambio de Rol */}
      <CustomAlert
        visible={showChangeRoleAlert}
        onClose={() => setShowChangeRoleAlert(false)}
        type="warning"
        title="Cambiar Rol"
        message={`¿Cambiar rol a ${actionData?.newRole === 'admin' ? 'Administrador' : 'Usuario'}?`}
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setShowChangeRoleAlert(false)
          },
          {
            text: 'Confirmar',
            onPress: confirmToggleRole
          }
        ]}
      />

      {/* Alert de Confirmación de Cambio de Estado */}
      <CustomAlert
        visible={showToggleStatusAlert}
        onClose={() => setShowToggleStatusAlert(false)}
        type="warning"
        title={actionData?.newStatus ? 'Activar Usuario' : 'Desactivar Usuario'}
        message={`¿Estás seguro de ${actionData?.newStatus ? 'activar' : 'desactivar'} este usuario?`}
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setShowToggleStatusAlert(false)
          },
          {
            text: 'Confirmar',
            onPress: confirmToggleStatus
          }
        ]}
      />

      {/* Alert de Éxito - Usuario Creado */}
      <CustomAlert
        visible={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        title="Éxito"
        message={successMessage || "Usuario registrado correctamente"}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowSuccessAlert(false)
          }
        ]}
      />

      {/* Alert de Éxito - Permisos Actualizados */}
      <CustomAlert
        visible={showPermissionSuccessAlert}
        onClose={() => setShowPermissionSuccessAlert(false)}
        type="success"
        title="Éxito"
        message={successMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowPermissionSuccessAlert(false)
          }
        ]}
      />

      {/* Alert de Error */}
      <CustomAlert
        visible={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        type="error"
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  addButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: colors.primary + '20',
  },
  userBadge: {
    backgroundColor: colors.textSecondary + '20',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: {
    backgroundColor: colors.success + '20',
  },
  inactiveBadge: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  roleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  roleOptionTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
  },
  userInfoSection: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userInfoEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  permissionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ManageUsersScreen;
