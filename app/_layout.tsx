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
          <Stack.Screen name="login" />
          <Stack.Screen name="menu" />
          <Stack.Screen name="register-problem" />
          <Stack.Screen name="view-records" />
          <Stack.Screen name="problem-detail" />
          <Stack.Screen name="search-solutions" />
        </Stack>
      </AuthProvider>
    </ErrorBoundary>
  );
}