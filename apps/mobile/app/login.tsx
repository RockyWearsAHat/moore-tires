import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useMobileAuth } from '../src/context/AuthContext';
import { colors, spacing, typography } from '../src/theme';

export default function LoginScreen() {
  const { login } = useMobileAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Log in to your Moore Tires account to place orders and manage inventory.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.platinum[600]}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.platinum[600]}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={() => void handleLogin()}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.btnText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  card: {
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[700],
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.displayMd,
    color: colors.platinum[50],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.platinum[400],
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.platinum[600],
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.onyx[900],
    borderWidth: 1,
    borderColor: colors.onyx[600],
    color: colors.platinum[50],
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    marginTop: spacing.xs,
  },
  btn: {
    backgroundColor: colors.flame[500],
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    ...typography.label,
    color: '#FFFFFF',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: spacing.md,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
  },
});
