# Plan: Push Notifications for New Chat Messages (iOS + Android)

## Context

WeSwapCards chat is currently **polling-based** — there is no real-time
mechanism, so a user only learns about a new message when they next open/refresh
the app. The goal is to notify the **recipient** of a new chat message via native
push on iOS and Android, using **Expo's push service** (one token + one HTTP
call abstracting APNs and FCM).

Current state (verified):
- Mobile: Expo **SDK 54**, `newArchEnabled: true`, expo-router, **Clerk** auth.
  `expo-notifications` is **not installed**. `app.json` has **no**
  `ios.bundleIdentifier` / `android.package` and no EAS `projectId` yet.
- Backend (`/var/www/html/WeSwapCards/back`, Express 4 + `pg` + Clerk): new
  messages go through `POST /chat/:conversationId` →
  `chatController.insertNewMessage` (`app/controllers/api/chat.js`), and
  `datamapper.insertNewMessage` persists `content, timestamp, sender_id,
  recipient_id, conversation_id`. **No push token storage, no push SDK.**
- Reuse on mobile: `src/lib/axiosInstance.ts` + the Clerk auth-header pattern
  already used in `src/features/dashboard/api/dashboardApi.ts`.

This revision incorporates reviewer feedback (all accepted): correct the device
claim, use a separate token table, derive the explorer from the authenticated
Clerk user (never trust client-sent `explorerId`), keep push-sending out of the
datamapper, conservative v1 notification content, an in-app opt-out, defer badge
counts, and use `expo-constants` for the `projectId`.

---

## Reality check (read first)

- **Expo Go is NOT part of the push test strategy.** SDK 53+ removed remote push
  from Expo Go (Android), and iOS Expo Go can't do real APNs. You must use an
  **EAS development build** (`expo-dev-client`).
- **A physical device is NOT technically mandatory.** Per current Expo docs you
  can obtain a token and test push on: a physical device, an **Android Emulator
  with Google Play services**, or an **iOS Simulator on Xcode 14+ (macOS 13+,
  iOS 16+)**. → So do **not** hard-block registration on `Device.isDevice`.
- **Practical path on your Linux VM = real device + EAS cloud build.** The iOS
  Simulator route needs macOS/Xcode (not on your VM); a Play-services Android
  emulator on a headless VM is heavy. **EAS builds run in the cloud, so the VM is
  not a blocker** — build remotely, install on a real phone via the EAS link.
- **Tunnel is fine** for serving the JS bundle to a dev build
  (`expo start --dev-client --tunnel`); it has nothing to do with push delivery
  (push flows phone → Expo cloud → phone).

> **Rollout decision: Android first, iOS later.** Initial development and testing
> target a **physical Android device** (no paid account needed — only a free
> Firebase/FCM project). **Apple Developer Program enrollment, APNs setup, and all
> iOS build/test steps are deferred to a later phase** to avoid paying the fee
> early. The iOS-specific section below is kept for that later phase; nothing in
> it blocks the Android work. The mobile/back code is written cross-platform from
> the start (using `Platform.OS`), so enabling iOS later is config + credentials,
> not a rewrite.

### Web-version safety guarantee (shared backend)

The Express backend is **shared** by the web app (`/var/www/html/WeSwapCards/front`)
and mobile. This feature must not affect the web version. Verified facts:
- The web sends messages via the **same** `POST /chat/:conversationId` →
  `insertNewMessage` (`front/.../useChatLogic.js`), with identical body fields.
- The web frontend has **no** push / service-worker / web-push / token code and
  **reads no token field** — so new tables/columns/endpoints are invisible to it.

Therefore the change is constrained so the web is untouched:
1. **No `front/` files are modified. Ever.** This feature is mobile + backend only.
2. New `push_token` table, `pushNotificationService`, and `/push-tokens`
   endpoints are **purely additive** — the web never calls them.
3. The **only** shared edit is `insertNewMessage`. It stays
   contract-identical for web: same request body, same `res.status(201)
   .json(result)`. The push is triggered **after the response is sent**,
   fire-and-forget, fully try/catch-wrapped — so web send latency, success, and
   response are **unchanged**, and a push failure can never affect a web request.
4. **Expected (not a regression):** when a *web* user sends a message to a
   recipient who has the mobile app, that recipient gets a push on their phone.
   The web app's own behavior is identical; only the mobile recipient gains a
   notification. Web users have no registered tokens, so nothing is sent to them.

**Delivery flow:**
```
Device → register permission → getExpoPushTokenAsync({projectId})
       → POST /push-tokens (backend derives explorer from Clerk) → store row
New message saved (insertNewMessage)
       → controller asks notification service for recipient's active tokens
       → expo-server-sdk → Expo → APNs/FCM → recipient device
       → tap → deep-link to the conversation
```

---

## Backend steps (`/var/www/html/WeSwapCards/back`)

### B1. Separate token table (multi-device, reinstall, logout, cleanup)
New migration (follow existing `migrations/` style):
```sql
CREATE TABLE "push_token" (
  "id"          int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "explorer_id" int  NOT NULL REFERENCES "explorer"("id") ON DELETE CASCADE,
  "token"       text NOT NULL UNIQUE,          -- ExpoPushToken[...]
  "platform"    text NOT NULL,                 -- 'ios' | 'android'
  "created_at"  timestamptz NOT NULL DEFAULT now(),
  "updated_at"  timestamptz NOT NULL DEFAULT now(),
  "disabled_at" timestamptz                     -- set on DeviceNotRegistered / logout
);
CREATE INDEX "push_token_explorer_idx" ON "push_token"("explorer_id") WHERE "disabled_at" IS NULL;
```
`token` is unique so the same physical device updates one row (upsert on
conflict, re-activating + bumping `updated_at`). Multiple rows per `explorer_id`
= multiple devices.

### B2. Datamapper = data only (no push logic)
Add thin methods next to `insertNewMessage` in `app/models/datamapper.js`:
- `upsertPushToken({ explorerId, token, platform })` — `INSERT ... ON CONFLICT
  (token) DO UPDATE SET explorer_id, platform, updated_at=now(), disabled_at=NULL`.
- `getActivePushTokensForExplorer(explorerId)` — rows where `disabled_at IS NULL`.
- `disablePushToken(token)` — set `disabled_at=now()` (used on invalid-token cleanup & logout).
The datamapper never imports the Expo SDK.

### B3. Notification service module (new layer)
Create `app/services/pushNotificationService.js` (new `services/` dir):
- Holds the `expo-server-sdk` `Expo` instance (`npm i expo-server-sdk`).
- `sendNewMessageNotification({ recipientId, senderName, conversationId })`:
  1. `getActivePushTokensForExplorer(recipientId)`
  2. filter with `Expo.isExpoPushToken`
  3. build conservative message (see B5), chunk, `sendPushNotificationsAsync`
  4. inspect tickets/receipts; on `DeviceNotRegistered` → `disablePushToken(token)`.
- Fully wrapped so it **never throws into the request path**.

### B4. Endpoints — derive explorer from Clerk, never trust the client
Reuse the existing `requireAuth()` + the helper that maps a Clerk user → explorer
(the same mapping used by `checkExplorerAuthorization` / `user.js`).
- `POST /push-tokens` → body `{ token, platform }` **only**. Backend resolves
  `explorer_id` from `req.auth` (Clerk). **If the client sends `explorerId`, the
  backend must verify it equals the authenticated explorer and reject (403) on
  mismatch — it is never used as the source of truth.**
- `DELETE /push-tokens` → body `{ token }`, disables it (logout / opt-out off).
- Add to `app/routers/api/v1.js` next to the existing `/chat` routes, with the
  same `requireAuth()` middleware.

### B5. Trigger on new message — controller orchestrates, web-safe, conservative
In `insertNewMessage` (`app/controllers/api/chat.js`): persist the message, **send
the existing `res.status(201).json(result)` response first**, then resolve
`senderName` and call `pushNotificationService.sendNewMessageNotification(...)`
**fire-and-forget** inside a try/catch (no `await` blocking the response). This
guarantees the shared endpoint adds **zero latency** and **zero failure risk** to
either web or mobile senders — a push error can never fail or delay the message.
This is the only edit to a web-shared file; the request/response contract is
unchanged (see Web-version safety guarantee).

**v1 content is intentionally minimal (privacy + App Store review safety):**
```js
{ title: senderName, body: 'You have a new message', data: { conversationId }, sound: 'default' }
```
Do **not** put message text in the body for v1 — it can leak on lock screens and
draws extra review scrutiny. Full-content previews are a later, opt-in enhancement.

### B6. Respect the in-app opt-out (see M5) server-side
The opt-out's source of truth is the presence/absence of an **active token**:
when a user disables notifications in-app, the client calls `DELETE /push-tokens`
so no active token remains and the service naturally sends nothing. (Optional
belt-and-suspenders: a `notifications_enabled` boolean on `explorer` checked in
the service.)

### B7. Badges — deferred
**No `badge` field in v1.** There is a `/conversation/unread/:explorerId` count,
but keeping an OS badge in sync across devices/reads is error-prone. Revisit once
unread accounting is proven reliable; only then add `badge: totalUnread`.

---

## Mobile steps (`/var/www/html/WeSwapCards-native/mobile`)

### M1. Install
```bash
npx expo install expo-notifications expo-constants expo-dev-client
```
- `expo-constants` → retrieve the EAS `projectId` (required by
  `getExpoPushTokenAsync`).
- `expo-dev-client` → the development build that replaces Expo Go for testing.
- **`expo-device` is optional** and intentionally omitted: current Expo supports
  emulator/simulator push, so a strict `Device.isDevice` gate is undesirable.
  Add it later only if you need device-model telemetry.

### M2. Config (`app.json`)
- Add `ios.bundleIdentifier` and `android.package` (required for any build).
- Add the plugin:
  `["expo-notifications", { "icon": "./assets/images/notification-icon.png", "color": "#ffffff" }]`.
- `extra.eas.projectId` is populated when you run `eas init` (M-order step 1).

### M3. Read the projectId via expo-constants
```ts
import Constants from 'expo-constants';
const projectId =
  Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
// getExpoPushTokenAsync({ projectId })
```

### M4. Registration hook — `src/features/notifications/usePushRegistration.ts`
Called once after Clerk sign-in when the explorer id is known (but the id is sent
for convenience only; the backend re-derives it):
1. `requestPermissionsAsync()` (handles iOS prompt + Android 13+ `POST_NOTIFICATIONS`).
2. **Android**: `setNotificationChannelAsync('default', {...})` — required for
   heads-up display.
3. `getExpoPushTokenAsync({ projectId })`.
4. `POST /push-tokens` with `{ token, platform: Platform.OS }` via `axiosInstance`
   + Clerk auth headers (mirror `dashboardApi.ts`).
5. Subscribe to `addPushTokenListener` to re-register on rotation; on sign-out /
   opt-out call `DELETE /push-tokens`.
Do **not** abort on simulator/emulator.

### M5. In-app opt-out setting (app-level, distinct from OS permission)
Add a "Message notifications" toggle in settings, persisted (e.g. `expo-secure-store`,
already a dependency). Behavior:
- **OFF** → `DELETE /push-tokens` (disable token) and skip registration.
- **ON** → run the M4 flow.
Two **independent** layers, surfaced separately in the UI:
- **OS permission denied** → cannot be re-prompted programmatically; show an
  explainer and deep-link to system settings (`Linking.openSettings()`).
- **App setting OFF** → fully in your control; toggling it on re-registers
  (subject to OS permission still being granted).

### M6. Foreground handler
`Notifications.setNotificationHandler` returning
`{ shouldShowBanner: true, shouldPlaySound: true, shouldSetBadge: false }` so a
new-message notification is visible while the app is open. (`shouldSetBadge:false`
consistent with the no-badge v1 decision.)

### M7. Tap → deep-link into the chat
- `addNotificationResponseReceivedListener` reads `data.conversationId` and routes
  via expo-router to the conversation screen.
- Handle cold start with `getLastNotificationResponseAsync()` on app launch.

### M8. Keep polling
Existing fetch-on-focus stays as the reliability backstop (push is best-effort).

---

## iOS-specific requirements (DEFERRED — later phase, not part of initial work)

- **Apple Developer Program ($99/yr) required** — APNs key + push entitlement
  can't be created without it.
- EAS manages credentials: `eas credentials` / `eas build` creates & uploads the
  **APNs auth key**; the expo-notifications plugin adds the `aps-environment`
  entitlement. No manual certificates.
- Token/push testable on a real iPhone **or** iOS Simulator (Xcode 14+, macOS 13+,
  iOS 16+) — but the Simulator needs a Mac you don't have on the VM, so use a
  **real iPhone via the EAS dev build**.
- Registered test-device UDID needed for an internal-distribution iOS dev build.

## Android-specific requirements

- **FCM v1 credentials**: create a Firebase project, add the Android app, download
  `google-services.json`, upload the FCM v1 service-account key via
  `eas credentials`. Reference the file with `android.googleServicesFile` in
  `app.json`.
- **Android 13+ (API 33) `POST_NOTIFICATIONS`** runtime permission — requested in
  M4; handle denial via M5's OS-settings path.
- **Notification channel mandatory** (Android 8+) — created in M4.
- Test on a real Android **or** an emulator **with Google Play services**; expect
  OEM battery-optimization quirks (see interference section).

## Store-review considerations

- Notifications must be **opt-in-friendly and non-blocking**: the app must work
  with notifications denied (M5 + M8 ensure this).
- Content is **transactional** ("new message"), not marketing — compliant with
  both stores; do not add promotional pushes without separate explicit consent.
- Conservative body (no message text) reduces lock-screen data-leak review risk.
- Declare notification/data usage in **App Privacy** (Apple) and the **Data Safety**
  form (Play). Provide a clear permission-priming rationale before the OS prompt.

---

## Testing checklist (in order)

**Phase 0 — make push possible (do before any backend message wiring):**
1. `eas init` + `eas build:configure`; add bundle id / package; build a **dev
   client** in the cloud:
   `eas build --profile development --platform android` (and `--platform ios` with
   Apple account) → install on a real device via the EAS link.
2. Run `npx expo start --dev-client --tunnel`, open the **dev build** (not Expo Go).
3. Verify **token generation**: log the `ExpoPushToken`.
4. Verify **raw push** by pasting the token into Expo's **Push Notifications Tool**
   (push.expo.dev) — confirms APNs/FCM credentials independent of your backend.

**Phase 1 — backend storage + message trigger, then exercise every state:**
5. Register token → confirm a `push_token` row with the correct `explorer_id`
   **derived from Clerk** (try forging a different `explorerId` in the request →
   expect rejection / ignored).
6. Send a real message A→B and verify B receives it. Then cover:
   - [ ] **Foreground** app (banner via M6)
   - [ ] **Background** app
   - [ ] **Killed / cold-start** app (tap routes correctly via M7)
   - [ ] **Locked screen**
   - [ ] **OS permission denied** (no crash; settings deep-link works)
   - [ ] **App-level notifications disabled** (M5 → no push delivered)
   - [ ] **Invalid/stale token** (uninstall/reinstall → `DeviceNotRegistered` →
         row `disabled_at` set, no repeat sends)
   - [ ] **Multiple devices** for one explorer (all active tokens notified)
   - [ ] **Android notification channel** present (heads-up shows)
   - [ ] **Android 13+ runtime permission** prompt + denial path
   - [ ] **iOS permission flow** (prompt, grant, revoke-in-Settings)
   - [ ] **Tap → deep-link** opens the right conversation from each app state

---

## Recommended order of implementation (Android-first)

**Phase A — Android, end to end (the initial work):**
1. **Firebase/FCM project** (free) + `google-services.json`; `eas init` /
   `eas build:configure`; add `android.package` + `android.googleServicesFile`.
2. **EAS Android dev build** booting on your **physical Android device** (gate for
   everything).
3. **Validate raw push** with the Expo Push Tool (no app/backend code yet).
4. **Mobile** (cross-platform code, tested on Android): install libs, registration
   hook (M4), projectId via constants (M3), Android channel + 13+ permission,
   foreground handler (M6), opt-out (M5).
5. **Backend**: migration (B1), datamapper methods (B2), notification service (B3),
   `/push-tokens` endpoints with Clerk-derived explorer (B4) — all web-safe.
6. **Wire the trigger** in `insertNewMessage` (B5, response-first fire-and-forget)
   + invalid-token cleanup.
7. **Deep-link on tap** (M7) + cold-start handling.
8. Run the **testing checklist** on Android.

**Phase B — iOS (deferred, when ready to pay Apple fee):**
9. Apple Developer enrollment → APNs key via `eas credentials` → `ios.bundleIdentifier`.
10. iOS dev build on a real iPhone; re-run token + raw-push + checklist on iOS.
11. **Store prep**: privacy & data-safety forms for both stores.

**Deferred enhancements:** badge counts (B7), full-message-content previews.

---

## Current architecture that could interfere with reliable delivery

- **No websockets/real-time** — push is the *only* proactive channel; if a push
  is dropped, the user relies on polling. Keep both.
- **Expo Go / Simulator-on-VM** — can't validate push from your current setup;
  dev build on a real device is required in practice.
- **Clerk ↔ explorer mapping** — registration must resolve the explorer from the
  Clerk session; a wrong/forged `explorerId` must be rejected (B4) or pushes go to
  the wrong account.
- **Android OEM battery optimization** (Xiaomi/MIUI, Huawei, Samsung, OnePlus)
  delays/kills background delivery — test a Pixel first, then a problem OEM.
- **DND / Focus modes** silence notifications — check when "nothing arrives."
- **Permission-denied is sticky** — no programmatic re-prompt; needs the
  settings deep-link (M5).
- **Stale tokens** after reinstall/logout — handled by unique-token upsert +
  `DeviceNotRegistered` disabling (B1/B3).
- **Foreground with no handler** — looks broken; M6 prevents it.

---

## Verification (end-to-end)

After implementation: from a real device running the EAS dev build, with the
backend deployed — send a message from account A to account B and confirm B
receives the push in foreground/background/killed states and tapping it opens the
conversation. Confirm token rows are created under the Clerk-derived explorer,
that toggling the in-app setting and OS permission behave independently, and that
a reinstalled device's old token is auto-disabled on the next send.
