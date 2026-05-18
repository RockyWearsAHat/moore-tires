import { type ComponentProps, useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMobileAuth } from '../../src/context/AuthContext';
import { colors, radii, shadow, spacing, typography } from '../../src/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type JobStatus = 'SCHEDULED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

interface Job {
  id: string;
  status: JobStatus;
  customerName: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: string;
  startsAt: string;
  isMobileService: boolean;
}

const STATUS_META: Record<JobStatus, { label: string; color: string; icon: IoniconName }> = {
  SCHEDULED: { label: 'Scheduled', color: '#3B82F6', icon: 'calendar-outline' },
  EN_ROUTE: { label: 'En Route', color: '#F59E0B', icon: 'car-outline' },
  IN_PROGRESS: { label: 'In Progress', color: '#8B5CF6', icon: 'construct-outline' },
  COMPLETE: { label: 'Complete', color: '#10B981', icon: 'checkmark-circle-outline' },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', icon: 'close-circle-outline' },
};

export default function JobsScreen() {
  const { apiFetch, user } = useMobileAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setError('');
    try {
      // Use the authenticated user's ID so the correct technician's jobs are returned.
      const res = await apiFetch(`/api/v1/jobs/technician/${user.id}`);
      if (!res.ok) {
        setError('Failed to load jobs.');
        return;
      }
      const json = (await res.json()) as { data: Job[] };
      setJobs(json.data ?? []);
    } catch {
      setError('Network error — could not load jobs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFetch, user]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchJobs();
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={40} color={colors.platinum[700]} />
        <Text style={styles.muted}>Sign in to view your jobs.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.flame[500]} size="large" />
        <Text style={[styles.muted, { marginTop: spacing.sm }]}>Loading jobs…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={40} color={colors.platinum[700]} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => void fetchJobs()} activeOpacity={0.85}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={jobs.length === 0 ? styles.empty : styles.list}
      data={jobs}
      keyExtractor={(j) => j.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.flame[500]} />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Ionicons name="briefcase-outline" size={40} color={colors.platinum[700]} />
          <Text style={styles.muted}>No jobs assigned today.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const meta = STATUS_META[item.status];
        const timeStr = new Date(item.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return (
          <TouchableOpacity
            style={[styles.card, shadow.card]}
            onPress={() => router.push(`/job/${item.id}`)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Job for ${item.customerName}`}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.customer}>{item.customerName}</Text>
                <Text style={styles.vehicle}>
                  {item.vehicleYear} {item.vehicleMake} {item.vehicleModel}
                </Text>
              </View>
              <View style={styles.timeBox}>
                <Ionicons name="time-outline" size={11} color={colors.flame[400]} />
                <Text style={styles.timeText}>{timeStr}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.serviceRow}>
                <Ionicons name="construct-outline" size={12} color={colors.platinum[600]} />
                <Text style={styles.serviceText}>{item.serviceType.replace(/_/g, ' ')}</Text>
              </View>
              <View style={styles.badgeRow}>
                {item.isMobileService && (
                  <View style={[styles.badge, { backgroundColor: '#3B82F6' + '22', borderColor: '#3B82F6' + '55' }]}>
                    <Ionicons name="car-outline" size={10} color="#3B82F6" />
                    <Text style={[styles.badgeText, { color: '#3B82F6' }]}>MOBILE</Text>
                  </View>
                )}
                <View style={[styles.badge, { backgroundColor: meta.color + '22', borderColor: meta.color + '55' }]}>
                  <Ionicons name={meta.icon} size={10} color={meta.color} />
                  <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, gap: spacing.sm },
  muted: { ...typography.body, color: colors.platinum[600], textAlign: 'center' },

  card: {
    backgroundColor: colors.onyx[800],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.onyx[700],
    overflow: 'hidden',
    padding: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  customer: { ...typography.displaySm, color: colors.platinum[50] },
  vehicle: { ...typography.small, color: colors.platinum[400], marginTop: 2 },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.flame[500] + '1A',
    borderWidth: 1,
    borderColor: colors.flame[500] + '55',
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeText: { fontSize: 12, fontWeight: '700', color: colors.flame[400] },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceText: { ...typography.small, color: colors.platinum[600] },

  badgeRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  errorText: { ...typography.body, color: '#EF4444', textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.onyx[700],
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: { ...typography.label, color: colors.platinum[100], fontSize: 11 },
});
