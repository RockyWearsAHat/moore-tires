import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, spacing, typography } from '../../src/theme';

type JobStatus = 'SCHEDULED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

interface Job {
  id: string;
  status: JobStatus;
  customerName: string;
  customerPhone: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  licensePlate: string;
  serviceType: string;
  startsAt: string;
  endsAt: string;
  isMobileService: boolean;
  notes?: string;
}

const NEXT_STATUS: Partial<Record<JobStatus, JobStatus>> = {
  SCHEDULED: 'EN_ROUTE',
  EN_ROUTE: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETE',
};

const STATUS_LABEL: Record<JobStatus, string> = {
  SCHEDULED: 'Scheduled',
  EN_ROUTE: 'En Route',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete',
  CANCELLED: 'Cancelled',
};

const STATUS_COLOR: Record<JobStatus, string> = {
  SCHEDULED: '#3B82F6',
  EN_ROUTE: '#F59E0B',
  IN_PROGRESS: '#8B5CF6',
  COMPLETE: '#10B981',
  CANCELLED: '#6B7280',
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${process.env['EXPO_PUBLIC_API_URL'] ?? ''}/api/v1/jobs/${id ?? ''}`);
        if (!res.ok) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { data } = await res.json();
        setJob(data as Job);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const advanceStatus = async () => {
    if (!job || !NEXT_STATUS[job.status]) return;
    const next = NEXT_STATUS[job.status]!;
    setUpdating(true);
    try {
      const res = await fetch(`${process.env['EXPO_PUBLIC_API_URL'] ?? ''}/api/v1/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) setJob((j) => j ? { ...j, status: next } : j);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !job) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{loading ? 'Loading…' : 'Job not found.'}</Text>
      </View>
    );
  }

  const nextStatus = NEXT_STATUS[job.status];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[job.status] + '20', borderColor: STATUS_COLOR[job.status] + '50' }]}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[job.status] }]} />
        <Text style={[styles.statusText, { color: STATUS_COLOR[job.status] }]}>{STATUS_LABEL[job.status]}</Text>
      </View>

      {/* Vehicle */}
      <Text style={styles.vehicle}>{job.vehicleYear} {job.vehicleMake} {job.vehicleModel}</Text>
      <Text style={styles.plate}>{job.licensePlate}</Text>
      <Text style={styles.service}>{job.serviceType.replace(/_/g, ' ')}</Text>

      {/* Time */}
      <View style={styles.section}>
        <InfoRow label="Date" value={new Date(job.startsAt).toLocaleDateString()} />
        <InfoRow
          label="Time"
          value={`${new Date(job.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → ${new Date(job.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        />
        <InfoRow label="Type" value={job.isMobileService ? 'Mobile (we go to customer)' : 'In-Shop'} />
      </View>

      {/* Customer */}
      <Text style={styles.sectionLabel}>Customer</Text>
      <View style={styles.section}>
        <InfoRow label="Name" value={job.customerName} />
        <InfoRow label="Phone" value={job.customerPhone} />
      </View>

      {/* Notes */}
      {job.notes ? (
        <>
          <Text style={styles.sectionLabel}>Notes</Text>
          <View style={styles.section}>
            <Text style={styles.notes}>{job.notes}</Text>
          </View>
        </>
      ) : null}

      {/* CTA */}
      {nextStatus ? (
        <TouchableOpacity
          style={[styles.ctaBtn, updating && styles.ctaBtnDisabled]}
          onPress={advanceStatus}
          disabled={updating}
          accessibilityRole="button"
          accessibilityLabel={`Mark as ${STATUS_LABEL[nextStatus]}`}
        >
          <Text style={styles.ctaText}>
            {updating ? 'Updating…' : `Mark as ${STATUS_LABEL[nextStatus]}`}
          </Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" style={styles.backBtn}>
        <Text style={styles.backText}>← Back to My Jobs</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { ...typography.body, color: colors.platinum[600] },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...typography.label, fontSize: 10 },

  vehicle: { ...typography.displayMd, color: colors.platinum[50] },
  plate: { ...typography.label, color: colors.platinum[600], marginTop: spacing.xs / 2 },
  service: { ...typography.body, color: colors.flame[400], marginTop: spacing.xs },

  sectionLabel: { ...typography.label, color: colors.platinum[600], marginTop: spacing.xl, marginBottom: spacing.xs },
  section: {
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[700],
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.onyx[700],
  },
  infoLabel: { ...typography.small, color: colors.platinum[600] },
  infoValue: { ...typography.small, color: colors.platinum[100], fontWeight: '600' },
  notes: { ...typography.body, color: colors.platinum[400], padding: spacing.md },

  ctaBtn: {
    backgroundColor: colors.flame[500],
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaText: { ...typography.label, color: '#FFFFFF', fontSize: 13 },

  backBtn: { marginTop: spacing.lg, alignItems: 'center' },
  backText: { ...typography.small, color: colors.flame[500] },
});
