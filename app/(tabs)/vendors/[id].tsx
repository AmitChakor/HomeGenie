/**
 * What this does:
 * Vendor detail screen — shows vendor header with avatar, action buttons
 * (call, WhatsApp, AI message, schedule), info sections, rating,
 * edit/delete controls, and interaction history from the messages table.
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../../components/VendorCard';
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import { useDeleteVendor, useVendor } from '../../../hooks/useVendors';
import { openDialer, openWhatsApp } from '../../../lib/links';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: vendor, isLoading, isError } = useVendor(id);
  const deleteMutation = useDeleteVendor();

  const handleDelete = () => {
    Alert.alert(
      'Delete Vendor',
      `Are you sure you want to delete ${vendor?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMutation.mutateAsync(id!);
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !vendor) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Vendor not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const categoryColor = CATEGORY_COLORS[vendor.category] ?? Colors.textSecondary;
  const whatsappNumber = vendor.whatsapp || vendor.phone;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatarLarge, { borderColor: categoryColor }]}>
          {vendor.avatar_url ? (
            <Image source={{ uri: vendor.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>
              {vendor.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{vendor.name}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '18' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {CATEGORY_LABELS[vendor.category] ?? vendor.category}
          </Text>
        </View>

        {/* Rating */}
        {vendor.rating != null && (
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= vendor.rating! ? 'star' : 'star-outline'}
                size={18}
                color={star <= vendor.rating! ? '#F59E0B' : Colors.textTertiary}
              />
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <ActionButton
          icon="call"
          label="Call"
          color={Colors.success}
          onPress={() => openDialer(vendor.phone)}
        />
        <ActionButton
          icon="logo-whatsapp"
          label="WhatsApp"
          color="#25D366"
          onPress={() => openWhatsApp(whatsappNumber)}
        />
        <ActionButton
          icon="chatbubble-ellipses"
          label="AI Chat"
          color={Colors.primary}
          onPress={() => router.push('/(tabs)')}
        />
        <ActionButton
          icon="calendar"
          label="Schedule"
          color={Colors.info}
          onPress={() => router.push('/(tabs)/schedule')}
        />
      </View>

      {/* Info Sections */}
      <View style={styles.section}>
        <InfoRow icon="call-outline" label="Phone" value={vendor.phone} />
        {vendor.whatsapp && (
          <InfoRow icon="logo-whatsapp" label="WhatsApp" value={vendor.whatsapp} />
        )}
        {vendor.address && (
          <InfoRow icon="location-outline" label="Address" value={vendor.address} />
        )}
        {vendor.notes && (
          <InfoRow icon="document-text-outline" label="Notes" value={vendor.notes} />
        )}
      </View>

      {/* Edit / Delete */}
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({ pathname: '/(tabs)/vendors/new', params: { editId: vendor.id } })
          }
          accessibilityRole="button"
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={handleDelete}
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress} accessibilityRole="button">
      <View style={[styles.actionIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
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
    paddingBottom: Spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  backLink: {
    padding: Spacing.sm,
  },
  backLinkText: {
    ...Typography.body,
    color: Colors.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  name: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...Typography.caption,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
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
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editButtonText: {
    ...Typography.button,
    color: Colors.primary,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    ...Typography.button,
    color: Colors.error,
  },
});
