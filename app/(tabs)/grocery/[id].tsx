/**
 * What this does:
 * Grocery list detail screen — interactive checklist with tap-to-check,
 * add item (voice or manual), send to store via WhatsApp or SMS,
 * and mark list as completed.
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  useAddGroceryItem,
  useDeleteGroceryItem,
  useGroceryList,
  useToggleGroceryItem,
  useUpdateListStatus,
} from '../../../hooks/useGrocery';
import type { ParsedGroceryItem } from '../../../lib/grocery-parser';
import {
  shareGroceryViaSms,
  shareGroceryViaWhatsApp,
} from '../../../lib/share';
import type { GroceryItem } from '../../../types';

export default function GroceryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: list, isLoading, isError } = useGroceryList(id);

  const toggleItem = useToggleGroceryItem();
  const deleteItem = useDeleteGroceryItem();
  const addItem = useAddGroceryItem();
  const updateStatus = useUpdateListStatus();

  const [showVoiceSheet, setShowVoiceSheet] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualName, setManualName] = useState('');

  const handleToggle = useCallback(
    (item: GroceryItem) => {
      toggleItem.mutate({
        itemId: item.id,
        listId: id!,
        isChecked: !item.is_checked,
      });
    },
    [id, toggleItem]
  );

  const handleDelete = useCallback(
    (item: GroceryItem) => {
      Alert.alert('Remove item', `Remove "${item.name}" from list?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            deleteItem.mutate({ itemId: item.id, listId: id! }),
        },
      ]);
    },
    [id, deleteItem]
  );

  const handleAddManual = useCallback(async () => {
    if (!manualName.trim() || !id) return;
    await addItem.mutateAsync({
      listId: id,
      name: manualName.trim(),
      quantity: 1,
      unit: null,
      notes: null,
    });
    setManualName('');
    setShowManualInput(false);
  }, [manualName, id, addItem]);

  const handleVoiceItems = useCallback(
    async (items: ParsedGroceryItem[]) => {
      if (!id) return;
      for (const item of items) {
        await addItem.mutateAsync({
          listId: id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
        });
      }
    },
    [id, addItem]
  );

  const handleShare = useCallback(() => {
    if (!list) return;

    const phone = list.store_whatsapp || list.store_phone;

    if (phone) {
      Alert.alert('Share via', 'Choose how to send this list', [
        {
          text: 'WhatsApp',
          onPress: () =>
            shareGroceryViaWhatsApp(
              list.items,
              phone,
              list.store_name ?? undefined
            ),
        },
        {
          text: 'SMS',
          onPress: () =>
            shareGroceryViaSms(
              list.items,
              list.store_phone ?? phone,
              list.store_name ?? undefined
            ),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      Alert.alert(
        'No store linked',
        'This list has no store vendor. Add a grocery vendor first, then link it to a list.'
      );
    }
  }, [list]);

  const handleComplete = useCallback(() => {
    if (!id) return;
    Alert.alert('Complete list', 'Mark this list as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          updateStatus.mutate({ listId: id, status: 'completed' });
          router.back();
        },
      },
    ]);
  }, [id, updateStatus, router]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !list) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load list.</Text>
      </View>
    );
  }

  const uncheckedCount = list.items.filter((i) => !i.is_checked).length;
  const checkedCount = list.items.filter((i) => i.is_checked).length;

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerInfo}>
        <Text style={styles.listName}>{list.name}</Text>
        {list.store_name && (
          <Text style={styles.storeName}>Store: {list.store_name}</Text>
        )}
        <Text style={styles.progress}>
          {checkedCount}/{list.items.length} items checked
        </Text>
      </View>

      {/* Items */}
      <FlatList
        data={[
          ...list.items.filter((i) => !i.is_checked),
          ...list.items.filter((i) => i.is_checked),
        ]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.itemList}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Pressable
              style={styles.checkbox}
              onPress={() => handleToggle(item)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.is_checked }}
            >
              <Ionicons
                name={item.is_checked ? 'checkbox' : 'square-outline'}
                size={24}
                color={item.is_checked ? Colors.success : Colors.textTertiary}
              />
            </Pressable>

            <View style={styles.itemContent}>
              <Text
                style={[
                  styles.itemName,
                  item.is_checked && styles.itemNameChecked,
                ]}
              >
                {item.name}
              </Text>
              {(item.quantity !== 1 || item.unit) && (
                <Text style={styles.itemDetail}>
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ''}
                  {item.notes ? ` · ${item.notes}` : ''}
                </Text>
              )}
            </View>

            <Pressable
              onPress={() => handleDelete(item)}
              hitSlop={8}
              accessibilityLabel={`Remove ${item.name}`}
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={Colors.textTertiary}
              />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>
              No items yet. Add some below!
            </Text>
          </View>
        }
      />

      {/* Manual Input Row */}
      {showManualInput && (
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            value={manualName}
            onChangeText={setManualName}
            placeholder="Item name..."
            placeholderTextColor={Colors.textTertiary}
            autoFocus
            onSubmitEditing={handleAddManual}
            returnKeyType="done"
            accessibilityLabel="Item name"
          />
          <Pressable
            style={styles.manualAddBtn}
            onPress={handleAddManual}
            disabled={!manualName.trim()}
          >
            <Ionicons name="add" size={22} color={Colors.textInverse} />
          </Pressable>
          <Pressable onPress={() => setShowManualInput(false)} hitSlop={8}>
            <Ionicons name="close" size={22} color={Colors.textTertiary} />
          </Pressable>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <View style={styles.addActions}>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowManualInput(true)}
            accessibilityLabel="Add item manually"
          >
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>Type</Text>
          </Pressable>

          <Pressable
            style={styles.addButton}
            onPress={() => setShowVoiceSheet(true)}
            accessibilityLabel="Add items via voice"
          >
            <Ionicons name="mic-outline" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>Voice</Text>
          </Pressable>
        </View>

        <View style={styles.mainActions}>
          <Pressable
            style={styles.shareButton}
            onPress={handleShare}
            accessibilityLabel="Send list to store"
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.shareText}>Send to Store</Text>
          </Pressable>

          {list.status === 'active' && (
            <Pressable
              style={styles.completeButton}
              onPress={handleComplete}
              accessibilityLabel="Mark list complete"
            >
              <Ionicons name="checkmark-done" size={18} color={Colors.textInverse} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Voice Sheet */}
      <VoiceCaptureSheet
        visible={showVoiceSheet}
        onClose={() => setShowVoiceSheet(false)}
        onConfirm={handleVoiceItems}
      />
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
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  headerInfo: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  listName: {
    ...Typography.h2,
    color: Colors.text,
  },
  storeName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progress: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  itemList: {
    paddingTop: Spacing.sm,
    paddingBottom: 160,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  checkbox: {
    padding: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...Typography.body,
    color: Colors.text,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  itemDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  emptyList: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  manualInput: {
    flex: 1,
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  manualAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  addActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addButtonText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  mainActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: '#25D366' + '15',
    borderWidth: 1,
    borderColor: '#25D366',
  },
  shareText: {
    ...Typography.button,
    color: '#25D366',
  },
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
