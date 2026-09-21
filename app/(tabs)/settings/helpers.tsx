/**
 * What this does:
 * Helpers management screen — list of household helpers with add/remove.
 * Adding a helper prompts for name/role/phone then navigates to
 * face enrollment (the check-in screen in enrollment mode).
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
import { Colors, Radius, Spacing, Typography } from '../../../constants/theme';
import { useCreateHelper, useDeleteHelper, useHelpers } from '../../../hooks/useHelpers';
import type { Helper } from '../../../types';

const ROLE_OPTIONS = ['Maid', 'Cook', 'Driver', 'Nanny', 'Gardener', 'Other'];

export default function HelpersScreen() {
  const router = useRouter();
  const { data: helpers, isLoading } = useHelpers();
  const createHelper = useCreateHelper();
  const deleteHelper = useDeleteHelper();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Maid');
  const [phone, setPhone] = useState('');

  const handleAdd = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    const embeddingId = `face_${Date.now()}`;

    const helper = await createHelper.mutateAsync({
      name: name.trim(),
      role,
      phone: phone.trim() || undefined,
      face_embedding_id: embeddingId,
    });

    setName('');
    setPhone('');
    setShowAddForm(false);

    Alert.alert(
      'Enroll Face?',
      `Would you like to enroll ${helper.name}'s face for attendance?`,
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Enroll Now',
          onPress: () =>
            router.push({
              pathname: '/attendance/checkin',
              params: { mode: 'enroll', helperId: helper.id, helperName: helper.name },
            }),
        },
      ]
    );
  }, [name, role, phone, createHelper, router]);

  const handleDelete = useCallback(
    (helper: Helper) => {
      Alert.alert(
        'Remove Helper',
        `Remove ${helper.name}? Their face data will also be deleted.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => deleteHelper.mutate(helper),
          },
        ]
      );
    },
    [deleteHelper]
  );

  const renderHelper = useCallback(
    ({ item }: { item: Helper }) => (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardRole}>{item.role}</Text>
          {item.phone && (
            <Text style={styles.cardPhone}>{item.phone}</Text>
          )}
        </View>
        <View style={styles.cardActions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: '/attendance/checkin',
                params: {
                  mode: 'enroll',
                  helperId: item.id,
                  helperName: item.name,
                },
              })
            }
            accessibilityLabel={`Re-enroll ${item.name}`}
          >
            <Ionicons name="camera-outline" size={18} color={Colors.info} />
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => handleDelete(item)}
            accessibilityLabel={`Remove ${item.name}`}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </Pressable>
        </View>
      </View>
    ),
    [router, handleDelete]
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={helpers}
          keyExtractor={(item) => item.id}
          renderItem={renderHelper}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>
                No helpers added yet.{'\n'}Tap + to add one.
              </Text>
            </View>
          }
        />
      )}

      {/* Add Form */}
      {showAddForm && (
        <View style={styles.formOverlay}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Add Helper</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name *"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
            />

            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.roleChip, role === r && styles.roleChipSelected]}
                  onPress={() => setRole(r)}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      role === r && styles.roleChipTextSelected,
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone (optional)"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
            />

            <View style={styles.formActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.addBtn, createHelper.isPending && { opacity: 0.6 }]}
                onPress={handleAdd}
                disabled={createHelper.isPending}
              >
                {createHelper.isPending ? (
                  <ActivityIndicator color={Colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.addText}>Add</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* FAB */}
      {!showAddForm && (
        <Pressable
          style={styles.fab}
          onPress={() => setShowAddForm(true)}
          accessibilityLabel="Add helper"
        >
          <Ionicons name="add" size={28} color={Colors.textInverse} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  list: { paddingBottom: 100, paddingTop: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: 4,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6' + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  cardInfo: { flex: 1 },
  cardName: { ...Typography.body, fontWeight: '600', color: Colors.text },
  cardRole: { ...Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  cardPhone: { ...Typography.caption, color: Colors.textTertiary, marginTop: 1 },
  cardActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  formOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  form: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  formTitle: { ...Typography.h3, color: Colors.text },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  roleChipSelected: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  roleChipText: { ...Typography.bodySmall, color: Colors.textSecondary },
  roleChipTextSelected: { color: Colors.primary, fontWeight: '600' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md },
  cancelBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  cancelText: { ...Typography.button, color: Colors.textSecondary },
  addBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
  },
  addText: { ...Typography.button, color: Colors.textInverse },
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
