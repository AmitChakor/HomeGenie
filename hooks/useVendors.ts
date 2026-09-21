/**
 * What this does:
 * React Query hooks for vendor CRUD operations.
 * - useVendors(): list all vendors with optional category filter + search
 * - useVendor(id): single vendor detail
 * - useCreateVendor(): mutation to add a vendor
 * - useUpdateVendor(): mutation to update a vendor
 * - useDeleteVendor(): mutation to delete a vendor
 * - useUploadVendorAvatar(): mutation to upload avatar image
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Vendor, VendorCategory } from '../types';

const VENDORS_KEY = ['vendors'];

interface VendorFilters {
  category?: VendorCategory | null;
  search?: string;
}

export function useVendors(filters?: VendorFilters) {
  return useQuery({
    queryKey: [...VENDORS_KEY, filters?.category, filters?.search],
    queryFn: async (): Promise<Vendor[]> => {
      let query = supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search?.trim()) {
        query = query.ilike('name', `%${filters.search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Vendor[];
    },
  });
}

export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: [...VENDORS_KEY, id],
    queryFn: async (): Promise<Vendor> => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Vendor;
    },
    enabled: !!id,
  });
}

type VendorInput = Omit<Vendor, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VendorInput): Promise<Vendor> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('vendors')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<VendorInput> & { id: string }): Promise<Vendor> => {
      const { data, error } = await supabase
        .from('vendors')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
      queryClient.setQueryData([...VENDORS_KEY, data.id], data);
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_KEY });
    },
  });
}

export function useUploadVendorAvatar() {
  return useMutation({
    mutationFn: async ({
      uri,
      vendorId,
    }: {
      uri: string;
      vendorId: string;
    }): Promise<string> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = uri.split('.').pop() ?? 'jpg';
      const filePath = `${user.id}/${vendorId}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('vendor-avatars')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('vendor-avatars').getPublicUrl(filePath);

      await supabase
        .from('vendors')
        .update({ avatar_url: publicUrl })
        .eq('id', vendorId);

      return publicUrl;
    },
  });
}
