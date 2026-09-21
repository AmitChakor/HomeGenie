/**
 * What this does:
 * Layout for the attendance flow — full-screen stack outside of tabs.
 */

import { Stack } from 'expo-router';

export default function AttendanceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
