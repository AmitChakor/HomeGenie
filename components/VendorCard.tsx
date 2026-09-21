/**
 * What this does:
 * A vendor list card showing avatar, name, category badge,
 * and quick-action buttons for calling and WhatsApp messaging.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { openDialer, openWhatsApp } from '../lib/links';
import type { Vendor } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  medical: 'Medical',
  maid: 'Maid',
  grocery: 'Grocery',
  electrician: 'Electrician',
  plumber: 'Plumber',
  driver: 'Driver',
  other: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  medical: '#EF4444',
  maid: '#8B5CF6',
  grocery: '#10B981',
  electrician: '#F59E0B',
  plumber: '#3B82F6',
  driver: '#6366F1',
  other: '#6B7280',
};

interface VendorCardProps {
  vendor: Vendor;
  onPress: () => void;
}

export default function VendorCard({ vendor, onPress }: VendorCardProps) {
  const categoryColor = CATEGORY_COLORS[vendor.category] ?? Colors.textSecondary;

  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      {/* Avatar */}
      <View style={[styles.avatar, { borderColor: categoryColor }]}>
        {vendor.avatar_url ? (
          <Image source={{ uri: vendor.avatar_url }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitial}>
            {vendor.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {vendor.name}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '18' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {CATEGORY_LABELS[vendor.category] ?? vendor.category}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => openDialer(vendor.phone)}
          accessibilityLabel={`Call ${vendor.name}`}
          hitSlop={8}
        >
          <Ionicons name="call-outline" size={20} color={Colors.success} />
        </Pressable>

        {vendor.whatsapp ? (
          <Pressable
            style={styles.actionButton}
            onPress={() => openWhatsApp(vendor.whatsapp!)}
            accessibilityLabel={`WhatsApp ${vendor.name}`}
            hitSlop={8}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

export { CATEGORY_LABELS, CATEGORY_COLORS };

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarInitial: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  categoryText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});
