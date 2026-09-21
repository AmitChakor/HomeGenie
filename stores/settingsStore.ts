/**
 * What this does:
 * Zustand store for user preferences — voice, language, notifications.
 * Persisted to AsyncStorage so settings survive app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type VoiceGender = 'female' | 'male' | 'child';
export type AppLanguage = 'en' | 'hi';

interface SettingsState {
  voiceGender: VoiceGender;
  speechRate: number;
  language: AppLanguage;
  notificationsEnabled: boolean;
  reminderSound: boolean;

  setVoiceGender: (gender: VoiceGender) => void;
  setSpeechRate: (rate: number) => void;
  setLanguage: (lang: AppLanguage) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setReminderSound: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      voiceGender: 'female',
      speechRate: 0.95,
      language: 'en',
      notificationsEnabled: true,
      reminderSound: true,

      setVoiceGender: (voiceGender) => set({ voiceGender }),
      setSpeechRate: (speechRate) => set({ speechRate }),
      setLanguage: (language) => set({ language }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
      setReminderSound: (reminderSound) => set({ reminderSound }),
    }),
    {
      name: 'homegenie-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
