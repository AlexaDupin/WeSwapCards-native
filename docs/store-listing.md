# Store listing

Everything typed into App Store Connect and the Play Console, drafted here first so
both stores stay consistent and nothing is improvised into a web form.

**No credentials in this file.** Reviewer account passwords live in the password
manager; see [Reviewer accounts](#reviewer-accounts).

Items marked **DECIDE** need your answer before submission. Items marked ⚠ need
verifying against something outside this repo.

---

## Where this stands (2026-08-19)

Copy is drafted and the questionnaire answers are reasoned through. What stops a
submission today, roughly in the order it has to be dealt with:

1. ⚠ **No store media exists.** No screenshots, no Play feature graphic. This is
   the largest remaining piece of work. See [Store media](#store-media).
2. ⚠ **No reviewer accounts.** Still `PLACEHOLDER`, and email/password sign-in is
   unverified on the production Clerk instance.
   See [Reviewer accounts](#reviewer-accounts).
3. **DECIDE** items: Apple secondary category, and whether the description names
   the source platform.
4. Remaining ⚠ verifications that are answers rather than work: the Sentry DSN
   and log retention questions in [App Privacy](#app-privacy-apple-and-data-safety-play),
   and the partial-failure window on deletion.
5. The store records themselves do not exist yet, which is why
   `submit.production` in `eas.json` is still empty.

Settled since the first draft: the account-deletion cascade is confirmed live in
production, the legal pages are deployed, `app.config.ts` validates the build
configuration and predeclares export compliance, and the app carries a
non-affiliation statement of its own.

---

## Apple: App Store Connect

| Field | Limit | Value |
| --- | --- | --- |
| App name | 30 | `WeSwapCards` |
| Subtitle | 30 | `Swap your duplicate cards` |
| Keywords | 100 | see below |
| Support URL | n/a | `https://weswapcards.com/contact` |
| Marketing URL | n/a | `https://weswapcards.com` |
| Privacy policy URL | n/a | `https://weswapcards.com/privacy` |
| Copyright | n/a | `2026 WeSwapCards` |
| Primary category | n/a | `Lifestyle` |
| Secondary category | n/a | **DECIDE**: `Social Networking`, or leave unset |

Not Entertainment. The app is a collection-management and matching utility, not
entertainment content. Secondary `Social Networking` is defensible given the
matching and messaging, but it also invites closer UGC scrutiny; leaving it unset is
the quieter option.

### Keywords (100 characters)

```
collector,collection,tracker,trading,doubles,missing,complete,exchange,collectible,album,inventory
```

Apple indexes the app name and subtitle separately, so `swap`, `duplicate`, and
`cards` are deliberately absent, since they already appear there and repeating
them wastes the budget. `duplicate` sits in the subtitle and `doubles` here, covering both words
collectors actually type. `chapter` was dropped: it is meaningful inside the app but
weak as a discovery term, and the space went to the utility words (`tracker`,
`inventory`, `album`) that describe what someone would search for. No third-party
brand name is used (see [Naming and IP](#naming-and-ip)).

This is an informed guess. Keyword performance can only really be judged after
launch, so treat it as a first iteration.

### Promotional text (170)

```
More than 1,000 collectors have joined WeSwapCards and completed over 16,000 swaps.
Log your cards and doubles, find who has what you are missing, and agree a swap.
```

Both figures are confirmed and describe the WeSwapCards community as a whole, not
activity through the native app specifically, which is what the wording says. Keep
that framing if the numbers are refreshed later. The app's onboarding
(`src/features/onboarding/data/onboardingSlides.ts`) states only the swaps total,
which is a subset of this claim rather than a contradiction. If the swaps figure is
ever refreshed, update it in both places.

### Description (4000)

```
WeSwapCards helps card collectors complete their collections.

Log what you own and what you have spare, then find the people who can fill your
gaps, and who need the doubles sitting in yours.

LOG YOUR CARDS
Mark the cards you own and the ones you have doubles of. Browse by chapter to see
at a glance what is still missing.

FIND WHAT YOU NEED
Pick a card and see which collectors have it spare. Search works the other way
too: find the people who need the doubles you are holding.

CHAT AND SWAP
Message another collector directly and agree on a swap. Conversations are private
and one to one. The swap itself happens in the app where your cards live.
WeSwapCards is where collectors find each other and settle the details.

KEEP TRACK
Your messages stay organized in one place, so you always know which swaps are
still open. Notifications tell you when someone replies.
```

No pricing sentence: the product page already states the price, and a claim in the
description would go stale the moment that changes.

**DECIDE: factual mention of the source platform.** The description never names it.
A single factual sentence (that the app is an independent companion for collectors
of a particular card set, not affiliated with or endorsed by its publisher) would
help users understand what the app is for, but it is a legal/metadata decision.
See [Naming and IP](#naming-and-ip).

---

## Google Play

| Field | Limit | Value |
| --- | --- | --- |
| App name | 30 | `WeSwapCards: Card Swaps` |
| Short description | 80 | `Log your cards, find collectors who have what you need, and swap.` |
| Full description | 4000 | reuse the Apple description above |
| Category | n/a | `Social` |
| Contact email | n/a | `contact@weswapcards.com` |
| Contact website | n/a | `https://weswapcards.com` |
| Privacy policy URL | n/a | `https://weswapcards.com/privacy` |
| **Account deletion URL** | n/a | `https://weswapcards.com/delete-account` |

Category is chosen independently of Apple's. Play describes Lifestyle with examples
like style guides and event planning; `Social` is the closer functional match for an
app whose core loop is finding and messaging other people.

Play has no keyword field. It indexes the title and both descriptions, so the terms
have to read naturally in the prose rather than being listed.

---

## App Privacy (Apple) and Data Safety (Play)

### What the code actually stores

| Data | Evidence |
| --- | --- |
| Email address | Clerk |
| Username | `explorer` |
| Clerk user id, internal explorer id | `explorer.userid`, `explorer.id` |
| Chat messages | `message` |
| Report reason and free-text comment | `user_report` |
| Card collection (owned, doubles) | `explorer_has_cards` |
| Blocks | `user_block` |
| Expo push token | `push_token` |
| Profile photo | ⚠ Clerk only. The app renders `user.imageUrl` and has no image picker, so it never uploads one. Confirm how Clerk's profile UI is configured. |
| Crash logs, traces | ⚠ Backend `@sentry/node`, active only when `SENTRY_DSN` is set. Confirm the dashboard PII setting and retention, and whether the DSN will be set on o2switch. |
| Server logs, IP | ⚠ o2switch. Confirm retention and what the logs are used for. |

**Not collected.** Nothing in the code or dependencies supports these: location,
contacts, health, financial info, browsing history, advertising identifiers,
analytics. The app requests no runtime permission other than notifications.

### Apple category mapping

| Our data | Apple category |
| --- | --- |
| Email address | Contact Info → Email Address |
| Username, Clerk id, explorer id | Identifiers → User ID |
| Chat messages | User Content → **Emails or Text Messages** (Apple counts private in-app messages here) |
| Report text, card collection, blocks | User Content → Other User Content |
| Profile photo | User Content → Photos or Videos |
| Push token | Identifiers → Device ID |
| Crash logs, traces | Diagnostics → Crash Data, Performance Data |
| IP in server logs | ⚠ Declare by **use**. Security/anti-fraud and diagnostics map differently, and if anything derives location from IP it becomes Coarse Location. Settle the actual use before answering. |

**Tracking:** none. No advertising SDK and no cross-app tracking, so App Tracking
Transparency does not apply.

### Play category mapping

| Our data | Play category |
| --- | --- |
| Email address | Personal info → Email address |
| Username, ids | Personal info → User IDs |
| Chat messages | Messages → Other in-app messages |
| Report text, card collection, blocks | Other user-generated content |
| Profile photo | Photos and videos → Photos |
| Push token | Device or other IDs |
| Crash logs, traces | App info and performance → Crash logs, Diagnostics |

⚠ Play requires declaring data collected by **third-party SDKs** as well as our own
code. Clerk and Expo are the ones in the app; walk their SDK data disclosures before
finalizing.

### Selling, sharing, and processors are three different questions

Do not collapse these into "we don't share data":

- **Selling:** no. Nothing is sold, under either store's definition.
- **Processors:** Clerk (authentication), Expo (push delivery), the SMTP provider
  (report alerts), Sentry (if enabled), o2switch (hosting).
- **Store-defined "sharing":** Play generally excludes qualifying service providers
  from its "shared" definition, so most of the above likely count as processing
  rather than sharing. Apple still expects integrated third-party partners to be
  accounted for in its answers. Answer each store's question in its own terms.

### Encryption in transit

⚠ Do not answer "yes" globally on the strength of our own API. `app.config.ts`
enforces HTTPS for the production base URL, which proves *our* endpoint. It says
nothing about Clerk, Expo push, SMTP, Sentry, or any server-to-server hop. Confirm
each before answering.

⚠ **Keep this section and the published Privacy Policy in step.** If Sentry is
enabled on o2switch, the Privacy Policy must say so before these forms claim it.

---

## App Review notes

```
WeSwapCards helps people who collect digital cards in another app keep track of
which cards they own and which they have spare, and find other collectors to swap
with. Nothing is bought or sold here and no digital goods change hands in the app:
the swap itself happens on the platform where the cards live. WeSwapCards is where
collectors find each other and agree on the details.

An account is required, because the whole app is about matching your collection
against other people's. Demo credentials are provided below.

HOW TO EXERCISE THE MAIN FLOW
1. Sign in with the first demo account.
2. "My cards" shows the collection. Cards can be marked as owned or as a double.
3. "Search" finds collectors who hold a chosen card.
4. "Messages" contains an existing conversation with the second demo account.

USER-GENERATED CONTENT AND MODERATION
Communication is limited to private one-to-one messages. There is no public feed,
no profile wall, and no publicly visible user content.

- Report: open the conversation, tap the actions menu at the top right, then
  "Report this conversation". Reports are stored and emailed to a monitored
  address for human review.
- Block: same menu. A blocked user cannot start a new conversation or send new
  messages, and blocked collectors are hidden from search results.
- Terms of Service, including our position on objectionable content and abusive
  users: https://weswapcards.com/terms
- Contact: contact@weswapcards.com

Reports are reviewed by a person, and we may remove content, restrict features,
suspend an account, or terminate it.

ACCOUNT DELETION
Tap the profile picture in the top right, then "Delete account". What is removed
and what is retained is documented at https://weswapcards.com/delete-account
```

The deletion paragraph deliberately points at the page rather than asserting
"deletes the account and its data", an absolute claim we would have to be able to
defend line by line. See the checklist below.

---

## Deletion claims to verify before submitting

Both stores expect account-associated data to be deleted, including content shared
with other users, unless retention is legally required *and disclosed*.

✅ **Verified against o2switch production, 2026-08-19.**
`account-deletion-cascade.sql` is applied. All four participant FKs report
`confdeltype = 'c'`, so production cascades rather than nulling, and the schema
in the repo is what production enforces. The FK actions below are the behavior,
not a prediction.

This is worth re-running before each submission, since it is the one claim the
stores and the public deletion page both depend on:

```sql
SELECT conname, confdeltype FROM pg_constraint
WHERE conname IN ('conversation_creator_id_fkey','conversation_recipient_id_fkey',
                  'message_sender_id_fkey','message_recipient_id_fkey');
-- 'c' = CASCADE, the expected answer. 'n' = SET NULL, the pre-migration state.
```

With cascade live, the live `/delete-account` page §4 ("your conversations and
the messages in them" are removed) is accurate, and both store questionnaires can
repeat it.

| Item | Behavior | Source |
| --- | --- | --- |
| Clerk account | Deleted first, via `clerkClient.users.deleteUser` | `controllers/api/user.js` |
| `explorer` row | `DELETE FROM explorer` | `models/user.js:52` |
| Card collection | `explorer_has_cards` cascades | schema |
| Push tokens | `push_token` cascades | `migrations/push-token.sql` |
| Blocks | `user_block` cascades, both directions | `migrations/moderation.sql` |
| Reports **you filed** | `user_report.reporter_id` cascades, destroying them with the account | `migrations/moderation.sql:44` |
| Reports **about you** | `reported_id` set null, `reported_name` snapshot **retained** | `migrations/moderation.sql:45` |
| Conversations and messages | Cascade, verified live in prod | `migrations/account-deletion-cascade.sql` |

Still genuinely external, so still worth checking once:

- **Profile photo.** Held by Clerk, expected to go with the Clerk user.
- **Sentry and server logs.** Provider retention, and disclose whatever it is.
- **The partial-failure window.** Clerk deletion succeeds, the backend purge
  fails, and the `user.deleted` webhook has to recover it. Test it deliberately
  rather than assuming the backstop works.

Note the asymmetry in the two report rows: it is deliberate (a user cannot erase
reports against themselves by deleting their account) and the deletion page
discloses the retained snapshot. Worth being able to explain if asked.

⚠ The Play deletion URL must let a **signed-out** user request deletion without
reinstalling or opening the app. The page satisfies this through the email route;
confirm it still reads that way after any edit.

---

## Pre-submission link check

✅ Resolved 2026-08-19. The `native` branch is merged into `main` (zero commits
ahead) and the front end is deployed: the live bundle is now `main.b683065e.js`
and contains all four routes, `/delete-account` included. All four return 200.

All four pages return the same small shell to `curl`, because the site is a React
SPA that renders client-side. That is expected and fine for a reviewer using a
browser, but it means link checkers and crawlers cannot confirm the content. So,
immediately before submitting, open each in a **private window on a phone** and
confirm it renders:

- `https://weswapcards.com/terms`
- `https://weswapcards.com/privacy`
- `https://weswapcards.com/delete-account`
- `https://weswapcards.com/contact`

---

## Store media

⚠ **None of this exists yet.** The repo has brand assets under
`src/assets/images/brand/` (app icon, adaptive icon, splash) which the build
consumes, but no store screenshots and no feature graphic. Both consoles block on
these, so they are the largest remaining piece of work after the deletion blocker.

| Asset | Store | Requirement |
| --- | --- | --- |
| iPhone 6.9" screenshots | Apple | 1290×2796, at least 1, up to 10 |
| iPad screenshots | Apple | **Not needed.** `supportsTablet: false` in `app.config.ts` |
| App icon 1024×1024 | Apple | Taken from the binary, no separate upload |
| Phone screenshots | Play | 1080×1920 or similar 9:16, **at least 2**, up to 8 |
| App icon 512×512 | Play | PNG, uploaded to the console |
| Feature graphic 1024×500 | Play | Required, shown at the top of the listing |

Apple scales the 6.9" set down to the smaller sizes, so one set is enough.

Shoot the same four screens for both stores, matching the review-notes flow:
My cards, search results for a card, a conversation, and the home or dashboard
view. Use the reviewer accounts, so the collections look populated rather than
empty, and check no real user's username is visible in a search result or chat.

`orientation: 'portrait'` means every capture is portrait. No landscape set.

---

## Reviewer accounts

| | Account A | Account B |
| --- | --- | --- |
| Email | `PLACEHOLDER` | `PLACEHOLDER` |
| Password | in password manager | in password manager |
| Username | `PLACEHOLDER` | `PLACEHOLDER` |

Requirements:

- **Email and password sign-in, no one-time codes.** ⚠ Verify on the production
  Clerk instance, where a default that prefers email codes will block a reviewer.
- Both accounts hold a **card collection with doubles**, so search returns results
  rather than an empty state.
- A **conversation already exists** between them, so report and block can be tried
  without a reviewer having to arrange a match first.
- Do not reuse a real user's account.
- **Recovery:** a reviewer may test account deletion, which destroys the account.
  Keep a written recreate procedure and re-check both accounts before each
  submission.

Credentials go in the console's review-notes fields, never in this repo.

---

## Naming and IP

Working decisions, carried into every field above:

- The third-party platform name is **not** used in the Apple keyword field, the
  Apple subtitle, the Play title, or the Play short description.
- A factual mention in the full description is a **DECIDE** item, above.
- A non-affiliation statement is worth including, while recognizing that a
  disclaimer does not by itself create permission to use someone's mark. The web
  Terms already carry one (§7, "No Affiliation with Third-Party Platform").

⚠ Open review items, none of which are copy decisions. Re-checked 2026-08-19,
after the landing page was rebuilt on the web v2 design, which moved these lines
and added one:

- `src/features/home/components/Hero.tsx:44`, "Not affiliated with the official
  WeWard app." Names the platform, but in a disclaimer.
- `src/features/home/components/LandingFooter.tsx:43`, "Not affiliated in any way
  with the official WeWard app." Same shape.
- `src/features/home/components/CatalogueCard.tsx:11`, "New chapters are added as
  they land in WeWard". Descriptive rather than a disclaimer, so this is the one
  closest to plain referential use.
- `app/(auth)/register-user.tsx:207`, "Enter your WeWard username". Arguably
  functionally necessary, unlike the marketing copy.

The old `HeroCard.tsx` reference this list used to carry no longer exists. Net
change since the last review: the two most prominent mentions now carry an
explicit non-affiliation statement in the app itself, matching web Terms §7.
- `src/assets/images/illustrations/onboarding-*.png` and `LandingPageImage.png`,
  panda mascot artwork. The concern is cumulative rather than any single element.
- Chapter imagery comes from **Pexels**;
  `back/app/services/imageIngestionService.js` stores an `image_credit` string that
  the app never displays. Confirm the licence terms against actual use.

---

## Submit configuration

Not added to `eas.json` until the store records exist. An incomplete block fails
confusingly, and placeholders invite committing real identifiers later.

`submit.production.ios` needs `appleId`, `ascAppId`, `appleTeamId`.
`submit.production.android` needs `serviceAccountKeyPath` and `track`.

The Play service-account JSON is already covered by `.gitignore` and `.easignore`
as `play-service-account*.json`. Keep it out of the repo.
