import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateServiceRequestSchema, ServiceTypeSchema, TimeWindowSchema } from '@moore-tires/shared';
import type { CreateServiceRequestInput } from '@moore-tires/shared';
import { colors, spacing, typography } from '../../src/theme';

type State = 'idle' | 'submitting' | 'success' | 'error';

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function BookScreen() {
  const [state, setState] = useState<State>('idle');
  const [apiError, setApiError] = useState<string>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServiceRequestInput>({
    resolver: zodResolver(CreateServiceRequestSchema),
    defaultValues: { isMobileService: false },
  });

  const onSubmit = async (data: CreateServiceRequestInput) => {
    setState('submitting');
    setApiError(undefined);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? ''}/api/v1/service-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status === 201) {
        setState('success');
        reset();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setApiError(String(body?.error?.message ?? 'Something went wrong.'));
      setState('error');
    } catch {
      setApiError('Network error. Check your connection.');
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon} aria-hidden={true}>✓</Text>
        <Text style={styles.successTitle}>Request Received</Text>
        <Text style={styles.successBody}>
          Check your phone for an SMS confirmation. We'll reach out shortly to confirm your time.
        </Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => { setState('idle'); }}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>Submit Another Request</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/')} accessibilityRole="button">
          <Text style={styles.backLink}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageLabel}>Book Service</Text>
        <Text style={styles.pageTitle}>Service Request</Text>

        {apiError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        ) : null}

        {/* Contact */}
        <Field label="Full Name *" error={errors.fullName?.message}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                onChangeText={onChange}
                value={value}
                placeholder="Jane Smith"
                placeholderTextColor={colors.platinum[600]}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
        </Field>

        <Field label="Phone *" error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                onChangeText={onChange}
                value={value}
                placeholder="+1 555 867 5309"
                placeholderTextColor={colors.platinum[600]}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            )}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                onChangeText={onChange}
                value={value ?? ''}
                placeholder="jane@example.com"
                placeholderTextColor={colors.platinum[600]}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            )}
          />
        </Field>

        {/* Vehicle */}
        <Text style={styles.sectionLabel}>Vehicle</Text>

        <View style={styles.row}>
          <View style={styles.flex}>
            <Field label="Year *" error={errors.vehicleYear?.message}>
              <Controller
                control={control}
                name="vehicleYear"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.vehicleYear && styles.inputError]}
                    onChangeText={(t) => onChange(Number(t))}
                    value={value ? String(value) : ''}
                    placeholder="2020"
                    placeholderTextColor={colors.platinum[600]}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                )}
              />
            </Field>
          </View>
          <View style={[styles.flex, { marginLeft: spacing.sm }]}>
            <Field label="Make *" error={errors.vehicleMake?.message}>
              <Controller
                control={control}
                name="vehicleMake"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.vehicleMake && styles.inputError]}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Honda"
                    placeholderTextColor={colors.platinum[600]}
                    autoCapitalize="words"
                  />
                )}
              />
            </Field>
          </View>
        </View>

        <Field label="Model *" error={errors.vehicleModel?.message}>
          <Controller
            control={control}
            name="vehicleModel"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.vehicleModel && styles.inputError]}
                onChangeText={onChange}
                value={value}
                placeholder="Accord"
                placeholderTextColor={colors.platinum[600]}
                autoCapitalize="words"
              />
            )}
          />
        </Field>

        <Field label="License Plate *" error={errors.licensePlate?.message}>
          <Controller
            control={control}
            name="licensePlate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.licensePlate && styles.inputError]}
                onChangeText={(t) => onChange(t.toUpperCase())}
                value={value}
                placeholder="ABC 1234"
                placeholderTextColor={colors.platinum[600]}
                autoCapitalize="characters"
              />
            )}
          />
        </Field>

        {/* Service */}
        <Text style={styles.sectionLabel}>Service Details</Text>

        <Field label="Service Type *" error={errors.serviceType?.message}>
          <View style={styles.optionGroup}>
            {ServiceTypeSchema.options.map((type) => (
              <Controller
                key={type}
                control={control}
                name="serviceType"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[styles.option, value === type && styles.optionSelected]}
                    onPress={() => onChange(type)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: value === type }}
                  >
                    <Text style={[styles.optionText, value === type && styles.optionTextSelected]}>
                      {type.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
        </Field>

        <Field label="Preferred Date *" error={errors.preferredDate?.message}>
          <Controller
            control={control}
            name="preferredDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.preferredDate && styles.inputError]}
                onChangeText={onChange}
                value={value}
                placeholder="2025-09-15"
                placeholderTextColor={colors.platinum[600]}
                keyboardType="numbers-and-punctuation"
              />
            )}
          />
        </Field>

        <Field label="Preferred Time *" error={errors.preferredTimeWindow?.message}>
          <View style={styles.optionGroup}>
            {TimeWindowSchema.options.map((tw) => (
              <Controller
                key={tw}
                control={control}
                name="preferredTimeWindow"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[styles.option, value === tw && styles.optionSelected]}
                    onPress={() => onChange(tw)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: value === tw }}
                  >
                    <Text style={[styles.optionText, value === tw && styles.optionTextSelected]}>
                      {tw.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
        </Field>

        {/* Mobile toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.flex}>
            <Text style={styles.fieldLabel}>Mobile Service</Text>
            <Text style={styles.toggleSub}>We'll come to you</Text>
          </View>
          <Controller
            control={control}
            name="isMobileService"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.onyx[600], true: colors.flame[500] }}
                thumbColor={colors.platinum[50]}
              />
            )}
          />
        </View>

        {/* Notes */}
        <Field label="Notes" error={errors.notes?.message}>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textarea]}
                onChangeText={onChange}
                value={value ?? ''}
                placeholder="Anything else we should know?"
                placeholderTextColor={colors.platinum[600]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
        </Field>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.ctaBtn, state === 'submitting' && styles.ctaBtnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={state === 'submitting'}
          accessibilityRole="button"
          accessibilityLabel="Submit service request"
        >
          <Text style={styles.ctaText}>
            {state === 'submitting' ? 'Submitting…' : 'Submit Request'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },

  pageLabel: { ...typography.label, color: colors.flame[500], marginBottom: spacing.xs },
  pageTitle: { ...typography.displayLg, color: colors.platinum[50], marginBottom: spacing.xl },

  errorBanner: {
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF444440',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: { ...typography.small, color: '#EF4444' },

  sectionLabel: { ...typography.label, color: colors.platinum[600], marginTop: spacing.lg, marginBottom: spacing.xs },

  field: { marginBottom: spacing.md },
  fieldLabel: { ...typography.label, color: colors.platinum[400], marginBottom: spacing.xs, fontSize: 11 },
  fieldError: { ...typography.small, color: '#EF4444', marginTop: spacing.xs / 2 },

  input: {
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[700],
    color: colors.platinum[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  inputError: { borderColor: '#EF4444' },
  textarea: { height: 96, paddingTop: spacing.sm },

  row: { flexDirection: 'row' },

  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 1, backgroundColor: colors.onyx[700] },
  option: {
    backgroundColor: colors.onyx[800],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  optionSelected: { backgroundColor: colors.flame[500] },
  optionText: { ...typography.label, color: colors.platinum[400], fontSize: 10 },
  optionTextSelected: { color: '#FFFFFF' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[700],
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  toggleSub: { ...typography.small, color: colors.platinum[600], marginTop: 2 },

  ctaBtn: {
    backgroundColor: colors.flame[500],
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaText: { ...typography.label, color: '#FFFFFF', fontSize: 13 },

  successContainer: {
    flex: 1,
    backgroundColor: colors.onyx[900],
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successIcon: { fontSize: 48, marginBottom: spacing.md, color: colors.flame[500] },
  successTitle: { ...typography.displayMd, color: colors.platinum[50], marginBottom: spacing.sm },
  successBody: { ...typography.body, color: colors.platinum[400], textAlign: 'center', marginBottom: spacing.xl },
  backLink: { ...typography.small, color: colors.flame[500], marginTop: spacing.md },
});
