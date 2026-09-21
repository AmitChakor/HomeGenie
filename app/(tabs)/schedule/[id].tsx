/**
 * What this does:
 * Appointment detail screen showing time, vendor, location, notes,
 * with action buttons to call vendor, mark complete, cancel, or delete.
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import {
  useDeleteAppointment,
  useUpdateAppointment,
} from '../../../hooks/useAppointments';
import { useVendor } from '../../../hooks/useVendors';
import { openDialer, openWhatsApp } from '../../../lib/links';
import { supabase } from '../../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import type { Appointment } from '../../../types';

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const STATUS_BADGE: Record<string, { color: string; label: string }> = {
  upcoming: { color: Colors.primary, label: 'Upcoming' },
  completed: { color: Colors.success, label: 'Completed' },
  cancelled: { color: Colors.textTertiary, label: 'Cancelled' },
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const updateAppt = useUpdateAppointment();
  const deleteAppt = useDeleteAppointment();

  const {
    data: appointment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['appointment', id],
    queryFn: async (): Promise<Appointment> => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    enabled: !!id,
  });

  const { data: vendor } = useVendor(appointment?.vendor_id ?? undefined);

  const handleStatusChange = (status: 'completed' | 'cancelled') => {
    const label = status === 'completed' ? 'complete' : 'cancel';
    Alert.alert(
      `Mark as ${label}?`,
      `This will ${label} the appointment.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            updateAppt.mutate({ id: id!, status });
            router.back();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete appointment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteAppt.mutate(id!);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !appointment) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Appointment not found.</Text>
      </View>
    );
  }

  const badge = STATUS_BADGE[appointment.status] ?? STATUS_BADGE.upcoming;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Badge */}
      <View style={[styles.badge, { backgroundColor: badge.color + '18' }]}>
        <Text style={[styles.badgeText, { color: badge.color }]}>
          {badge.label}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{appointment.title}</Text>

      {/* Time */}
      <InfoRow icon="time-outline" label="Start" value={formatFull(appointment.start_time)} />
      {appointment.end_time && (
        <InfoRow icon="time-outline" label="End" value={formatFull(appointment.end_time)} />
      )}

      {/* Vendor */}
      {vendor && (
        <View style={styles.vendorCard}>
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            <Text style={styles.vendorCategory}>{vendor.category}</Text>
          </View>
          <View style={styles.vendorActions}>
            <Pressable
              style={styles.vendorBtn}
              onPress={() => openDialer(vendor.phone)}
            >
              <Ionicons name="call" size={18} color={Colors.success} />
            </Pressable>
            {(vendor.whatsapp || vendor.phone) && (
              <Pressable
                style={styles.vendorBtn}
                onPress={() =>
                  openWhatsApp(vendor.whatsapp || vendor.phone)
                }
              >
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Location */}
      {appointment.location && (
        <InfoRow
          icon="location-outline"
          label="Location"
          value={appointment.location}
        />
      )}

      {/* Reminder */}
      {appointment.reminder_minutes != null && appointment.reminder_minutes > 0 && (
        <InfoRow
          icon="notifications-outline"
          label="Reminder"
          value={
            appointment.reminder_minutes >= 1440
              ? `${Math.round(appointment.reminder_minutes / 1440)} day before`
              : appointment.reminder_minutes >= 60
              ? `${Math.round(appointment.reminder_minutes / 60)} hour before`
              : `${appointment.reminder_minutes} min before`
          }
        />
      )}

      {/* Description */}
      {appointment.description && (
        <InfoRow
          icon="document-text-outline"
          label="Notes"
          value={appointment.description}
        />
      )}

      {/* Actions */}
      {appointment.status === 'upcoming' && (
        <View style={styles.actionSection}>
          <Pressable
            style={styles.completeBtn}
            onPress={() => handleStatusChange('completed')}
          >
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={[styles.actionText, { color: Colors.success }]}>
              Mark Complete
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelBtn}
            onPress={() => handleStatusChange('cancelled')}
          >
            <Ionicons name="close-circle" size={18} color={Colors.warning} />
            <Text style={[styles.actionText, { color: Colors.warning }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color={Colors.error} />
        <Text style={[styles.actionText, { color: Colors.error }]}>
          Delete Appointment
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={Colors.textTertiary} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  badgeText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  vendorCategory: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vendorActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  vendorBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.md,
  },
  actionText: {
    ...Typography.button,
  },
});
