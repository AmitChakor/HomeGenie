/**
 * What this does:
 * React Query hooks for helper CRUD.
 * - useHelpers(): list all active helpers
 * - useHelper(id): single helper
 * - useCreateHelper(): add helper
 * - useUpdateHelper(): update helper
 * - useDeleteHelper(): deactivate helper + delete face data
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { deleteFaceEmbedding } from '../lib/face-store';
import type { Helper } from '../types';

const HELPERS_KEY = ['helpers'];

export function useHelpers() {
  return useQuery({
    queryKey: HELPERS_KEY,
    queryFn: async (): Promise<Helper[]> => {
      const { data, error } = await supabase
        .from('helpers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Helper[];
    },
  });
}

export function useHelper(id: string | undefined) {
  return useQuery({
    queryKey: [...HELPERS_KEY, id],
    queryFn: async (): Promise<Helper> => {
      const { data, error } = await supabase
        .from('helpers')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Helper;
    },
    enabled: !!id,
  });
}

interface CreateHelperInput {
  name: string;
  role: string;
  phone?: string;
  face_embedding_id?: string;
}

export function useCreateHelper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateHelperInput): Promise<Helper> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('helpers')
        .insert({
          user_id: user.id,
          name: input.name,
          role: input.role,
          phone: input.phone ?? null,
          face_embedding_id: input.face_embedding_id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Helper;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HELPERS_KEY });
    },
  });
}

export function useUpdateHelper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<CreateHelperInput> & { id: string }): Promise<Helper> => {
      const { data, error } = await supabase
        .from('helpers')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Helper;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HELPERS_KEY });
    },
  });
}

export function useDeleteHelper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (helper: Helper): Promise<void> => {
      if (helper.face_embedding_id) {
        await deleteFaceEmbedding(helper.face_embedding_id);
      }
      const { error } = await supabase
        .from('helpers')
        .update({ is_active: false })
        .eq('id', helper.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HELPERS_KEY });
    },
  });
}
