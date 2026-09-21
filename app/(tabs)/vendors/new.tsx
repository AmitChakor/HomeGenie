/**
 * What this does:
 * Add / Edit vendor screen. If an `editId` param is passed, it loads
 * the existing vendor data and switches to edit mode. Uses the shared
 * VendorForm component for the actual form.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import VendorForm from '../../../components/VendorForm';
import { Colors } from '../../../constants/theme';
import {
  useCreateVendor,
  useUpdateVendor,
  useVendor,
} from '../../../hooks/useVendors';

export default function NewVendorScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const router = useRouter();
  const isEditMode = !!editId;

  const { data: existingVendor, isLoading: isLoadingVendor } = useVendor(editId);
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();

  useEffect(() => {
    router.setParams({});
  }, []);

  const handleSubmit = async (data: Record<string, any>) => {
    const payload = {
      name: data.name as string,
      phone: data.phone as string,
      category: data.category as string,
      is_active: data.is_active as boolean,
      avatar_url: null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      notes: data.notes || null,
      rating: data.rating ?? null,
    };
    if (isEditMode && editId) {
      await updateMutation.mutateAsync({ id: editId, ...payload } as any);
    } else {
      await createMutation.mutateAsync(payload as any);
    }
    router.back();
  };

  if (isEditMode && isLoadingVendor) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <VendorForm
      initialData={isEditMode ? existingVendor : undefined}
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      submitLabel={isEditMode ? 'Save Changes' : 'Add Vendor'}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
