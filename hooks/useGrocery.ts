/**
 * What this does:
 * React Query hooks for grocery list and item CRUD.
 * - useGroceryLists(): all lists with item counts
 * - useGroceryList(id): single list with its items
 * - useCreateGroceryList(): create list + bulk insert items
 * - useAddGroceryItem(): add single item to a list
 * - useToggleGroceryItem(): check/uncheck an item
 * - useDeleteGroceryItem(): remove an item
 * - useUpdateListStatus(): mark list completed/cancelled
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { GroceryItem, GroceryList } from '../types';

const LISTS_KEY = ['grocery-lists'];
const listDetailKey = (id: string) => ['grocery-list', id];

interface GroceryListWithMeta extends GroceryList {
  item_count: number;
  checked_count: number;
  store_name: string | null;
}

interface GroceryListDetail extends GroceryList {
  items: GroceryItem[];
  store_name: string | null;
  store_phone: string | null;
  store_whatsapp: string | null;
}

export function useGroceryLists() {
  return useQuery({
    queryKey: LISTS_KEY,
    queryFn: async (): Promise<GroceryListWithMeta[]> => {
      const { data: lists, error } = await supabase
        .from('grocery_lists')
        .select('*, vendors(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const listsWithCounts = await Promise.all(
        (lists ?? []).map(async (list: any) => {
          const { count: itemCount } = await supabase
            .from('grocery_items')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id);

          const { count: checkedCount } = await supabase
            .from('grocery_items')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id)
            .eq('is_checked', true);

          return {
            ...list,
            item_count: itemCount ?? 0,
            checked_count: checkedCount ?? 0,
            store_name: list.vendors?.name ?? null,
            vendors: undefined,
          } as GroceryListWithMeta;
        })
      );

      return listsWithCounts;
    },
  });
}

export function useGroceryList(id: string | undefined) {
  return useQuery({
    queryKey: listDetailKey(id ?? ''),
    queryFn: async (): Promise<GroceryListDetail> => {
      const { data: list, error: listError } = await supabase
        .from('grocery_lists')
        .select('*, vendors(name, phone, whatsapp)')
        .eq('id', id!)
        .single();
      if (listError) throw listError;

      const { data: items, error: itemsError } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('list_id', id!)
        .order('created_at', { ascending: true });
      if (itemsError) throw itemsError;

      const vendor = (list as any).vendors;
      return {
        ...list,
        items: (items ?? []) as GroceryItem[],
        store_name: vendor?.name ?? null,
        store_phone: vendor?.phone ?? null,
        store_whatsapp: vendor?.whatsapp ?? null,
        vendors: undefined,
      } as GroceryListDetail;
    },
    enabled: !!id,
  });
}

interface CreateListInput {
  name: string;
  storeVendorId?: string | null;
  items: { name: string; quantity: number; unit: string | null; notes: string | null }[];
}

export function useCreateGroceryList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateListInput): Promise<GroceryList> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: list, error: listError } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: user.id,
          name: input.name,
          store_vendor_id: input.storeVendorId ?? null,
          status: 'active',
        })
        .select()
        .single();
      if (listError) throw listError;

      if (input.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('grocery_items')
          .insert(
            input.items.map((item) => ({
              list_id: list.id,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              notes: item.notes,
            }))
          );
        if (itemsError) throw itemsError;
      }

      return list as GroceryList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTS_KEY });
    },
  });
}

export function useAddGroceryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      name,
      quantity,
      unit,
      notes,
    }: {
      listId: string;
      name: string;
      quantity: number;
      unit: string | null;
      notes: string | null;
    }): Promise<GroceryItem> => {
      const { data, error } = await supabase
        .from('grocery_items')
        .insert({ list_id: listId, name, quantity, unit, notes })
        .select()
        .single();
      if (error) throw error;
      return data as GroceryItem;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: listDetailKey(vars.listId) });
      queryClient.invalidateQueries({ queryKey: LISTS_KEY });
    },
  });
}

export function useToggleGroceryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      isChecked,
    }: {
      itemId: string;
      listId: string;
      isChecked: boolean;
    }): Promise<void> => {
      const { error } = await supabase
        .from('grocery_items')
        .update({ is_checked: isChecked })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: listDetailKey(vars.listId) });
      queryClient.invalidateQueries({ queryKey: LISTS_KEY });
    },
  });
}

export function useDeleteGroceryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
    }: {
      itemId: string;
      listId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: listDetailKey(vars.listId) });
      queryClient.invalidateQueries({ queryKey: LISTS_KEY });
    },
  });
}

export function useUpdateListStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      status,
    }: {
      listId: string;
      status: 'active' | 'completed' | 'cancelled';
    }): Promise<void> => {
      const { error } = await supabase
        .from('grocery_lists')
        .update({ status })
        .eq('id', listId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: LISTS_KEY });
      queryClient.invalidateQueries({ queryKey: listDetailKey(vars.listId) });
    },
  });
}
