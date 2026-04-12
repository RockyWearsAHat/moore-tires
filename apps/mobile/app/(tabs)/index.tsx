import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '../../src/theme';

const SERVICES = [
  { icon: '⚙', title: 'Install', desc: 'Mount & balance new tires.' },
  { icon: '◎', title: 'Repair', desc: 'Fast flat patch & plug.' },
  { icon: '↺', title: 'Rotation', desc: 'Even wear, longer life.' },
  { icon: '◈', title: 'Inspection', desc: '20-point tire health check.' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.label}>Professional Tire Service</Text>
        <Text style={styles.headline}>
          Gripped.{'\n'}
          <Text style={{ color: colors.flame[500] }}>Every</Text> Road.
        </Text>
        <Text style={styles.subhead}>
          Expert installation, repair, rotation & inspection. Mobile service available.
        </Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push('/book')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Book appointment"
        >
          <Text style={styles.ctaText}>Book Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => {/* Linking.openURL('tel:+15558675309') */}}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Call us"
        >
          <Text style={styles.callText}>Call (555) 867-5309</Text>
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
