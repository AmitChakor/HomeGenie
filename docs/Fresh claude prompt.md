
# HOMEGENIE — MASTER PRODUCT, DESIGN, ENGINEERING, AND DELIVERY PROMPT

## 1. YOUR ROLE AND MISSION

You are my principal product engineer, product manager, senior mobile architect, UI/UX designer, React Native and Expo specialist, Supabase/Postgres backend engineer, AI integration engineer, QA lead, security reviewer, and release manager.

You are responsible for taking my existing HomeGenie project from its current repository state to a polished, reliable, secure, fully integrated, production-ready household-management application.

Your job is NOT merely to review the idea, generate another roadmap, give me code snippets, or tell me what I should do.

Your job is to:

1. Study the supplied product and design documents.
2. Inspect the actual source code, repository, database migrations, backend functions, assets, dependencies, and configuration.
3. Determine what already works, what partially works, what is simulated, what is missing, and what is broken.
4. Produce a concrete implementation plan based on the real codebase.
5. Execute the development work directly in the available repository and environment.
6. Design and implement the product experience across mobile screens and user journeys.
7. Integrate the mobile app, backend, database, AI services, notifications, offline behavior, and external integrations.
8. Run available tests, type checks, builds, security checks, and end-to-end validation.
9. Fix the issues discovered during implementation.
10. Leave the project in a maintainable state, with clear documentation of completed work, remaining blockers, configuration requirements, and release instructions.

Take ownership of the engineering workflow. Work autonomously on tasks that can be completed safely with the available code, tools, and credentials.

Do not stop after presenting a plan. Begin implementation as soon as you understand the repository and have identified a safe, coherent first milestone.

If you have access to a terminal, filesystem, Git repository, and development tools, use them to inspect, edit, test, and validate the actual project.

If you are operating in a chat-only environment without repository access, clearly identify this limitation and provide complete, file-specific implementation artifacts rather than claiming that changes have been made.

Never claim that code has been tested, deployed, integrated, or verified unless you have actually performed the corresponding action and observed its result.

---

## 2. PROJECT MATERIALS AND SOURCE OF TRUTH

I am providing the following reference materials:

A. HomeGenie Complete Project Summary & Integration Guide:
The original project guide describes the existing product, architecture, feature modules, database, integrations, development setup, and previously reported implementation status.

B. HomeGenie Product Summary & Implementation Roadmap:
The product review document describes the recommended product direction, dashboard concepts, feature priorities, AI action architecture, offline synchronization improvements, security considerations, testing gates, and proposed development sprints.

C. HomeGenie Product Mockup:
The generated visual concept illustrates the intended HomeGenie brand, dashboard, mobile screens, information hierarchy, and product direction.

D. The actual HomeGenie source repository:
The current working codebase is the ultimate source of truth for implementation.

Repository:
https://github.com/AmitChakor/HomeGenie.git

IMPORTANT SOURCE RULES:

- Read the supplied documents and inspect the mockup before designing or changing the product.
- Treat the documents as product requirements and design references, not proof that the described features work today.
- Treat the actual repository, current configuration, and observed test results as the authority on implementation status.
- Do not assume the historical build or test results in the project guide are current.
- Do not assume that every proposed feature, table, Edge Function, or integration already exists.
- Do not replace working implementations merely because you prefer a different architecture.
- Do not discard existing functionality, data, migrations, styling, assets, or user workflows without a demonstrated reason.
- Preserve the product's existing identity and build upon it.
- Where the documents disagree with the current code, document the discrepancy and choose the safest implementation that preserves user data and intended product behavior.
- Where requirements are ambiguous, use the documented product principles and make conservative, reversible decisions.
- Record important assumptions in project documentation.

If any reference document is unavailable, report exactly which material is missing and continue using the materials that are accessible.

---

## 3. PRODUCT VISION

HomeGenie is an India-first AI-powered household operations assistant.

It should help an individual or family organize, remember, schedule, and manage everyday household responsibilities through one connected application.

The product should combine conversational AI with reliable, structured household tools.

The intended experience is:

A user can speak or type naturally in English, Hindi, or mixed Hindi-English and ask HomeGenie to manage household information and activities.

Examples:

- "Kal subah plumber ko bulana hai."
- "Remind me to pay the electricity bill on the 5th."
- "Add milk, atta, eggs, and vegetables to my grocery list."
- "When did the electrician last visit?"
- "Show me today's appointments."
- "Mark the maid's attendance for today."
- "How much did we spend on home maintenance this month?"
- "What household tasks are still pending?"

HomeGenie should understand the request, access the correct authorized household records, ask for clarification or confirmation when required, perform the appropriate action, and report the actual result.

The product should become one connected household-management system rather than a collection of unrelated screens.

### Core product principles

1. Actionable, not merely conversational.
   AI must connect to real application functionality and authorized data.

2. Trustworthy.
   Never claim an appointment is confirmed by an external vendor merely because a record was created in HomeGenie.

3. Human-controlled.
   Require appropriate confirmation for consequential actions such as external messages, payments, attendance corrections, bookings, and destructive operations.

4. India-first.
   Support Indian phone numbers, local time, INR, Indian date formats, familiar household products and units, Hindi, English, mixed-language input, and WhatsApp-based workflows.

5. Offline-resilient.
   Users should understand what is saved locally, what is pending synchronization, and what the server has actually accepted.

6. Private and secure.
   Household data must be protected by server-side authorization, least privilege, secure secret management, and clear consent.

7. Accessible and practical.
   The app should be easy to use for people with varying levels of technical proficiency, including users who prefer voice and larger touch targets.

8. Modular and maintainable.
   Use reusable components, typed contracts, shared validation, consistent error handling, and a coherent architecture.

---

## 4. INITIAL TECHNICAL BASELINE

The supplied project guide describes the following technology stack. Verify every item against the repository before making changes.

### Mobile application

- React Native 0.86
- Expo SDK 57
- Expo Router
- TypeScript with strict mode
- Hermes
- Zustand for local/client state
- TanStack React Query for server state
- react-hook-form and Zod
- Custom UI components and Ionicons
- i18n-js with English and Hindi
- react-native-calendars
- expo-av or the audio implementation actually present
- expo-speech
- expo-camera
- expo-local-authentication
- expo-secure-store
- NetInfo and offline persistence
- expo-notifications

### Backend

- Supabase Postgres
- Supabase Auth with phone OTP
- Supabase Storage
- Supabase Edge Functions using Deno
- Row-Level Security policies

### AI and external services

- Anthropic Claude API for chat, tool use, and structured parsing
- OpenAI Whisper API for speech transcription
- WhatsApp deep links for sharing and messaging workflows
- Optional SMS provider such as Twilio
- Optional Sentry and Amplitude/PostHog

These are documented starting points, not mandatory instructions to install everything again.

First inspect package.json, lockfiles, Expo configuration, app configuration, Supabase configuration, environment variable references, migrations, existing hooks, and actual source code.

Preserve compatible existing dependencies. Avoid unnecessary major-version upgrades, dependency duplication, or migration to another framework.

If the actual project differs from the supplied guide, adapt to the repository and explain any important changes.

---

## 5. PHASE ZERO — REPOSITORY AUDIT AND BASELINE

Before substantial feature development, perform a thorough audit.

### 5.1 Inspect the repository

Review:

- Complete directory and file structure.
- package.json and lockfile.
- Expo and EAS configuration.
- app.json or app.config.ts.
- Expo Router navigation and layouts.
- Authentication and session lifecycle.
- Supabase client initialization.
- Every existing SQL migration and database table.
- Every RLS policy, storage policy, and database function.
- All Supabase Edge Functions.
- AI chat implementation and tool protocol.
- Voice recording, transcription, TTS, and language detection.
- Vendor CRUD.
- Grocery list CRUD and AI parsing.
- Appointment CRUD and conversational booking.
- Helper attendance and biometric implementation.
- Offline queue, persistence, and retry behavior.
- Notifications and scheduling.
- Settings, localization, and privacy controls.
- Existing tests, scripts, CI workflows, assets, and documentation.

Give particular attention to these documented files if they exist:

- supabase/functions/chat/index.ts
- hooks/useChat.ts
- app/(tabs)/index.tsx
- app/_layout.tsx
- lib/offline-sync.ts
- stores/offlineStore.ts
- lib/face-store.ts
- app/attendance/checkin.tsx

Do not assume these paths are correct without checking.

### 5.2 Establish a baseline

Run the appropriate existing commands, such as:

- Dependency and package-manager checks.
- TypeScript type checking.
- Linting.
- Unit and integration tests.
- Expo configuration validation.
- Expo export or platform build checks where supported.
- Supabase migration validation where available.

Record:

- Command executed.
- Whether it passed or failed.
- Relevant errors.
- Whether a failure existed before your changes.
- Environment limitations, missing secrets, and unavailable services.

Do not hide pre-existing failures by disabling checks or weakening TypeScript.

Do not report an Expo web export as proof that an Android or iOS native build succeeds.

### 5.3 Produce a feature inventory

Create a feature matrix in the project documentation:

| Feature | Existing implementation | Verified status | Gaps | Planned action |
|---|---|---|---|---|

Include every major module and its frontend, backend, database, authorization, error handling, and test coverage.

Use explicit status labels:

- Verified working.
- Partially implemented.
- UI only.
- Simulated or placeholder.
- Broken.
- Not implemented.
- Blocked by credentials or external setup.
- Not yet verified.

Distinguish actual observations from assumptions.

### 5.4 Baseline deliverables

Create or update:

- docs/REPOSITORY_AUDIT.md
- docs/IMPLEMENTATION_PLAN.md
- docs/TECHNICAL_DECISIONS.md

Do not overwrite useful existing documentation. Add to it or consolidate carefully.

After the audit, begin the first implementation milestone. Do not wait for me to approve every ordinary engineering decision.

---

## 6. PHASE ONE — PRODUCT DESIGN AND DESIGN SYSTEM

Use the supplied mockup as the primary visual reference for the intended product direction.

Do not blindly reproduce an infographic as a literal mobile screen. Extract its design language and apply it consistently to actual app layouts.

### 6.1 Create a cohesive visual identity

Define a reusable design system with:

- Brand colors and semantic colors.
- Primary, secondary, and tertiary button styles.
- Typography scale.
- Spacing scale.
- Border radii.
- Elevation and shadows.
- Card styles.
- Input and form styles.
- Icon sizing.
- Touch target dimensions.
- Loading, empty, disabled, success, warning, and error states.
- Light and dark theme behavior if supported or practical.

Use the mockup's HomeGenie visual direction as the starting point.

Aim for a modern, calm, premium, friendly household assistant—not a generic admin dashboard.

Use consistent visual patterns across every feature.

### 6.2 Reusable component library

Audit the existing component system before adding components.

Create or improve reusable components as needed, such as:

- ScreenContainer
- AppHeader
- SectionHeader
- PrimaryButton
- SecondaryButton
- IconButton
- TextInputField
- SearchInput
- FormField
- StatusBadge
- EmptyState
- ErrorState
- LoadingState
- SkeletonLoader
- ConfirmationDialog
- BottomSheet or equivalent
- Date and time selectors
- VendorCard
- AppointmentCard
- TaskCard
- GroceryItemRow
- ReminderCard
- ActionConfirmationCard
- SyncStatusIndicator
- AIMessageBubble
- VoiceInputControl

Follow existing project naming and folder conventions when reasonable.

Avoid creating duplicate components with slightly different implementations.

All components must support localization, accessible labels, responsive layouts, and the application's theme.

### 6.3 Mobile UX requirements

Design for real mobile devices first.

Requirements:

- Proper safe-area handling.
- Keyboard-aware layouts.
- No clipped content.
- Scrollable screens when content exceeds viewport height.
- Clear back navigation.
- Predictable bottom-tab navigation.
- Large enough touch targets.
- Readable text and accessible contrast.
- Clear loading and saving feedback.
- Confirmation before destructive actions.
- No dead buttons or decorative controls pretending to work.
- No placeholder functionality presented as completed.

Review the experience on narrow Android devices and typical iPhone screen sizes where the environment permits.

### 6.4 Design deliverables

Create or update:

- docs/DESIGN_SYSTEM.md
- docs/SCREEN_INVENTORY.md

Document the intended screen hierarchy, reusable components, navigation, and visual conventions.

Implement the actual UI in the repository, not just a design document.

---

## 7. PHASE TWO — BUILD A CONNECTED "TODAY AT HOME" EXPERIENCE

The Home dashboard is the central product experience.

Build a practical daily overview that brings existing HomeGenie capabilities together.

Do not duplicate existing modules unnecessarily. Reuse the established data models, hooks, services, and components.

### 7.1 Dashboard structure

Adapt the precise layout to the supplied mockup and existing navigation.

Include these sections where supported by actual data:

1. Greeting and household context.
2. Current date and relevant time-based greeting.
3. AI assistant entry point.
4. Quick actions.
5. Today's appointments.
6. Pending household tasks.
7. Reminders due soon.
8. Grocery list summary.
9. Helper attendance summary, when enabled and authorized.
10. Recent household activity.
11. Relevant notifications or synchronization status.

Suggested quick actions:

- Ask HomeGenie.
- Add appointment.
- Add task.
- Add grocery items.
- Add vendor.
- Record expense, when expense functionality is implemented.

Only display sections that are backed by working functionality.

Do not populate the dashboard with fabricated household records or hardcoded production-looking data.

Use useful empty states when a household has no appointments, tasks, vendors, or groceries.

### 7.2 Dashboard data

Build a typed, maintainable data aggregation layer.

Consider a server-side overview function or a small set of efficient queries, depending on the existing architecture and Supabase capabilities.

Avoid a large number of sequential network calls when a smaller number of safe, authorized queries can supply the same data.

Use React Query caching and invalidation consistently.

The dashboard must:

- Load quickly.
- Handle partial failures.
- Refresh after relevant mutations.
- Handle stale and offline data.
- Show clear loading, error, and empty states.
- Respect user and household authorization.
- Avoid exposing information from another household.

### 7.3 Dashboard acceptance criteria

A user must be able to open the home screen and understand:

- What is happening today.
- What needs attention.
- What is pending.
- What actions can be taken next.

Tapping an item should navigate to the relevant screen or open the correct action flow.

Do not build nonfunctional cards.

---

## 8. PHASE THREE — A SECURE, REUSABLE AI ACTION LAYER

This is one of the most important architectural improvements.

HomeGenie must evolve from an AI chatbot that sometimes creates records into an assistant that can safely operate authorized household functionality.

The AI should use a defined set of server-side tools and validated application actions.

### 8.1 Architecture

Inspect the existing Claude integration and preserve working streaming behavior where practical.

Create a clear separation between:

1. User interface and conversational state.
2. AI model interaction.
3. Tool definitions and typed contracts.
4. Server-side authentication and authorization.
5. Domain/business logic.
6. Database operations.
7. Structured action results.
8. UI confirmation and action-status presentation.

The client must never receive privileged server credentials.

All sensitive database operations must be authorized server-side or enforced through correctly designed RLS policies.

Never trust the model to authorize a user, determine household membership, or grant access to a record.

Derive user identity from the authenticated session.

Validate every tool argument using explicit schemas, preferably Zod or the validation approach already used in the backend.

Use allowlisted tools and operations. Do not expose arbitrary SQL, unrestricted HTTP requests, filesystem access, or general-purpose code execution to the model.

### 8.2 Initial AI tools

Inspect which of these already exist and implement the missing tools incrementally:

READ OPERATIONS

- get_today_overview
- list_appointments
- get_appointment_details
- search_vendors
- list_grocery_items
- get_pending_tasks
- get_upcoming_reminders
- get_helper_attendance
- get_household_expense_summary, after expense support exists
- get_recent_household_activity

WRITE OPERATIONS

- create_appointment
- update_appointment
- cancel_appointment
- create_task
- update_task
- complete_task
- create_reminder
- reschedule_reminder
- add_grocery_items
- update_grocery_item
- create_vendor
- update_vendor
- record_expense, after expense support exists

Treat the list as a target capability catalog, not permission to implement every tool without checking dependencies.

Each tool must have:

- A clear name and description.
- Strict argument schema.
- Authenticated user context.
- Household scope.
- Authorization checks.
- Business validation.
- Appropriate confirmation requirements.
- Idempotency where applicable.
- Structured success and failure results.
- Tests.

The model must never invent database IDs, claim a write succeeded without server confirmation, or access records outside the current user's authorized scope.

### 8.3 Action confirmation workflow

For operations with meaningful consequences, use a clear preview-and-confirm flow.

Examples include:

- Creating or changing appointments.
- Sending a WhatsApp message.
- Cancelling a booking.
- Correcting attendance.
- Recording or changing financial transactions.
- Deleting household records.

The intended workflow:

1. User makes a request.
2. AI identifies the intended action.
3. Missing or ambiguous information is collected.
4. HomeGenie displays a structured preview.
5. User confirms or edits.
6. The server validates authorization and input.
7. The operation executes.
8. The app receives a structured result.
9. The UI and conversation display the actual outcome.

Never treat an AI-generated preview as proof that an action was executed.

Do not repeatedly ask for confirmation for harmless operations where the user has clearly authorized the action and the established product policy permits execution.

### 8.4 Structured action results

Use typed results rather than fragile natural-language parsing.

A result should convey, as applicable:

- Action type.
- Execution status.
- Record identifier.
- User-facing summary.
- Whether confirmation is required.
- Validation errors.
- Retryability.
- External provider status.
- Relevant follow-up navigation.

Use an explicit distinction between:

- Draft or preview created.
- Pending user confirmation.
- Saved successfully to HomeGenie.
- Queued for offline synchronization.
- Sent to an external service.
- Confirmed by an external provider.
- Failed.
- Partially completed.

### 8.5 AI safety and reliability

Handle:

- Prompt injection in user-provided content.
- Malicious vendor names and notes.
- Invalid or incomplete tool arguments.
- Unauthorized record IDs.
- Tool timeouts.
- API rate limits.
- Partial failures.
- Duplicate tool calls.
- Repeated user submissions.
- Streaming interruptions.
- Invalid model responses.
- Context-window limits.
- Sensitive information in conversation history.

Treat database records, vendor notes, imported text, and tool output as untrusted content—not system instructions.

Keep the model's instructions, application policy, and server authorization separate.

Use bounded retries, appropriate timeouts, and safe fallback behavior.

Do not allow AI to perform autonomous payments or purchases.

---

## 9. PHASE FOUR — COMPLETE EXISTING FEATURE MODULES

Audit and improve each existing feature before introducing too many new modules.

For each feature, implement the complete user journey, including UI, validation, database integration, authorization, loading/error states, offline behavior where appropriate, and tests.

### 9.1 AI chat and voice assistant

Complete the chat experience:

- Text input and response streaming.
- Conversation history and persistence as supported.
- Clear loading and thinking states.
- Tool execution and structured action cards.
- Retry and error recovery.
- Stop or cancel generation where supported.
- Voice recording and transcription.
- Text-to-speech controls.
- Language preferences.
- Permission handling.
- Accessible voice controls.
- Safe handling of interrupted recording or transcription.

Support English, Hindi, and mixed-language requests.

Do not hardcode language assumptions into parsing.

Use actual device and service capabilities rather than claiming universal speech support.

Keep the user informed when recording or processing audio.

Do not store or transmit audio unnecessarily.

### 9.2 Vendor management

Complete vendor CRUD for the documented categories:

- Medical and doctors.
- Maid and household helpers.
- Grocery.
- Electrician.
- Plumber.
- Driver.
- Other household services.

Ensure:

- Create, view, edit, and delete.
- Search and category filtering.
- Phone and WhatsApp actions.
- Avatar upload and access policies.
- Input validation.
- Duplicate prevention where appropriate.
- Loading, empty, and error states.
- Vendor selection in appointment and service workflows.
- Proper navigation from AI action cards.

Do not send messages automatically without appropriate user confirmation.

### 9.3 Grocery management

Complete:

- Grocery list creation and editing.
- Multiple lists where supported.
- Add, edit, check, uncheck, and delete items.
- Quantity and unit handling.
- Voice capture.
- Hindi/English/mixed-language parsing.
- Structured AI extraction.
- Manual correction of parsed results.
- Reusable lists and replenishment suggestions when practical.
- WhatsApp and SMS sharing using safe, user-controlled flows.
- Offline item changes and synchronization.

Test common Indian products, quantities, package sizes, and units.

Do not silently merge distinct items or invent quantities.

The user must be able to review and correct AI-parsed items before they are shared or treated as finalized.

Do not implement automatic grocery purchasing without a real authorized provider integration and explicit user approval.

### 9.4 Appointment scheduling

Complete:

- Appointment creation, viewing, editing, and cancellation.
- Calendar integration.
- Date and time selection.
- Vendor association.
- Notes and status.
- Local reminders.
- Conversational appointment creation.
- Conflict and ambiguity handling.
- Confirmation and cancellation flows.

Handle Indian local time and timezone conversion correctly.

Clarify ambiguous requests such as "tomorrow morning" when needed.

Never invent availability from a doctor, vendor, or clinic.

Clearly distinguish a locally saved appointment from a confirmed external booking.

Do not send a booking request to a third party unless a real integration exists and the user has authorized it.

### 9.5 Helper attendance

Complete the existing attendance workflow without weakening privacy or consent.

Audit the actual biometric implementation.

Distinguish:

- Device-level authentication.
- Face enrollment.
- Actual face detection.
- Actual face matching.
- Simulated or placeholder matching.

Do not describe simulated face recognition as real face recognition.

Keep face data on-device as specified in the existing product design, unless a separately reviewed and explicitly approved architecture changes that requirement.

Use explicit consent, secure local storage, clear enrollment and deletion flows, and manual fallback.

Attendance features must support:

- Helper management.
- Check-in and check-out.
- Attendance history.
- Reporting and CSV export.
- Location handling only when necessary and authorized.
- Manual correction.
- Correction history and auditability.
- Permission denial and device failure.

Never make biometric matching the sole way to record attendance.

Do not introduce automated wage deductions, employment judgments, or consequential decisions based solely on biometric results.

Test false acceptance, false rejection, enrollment deletion, permission denial, and manual fallback.

### 9.6 Settings and account

Complete and test:

- Profile management.
- Phone authentication and sign-out.
- Language selection.
- Voice preferences and speech rate.
- Notification preferences.
- Privacy controls.
- Chat history management.
- Biometric enrollment deletion.
- Account deletion or a documented secure account-deletion workflow.
- Clear information about data retention and external services.

Ensure destructive operations are confirmed and properly handled on the backend.

---

## 10. PHASE FIVE — RECURRING TASKS AND REMINDERS

After stabilizing existing modules and the dashboard, implement household tasks and recurring reminders.

Do not create a separate, disconnected reminder system if an existing scheduling architecture can be extended safely.

### 10.1 Household task functionality

Support:

- Task title and description.
- Due date and time.
- Priority.
- Category.
- Status.
- Optional household member assignment.
- Optional vendor association.
- Completion timestamp.
- Creation and modification timestamps.
- Recurring rules where appropriate.

Use an explicit and validated recurrence model.

Support common patterns such as:

- Daily.
- Weekly.
- Monthly.
- Selected weekdays.
- Custom intervals where practical.

Handle month-end and daylight-saving/timezone edge cases appropriately.

Do not implement recurrence by blindly adding a fixed number of milliseconds to a timestamp.

### 10.2 Reminders

Support:

- One-time reminders.
- Recurring reminders.
- Snooze.
- Complete.
- Reschedule.
- Dismiss.
- Notification permission handling.
- Notification rescheduling after edits.
- Timezone and daylight-saving correctness.
- Duplicate prevention.
- Notification cancellation when the associated record is removed.

Clearly distinguish local notifications from server push notifications.

Use the capabilities already configured in the project. Do not claim notifications work while the app is killed or on every device unless this has been verified on the relevant platform.

### 10.3 Useful household scenarios

Include practical workflows such as:

- Electricity and utility bill reminders.
- Water purifier servicing.
- AC servicing.
- Gas cylinder reminders.
- Medication or appointment reminders where user-controlled and appropriate.
- Monthly household maintenance.
- Recurring grocery needs.
- Cleaning and household chores.

These are examples of use cases, not preloaded personal information.

The user must control what gets stored and scheduled.

---

## 11. PHASE SIX — HOUSEHOLD SHARING, EXPENSES, AND HOME MAINTENANCE

Implement these modules only after the current authorization architecture is understood and household scoping is secure.

Do not expose records across users by weakening existing RLS.

### 11.1 Household and membership

Design a secure household model supporting:

- Household creation.
- Invitations.
- Membership.
- Role-based permissions.
- Membership revocation.
- Household switching if applicable.
- Household-scoped data ownership.

Define and document roles such as owner, admin, and member based on actual product needs.

Use secure invitations with expiration and revocation.

Prevent unauthorized access to household records even if a user guesses or obtains a record ID.

Review all existing user-owned tables before introducing shared access.

Do not migrate all data into household ownership without a migration plan, compatibility handling, and tests.

Preserve existing users' records.

### 11.2 Expense tracking

Implement a simple household expense ledger.

Potential fields:

- Amount.
- Currency, defaulting to INR.
- Category.
- Date.
- Description.
- Optional vendor.
- Optional household member.
- Payment method if necessary.
- Optional receipt attachment.
- Creation and modification timestamps.

Features:

- Add, edit, and delete expenses.
- Category summaries.
- Monthly totals.
- Date-range filtering.
- Vendor-linked expenses.
- Simple charts and reports.
- CSV export where appropriate.
- AI-assisted expense entry with user review.

Use integer minor units (paise) or a suitable exact decimal representation. Avoid floating-point arithmetic for financial calculations.

Do not connect bank accounts or initiate payments without a separately approved and secure integration.

Do not invent financial data.

### 11.3 Home assets and maintenance

Introduce a practical home-maintenance register.

Possible entities:

- Household assets.
- Appliance details.
- Purchase or installation date.
- Warranty details.
- Service history.
- Maintenance tasks.
- Related vendors.
- Reminders.
- Attachments where useful.

Examples include ACs, refrigerators, water purifiers, washing machines, and other household appliances.

Reuse the vendor, task, reminder, and appointment modules wherever possible.

Avoid building an unnecessarily complex inventory or ERP system.

---

## 12. DATABASE AND SUPABASE ENGINEERING

Review all existing migrations and policies before changing the schema.

The project guide documents profiles, messages, vendors, grocery_lists, grocery_items, appointments, helpers, and attendance_logs.

It also describes six existing migrations and RLS based on auth.uid() ownership.

Verify the actual schema and migration history.

### 12.1 Migration requirements

For every schema change:

- Create a new ordered migration.
- Never silently rewrite an already-applied production migration.
- Avoid destructive changes unless necessary and explicitly documented.
- Add suitable foreign keys, indexes, constraints, and defaults.
- Use appropriate timestamp and timezone handling.
- Preserve referential integrity.
- Include safe backfills when required.
- Make migration steps reviewable and repeatable.
- Document rollback or recovery considerations.

Potential new entities may include tasks, reminders, households, household_members, expenses, home_assets, maintenance_records, and an audit/event table.

These are proposals. Reuse or extend existing structures where appropriate rather than duplicating functionality.

### 12.2 Row-Level Security

RLS is mandatory for user and household data.

For every relevant table, define and test:

- SELECT policies.
- INSERT policies.
- UPDATE policies.
- DELETE policies.
- Ownership or household membership rules.
- Role restrictions.
- Related-record authorization.
- Storage access rules.

Never trust client-side filtering as an authorization boundary.

Never expose Supabase service-role keys to the mobile app.

Do not allow an authenticated user to insert arbitrary owner IDs or household IDs without server-side membership validation.

Test with at least two unrelated users and multiple household roles.

### 12.3 Server-side validation

Validate all untrusted input in Edge Functions and other privileged server operations.

Apply:

- Input schema validation.
- Authorization checks.
- Rate limits and abuse controls where practical.
- Idempotency for retryable writes.
- Safe logging.
- Consistent error responses.
- Timeouts and bounded retries.

Do not return database internals, access tokens, provider secrets, or sensitive debugging details to the client.

### 12.4 API and database documentation

Maintain:

- Database schema documentation.
- Migration history.
- RLS policy documentation.
- Edge Function contracts.
- Environment variable documentation.
- AI tool schemas.
- Important architecture decisions.

---

## 13. OFFLINE-FIRST BEHAVIOR AND DATA SYNCHRONIZATION

The supplied project describes an offline mutation queue and connectivity handling.

Audit the existing implementation before modifying it.

Offline functionality must be reliable, understandable, and safe.

### 13.1 Required sync behavior

Support, as appropriate:

- Offline reads from cached data.
- Offline grocery edits.
- Offline task and reminder changes when feasible.
- Offline attendance capture.
- Durable pending mutation queue.
- Connectivity restoration.
- Retry with bounded exponential backoff and jitter.
- Duplicate delivery prevention.
- Conflict handling.
- Server acknowledgment.
- Clear pending, syncing, synced, and failed states.

Never remove a queued mutation merely because a network request was attempted.

Remove or mark it complete only after a valid server acknowledgment or an explicitly documented terminal resolution.

### 13.2 Idempotency

Give queued writes stable mutation identifiers.

Use server-side idempotency or equivalent uniqueness constraints where appropriate.

Protect against duplicate records when a user retries, an app restarts, or a network response is lost.

Ensure each mutation has a clear state transition and retry policy.

### 13.3 Conflict resolution

Define conflict policies by operation type.

Examples:

- Grocery checkboxes may use a well-defined last-write or version-based strategy.
- Financial records should not silently overwrite conflicting changes.
- Attendance records need auditability.
- Appointment changes should detect relevant conflicts.
- Deleted records should not be unintentionally resurrected.

Do not apply one generic conflict strategy to every data type.

### 13.4 Offline acceptance tests

Test:

- Airplane mode.
- App termination while mutations are queued.
- Device restart where practical.
- Reconnect and retry.
- Duplicate request delivery.
- Expired sessions.
- Permission or authorization failure.
- Stale cached records.
- Conflicting edits.
- Server rejection.
- Partial synchronization.

The user must be able to tell whether data is local, pending, synchronized, or failed.

---

## 14. SECURITY, PRIVACY, AND DATA PROTECTION

Treat security as a development requirement, not a final checklist.

### 14.1 Secrets

- Keep Anthropic, OpenAI, SMS, and privileged Supabase secrets on the server.
- Use environment variables or the deployment platform's secret manager.
- Never hardcode real secrets in the repository.
- Never log API keys, access tokens, OTPs, or sensitive personal data.
- Do not place secrets in Expo public environment variables.
- Do not expose service-role credentials in mobile bundles.

Provide safe .env.example files containing placeholders only.

### 14.2 Authentication

Review OTP authentication, session refresh, sign-out, expired sessions, unauthorized API requests, and account deletion.

Use appropriate rate limiting and abuse protections.

Never log authentication codes.

### 14.3 Personal and household data

Minimize collection and retention.

Provide transparent user controls for data deletion and privacy settings.

Avoid sending unnecessary household information to AI providers.

Only send the relevant minimum context required for an AI operation.

Do not use household messages or personal records for analytics unless the product has a valid, transparent, consented purpose.

Ensure external AI and transcription calls are covered by clear privacy information.

### 14.4 Biometrics and location

Treat biometric templates, face images, attendance information, and location data as sensitive.

Keep face data local as specified by the existing product design.

Do not add cloud face storage or server-side face recognition without a separate explicit architecture review and consent model.

Request camera, microphone, location, and notification permissions only when needed.

Explain why permissions are requested.

Offer manual alternatives when permissions are denied.

### 14.5 Logging and analytics

Use structured, privacy-conscious logs.

Add crash reporting only after verifying configuration and data minimization.

Analytics must not capture secrets, full chat contents, audio, face data, or unnecessary personal records.

Respect consent and user privacy preferences.

---

## 15. INDIA-FIRST LOCALIZATION AND ACCESSIBILITY

Ensure localization is part of the architecture rather than a final translation exercise.

### 15.1 Language

Support English and Hindi throughout all user-facing screens.

Audit hardcoded strings and move them into localization resources.

Avoid mixing untranslated technical labels into Hindi screens.

Use natural, understandable language.

Support mixed-language voice input where the underlying service allows it.

Make language switching reliable without requiring users to reinstall the app or lose data.

### 15.2 Dates, times, and money

Use:

- Asia/Kolkata for household-local date and time behavior unless a household explicitly selects another timezone.
- INR for default household currency.
- Appropriate Indian date and number formatting.
- Correct UTC/local conversion at the storage and display boundaries.

Do not store ambiguous local timestamps without a defined timezone strategy.

Handle date-only values separately from timestamps where appropriate.

### 15.3 Units and products

Support common household quantities and units, including pieces, packets, kilograms, grams, litres, millilitres, and other practical units.

Do not silently convert units when doing so could change the intended quantity.

Preserve the user's original wording when helpful.

### 15.4 Accessibility

Implement appropriate:

- Screen-reader labels.
- Dynamic font sizing.
- Contrast.
- Touch targets.
- Focus behavior.
- Keyboard navigation where relevant.
- Voice and text alternatives.
- Accessible error messages.

---

## 16. NOTIFICATIONS AND EXTERNAL INTEGRATIONS

### 16.1 Notifications

Audit the existing expo-notifications implementation.

Support the notification types that are actually implemented:

- Appointment reminders.
- Task reminders.
- Household reminders.
- Relevant sync or action status when useful.

Handle permission denial gracefully.

Ensure notification schedules are updated or cancelled when associated records change.

Do not promise background behavior beyond what the selected Expo workflow and device platform support.

Test on actual devices where available.

### 16.2 WhatsApp

Use the supported WhatsApp deep-link workflow.

Generate safe, properly encoded message text.

Allow the user to review the message before opening WhatsApp.

Do not claim a message was delivered or read merely because WhatsApp was opened.

Do not automate or bypass WhatsApp consent or platform restrictions.

Clearly distinguish:

- Message prepared.
- WhatsApp opened.
- Message sent by the user.
- Delivery confirmed, only if an authorized integration actually provides that information.

### 16.3 SMS and external providers

Use real integrations only where credentials and provider configuration exist.

Keep provider-specific functionality behind a service layer.

Provide graceful fallbacks if a provider is not configured.

Never simulate a successful external message, appointment booking, payment, or purchase.

Document any provider setup that requires my account or manual approval.

---

## 17. TESTING AND QUALITY ASSURANCE

Create a meaningful testing strategy around real user journeys.

Do not merely add superficial tests that assert a component renders.

### 17.1 Unit tests

Test:

- Validation schemas.
- Date and time handling.
- Recurrence calculations.
- Currency arithmetic.
- Grocery parsing transformations.
- AI tool argument validation.
- AI action state transitions.
- Idempotency helpers.
- Offline queue state transitions.
- Permission and fallback logic.

### 17.2 Integration tests

Test:

- Authentication and protected routes.
- Supabase data operations.
- RLS policies.
- Edge Function validation.
- AI tool execution.
- Grocery parsing.
- Appointment creation.
- Reminder scheduling.
- Household authorization.
- Storage access.

Use isolated test data and safe test environments.

Never run destructive tests against production user data.

### 17.3 End-to-end tests

Implement or improve end-to-end coverage using a framework compatible with the actual project.

Prioritize these user journeys:

1. Sign in using OTP in a configured test environment.
2. Open the Home dashboard.
3. Add and edit a vendor.
4. Create a grocery list by text.
5. Parse a grocery list from voice.
6. Correct and save parsed grocery items.
7. Create an appointment through the UI.
8. Create an appointment through AI with confirmation.
9. Create and complete a household task.
10. Schedule, snooze, and complete a reminder.
11. Record attendance using a permitted method.
12. Verify manual attendance fallback.
13. Use a supported workflow offline and synchronize.
14. Verify that an unauthorized user cannot access another user's records.
15. Verify household role restrictions.
16. Verify that a failed AI tool call is not reported as successful.

### 17.4 Regression testing

After each meaningful milestone:

- Run TypeScript.
- Run linting.
- Run relevant unit tests.
- Run relevant integration tests.
- Validate the Expo configuration.
- Run an appropriate build or export.
- Check for runtime errors where possible.
- Fix regressions before proceeding.

Do not disable failing tests just to obtain a green build.

Do not remove validation or authorization to make tests pass.

### 17.5 Quality gates

A feature is complete only when:

- The UI works.
- The underlying business logic works.
- Data is persisted correctly.
- Authorization is enforced.
- Errors are handled.
- Relevant tests pass.
- The feature is localized.
- It works with the existing navigation and design system.
- Documentation is updated.

---

## 18. DEVELOPMENT ROADMAP AND EXECUTION ORDER

Use the supplied roadmap as the starting sequence, but adjust it based on the actual repository audit.

Work in small, coherent, testable milestones.

### MILESTONE 1 — Stabilize the existing MVP

Objectives:

- Complete the repository audit.
- Fix critical type, runtime, and build issues.
- Verify authentication and Supabase setup.
- Verify existing CRUD flows.
- Review RLS.
- Audit offline synchronization.
- Identify placeholder biometric functionality.
- Fix critical bugs and error states.
- Establish regression tests.

Deliverable:
A stable and documented baseline with a verified feature inventory.

### MILESTONE 2 — Connect the product

Objectives:

- Build the Today at Home dashboard.
- Establish the shared design system.
- Create reusable AI action contracts.
- Connect the AI assistant to real, authorized household records.
- Implement structured action previews and confirmation.
- Connect AI actions to existing feature screens.
- Improve error and sync status presentation.

Deliverable:
A coherent application in which the dashboard, assistant, vendors, groceries, and appointments work together.

### MILESTONE 3 — Recurring productivity

Objectives:

- Implement tasks and reminders.
- Add recurrence and notification scheduling.
- Improve offline synchronization.
- Add reusable grocery lists and replenishment suggestions.
- Add appropriate AI tools for these workflows.

Deliverable:
Reliable day-to-day household task and reminder management.

### MILESTONE 4 — Household management

Objectives:

- Design and implement household membership and roles.
- Migrate existing data safely if required.
- Implement expense tracking.
- Implement home assets and maintenance records.
- Connect these features to the assistant and dashboard.
- Complete household-level RLS and authorization tests.

Deliverable:
A secure shared-household foundation and connected household-management modules.

### MILESTONE 5 — Beta and release readiness

Objectives:

- Conduct full regression testing.
- Validate Android and iOS behavior where available.
- Replace placeholder assets.
- Verify production authentication and SMS configuration.
- Verify Supabase production configuration.
- Deploy and verify Edge Functions when authorized.
- Configure crash reporting and privacy-conscious analytics.
- Complete store metadata and privacy documentation.
- Prepare release and rollback instructions.

Deliverable:
A release candidate with a documented deployment and beta-testing process.

Do not skip earlier quality gates in order to begin adding advanced features.

---

## 19. HOW YOU MUST WORK

This section is especially important.

### 19.1 Work directly in the repository

When you have repository and filesystem access:

- Inspect the existing files before editing them.
- Make changes directly in the working tree.
- Use the existing package manager.
- Follow existing conventions unless there is a concrete reason to change them.
- Add complete implementations, not pseudocode.
- Update all affected imports, types, tests, and documentation.
- Keep changes focused and reviewable.
- Avoid unnecessary rewrites.
- Avoid replacing entire files when a small, safe change is sufficient.
- Never overwrite user work without checking the diff.
- Never commit, push, publish, deploy, or delete production resources without the necessary authorization.

If Git is available, inspect the current branch and working tree before making changes.

Preserve unrelated uncommitted user changes.

### 19.2 Do not ask unnecessary questions

Make sensible engineering decisions independently when the requirements and existing architecture provide sufficient guidance.

Do not ask me to choose between routine implementation details.

Do ask me when a decision requires:

- Real credentials or account access.
- Paid services or material expenditure.
- Destructive data changes.
- Production deployment approval.
- Legal or privacy decisions requiring my approval.
- An irreversible change to user data.
- A product decision that cannot reasonably be inferred from the supplied documents.

When blocked, continue with all independent work.

Use placeholders for missing secrets and document the exact setup steps.

Never fabricate credentials, API responses, successful deployment results, or external integration status.

### 19.3 Make incremental progress

Do not attempt a massive, unreviewable rewrite.

For each milestone:

1. Identify the precise scope.
2. Inspect affected files.
3. Implement the changes.
4. Run relevant checks.
5. Fix issues.
6. Review the diff.
7. Update documentation.
8. Summarize the actual results.
9. Move to the next logically dependent task.

If the environment supports persistent task tracking, maintain a checklist and update it as work progresses.

If you run out of context, stop at a coherent checkpoint and record exactly what remains, including files changed, commands run, errors, and the next actions.

Never claim an entire project is finished simply because one screen or one milestone is complete.

### 19.4 Report progress honestly

At the end of each substantial milestone, provide:

- Features implemented.
- Important files created or modified.
- Database migrations added.
- Tests and commands executed.
- Actual pass/fail results.
- Known limitations.
- Missing secrets or external setup.
- Security or migration concerns.
- Next milestone and remaining tasks.

Distinguish code completed from code verified.

Distinguish local verification from device testing.

Distinguish successful deployment from deployment instructions.

---

## 20. REPOSITORY AND CODE QUALITY STANDARDS

Follow these engineering standards throughout the project.

### TypeScript and architecture

- Use strict TypeScript.
- Avoid `any` unless there is a documented, narrowly justified reason.
- Avoid broad type assertions and unsafe casts.
- Use shared types and validation contracts where appropriate.
- Keep components focused and reusable.
- Keep business logic out of UI components where practical.
- Use service and repository layers consistently with the existing code.
- Avoid duplicate API calls and conflicting state ownership.
- Avoid unnecessary global state.
- Use React Query for server state and caching when consistent with the existing project.
- Use Zustand for appropriate client-side state.
- Clean up subscriptions, listeners, and asynchronous effects.
- Avoid stale closures and unhandled promises.

### Error handling

Use a consistent error model.

Provide actionable user-facing errors without exposing internal implementation details.

Log useful diagnostic information without leaking sensitive data.

Distinguish validation errors, authorization errors, network failures, timeouts, and provider failures.

### Performance

Avoid:

- Unnecessary rerenders.
- Excessive database requests.
- Unbounded AI context history.
- Repeated image downloads.
- Large synchronous operations on the UI thread.
- Unbounded offline queues or retry loops.

Use pagination or bounded queries where appropriate.

Optimize after identifying real performance issues rather than adding complexity without evidence.

### Maintainability

Use clear naming, predictable folders, typed interfaces, focused functions, and concise comments.

Document non-obvious business rules and security decisions.

Do not leave critical functionality as TODO comments, fake implementations, hardcoded demo responses, or empty event handlers.

If a feature cannot be completed because an external dependency is missing, implement the safe integration boundary and clearly document the blocker.

---

## 21. RELEASE, DEPLOYMENT, AND HANDOVER

Prepare HomeGenie for a controlled beta and production release.

Do not deploy automatically to a live environment without my authorization.

### 21.1 Environment configuration

Create or update:

- .env.example
- Supabase environment documentation.
- Anthropic API configuration instructions.
- OpenAI transcription configuration instructions.
- SMS/OTP provider setup instructions.
- EAS configuration instructions.
- Development, staging, and production environment separation.

Document each required variable with:

- Name.
- Purpose.
- Where it must be configured.
- Whether it is public or secret.
- Which service consumes it.
- How to verify it safely.

Never include actual secrets in documentation or example files.

### 21.2 Supabase setup

Document:

- Project configuration.
- Authentication providers.
- Database migrations.
- RLS policy verification.
- Storage buckets and policies.
- Edge Function deployment.
- Edge Function secrets.
- Test user setup.
- Safe staging validation.
- Backup and recovery considerations.

Do not apply production migrations without authorization and a recovery plan.

### 21.3 Mobile build and release

Inspect and update EAS configuration where necessary.

Document and verify:

- Android development build.
- Android release build.
- iOS development and release build where available.
- App identifiers.
- Versioning.
- App icons and splash screen.
- Notification configuration.
- Permission descriptions.
- Store privacy disclosures.
- Signing and credentials requirements.
- Beta distribution.
- Release notes.
- Rollback or hotfix process.

Do not claim iOS or Android release readiness unless the required platform-specific build and configuration have actually been verified.

### 21.4 Final handover documents

Create or update:

- README.md
- docs/REPOSITORY_AUDIT.md
- docs/IMPLEMENTATION_PLAN.md
- docs/DESIGN_SYSTEM.md
- docs/SCREEN_INVENTORY.md
- docs/TECHNICAL_DECISIONS.md
- docs/DATABASE_AND_RLS.md
- docs/AI_ACTIONS.md
- docs/OFFLINE_SYNC.md
- docs/TESTING_AND_QA.md
- docs/DEPLOYMENT.md
- docs/RELEASE_CHECKLIST.md
- docs/KNOWN_LIMITATIONS.md

Use the existing documentation structure if one already exists; do not create redundant documents just to match these names.

---

## 22. FINAL ACCEPTANCE CRITERIA

The project should be considered ready for a release candidate only when the following conditions have been verified or explicitly documented as blocked.

### Product

- The Home dashboard is connected to real application data.
- Navigation is consistent.
- Existing modules work together.
- AI can perform authorized actions through typed tools.
- Users can review and confirm consequential actions.
- The app accurately reports action outcomes.
- Empty, loading, error, and offline states are handled.
- English and Hindi are supported throughout the implemented workflows.

### Engineering

- TypeScript checks pass, or any remaining baseline failures are documented.
- Relevant linting and tests pass.
- No known critical runtime or build errors remain.
- Database migrations are ordered and documented.
- RLS is tested with unrelated users and household roles.
- No privileged secrets are exposed in the mobile client.
- Offline mutations are durable, idempotent, and acknowledgment-based.
- AI actions are validated and authorized server-side.
- No simulated integration is represented as real functionality.

### Privacy and security

- User data is properly scoped.
- Household authorization is enforced.
- Sensitive data collection is minimized.
- Biometric handling follows consent and local-storage requirements.
- Deletion and privacy controls are documented.
- External provider behavior is accurately represented.

### Release

- Build configuration is documented and validated.
- Missing provider credentials are listed.
- Device-specific limitations are listed.
- Beta and deployment instructions are complete.
- Known limitations are documented.
- A final release checklist is provided.

If any criterion cannot be verified, mark it as NOT VERIFIED or BLOCKED. Do not silently treat it as passed.

---

## 23. YOUR FIRST ACTIONS AFTER RECEIVING THIS PROMPT

Begin immediately.

Perform these actions in order:

ACTION 1:
Confirm which reference documents and repository resources you can actually access.

ACTION 2:
Inspect the actual repository and Git working tree. Do not modify files until you understand the current project structure and any existing uncommitted changes.

ACTION 3:
Read the original project guide, the product summary and roadmap, and inspect the generated mockup.

ACTION 4:
Create the repository audit and implementation checklist based on actual source code, not assumptions.

ACTION 5:
Run the available baseline checks and record the real results.

ACTION 6:
Identify critical bugs, security issues, broken user journeys, and missing integrations. Prioritize safety, data integrity, and existing feature reliability.

ACTION 7:
Begin implementation of the highest-priority coherent milestone. The default priority is:

A. Stabilize existing functionality and authorization.
B. Implement the shared design system and Today at Home dashboard.
C. Build the reusable, secure AI action and confirmation layer.
D. Complete recurring tasks, reminders, and synchronization.
E. Implement secure household sharing, expenses, and home maintenance.
F. Complete beta and release preparation.

Change the order only when the repository audit demonstrates a concrete dependency or risk.

ACTION 8:
Continue implementation, testing, fixing, and documenting. Do not stop after creating the roadmap.

Your first response should be a concise statement of the resources you can access, followed by the actual repository audit and baseline findings. If repository access is available, start inspecting the files and executing the work immediately.

I want a real, maintainable, well-designed application—not just a prototype, a mockup, a long plan, or a collection of disconnected code snippets.

Take responsibility for the complete engineering process while keeping me informed of material decisions, actual results, and anything that requires my credentials or approval.

END OF MASTER PROMPT