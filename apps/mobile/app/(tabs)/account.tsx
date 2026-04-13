import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useMobileAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography } from '../../src/theme';

export default function AccountScreen() {
  const { user, loading, logout } = useMobileAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Log in to view your orders, manage inventory, and place new orders.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName[0]}{user.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Quick Actions</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuText}>My Orders</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {user.wholesaleAccountId && (
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>Inventory</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <Text style={styles.menuIcon}>🛞</Text>
          <Text style={styles.menuText}>Shop Tires</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => void logout()}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  content: { padding: spacing.lg, gap: spacing.lg },
  center: {
    flex: 1,
    backgroundColor: colors.onyx[900],
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: { ...typography.body, color: colors.platinum[600] },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { ...typography.displayMd, color: colors.platinum[50], marginBottom: spacing.xs },
  subtitle: {
    ...typography.body,
    color: colors.platinum[400],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.flame[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  primaryBtnText: { ...typography.label, color: '#FFFFFF', fontSize: 13 },
  card: {
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[700],
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.flame[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
  name: { ...typography.displayMd, color: colors.platinum[50], fontSize: 20 },
  email: { ...typography.small, color: colors.platinum[400] },
  roleBadge: {
    backgroundColor: colors.flame[500] + '1A',
    borderWidth: 1,
    borderColor: colors.flame[500] + '4D',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: spacing.xs,
  },
  roleText: { fontSize: 10, fontWeight: '700', color: colors.flame[400], textTransform: 'uppercase', letterSpacing: 1.5 },
  section: { gap: 1, backgroundColor: colors.onyx[700] },
  sectionLabel: {
    ...typography.label,
    color: colors.platinum[600],
    backgroundColor: colors.onyx[900],
    paddingBottom: spacing.sm,
  },
  menuItem: {
    backgroundColor: colors.onyx[800],
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuIcon: { fontSize: 20 },
  menuText: { ...typography.body, color: colors.platinum[100], flex: 1 },
  menuArrow: { fontSize: 20, color: colors.platinum[600] },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.onyx[600],
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutText: { ...typography.label, color: colors.platinum[400], fontSize: 11 },
});
