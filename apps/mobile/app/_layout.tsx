import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MobileAuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <MobileAuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0C0C12' },
          headerTintColor: '#FFFCF8',
          headerTitleStyle: { fontWeight: '700', fontSize: 16 },
          contentStyle: { backgroundColor: '#0C0C12' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="job/[id]" options={{ title: 'Job Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="book" options={{ title: 'Book Service', headerBackTitle: 'Back' }} />
        <Stack.Screen name="login" options={{ title: 'Sign In', headerBackTitle: 'Back' }} />
      </Stack>
    </MobileAuthProvider>
  );
}
