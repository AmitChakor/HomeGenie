/**
 * What this does:
 * Grocery lists screen showing active and past lists.
 * FAB opens a voice capture sheet to create a new list.
 * Each card shows list name, item count, progress, and store.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import VoiceCaptureSheet from '../../../components/VoiceCaptureSheet';
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import {
  useCreateGroceryList,
  useGroceryLists,
} from '../../../hooks/useGrocery';
import { useVendors } from '../../../hooks/useVendors';
import type { ParsedGroceryItem } from '../../../lib/grocery-parser';

export default function GroceryListsScreen() {
  const router = useRouter();
  const { data: lists, isLoading, isError, refetch } = useGroceryLists();
  const { data: vendors } = useVendors({ category: 'grocery' });
  const createList = useCreateGroceryList();

  const [showVoiceSheet, setShowVoiceSheet] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingItems, setPendingItems] = useState<ParsedGroceryItem[]>([]);
  const [listName, setListName] = useState('');

  const handleVoiceConfirm = useCallback((items: ParsedGroceryItem[]) => {
    setPendingItems(items);
    setListName(`Grocery ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`);
    setShowNamePrompt(true);
  }, []);

  const handleCreateList = useCallback(async () => {
    if (!listName.trim()) return;

    try {
      const list = await createList.mutateAsync({
        name: listName.trim(),
        storeVendorId: vendors?.[0]?.id ?? null,
        items: pendingItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
        })),
      });

      setShowNamePrompt(false);
      setPendingItems([]);
      setListName('');

      router.push({
        pathname: '/(tabs)/grocery/[id]',
        params: { id: list.id },
      });
    } catch {
      Alert.alert('Error', 'Failed to create grocery list.');
    }
  }, [listName, pendingItems, vendors, createList, router]);

  const activeLists = lists?.filter((l) => l.status === 'active') ?? [];
  const pastLists = lists?.filter((l) => l.status !== 'active') ?? [];

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Failed to load lists.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={[
            ...(activeLists.length > 0
              ? [{ type: 'header' as const, title: 'Active' }]
              : []),
            ...activeLists.map((l) => ({ type: 'item' as const, data: l })),
            ...(pastLists.length > 0
              ? [{ type: 'header' as const, title: 'Past' }]
              : []),
            ...pastLists.map((l) => ({ type: 'item' as const, data: l })),
          ]}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${index}` : item.data!.id
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={styles.sectionHeader}>{item.title}</Text>;
            }
            const list = item.data!;
            const progress =
              list.item_count > 0
                ? Math.round((list.checked_count / list.item_count) * 100)
                : 0;

            return (
              <Pressable
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/grocery/[id]',
                    params: { id: list.id },
                  })
                }
              >
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          list.status === 'active'
                            ? Colors.success
                            : list.status === 'completed'
                            ? Colors.textTertiary
                            : Colors.error,
                      },
                    ]}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {list.name}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {list.item_count} item{list.item_count !== 1 ? 's' : ''}
                      {list.store_name ? ` · ${list.store_name}` : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardRight}>
                  {list.status === 'active' && list.item_count > 0 && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBg}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.textTertiary}
                  />
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="cart-outline"
                size={48}
                color={Colors.textTertiary}
              />
              <Text style={styles.emptyText}>
                No grocery lists yet.{'\n'}Tap + to create one!
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => setShowVoiceSheet(true)}
        accessibilityRole="button"
        accessibilityLabel="New grocery list"
      >
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </Pressable>

      {/* Voice Capture Sheet */}
      <VoiceCaptureSheet
        visible={showVoiceSheet}
        onClose={() => setShowVoiceSheet(false)}
        onConfirm={handleVoiceConfirm}
      />

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <View style={styles.overlay}>
          <View style={styles.namePrompt}>
            <Text style={styles.namePromptTitle}>Name your list</Text>
            <TextInput
              style={styles.nameInput}
              value={listName}
              onChangeText={setListName}
              placeholder="e.g. Weekly groceries"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              accessibilityLabel="List name"
            />
            <Text style={styles.namePromptMeta}>
              {pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''} will
              be added
            </Text>
            <View style={styles.namePromptActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setShowNamePrompt(false);
                  setPendingItems([]);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createButton,
                  createList.isPending && styles.createButtonDisabled,
                ]}
                onPress={handleCreateList}
                disabled={createList.isPending}
              >
                {createList.isPending ? (
                  <ActivityIndicator color={Colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.createText}>Create</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    lineHeight: 24,
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
  list: {
    paddingBottom: 100,
    paddingTop: Spacing.sm,
  },
  sectionHeader: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    marginVertical: 4,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  cardMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 2,
  },
  progressBg: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.success,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 10,
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
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  namePrompt: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
  },
  namePromptTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  nameInput: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  namePromptMeta: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  namePromptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  cancelText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
  createButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
});
