/**
 * What this does:
 * Expo app config for HomeGenie. Defines app metadata, icons, splash screen,
 * permissions (camera, mic, notifications, biometrics, location), and plugin
 * configuration for EAS builds. Uses environment variables for sensitive values.
 */

import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'HomeGenie',
  slug: 'homegenie',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'homegenie',

  assetBundlePatterns: ['**/*'],

  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.homegenie.app',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription:
        'HomeGenie needs camera access for helper attendance check-in via face recognition.',
      NSMicrophoneUsageDescription:
        'HomeGenie needs microphone access for voice commands and grocery dictation.',
      NSFaceIDUsageDescription:
        'HomeGenie uses Face ID as a fallback for helper attendance check-in.',
      NSLocationWhenInUseUsageDescription:
        'HomeGenie records location with attendance check-ins for verification.',
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },

  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#6C63FF',
    },
    package: 'com.homegenie.app',
    versionCode: 1,
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED',
      'SCHEDULE_EXACT_ALARM',
    ],
  },

  web: {
    favicon: './assets/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/splash.png',
        imageResizeMode: 'contain',
        backgroundColor: '#6C63FF',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'HomeGenie needs camera access for helper attendance check-in via face recognition.',
        microphonePermission:
          'HomeGenie needs microphone access for voice commands.',
        recordAudioAndroid: true,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#6C63FF',
        sounds: ['./assets/sounds/reminder.wav'],
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission:
          'HomeGenie uses Face ID as a fallback for helper attendance.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'HomeGenie records location with attendance check-ins.',
      },
    ],
    [
      'expo-av',
      {
        microphonePermission:
          'HomeGenie needs microphone access for voice input.',
      },
    ],
    // Uncomment after installing @sentry/react-native:
    // [
    //   '@sentry/react-native/expo',
    //   {
    //     organization: 'YOUR_SENTRY_ORG',
    //     project: 'homegenie',
    //     url: 'https://sentry.io/',
    //   },
    // ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? 'YOUR_EAS_PROJECT_ID',
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },

  owner: 'homegenie',
});
