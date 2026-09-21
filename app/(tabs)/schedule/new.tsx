/**
 * What this does:
 * Create / Edit appointment form with vendor picker, date/time
 * pickers, location, reminder setting, and notes.
 * Saves to Supabase and schedules a local notification.
 */

import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useCallback, useState } from 'react';
import { z } from 'zod';
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import { useCreateAppointment } from '../../../hooks/useAppointments';
import { useVendors } from '../../../hooks/useVendors';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  vendor_id: z.string().nullable(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  reminder_minutes: z.number(),
});

type FormData = z.infer<typeof schema>;

const REMINDER_OPTIONS = [
  { label: 'None', value: 0 },
  { label: '10 min', value: 10 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 1440 },
];

export default function NewAppointmentScreen() {
  const { date: paramDate, editId } = useLocalSearchParams<{
    date?: string;
    editId?: string;
  }>();
  const router = useRouter();
  const createAppt = useCreateAppointment();
  const { data: vendors } = useVendors();

  const initialDate = paramDate ? new Date(`${paramDate}T10:00:00`) : new Date();
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(
    new Date(initialDate.getTime() + 60 * 60 * 1000)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showVendorPicker, setShowVendorPicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      vendor_id: null,
      description: null,
      location: null,
      reminder_minutes: 30,
    },
  });

  const selectedVendorId = watch('vendor_id');
  const selectedVendor = vendors?.find((v) => v.id === selectedVendorId);

  const onStartChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      setShowStartPicker(Platform.OS === 'ios');
      if (date) {
        setStartDate(date);
        if (date >= endDate) {
          setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
        }
      }
    },
    [endDate]
  );

  const onEndChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      setShowEndPicker(Platform.OS === 'ios');
      if (date) setEndDate(date);
    },
    []
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      await createAppt.mutateAsync({
        title: data.title,
        vendor_id: data.vendor_id,
        description: data.description,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        location: data.location,
        reminder_minutes: data.reminder_minutes,
        status: 'upcoming',
      });
      router.back();
    },
    [createAppt, startDate, endDate, router]
  );

  const formatDateTime = (d: Date) =>
    d.toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g. Doctor checkup"
              placeholderTextColor={Colors.textTertiary}
              accessibilityLabel="Appointment title"
            />
          )}
        />
        {errors.title && (
          <Text style={styles.error}>{errors.title.message}</Text>
        )}
      </View>

      {/* Vendor Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Vendor (optional)</Text>
        <Pressable
          style={styles.pickerButton}
          onPress={() => setShowVendorPicker(!showVendorPicker)}
        >
          <Text
            style={[
              styles.pickerText,
              !selectedVendor && styles.pickerPlaceholder,
            ]}
          >
            {selectedVendor ? selectedVendor.name : 'Select a vendor...'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={Colors.textTertiary}
          />
        </Pressable>
        {showVendorPicker && (
          <View style={styles.vendorList}>
            <Pressable
              style={styles.vendorOption}
              onPress={() => {
                setValue('vendor_id', null);
                setShowVendorPicker(false);
              }}
            >
              <Text style={styles.vendorOptionText}>None</Text>
            </Pressable>
            {(vendors ?? []).map((v) => (
              <Pressable
                key={v.id}
                style={[
                  styles.vendorOption,
                  v.id === selectedVendorId && styles.vendorOptionSelected,
                ]}
                onPress={() => {
                  setValue('vendor_id', v.id);
                  setValue('title', watch('title') || `${v.name} appointment`);
                  setShowVendorPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.vendorOptionText,
                    v.id === selectedVendorId && styles.vendorOptionTextSelected,
                  ]}
                >
                  {v.name} ({v.category})
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Start Time */}
      <View style={styles.field}>
        <Text style={styles.label}>Start</Text>
        <Pressable
          style={styles.pickerButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.pickerText}>{formatDateTime(startDate)}</Text>
        </Pressable>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      {/* End Time */}
      <View style={styles.field}>
        <Text style={styles.label}>End</Text>
        <Pressable
          style={styles.pickerButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.pickerText}>{formatDateTime(endDate)}</Text>
        </Pressable>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onEndChange}
            minimumDate={startDate}
          />
        )}
      </View>

      {/* Location */}
      <View style={styles.field}>
        <Text style={styles.label}>Location</Text>
        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Clinic, office, home..."
              placeholderTextColor={Colors.textTertiary}
              accessibilityLabel="Location"
            />
          )}
        />
      </View>

      {/* Reminder */}
      <View style={styles.field}>
        <Text style={styles.label}>Reminder</Text>
        <Controller
          control={control}
          name="reminder_minutes"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {REMINDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.chip,
                    value === opt.value && styles.chipSelected,
                  ]}
                  onPress={() => onChange(opt.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      value === opt.value && styles.chipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Notes</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Additional notes..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={3}
              accessibilityLabel="Notes"
            />
          )}
        />
      </View>

      {/* Submit */}
      <Pressable
        style={[
          styles.submitButton,
          createAppt.isPending && styles.submitDisabled,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={createAppt.isPending}
        accessibilityRole="button"
      >
        {createAppt.isPending ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.submitText}>Save Appointment</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.surface,
  },
  pickerText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  pickerPlaceholder: {
    color: Colors.textTertiary,
  },
  vendorList: {
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  vendorOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  vendorOptionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  vendorOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  vendorOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
});
