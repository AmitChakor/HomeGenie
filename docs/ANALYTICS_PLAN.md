# HomeGenie — MVP Analytics Event Plan

## Recommended SDK

**Expo + Amplitude** (free tier: 10M events/month) or **PostHog** (self-hostable, free tier: 1M events/month).

```bash
# Option A: Amplitude
npx expo install @amplitude/analytics-react-native

# Option B: PostHog
npx expo install posthog-react-native
```

---

## Event Taxonomy

All events follow the `object_action` naming convention. Every event includes these default properties:

| Property | Source | Example |
|---|---|---|
| `user_id` | Supabase auth | `uuid` |
| `platform` | `Platform.OS` | `ios` / `android` |
| `app_version` | `app.config.ts` | `1.0.0` |
| `language` | settings store | `en` / `hi` |
| `is_online` | offline store | `true` / `false` |

---

## Core Events (MVP — track from day one)

### Authentication
| Event | When | Properties |
|---|---|---|
| `auth_otp_requested` | User taps "Send OTP" | `phone_country_code` |
| `auth_otp_verified` | OTP verification succeeds | — |
| `auth_otp_failed` | OTP verification fails | `error_reason` |
| `auth_signed_out` | User signs out | — |

### AI Chat
| Event | When | Properties |
|---|---|---|
| `chat_message_sent` | User sends a message | `input_method` (`text` / `voice`), `message_length` |
| `chat_response_received` | Claude response completes | `response_time_ms`, `used_tool` (`none` / `book_appointment`) |
| `chat_voice_started` | User starts voice recording | — |
| `chat_voice_transcribed` | Whisper transcription completes | `transcription_time_ms`, `word_count` |
| `chat_tts_played` | TTS reads a response | `voice_gender` |
| `chat_cleared` | User clears chat history | `message_count` |

### Vendors
| Event | When | Properties |
|---|---|---|
| `vendor_created` | New vendor saved | `category` |
| `vendor_updated` | Vendor edited | `category`, `fields_changed[]` |
| `vendor_deleted` | Vendor removed | `category` |
| `vendor_called` | User taps call button | `category` |
| `vendor_whatsapp_opened` | User taps WhatsApp button | `category` |

### Grocery
| Event | When | Properties |
|---|---|---|
| `grocery_list_created` | New list created | — |
| `grocery_items_added` | Items added to list | `count`, `method` (`voice` / `manual`) |
| `grocery_item_toggled` | Item checked/unchecked | `is_checked` |
| `grocery_shared_whatsapp` | List shared via WhatsApp | `item_count` |
| `grocery_shared_sms` | List shared via SMS | `item_count` |

### Scheduling
| Event | When | Properties |
|---|---|---|
| `appointment_created` | Appointment saved | `method` (`manual` / `ai_booked`), `vendor_category` |
| `appointment_completed` | Marked as complete | — |
| `appointment_cancelled` | Marked as cancelled | — |
| `appointment_reminder_fired` | Local notification shown | `minutes_before` |

### Attendance
| Event | When | Properties |
|---|---|---|
| `attendance_checkin` | Check-in recorded | `method` (`face` / `fingerprint`), `helper_id` |
| `attendance_checkout` | Check-out recorded | `helper_id` |
| `attendance_face_matched` | Face recognized | `confidence_score` |
| `attendance_face_failed` | Face not recognized | `fell_back_to_fingerprint` |
| `attendance_csv_exported` | CSV export triggered | `log_count`, `month` |
| `helper_enrolled` | Face enrollment completed | — |
| `helper_deleted` | Helper removed | — |

### Settings
| Event | When | Properties |
|---|---|---|
| `settings_voice_changed` | Voice gender changed | `new_value` |
| `settings_language_changed` | Language switched | `from`, `to` |
| `settings_notifications_toggled` | Notifications toggled | `enabled` |
| `settings_face_data_cleared` | All face data wiped | — |

### System / Infrastructure
| Event | When | Properties |
|---|---|---|
| `app_opened` | App comes to foreground | `time_since_last_open_sec` |
| `offline_mutation_queued` | Write queued offline | `mutation_type` |
| `offline_queue_drained` | Queue synced on reconnect | `mutations_synced`, `mutations_failed` |
| `error_boundary_caught` | ErrorBoundary triggers | `error_message`, `component_stack` |

---

## Implementation Helper

Create a thin analytics wrapper so you can swap SDKs later:

```typescript
// lib/analytics.ts

type EventProperties = Record<string, string | number | boolean | string[]>;

let trackFn: (event: string, properties?: EventProperties) => void = () => {};

export function initAnalytics(userId: string): void {
  // Amplitude example:
  // import { init, track, setUserId } from '@amplitude/analytics-react-native';
  // init('YOUR_AMPLITUDE_KEY');
  // setUserId(userId);
  // trackFn = track;

  // PostHog example:
  // import PostHog from 'posthog-react-native';
  // const posthog = new PostHog('YOUR_POSTHOG_KEY');
  // posthog.identify(userId);
  // trackFn = (event, props) => posthog.capture(event, props);
}

export function track(event: string, properties?: EventProperties): void {
  if (__DEV__) {
    console.log('[Analytics]', event, properties);
  }
  trackFn(event, properties);
}
```

---

## Key Metrics Dashboard (build after 1 week of data)

| Metric | Formula | Target |
|---|---|---|
| **DAU / MAU** | Unique `app_opened` per day / month | > 30% ratio |
| **Chat engagement** | `chat_message_sent` per active user per day | > 3 |
| **Voice adoption** | `chat_voice_started` / `chat_message_sent` | > 20% |
| **Vendor utility** | (`vendor_called` + `vendor_whatsapp_opened`) / DAU | > 0.5 |
| **Grocery share rate** | `grocery_shared_*` / `grocery_list_created` | > 40% |
| **Attendance consistency** | Days with `attendance_checkin` / total days | > 80% |
| **Offline resilience** | `offline_queue_drained` success rate | > 95% |
| **Crash-free sessions** | 1 - (`error_boundary_caught` / `app_opened`) | > 99% |
