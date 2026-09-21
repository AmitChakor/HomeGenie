/**
 * What this does:
 * Local push notification utilities for appointment reminders.
 * - ensurePermissions(): requests notification permissions on first use
 * - scheduleReminder(): schedules a local notification before an appointment
 * - cancelReminder(): cancels a scheduled notification by appointment ID
 * - cancelAllReminders(): clears all scheduled notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Appointment } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Appointment Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleReminder(
  appointment: Appointment
): Promise<string | null> {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) return null;

  const reminderMinutes = appointment.reminder_minutes ?? 30;
  const triggerDate = new Date(appointment.start_time);
  triggerDate.setMinutes(triggerDate.getMinutes() - reminderMinutes);

  if (triggerDate <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Reminder: ${appointment.title}`,
      body: appointment.location
        ? `In ${reminderMinutes} min at ${appointment.location}`
        : `In ${reminderMinutes} min`,
      data: { appointmentId: appointment.id },
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: 'reminders' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
    identifier: `appt-${appointment.id}`,
  });

  return id;
}

export async function cancelReminder(appointmentId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    `appt-${appointmentId}`
  );
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
