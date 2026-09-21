/**
 * What this does:
 * Listens for network changes via NetInfo and drains the offline
 * mutation queue when connectivity is restored. Integrates with
 * React Query's onlineManager so queries pause/resume automatically.
 */

import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';
import { supabase } from './supabase';
import { useOfflineStore, type PendingMutation } from '../stores/offlineStore';

const MAX_RETRIES = 3;

export function setupOfflineSync(): () => void {
  const unsubNetInfo = NetInfo.addEventListener((state) => {
    const online = state.isConnected === true && state.isInternetReachable !== false;
    onlineManager.setOnline(online);
    useOfflineStore.getState().setOnline(online);

    if (online) {
      drainQueue();
    }
  });

  const handleAppState = (status: AppStateStatus) => {
    if (status === 'active') {
      NetInfo.fetch().then((state) => {
        const online = state.isConnected === true;
        onlineManager.setOnline(online);
        if (online) drainQueue();
      });
    }
  };

  const subscription = AppState.addEventListener('change', handleAppState);

  return () => {
    unsubNetInfo();
    subscription.remove();
  };
}

async function executeMutation(mutation: PendingMutation): Promise<boolean> {
  try {
    switch (mutation.type) {
      case 'grocery_toggle': {
        const { itemId, isChecked } = mutation.payload as {
          itemId: string;
          isChecked: boolean;
        };
        const { error } = await supabase
          .from('grocery_items')
          .update({ is_checked: isChecked })
          .eq('id', itemId);
        return !error;
      }

      case 'grocery_add_item': {
        const { listId, name, quantity, unit, notes } = mutation.payload as {
          listId: string;
          name: string;
          quantity: number;
          unit: string | null;
          notes: string | null;
        };
        const { error } = await supabase
          .from('grocery_items')
          .insert({ list_id: listId, name, quantity, unit, notes });
        return !error;
      }

      case 'attendance_checkin': {
        const { helperId, userId, method, latitude, longitude } =
          mutation.payload as {
            helperId: string;
            userId: string;
            method: string;
            latitude?: number;
            longitude?: number;
          };
        const { error } = await supabase.from('attendance_logs').insert({
          helper_id: helperId,
          user_id: userId,
          method,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          check_in_at: mutation.createdAt,
        });
        return !error;
      }

      default:
        console.warn('Unknown offline mutation type:', mutation.type);
        return true;
    }
  } catch {
    return false;
  }
}

async function drainQueue(): Promise<void> {
  const store = useOfflineStore.getState();
  if (store.isSyncing || store.queue.length === 0) return;

  store.setSyncing(true);

  const queue = [...store.queue];
  for (const mutation of queue) {
    if (mutation.retries >= MAX_RETRIES) {
      store.dequeue(mutation.id);
      continue;
    }

    const success = await executeMutation(mutation);
    if (success) {
      store.dequeue(mutation.id);
    } else {
      store.incrementRetries(mutation.id);
    }
  }

  store.setSyncing(false);
}
