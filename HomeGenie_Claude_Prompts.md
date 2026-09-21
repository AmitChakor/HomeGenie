# HomeGenie — Complete Claude.ai Build Prompt Document

**Version:** 1.0
**Purpose:** End-to-end prompt library to build the HomeGenie React Native app using Claude.ai, phase by phase.
**How to use:** Start a new Claude chat per phase. Paste Block 1 first (Project Context), then paste the phase-specific block. Save this file and update it as the app evolves.

---

## Table of Contents

1. [How to Use This Document](#how-to-use-this-document)
2. [Tech Stack Reference](#tech-stack-reference)
3. [Phase Roadmap](#phase-roadmap)
4. [Block 1 — Project Context (paste in every chat)](#block-1--project-context)
5. [Block 2 — Phase 0: Foundation](#block-2--phase-0-foundation)
6. [Block 3 — Phase 1: AI Avatar + Chat](#block-3--phase-1-ai-avatar--chat)
7. [Block 4 — Phase 2: Vendor Management](#block-4--phase-2-vendor-management)
8. [Block 5 — Phase 3: Grocery + WhatsApp](#block-5--phase-3-grocery--whatsapp)
9. [Block 6 — Phase 4: Scheduling](#block-6--phase-4-scheduling)
10. [Block 7 — Phase 5: Attendance](#block-7--phase-5-attendance)
11. [Block 8 — Phase 6: Settings + Polish](#block-8--phase-6-settings--polish)
12. [Block 9 — Phase 7: Beta Launch](#block-9--phase-7-beta-launch)
13. [Working Tips with Claude](#working-tips-with-claude)
14. [Debugging Prompts (Bonus)](#debugging-prompts-bonus)
15. [Changelog](#changelog)

---

## How to Use This Document

- **One phase per Claude chat.** Long chats lose context.
- **Always paste Block 1 first**, then the phase block.
- If a chat breaks or Claude gets confused, start a new chat and re-paste both blocks.
- When you change code outside Claude, paste the current file back before asking for edits.
- Ask Claude for **complete files**, not diffs, unless you explicitly want a patch.
- **Test after every phase** before moving to the next one.

---

## Tech Stack Reference

| Layer           | Choice                                                          |
| --------------- | --------------------------------------------------------------- |
| Frontend        | React Native + Expo SDK 51+                                    |
| Navigation      | Expo Router (file-based)                                        |
| Language        | TypeScript (strict)                                             |
| Local state     | Zustand                                                         |
| Server state    | React Query (@tanstack/react-query)                             |
| Backend         | Supabase (Postgres + Auth + Storage + Edge Functions)           |
| AI              | Anthropic Claude API (via Edge Functions only)                  |
| Voice STT       | OpenAI Whisper API                                              |
| Voice TTS       | expo-speech                                                     |
| Avatar          | Lottie (v1) → Rive (v2)                                        |
| Face detection  | Google ML Kit (on-device)                                       |
| Biometric       | expo-local-authentication                                       |
| Messaging       | WhatsApp deep links (wa.me) + SMS                               |
| Calendar        | react-native-calendars                                          |
| Notifications   | expo-notifications                                              |
| Forms           | react-hook-form + zod                                           |
| Errors          | Sentry                                                          |
| i18n            | i18n-js (EN + HI)                                               |

---

## Phase Roadmap

| Phase | Weeks | Deliverable              |
| ----- | ----- | ------------------------ |
| 0     | 1–2   | Auth + navigation skeleton |
| 1     | 3–4   | AI avatar + chat + voice |
| 2     | 5–6   | Vendor CRUD              |
| 3     | 7–8   | Grocery list + WhatsApp share |
| 4     | 9–10  | Appointments + reminders |
| 5     | 11–12 | Attendance (face + fingerprint) |
| 6     | 13–14 | Settings + offline + polish |
| 7     | 15–16 | Beta launch              |

---

## Block 1 — Project Context

> Paste this at the start of **EVERY** new Claude chat.

```text
You are a senior React Native + Supabase engineer helping me build a production-ready
home assistant app called "HomeGenie". I will build this with you phase by phase.

TECH STACK (do not deviate):
- React Native with Expo SDK 51+, Expo Router for navigation
- TypeScript strict mode
- Zustand for local state, React Query (@tanstack/react-query) for server state
- Supabase for backend (Postgres, Auth, Storage, Edge Functions)
- Anthropic Claude API called ONLY via Supabase Edge Functions (never expose keys)
- OpenAI Whisper API for voice-to-text (also via Edge Function)
- expo-speech for TTS
- Lottie for avatar (Rive later)
- Google ML Kit (via expo-face-detector or @react-native-ml-kit/face-detection) for on-device face recognition
- expo-local-authentication for fingerprint
- WhatsApp deep links (wa.me) + SMS for vendor messaging
- react-native-calendars for scheduling
- Expo Notifications for push

APP FEATURES (full scope):
1. AI avatar chat assistant that can call/message vendors (medical, maid, grocery, electrician, plumber, driver, etc.)
2. Vendor management screen (add/edit/delete, categorized)
3. Settings panel (voice, language, notifications, privacy)
4. Appointment scheduling (doctors, dentists, any vendor)
5. Attendance tracking for maids/helpers via face recognition or fingerprint
6. Voice-driven grocery list as checklist, shareable to a store via WhatsApp/SMS
7. Future: payments, multi-household, vendor-side app

DESIGN PRINCIPLES:
- Clean, modern, accessible (WCAG AA)
- Offline-first where possible (attendance, grocery list)
- Privacy: face data stored on-device only, never uploaded
- India-first (WhatsApp, phone OTP, multi-language support later)

WORKING RULES:
- Always give me COMPLETE file contents, not snippets, with the full path as a header
- Use TypeScript with explicit types
- Include a short "What this does" comment block at the top of each file
- After each code block, list any npm packages I need to install and any
  Supabase SQL migrations I need to run
- If you need info from me, ask before assuming
- Keep responses focused — one screen or one feature per response unless I ask for more
- End every response with: "Next step: <what you suggest we build next>"

Confirm you understand by saying "Ready — tell me which phase to start."
```

---

## Block 2 — Phase 0: Foundation

> Paste after Block 1.

```text
PHASE 0 — FOUNDATION

Build the project skeleton for HomeGenie.

1. Give me the exact commands to create the Expo project with TypeScript and Expo Router.
2. Give me the full folder structure (app/, components/, lib/, hooks/, stores/, types/, constants/).
3. Create app/_layout.tsx with:
   - Supabase provider
   - React Query provider
   - Auth gate (redirects to /(auth)/login if no session)
4. Create the auth flow:
   - app/(auth)/login.tsx — phone number input
   - app/(auth)/otp.tsx — OTP verification
   - Use Supabase phone auth
5. Create app/(tabs)/_layout.tsx with 5 tabs: Home, Vendors, Schedule, Grocery, Settings.
   Use placeholder screens for now.
6. Create lib/supabase.ts with typed client.
7. Create a constants/theme.ts with colors, spacing, typography.
8. Give me the Supabase SQL to create a `profiles` table (id, full_name, phone, created_at)
   with RLS so users only see their own row, plus a trigger to auto-create profile on signup.

Give me every file in full.
```

---

## Block 3 — Phase 1: AI Avatar + Chat

> Paste after Block 1.

```text
PHASE 1 — AI AVATAR + CORE CHAT

Build the AI assistant experience.

1. Supabase Edge Function: supabase/functions/chat/index.ts
   - Accepts { messages, userContext }
   - Calls Anthropic Claude API (claude-sonnet-4-5) with a system prompt that
     describes HomeGenie's capabilities and the user's vendors
   - Streams response back
   - Reads ANTHROPIC_API_KEY from env
   Give me the full function + the command to deploy it.

2. app/(tabs)/index.tsx — Home screen:
   - Full-screen avatar component at top (animated)
   - Chat message list below (user right, assistant left, with avatar thumbnail)
   - Input bar at bottom with: text field, mic button (hold to record), send button
   - Streaming assistant replies

3. components/Avatar.tsx:
   - Props: state ('idle' | 'listening' | 'thinking' | 'speaking')
   - Uses Lottie for now (I'll swap for Rive later)
   - Give me a placeholder Lottie JSON or tell me where to get one

4. lib/voice.ts:
   - recordAndTranscribe(): records audio with expo-av, sends to Whisper API
     via a Supabase Edge Function, returns text
   - speak(text): uses expo-speech

5. hooks/useChat.ts:
   - Manages message state, calls the chat edge function, handles streaming

6. Supabase table `messages` (id, user_id, role, content, created_at) with RLS.

Give me every file in full, plus install commands and SQL.
```

---

## Block 4 — Phase 2: Vendor Management

> Paste after Block 1.

```text
PHASE 2 — VENDOR MANAGEMENT

Build vendor CRUD.

1. Supabase table `vendors`:
   - id, user_id, name, category (enum: medical, maid, grocery, electrician,
     plumber, driver, other), phone, whatsapp, address, notes, rating,
     avatar_url, is_active, created_at, updated_at
   - RLS: users only access their own vendors
   - Storage bucket `vendor-avatars` with RLS

2. app/(tabs)/vendors/index.tsx:
   - Search bar
   - Category filter chips
   - List of vendor cards (avatar, name, category, quick actions: call, WhatsApp)
   - FAB to add vendor

3. app/(tabs)/vendors/[id].tsx — Vendor detail:
   - Header with avatar, name, category
   - Action buttons: Call, WhatsApp, Message via HomeGenie AI, Schedule
   - Info sections: phone, address, notes, rating
   - Edit + Delete buttons
   - History of interactions (pull from messages table where vendor_id matches)

4. app/(tabs)/vendors/new.tsx and edit.tsx (or a shared form):
   - Form with validation (react-hook-form + zod)
   - Category picker, avatar upload

5. hooks/useVendors.ts — React Query hooks for list, detail, create, update, delete.

6. lib/links.ts — helpers for tel:, wa.me, sms: deep links.

Give me every file in full, plus install commands and SQL. Also update the AI system
prompt in the chat edge function to include the user's vendor list so the avatar
can answer "call my plumber" correctly.
```

---

## Block 5 — Phase 3: Grocery + WhatsApp

> Paste after Block 1.

```text
PHASE 3 — GROCERY LIST + WHATSAPP ORDER

Build voice-driven grocery list.

1. Supabase tables:
   - `grocery_lists` (id, user_id, name, store_vendor_id, status, created_at)
   - `grocery_items` (id, list_id, name, quantity, unit, notes, is_checked, created_at)
   - RLS on both

2. app/(tabs)/grocery/index.tsx:
   - List of grocery lists (active + past)
   - FAB: "New list" → opens voice capture sheet
   - Each list card shows item count, store, status

3. app/(tabs)/grocery/[id].tsx:
   - Checklist UI (tap to check off)
   - Add item manually or via voice
   - "Send to store" button → opens WhatsApp with formatted message
   - Share via SMS fallback

4. components/VoiceCaptureSheet.tsx:
   - Modal with a big mic button
   - Records → Whisper → Claude parses into structured items
     ("2kg atta, 1L milk, dozen eggs" → [{name:'atta',qty:2,unit:'kg'}, ...])
   - Shows parsed items for confirmation before adding

5. lib/grocery-parser.ts:
   - Calls a Supabase Edge Function `parse-grocery` that uses Claude with a
     structured-output prompt (JSON mode) to parse freeform speech into items

6. lib/share.ts:
   - formatGroceryListForWhatsApp(items, storeName): returns a clean message
   - openWhatsApp(phone, message)

Give me every file in full, plus install commands and SQL.
```

---

## Block 6 — Phase 4: Scheduling

> Paste after Block 1.

```text
PHASE 4 — SCHEDULING

Build appointment scheduling.

1. Supabase table `appointments`:
   - id, user_id, vendor_id (nullable for non-vendor events), title,
     description, start_time, end_time, location, reminder_minutes,
     status (upcoming/completed/cancelled), created_at
   - RLS

2. app/(tabs)/schedule/index.tsx:
   - Month calendar (react-native-calendars) with dots on days with appointments
   - Agenda list below for selected day
   - FAB to add appointment

3. app/(tabs)/schedule/new.tsx and [id].tsx:
   - Form: title, vendor picker (or custom), date/time pickers, location,
     reminder, notes
   - Save → schedules a local notification via expo-notifications

4. hooks/useAppointments.ts — CRUD + upcoming query.

5. lib/notifications.ts:
   - scheduleReminder(appointment)
   - cancelReminder(id)
   - Request permissions on first use

6. Update the AI chat so the avatar can book appointments conversationally:
   "Book Dr. Sharma for Tuesday 5pm" → creates appointment row.

Give me every file in full, plus install commands and SQL.
```

---

## Block 7 — Phase 5: Attendance

> Paste after Block 1.

```text
PHASE 5 — ATTENDANCE (Face + Fingerprint)

Build attendance tracking for maids/helpers.

1. Supabase tables:
   - `helpers` (id, user_id, name, role, phone, face_embedding_id,
     is_active, created_at) — NOTE: never store raw face images in cloud
   - `attendance_logs` (id, helper_id, user_id, check_in_at, check_out_at,
     method (face/fingerprint/manual), latitude, longitude, created_at)
   - RLS on both

2. app/(tabs)/settings/helpers.tsx:
   - List of helpers
   - Add helper → enrolls face (capture 3–5 samples on-device, store only
     embedding locally in AsyncStorage or expo-secure-store with a key
     referenced by face_embedding_id)

3. app/attendance/checkin.tsx:
   - Camera view using expo-camera
   - On-device face detection via ML Kit
   - Match against stored embeddings (use a small cosine-similarity check)
   - Fallback: fingerprint via expo-local-authentication
   - On success: create attendance_logs row with check_in_at, geolocation

4. app/(tabs)/settings/attendance.tsx:
   - Monthly calendar view per helper
   - Summary: days present, absent, hours
   - Export to CSV

5. hooks/useAttendance.ts and hooks/useHelpers.ts

IMPORTANT PRIVACY NOTE: face embeddings stay on-device. Only the attendance
event syncs to Supabase. Confirm this approach and implement accordingly.

Give me every file in full, plus install commands and SQL.
```

---

## Block 8 — Phase 6: Settings + Polish

> Paste after Block 1.

```text
PHASE 6 — SETTINGS + POLISH

1. app/(tabs)/settings/index.tsx:
   - Profile (name, phone, avatar)
   - Assistant settings: voice (male/female/child), speech rate, language
   - Notification preferences
   - Privacy: manage face data, clear chat history
   - About, Terms, Sign out

2. Offline-first:
   - Add a queue in Zustand for grocery list mutations + attendance check-ins
   - Sync on reconnect using React Query's onlineManager + a custom mutation
     queue

3. Error handling:
   - Sentry setup (expo install @sentry/react-native)
   - Global error boundary in app/_layout.tsx

4. i18n scaffolding (i18n-js) with English + Hindi placeholders.

5. Final pass: make sure every screen handles loading, empty, and error states.

Give me every file in full, plus install commands.
```

---

## Block 9 — Phase 7: Beta Launch

> Paste after Block 1.

```text
PHASE 7 — BETA LAUNCH

1. app.json / app.config.ts: production config, icons, splash, permissions
   (camera, mic, notifications, biometrics, location)
2. EAS Build setup: eas.json with development, preview, production profiles
3. Steps to submit to Play Console internal testing + TestFlight
4. Supabase production checklist (backups, RLS audit, rate limits on edge functions)
5. A simple analytics event plan (which events to track for the MVP)
```

---

## Working Tips with Claude

- **One phase per chat.** Paste Block 1, then Block N. Get your code. Start fresh next phase.
- **Keep code in the chat.** If you edit a file outside Claude, paste it back before asking for changes.
- **Ask for migrations as SQL files**, then run them in the Supabase SQL editor.
- **When Claude makes a mistake**, say: *"That file has an error: \<paste error\>. Rewrite the full file."* Don't ask for a patch.
- **Use Claude Projects.** Create a project "HomeGenie" and put Block 1 in the project's custom instructions.
- **Test after every phase.** Expo Go + Supabase dashboard is your fastest loop.

---

## Debugging Prompts (Bonus)

Use these when things break. Always paste Block 1 first, then one of these.

### D1 — General Bug Fix

```text
I'm getting this error in HomeGenie:

<PASTE FULL ERROR + STACK TRACE>

Here is the relevant file:

<PASTE FULL FILE>

Diagnose the cause, explain it in 2 lines, then give me the corrected full file.
```

### D2 — Supabase RLS Not Working

```text
My RLS policy isn't behaving as expected.

Table: <name>
Policy I wrote: <paste SQL>
What I expect: <describe>
What happens: <describe>

Give me the corrected policy SQL and explain the mistake in 2 lines.
```

### D3 — Claude API Response Wrong

```text
The avatar's Claude reply is wrong for this input:

User input: <paste>
User's vendors: <paste JSON>
Assistant reply I got: <paste>
Expected reply: <describe>

Give me the updated system prompt or tool definitions to fix this.
```

### D4 — Streaming Not Working

```text
My edge function streams Claude responses but the React Native client shows
nothing until the stream ends.

Edge function: <paste>
Client hook: <paste>

Fix the streaming end-to-end. Give me corrected full files.
```

### D5 — Face Recognition Mismatch

```text
Face recognition is matching the wrong helper (or failing to match).

Enrollment code: <paste>
Matching code: <paste>
Threshold: <value>

Suggest a better approach (embedding library, threshold, sample count) and
give me corrected files.
```

---

## Changelog

| Version | Date | Changes |
| ------- | ---- | ------- |
| 1.0     | —    | Initial document: 9 build blocks + 5 debugging prompts |
