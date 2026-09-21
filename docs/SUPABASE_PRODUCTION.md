# HomeGenie — Supabase Production Checklist

## 1. Project Setup

- [ ] Create a **separate Supabase project** for production (never share with dev/staging)
- [ ] Enable **Point-in-Time Recovery (PITR)** under Database → Backups (Pro plan required)
- [ ] Set a strong **database password** (Settings → Database → Connection string)
- [ ] Enable **SSL enforcement** (Settings → Database → SSL → Enforce SSL)

---

## 2. Row-Level Security (RLS) Audit

Every table must have RLS enabled with policies scoped to `auth.uid()`.

| Table | SELECT | INSERT | UPDATE | DELETE | Status |
|---|---|---|---|---|---|
| `profiles` | own row | auto-trigger | own row | — | ✅ |
| `messages` | own rows | own user_id | — | own rows | ✅ |
| `vendors` | own rows | own user_id | own rows | own rows | ✅ |
| `grocery_lists` | own rows | own user_id | own rows | own rows | ✅ |
| `grocery_items` | via list owner | via list owner | via list owner | via list owner | ✅ |
| `appointments` | own rows | own user_id | own rows | own rows | ✅ |
| `helpers` | own rows | own user_id | own rows | own rows | ✅ |
| `attendance_logs` | own rows | own user_id | own rows | — | ✅ |

**Verification query** — run this to find any table without RLS:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```
This should return **zero rows**. If any appear, enable RLS immediately.

---

## 3. Auth Configuration

- [ ] **Phone OTP only** — disable email/password, magic link, and social logins in  
      Authentication → Providers (unless you need them later)
- [ ] Set **OTP expiry** to 5 minutes (Authentication → Settings)
- [ ] Enable **rate limiting** on auth endpoints:
  - Sign-in: 10 requests / 5 min per IP
  - OTP send: 5 requests / 5 min per phone
- [ ] Configure **SMS provider** for production (Twilio recommended for India):
  - Authentication → Settings → Phone Auth → SMS Provider → Twilio
  - Set Account SID, Auth Token, Messaging Service SID
  - Verify sender ID / DLT registration for India

---

## 4. Edge Functions — Rate Limits & Security

### Apply rate limiting per function

Create a shared rate-limit helper or use Deno's `Map` with TTL:

```typescript
// supabase/functions/_shared/rate-limit.ts
const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || now > entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}
```

### Recommended limits per function

| Function | Limit | Window | Rationale |
|---|---|---|---|
| `chat` | 20 req | 1 min | Claude API cost control |
| `transcribe` | 10 req | 1 min | Whisper API cost control |
| `parse-grocery` | 15 req | 1 min | Claude API cost control |
| `book-appointment` | 5 req | 1 min | Prevents accidental duplicates |

### Secrets management

- [ ] Store all API keys as **Edge Function secrets** (never in code):
  ```bash
  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
  supabase secrets set OPENAI_API_KEY=sk-...
  ```
- [ ] Verify no secrets in git: `grep -r "sk-ant\|sk-" supabase/functions/`
- [ ] Set **CORS origins** to your app's deep link scheme only (not `*`) in production

---

## 5. Database Performance

- [ ] Add indexes (most already exist from migrations, verify):
  ```sql
  -- Verify these indexes exist:
  SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

  -- Expected indexes:
  -- messages: idx_messages_user_id, idx_messages_created_at
  -- vendors: vendors_user_id_idx
  -- grocery_items: grocery_items_list_id_idx
  -- appointments: idx_appointments_user_date
  -- attendance_logs: idx_attendance_helper_date
  ```
- [ ] Enable **pg_stat_statements** to monitor slow queries:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
  ```
- [ ] Set **statement timeout** to prevent runaway queries:
  ```sql
  ALTER DATABASE postgres SET statement_timeout = '30s';
  ```

---

## 6. Storage

- [ ] `vendor-avatars` bucket: verify RLS policies are in place
- [ ] Set **file size limit** to 5 MB for avatar uploads
- [ ] Enable **image transformation** for avatar thumbnails (Pro plan)
- [ ] No other buckets should exist (face data is on-device only)

---

## 7. Monitoring & Alerts

- [ ] Enable **Database Webhooks** for critical events (optional)
- [ ] Set up **Supabase Dashboard alerts**:
  - Database size approaching limit
  - Auth rate limit breaches
  - Edge Function errors > 5% error rate
- [ ] Forward Edge Function logs to an external service (Sentry, Datadog) via log drain
- [ ] Monitor **monthly API usage** against your plan limits:
  - Free: 500 MB DB, 1 GB storage, 2 GB bandwidth, 500K edge invocations
  - Pro: 8 GB DB, 100 GB storage, 250 GB bandwidth, 2M edge invocations

---

## 8. Backup & Recovery

- [ ] **Daily backups** enabled (free plan: 7-day retention)
- [ ] **PITR** enabled for production (Pro plan: up to 7-day point-in-time recovery)
- [ ] Test a restore to a fresh project at least once before launch
- [ ] Document the restore procedure for your team

---

## 9. Pre-launch SQL Commands

Run these in the SQL Editor on your **production** project:

```sql
-- 1. Verify RLS is enabled on all public tables
SELECT tablename, rowsecurity
FROM pg_tables WHERE schemaname = 'public';

-- 2. Verify no orphaned policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- 3. Check for tables without any policy (security gap)
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' AND p.policyname IS NULL;

-- 4. Verify indexes
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public' ORDER BY tablename;
```
