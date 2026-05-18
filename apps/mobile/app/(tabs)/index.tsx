import { type ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMobileAuth } from '../../src/context/AuthContext';
import { colors, radii, spacing, typography } from '../../src/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const SERVICES: {
  icon: IoniconName;
  title: string;
  desc: string;
  route: '/(tabs)/tires' | '/(tabs)/book';
}[] = [
  { icon: 'cube-outline',         title: 'Wholesale',   desc: 'Bulk OTR tires for fleet accounts.',   route: '/(tabs)/tires' },
  { icon: 'flash-outline',        title: 'Quick Order', desc: 'Reorder from your purchase history.',  route: '/(tabs)/tires' },
  { icon: 'stats-chart-outline',  title: 'Inventory',   desc: 'Track stock levels, get low alerts.',  route: '/(tabs)/tires' },
  { icon: 'car-outline',          title: 'Delivery',    desc: 'Fast shipping from our WA hub.',       route: '/(tabs)/tires' },
];

const STATS = [
  { value: '15+',  label: 'Years' },
  { value: '12k+', label: 'Shipped' },
  { value: '4.9★', label: 'Rating' },
];

export default function HomeScreen() {
  const { user } = useMobileAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.accentBar} />
        <Text style={styles.eyebrow}>Wholesale · Pacific Northwest</Text>
        <Text style={styles.headline}>
          {'MOORE\n'}<Text style={styles.headlineAccent}>TIRES.</Text>
        </Text>
        <Text style={styles.tagline}>
          Premium OTR tires for fleets, dealers, and independent operators.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push(user ? '/(tabs)/tires' : '/login')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={user ? 'Shop Tires' : 'Sign in to order'}
        >
          <Text style={styles.primaryBtnText}>{user ? 'Shop Tires' : 'Sign In to Order'}</Text>
          <Ionicons name="arrow-forward" size={13} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => router.push('/(tabs)/book')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Book service"
        >
          <Text style={styles.ghostBtnText}>Book Service</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <View style={styles.statsStrip}>
        {STATS.map(({ value, label }, i) => (
          <View
            key={label}
            style={[styles.statItem, i < STATS.length - 1 && styles.statDivider]}
          >
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>What We Do</Text>
        <View style={styles.serviceList}>
          {SERVICES.map(({ icon, title, desc, route }) => (
            <TouchableOpacity
              key={title}
              style={styles.serviceRow}
              onPress={() => router.push(route)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={title}
            >
              <View style={styles.serviceIconWrap}>
                <Ionicons name={icon} size={18} color={colors.flame[500]} />
              </View>
              <View style={styles.serviceCopy}>
                <Text style={styles.serviceTitle}>{title}</Text>
                <Text style={styles.serviceDesc}>{desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.platinum[600]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  content: { paddingBottom: spacing.xxl },

  // ── Hero
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + spacing.sm,
    paddingBottom: spacing.xl,
  },
  accentBar: {
    width: 44,
    height: 3,
    backgroundColor: colors.flame[500],
    marginBottom: spacing.md,
    borderRadius: radii.xs,
  },
  eyebrow: {
    ...typography.label,
    color: colors.platinum[600],
    marginBottom: spacing.sm,
  },
  headline: {
    fontSize: 58,
    fontWeight: '900',
    letterSpacing: -2.5,
    lineHeight: 58,
    color: colors.platinum[50],
    marginBottom: spacing.md,
  },
  headlineAccent: { color: colors.flame[500] },
  tagline: {
    ...typography.body,
    color: colors.platinum[400],
    marginBottom: spacing.xl,
    lineHeight: 22,
    maxWidth: 300,
  },
  primaryBtn: {
    backgroundColor: colors.flame[500],
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  primaryBtnText: { ...typography.label, color: '#FFFFFF', fontSize: 12 },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.onyx[600],
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  ghostBtnText: { ...typography.label, color: colors.platinum[400], fontSize: 12 },

  // ── Stats
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: colors.onyx[800],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.onyx[700],
  },
  statItem: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', gap: 2 },
  statDivider: { borderRightWidth: 1, borderRightColor: colors.onyx[700] },
  statValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, color: colors.flame[500] },
  statLabel: { ...typography.label, color: colors.platinum[600], fontSize: 8, letterSpacing: 1.5 },

  // ── Services
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.platinum[600], marginBottom: spacing.md },
  serviceList: {
    backgroundColor: colors.onyx[700],
    gap: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  serviceRow: {
    backgroundColor: colors.onyx[800],
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  serviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.flame[500] + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCopy: { flex: 1 },
  serviceTitle: { ...typography.displaySm, fontSize: 15, color: colors.platinum[100] },
  serviceDesc: { ...typography.small, color: colors.platinum[600], marginTop: 2 },
});
