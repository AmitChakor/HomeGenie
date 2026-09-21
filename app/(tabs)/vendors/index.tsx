/**
 * What this does:
 * Vendor list screen with search bar, category filter chips,
 * vendor cards with quick actions, and a FAB to add new vendors.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import VendorCard, { CATEGORY_COLORS, CATEGORY_LABELS } from '../../../components/VendorCard';
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import { useVendors } from '../../../hooks/useVendors';
import type { Vendor, VendorCategory } from '../../../types';

const CATEGORIES: (VendorCategory | null)[] = [
  null,
  'medical',
  'maid',
  'grocery',
  'electrician',
  'plumber',
  'driver',
  'other',
];

export default function VendorsListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | null>(null);

  const { data: vendors, isLoading, isError, refetch } = useVendors({
    category: selectedCategory,
    search,
  });

  const handleVendorPress = useCallback(
    (vendor: Vendor) => {
      router.push({ pathname: '/(tabs)/vendors/[id]', params: { id: vendor.id } });
    },
    [router]
  );

  const renderVendor = useCallback(
    ({ item }: { item: Vendor }) => (
      <VendorCard vendor={item} onPress={() => handleVendorPress(item)} />
    ),
    [handleVendorPress]
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search vendors..."
          placeholderTextColor={Colors.textTertiary}
          accessibilityLabel="Search vendors"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item ?? 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        renderItem={({ item: cat }) => {
          const isSelected = selectedCategory === cat;
          const color = cat ? CATEGORY_COLORS[cat] : Colors.primary;
          return (
            <Pressable
              style={[
                styles.filterChip,
                isSelected && { backgroundColor: color + '20', borderColor: color },
              ]}
              onPress={() => setSelectedCategory(cat)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && { color, fontWeight: '600' },
                ]}
              >
                {cat ? CATEGORY_LABELS[cat] : 'All'}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Vendor List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Failed to load vendors.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.id}
          renderItem={renderVendor}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>
                {search ? 'No vendors match your search.' : 'No vendors yet. Add your first!'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(tabs)/vendors/new')}
        accessibilityRole="button"
        accessibilityLabel="Add new vendor"
      >
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: 0,
  },
  chipList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  list: {
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  retryText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
