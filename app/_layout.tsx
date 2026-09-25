/**
 * What this does:
 * Root layout — wraps the app with ErrorBoundary, Supabase auth listener,
 * React Query provider, offline sync initialization, and an auth gate
 * that redirects unauthenticated users to the login screen.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Colors } from '../constants/theme';
import { setupOfflineSync } from '../lib/offline-sync';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

// Sentry initialization — uncomment after running:
// npx expo install @sentry/react-native
//
// import * as Sentry from '@sentry/react-native';
// Sentry.init({
//   dsn: 'YOUR_SENTRY_DSN',
//   tracesSampleRate: 0.2,
//   enableAutoSessionTracking: true,
// });

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AuthGate() {
  const { session, isLoading, setSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current = setupOfflineSync();
    return () => cleanupRef.current?.();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    // In dev builds allow navigating to tabs without a real session
    const devBypass = __DEV__ && segments[0] === '(tabs)';

    if (!session && !inAuthGroup && !devBypass) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments, isLoading, isReady, router]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthGate />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
