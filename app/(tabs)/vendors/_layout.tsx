/**
 * What this does:
 * Stack navigator for the Vendors tab — allows navigation between
 * vendor list, detail, and add/edit screens within the tab.
 */

import { Stack } from 'expo-router';
import { Colors } from '../../../constants/theme';

export default function VendorsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Vendors' }} />
      <Stack.Screen name="[id]" options={{ title: 'Vendor Details' }} />
      <Stack.Screen name="new" options={{ title: 'Add Vendor', presentation: 'modal' }} />
    </Stack>
  );
}
