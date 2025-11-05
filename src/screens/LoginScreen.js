import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlert from "../components/CustomAlert";
import CustomButton from "../components/CustomButton";
import { useAuth } from "../context/AuthContext";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";

const LoginScreen = () => {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("@dieselsoft.co");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Navegar automáticamente al menú cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated && !loginLoading) {
      console.log('🔵 Usuario autenticado detectado, navegando al menú...');
      // Navegación inmediata para login más rápido
      router.replace("/menu");
    }
  }, [isAuthenticated, loginLoading, router]);

  const handleEmailChange = (text) => {
    // Si intentan borrar el @ o el dominio, mantenerlo
    if (!text.includes('@dieselsoft.co')) {
      setEmail('@dieselsoft.co');
      return;
    }
    // Obtener solo la parte antes del @
    const beforeAt = text.split('@')[0];
    // Actualizar con la parte antes del @ + el dominio fijo
    setEmail(beforeAt + '@dieselsoft.co');
  };

const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert("Error", "Por favor ingrese email y contraseña");
    return;
  }

  setLoginLoading(true);

  try {
    const emailTrimmed = email.toLowerCase().trim();

    console.log('🔵 Iniciando login con Firebase Auth...');

    await signIn(emailTrimmed, password);

    console.log('✅ Login exitoso. El useEffect navegará automáticamente al menú...');

    // NO navegar manualmente aquí, el useEffect se encargará cuando isAuthenticated cambie
    setLoginLoading(false);

  } catch (error) {
    console.error("❌ Login error:", error);
    setLoginLoading(false);
    Alert.alert(
      "Error de autenticación",
      error.message || "No se pudo iniciar sesión. Verifica tus credenciales."
    );
  }
};


  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              <Text style={styles.logoDiesel}>DIESEL</Text>
              <Text style={styles.logoSoft}>SOFT</Text>
            </Text>
            <Text style={styles.subtitle}>TRUCK RALLY TEAM</Text>

            <View style={styles.appNamesContainer}>
              <Text style={styles.mechanicText}>MECANIC-FIXES</Text>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.electricText}>ELECTRIC-FIXES</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="usuario@dieselsoft.co"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loginLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loginLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loginLoading}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.textSecondary}
                  style={styles.iconRight}
                />
              </TouchableOpacity>
            </View>

            <CustomButton
              title="Iniciar Sesión"
              onPress={handleLogin}
              variant="primary"
              style={styles.button}
              loading={loginLoading}
              disabled={loginLoading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  logoContainer: { alignItems: "center", marginBottom: 60 },
  logoText: { fontSize: 36, fontWeight: "bold", marginBottom: 8 },
  logoDiesel: { color: colors.primary },
  logoSoft: { color: colors.secondary },
  subtitle: {
    color: colors.text,
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "300",
  },
  appNamesContainer: {
    marginTop: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mechanicText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.mechanical,
    letterSpacing: 0.5,
  },
  separator: {
    fontSize: 16,
    fontWeight: "300",
    color: colors.textSecondary,
  },
  electricText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.electrical,
    letterSpacing: 0.5,
  },
  formContainer: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { marginRight: 10 },
  iconRight: { marginLeft: 10, padding: 4 },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 14 },
  button: { marginTop: 8 },
});

export default LoginScreen;
