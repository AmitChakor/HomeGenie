/**
 * What this does:
 * Stack navigator for the Schedule tab — calendar, detail, and add screens.
 */

import { Stack } from 'expo-router';
import { Colors } from '../../../constants/theme';

export default function ScheduleLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Schedule' }} />
      <Stack.Screen name="[id]" options={{ title: 'Appointment' }} />
      <Stack.Screen
        name="new"
        options={{ title: 'New Appointment', presentation: 'modal' }}
      />
    </Stack>
  );
}
