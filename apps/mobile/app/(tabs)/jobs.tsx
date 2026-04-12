import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '../../src/theme';

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

const STATUS_COLORS: Record<JobStatus, string> = {
  SCHEDULED: '#3B82F6',
  EN_ROUTE: '#F59E0B',
  IN_PROGRESS: '#8B5CF6',
  COMPLETE: '#10B981',
  CANCELLED: '#6B7280',
};

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const technicianId = 'me'; // Replace with real auth-based tech ID
    void (async () => {
      try {
        const res = await fetch(`${process.env['EXPO_PUBLIC_API_URL'] ?? ''}/api/v1/jobs/technician/${technicianId}`);
        if (!res.ok) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { data } = await res.json();
        setJobs(data as Job[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading jobs…</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={jobs.length === 0 ? styles.empty : styles.list}
      data={jobs}
      keyExtractor={(j) => j.id}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.muted}>No jobs assigned today.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/job/${item.id}`)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Job for ${item.customerName}`}
        >
          {/* Status bar */}
          <View style={[styles.statusBar, { backgroundColor: STATUS_COLORS[item.status] }]} />
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <Text style={styles.customer}>{item.customerName}</Text>
              {item.isMobileService && (
                <View style={styles.mobileBadge}>
                  <Text style={styles.mobileBadgeText}>MOBILE</Text>
                </View>
              )}
            </View>
            <Text style={styles.vehicle}>
              {item.vehicleYear} {item.vehicleMake} {item.vehicleModel}
            </Text>
            <Text style={styles.service}>{item.serviceType.replace(/_/g, ' ')}</Text>
            <Text style={styles.time}>
              {new Date(item.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, gap: spacing.xs },
  muted: { ...typography.body, color: colors.platinum[600] },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[700],
    overflow: 'hidden',
  },
  statusBar: { width: 4 },
  cardBody: { flex: 1, padding: spacing.md, gap: 2 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  customer: { ...typography.body, fontWeight: '600', color: colors.platinum[100] },
  vehicle: { ...typography.small, color: colors.platinum[400] },
  service: { ...typography.small, color: colors.platinum[600] },
  time: { ...typography.label, color: colors.flame[500], marginTop: spacing.xs, fontSize: 10 },

  mobileBadge: {
    backgroundColor: colors.flame[500] + '20',
    borderWidth: 1,
    borderColor: colors.flame[500] + '50',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  mobileBadgeText: { ...typography.label, color: colors.flame[400], fontSize: 9 },
});
