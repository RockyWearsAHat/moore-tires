import { type ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMobileAuth } from '../../src/context/AuthContext';
import { colors, radii, shadow, spacing, typography } from '../../src/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IoniconName;
  label: string;
  onPress: () => void;
}

export default function AccountScreen() {
  const { user, loading, logout } = useMobileAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.flame[500]} size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <View style={styles.lockCircle}>
          <Ionicons name="lock-closed" size={28} color={colors.flame[500]} />
        </View>
        <Text style={styles.guestTitle}>Sign In</Text>
        <Text style={styles.guestSubtitle}>
          Log in to view your orders, manage inventory, and place new orders.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/login')}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Ionicons name="log-in-outline" size={16} color="#FFF" />
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems: MenuItem[] = [
    { icon: 'receipt-outline', label: 'My Orders', onPress: () => router.push('/(tabs)/jobs') },
    ...(user.wholesaleAccountId
      ? [{ icon: 'stats-chart-outline' as IoniconName, label: 'Inventory', onPress: () => router.push('/(tabs)/tires') }]
      : []),
    { icon: 'car-sport-outline', label: 'Shop Tires', onPress: () => router.push('/(tabs)/tires') },
    { icon: 'calendar-outline', label: 'Book Service', onPress: () => router.push('/(tabs)/book') },
  ];

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile card */}
      <View style={[styles.profileCard, shadow.card]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{user.role.replace(/_/g, ' ')}</Text>
          </View>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.sectionGroup}>
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={[styles.menuGroup, shadow.card]}>
          {menuItems.map((item, i) => (
            <View key={item.label}>
              {i > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={18} color={colors.flame[500]} />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.platinum[700]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => void logout()}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <Ionicons name="log-out-outline" size={16} color="#EF4444" />
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
    gap: spacing.md,
  },

  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.flame[500] + '1A',
    borderWidth: 1,
    borderColor: colors.flame[500] + '55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: { ...typography.displayMd, color: colors.platinum[50] },
  guestSubtitle: {
    ...typography.body,
    color: colors.platinum[400],
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.flame[500],
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryBtnText: { ...typography.label, color: '#FFFFFF', fontSize: 13 },

  profileCard: {
    backgroundColor: colors.onyx[800],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.onyx[700],
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.flame[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.flame[600],
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 22 },
  profileInfo: { flex: 1, gap: 3 },
  name: { ...typography.displaySm, color: colors.platinum[50], fontSize: 19 },
  email: { ...typography.small, color: colors.platinum[400] },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.flame[500] + '1A',
    borderWidth: 1,
    borderColor: colors.flame[500] + '4D',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  roleText: { fontSize: 9, fontWeight: '800', color: colors.flame[400], textTransform: 'uppercase', letterSpacing: 1.5 },

  sectionGroup: { gap: spacing.sm },
  sectionLabel: { ...typography.label, color: colors.platinum[600], fontSize: 10 },
  menuGroup: {
    backgroundColor: colors.onyx[800],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.onyx[700],
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.flame[500] + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { ...typography.body, color: colors.platinum[100], flex: 1, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.onyx[700], marginLeft: 58 },

  logoutBtn: {
    borderWidth: 1,
    borderColor: '#EF444433',
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#EF444408',
  },
  logoutText: { ...typography.label, color: '#EF4444', fontSize: 12 },
});
