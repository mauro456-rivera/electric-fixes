import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import CustomButton from "../components/CustomButton";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/api";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";

const LoginScreen = () => {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor ingrese email y contraseña");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingrese un email válido");
      return;
    }

    setLoading(true);

    try {
      const credentials = {
        email: email.toLowerCase().trim(),
        password: password,
      };

      const response = await ApiService.login(credentials);
      console.log("✅ Login exitoso");

      const token = response.access_token;
      const userData = response.user;

      if (!token || !userData) {
        throw new Error("Respuesta de login incompleta");
      }

      await signIn(userData, token);

      // Pequeño delay para que el contexto se actualice
      await new Promise((resolve) => setTimeout(resolve, 100));

      router.replace("/menu");
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert(
        "Error de autenticación",
        error.message || "No se pudo iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setLoading(false);
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

            <Text style={styles.subtitlel}>MECANIC-FIXES</Text>
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
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
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
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
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
              loading={loading}
              disabled={loading}
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
  subtitlel: {
    marginTop: 80,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
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
