/**
 * What this does:
 * Stack navigator for the Grocery tab — list and detail screens.
 */

import { Stack } from 'expo-router';
import { Colors } from '../../../constants/theme';

export default function GroceryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Grocery Lists' }} />
      <Stack.Screen name="[id]" options={{ title: 'Grocery List' }} />
    </Stack>
  );
}
