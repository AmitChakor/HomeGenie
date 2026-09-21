/**
 * What this does:
 * Thin analytics wrapper. Logs events in dev mode, delegates to
 * Amplitude/PostHog in production. Swap the SDK by editing initAnalytics().
 */

type EventProperties = Record<string, string | number | boolean | string[]>;

let trackFn: (event: string, properties?: EventProperties) => void = () => {};

export function initAnalytics(userId: string): void {
  // Uncomment your preferred SDK after installing:
  //
  // --- Amplitude ---
  // import { init, track, setUserId } from '@amplitude/analytics-react-native';
  // init('YOUR_AMPLITUDE_KEY');
  // setUserId(userId);
  // trackFn = track;
  //
  // --- PostHog ---
  // import PostHog from 'posthog-react-native';
  // const posthog = new PostHog('YOUR_POSTHOG_KEY');
  // posthog.identify(userId);
  // trackFn = (event, props) => posthog.capture(event, props);

  void userId;
}

export function track(event: string, properties?: EventProperties): void {
  if (__DEV__) {
    console.log('[Analytics]', event, properties);
  }
  trackFn(event, properties);
}
