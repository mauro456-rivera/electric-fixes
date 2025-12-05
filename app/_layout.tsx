import { Stack } from 'expo-router';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/context/AuthContext';
import { colors } from '../src/styles/colors';

export default function Layout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="menu" />
          <Stack.Screen name="guest-menu" />
          <Stack.Screen name="guest-solutions" />
          <Stack.Screen name="solution-detail" />
          <Stack.Screen name="contribute" />
          <Stack.Screen name="register-problem" />
          <Stack.Screen name="view-records" />
          <Stack.Screen name="problem-detail" />
          <Stack.Screen name="search-solutions" />
        </Stack>
      </AuthProvider>
    </ErrorBoundary>
  );
}