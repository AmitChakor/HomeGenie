/**
 * What this does:
 * Zustand store that queues mutations made while offline.
 * Supports grocery item toggles, attendance check-ins, and any
 * Supabase write. On reconnect, lib/offline-sync.ts drains the queue.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PendingMutation {
  id: string;
  type: 'grocery_toggle' | 'attendance_checkin' | 'grocery_add_item';
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

interface OfflineState {
  queue: PendingMutation[];
  isOnline: boolean;
  isSyncing: boolean;

  enqueue: (mutation: Omit<PendingMutation, 'id' | 'createdAt' | 'retries'>) => void;
  dequeue: (id: string) => void;
  incrementRetries: (id: string) => void;
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: true,
      isSyncing: false,

      enqueue: (mutation) =>
        set((state) => ({
          queue: [
            ...state.queue,
            {
              ...mutation,
              id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              createdAt: new Date().toISOString(),
              retries: 0,
            },
          ],
        })),

      dequeue: (id) =>
        set((state) => ({
          queue: state.queue.filter((m) => m.id !== id),
        })),

      incrementRetries: (id) =>
        set((state) => ({
          queue: state.queue.map((m) =>
            m.id === id ? { ...m, retries: m.retries + 1 } : m
          ),
        })),

      setOnline: (isOnline) => set({ isOnline }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'homegenie-offline-queue',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
