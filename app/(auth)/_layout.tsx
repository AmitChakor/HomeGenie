/**
 * What this does:
 * Layout for the auth group — plain stack with no header.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
