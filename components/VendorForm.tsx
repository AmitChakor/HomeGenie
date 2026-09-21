/**
 * What this does:
 * Shared form for creating and editing vendors.
 * Uses react-hook-form with zod validation.
 * Supports category picker and all vendor fields.
 */

import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import type { Vendor, VendorCategory } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from './VendorCard';

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum([
    'medical',
    'maid',
    'grocery',
    'electrician',
    'plumber',
    'driver',
    'other',
  ]),
  phone: z.string().min(10, 'Valid phone number required'),
  whatsapp: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  is_active: z.boolean().default(true),
});

type VendorFormData = z.output<typeof vendorSchema>;

const CATEGORIES: VendorCategory[] = [
  'medical',
  'maid',
  'grocery',
  'electrician',
  'plumber',
  'driver',
  'other',
];

interface VendorFormProps {
  initialData?: Partial<Vendor>;
  onSubmit: (data: VendorFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function VendorForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: VendorFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? 'other',
      phone: initialData?.phone ?? '+91',
      whatsapp: initialData?.whatsapp ?? '',
      address: initialData?.address ?? '',
      notes: initialData?.notes ?? '',
      rating: initialData?.rating ?? null,
      is_active: initialData?.is_active ?? true,
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Name *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g. Dr. Sharma"
              placeholderTextColor={Colors.textTertiary}
              accessibilityLabel="Vendor name"
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>Category *</Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => {
                const isSelected = value === cat;
                const color = CATEGORY_COLORS[cat];
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.chip,
                      isSelected && { backgroundColor: color + '20', borderColor: color },
                    ]}
                    onPress={() => onChange(cat)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && { color, fontWeight: '600' },
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
      </View>

      {/* Phone */}
      <View style={styles.field}>
        <Text style={styles.label}>Phone *</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="+91 98765 43210"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
              accessibilityLabel="Phone number"
            />
          )}
        />
        {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
      </View>

      {/* WhatsApp */}
      <View style={styles.field}>
        <Text style={styles.label}>
          <Ionicons name="logo-whatsapp" size={14} color="#25D366" /> WhatsApp
          (if different)
        </Text>
        <Controller
          control={control}
          name="whatsapp"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Leave blank if same as phone"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
              accessibilityLabel="WhatsApp number"
            />
          )}
        />
      </View>

      {/* Address */}
      <View style={styles.field}>
        <Text style={styles.label}>Address</Text>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Clinic / shop / home address"
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={2}
              accessibilityLabel="Address"
            />
          )}
        />
      </View>

      {/* Notes */}
      <View style={styles.field}>
        <Text style={styles.label}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Availability, speciality, etc."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={3}
              accessibilityLabel="Notes"
            />
          )}
        />
      </View>

      {/* Rating */}
      <View style={styles.field}>
        <Text style={styles.label}>Rating</Text>
        <Controller
          control={control}
          name="rating"
          render={({ field: { onChange, value } }) => (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => onChange(value === star ? null : star)}
                  hitSlop={4}
                  accessibilityLabel={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <Ionicons
                    name={value != null && star <= value ? 'star' : 'star-outline'}
                    size={28}
                    color={value != null && star <= value ? '#F59E0B' : Colors.textTertiary}
                  />
                </Pressable>
              ))}
            </View>
          )}
        />
      </View>

      {/* Submit */}
      <Pressable
        style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
        onPress={handleSubmit(onSubmit as any)}
        disabled={isSubmitting}
        accessibilityRole="button"
      >
        {isSubmitting ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.submitText}>{submitLabel}</Text>
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
