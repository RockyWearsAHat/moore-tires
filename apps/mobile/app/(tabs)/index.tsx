import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useMobileAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography } from '../../src/theme';

const SERVICES = [
  { icon: '🛞', title: 'Wholesale', desc: 'Bulk tire ordering for fleets.' },
  { icon: '📦', title: 'Quick Order', desc: 'Reorder from your history.' },
  { icon: '📊', title: 'Inventory', desc: 'Track stock, get low alerts.' },
  { icon: '🚚', title: 'Delivery', desc: 'Fast shipping from WA hub.' },
];

export default function HomeScreen() {
  const { user } = useMobileAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.label}>Wholesale Tire Distribution</Text>
        <Text style={styles.headline}>
          Moore{'\n'}
          <Text style={{ color: colors.flame[500] }}>Tires</Text>
        </Text>
        <Text style={styles.subhead}>
          Wholesale semi-truck tires for fleets. TA, Love's, and independent dealers. Fast delivery from our Washington distribution center.
        </Text>

        {user ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/(tabs)/tires')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Shop Tires"
          >
            <Text style={styles.ctaText}>Shop Tires</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Sign in to order"
          >
            <Text style={styles.ctaText}>Sign In to Order</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => router.push('/book')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Book service"
        >
          <Text style={styles.callText}>Book Service</Text>
        </TouchableOpacity>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>What We Do</Text>
        <View style={styles.grid}>
          {SERVICES.map(({ icon, title, desc }) => (
            <View key={title} style={styles.serviceCard}>
              <Text style={styles.serviceIcon} aria-hidden={true}>{icon}</Text>
              <Text style={styles.serviceTitle}>{title}</Text>
              <Text style={styles.serviceDesc}>{desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: '15+', label: 'Years' },
          { value: '12k+', label: 'Tires' },
          { value: '4.9★', label: 'Rating' },
        ].map(({ value, label }) => (
          <View key={label} style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  content: { paddingBottom: spacing.xxl },

  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.onyx[700],
  },
  label: { ...typography.label, color: colors.flame[500], marginBottom: spacing.sm },
  headline: { ...typography.displayXl, color: colors.platinum[50], marginBottom: spacing.md },
  subhead: { ...typography.bodyLg, color: colors.platinum[400], marginBottom: spacing.xl },
  ctaBtn: {
    backgroundColor: colors.flame[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  ctaText: { ...typography.label, color: '#FFFFFF', fontSize: 13 },
  callBtn: {
    borderWidth: 1,
    borderColor: colors.onyx[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  callText: { ...typography.label, color: colors.platinum[400], fontSize: 13 },

  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.platinum[600], marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1, backgroundColor: colors.onyx[700] },
  serviceCard: {
    width: '50%',
    backgroundColor: colors.onyx[800],
    padding: spacing.md,
    gap: spacing.xs,
  },
  serviceIcon: { fontSize: 22, color: colors.flame[500] },
  serviceTitle: { ...typography.displayMd, color: colors.platinum[100], fontSize: 16 },
  serviceDesc: { ...typography.small, color: colors.platinum[600] },

  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
    marginHorizontal: spacing.lg,
    gap: 1,
    backgroundColor: colors.onyx[700],
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.onyx[800],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statValue: { ...typography.displayMd, color: colors.flame[500] },
  statLabel: { ...typography.label, color: colors.platinum[600], fontSize: 9 },
});
