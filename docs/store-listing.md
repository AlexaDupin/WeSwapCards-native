# Store listing

Everything typed into App Store Connect and the Play Console, drafted here first so
both stores stay consistent and nothing is improvised into a web form.

**No credentials in this file.** Reviewer account passwords live in the password
manager; see [Reviewer accounts](#reviewer-accounts).

Items marked ⚠ need verifying against something outside this repo. Decisions that
were open are recorded inline with the date they were settled, so the reasoning
survives rather than just the answer.

### How to read the source tags

Claims here are tagged by what actually backs them, because a store doc mixes
things that were checked with things that were assumed, and the two look
identical once written down.

| Tag | Means |
| --- | --- |
| `[cmd]` | Verified by running something, named inline, on the date given |
| `[repo]` | Read out of a file in this repo, cited by path |
| `[web]` | Fetched from the vendor's own live documentation, dated and linked |
| `[user]` | Confirmed by Alexa against a system I cannot reach, e.g. prod DB or a console |
| `[model]` | General knowledge, **checked against nothing.** Treat as a lead |

`[model]` is not a synonym for wrong, but it is the tag to re-check first, and
nothing tagged `[model]` should be typed into a store form as fact.

Untagged prose is reasoning and drafted copy rather than a factual claim.

---

## Where this stands (2026-08-19)

Copy is drafted and the questionnaire answers are reasoned through. What stops a
submission today, roughly in the order it has to be dealt with:

1. ⚠ **No store media exists.** No screenshots, no Play feature graphic. This is
   the largest remaining piece of work. See [Store media](#store-media).
2. ⚠ **Reviewer accounts in progress.** Android pair being created 2026-08-19 on
   a production build; iOS pair waits on the Apple Developer Program. Password
   sign-in against production Clerk is the check that still has to pass.
   See [Reviewer accounts](#reviewer-accounts).
3. Remaining ⚠ verifications that are answers rather than work: the Sentry DSN
   and log retention questions, the IP-in-server-logs declaration, third-party
   SDK disclosures for Clerk and Expo, and the partial-failure window on deletion.
4. The store records themselves do not exist yet, which is why
   `submit.production` in `eas.json` is still empty.

Settled since the first draft: the production build configuration is proven —
an Android build on the real `pk_live_` Clerk instance and the o2switch API
installed and ran (2026-08-19). The whole deletion table is verified against the
production DB (cascade **and** moderation), the legal pages are deployed, both
privacy category mappings are
checked against the vendors' own published taxonomies, `app.config.ts` validates
the build configuration and predeclares export compliance, and the app carries a
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
| Secondary category | n/a | Leave unset |

Decided 2026-08-19: `Lifestyle` alone, no secondary. Apple does not allow the
secondary to repeat the primary, so "Lifestyle only" and "no secondary" are the
same choice.

Not Entertainment. The app is a collection-management and matching utility, not
entertainment content. Secondary `Social Networking` was considered and dropped:
it is defensible given the matching and messaging, but it invites closer UGC
scrutiny for little discovery gain.

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

`[user]` Both figures are confirmed by Alexa and describe the WeSwapCards community as a whole, not
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

Decided 2026-08-19: **the description does not name the source platform.** A
factual non-affiliation sentence was considered and dropped. The store listing is
the most public surface and the one most likely to attract a rights complaint,
and the in-app disclaimers (`Hero.tsx`, `LandingFooter.tsx`) already serve the
users who matter, the ones who have installed. See
[Naming and IP](#naming-and-ip).

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

`[repo]` throughout, except the three ⚠ rows, which name what is external about
them. The evidence column is a table or a service, not an inference.

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

`[web]` Checked against
[Apple's published data-type list](https://developer.apple.com/app-store/app-privacy-details/)
on 2026-08-19. Every category and subtype below exists in Apple's taxonomy as
written, and no mapping needed changing.

| Our data | Apple category |
| --- | --- |
| Email address | Contact Info → Email Address |
| Username, Clerk id, explorer id | Identifiers → User ID |
| Chat messages | User Content → **Emails or Text Messages** |
| Report text, card collection, blocks | User Content → Other User Content |
| Profile photo | User Content → Photos or Videos |
| Push token | Identifiers → Device ID |
| Crash logs, traces | Diagnostics → Crash Data, Performance Data |
| IP in server logs | ⚠ Declare by **use**. Security/anti-fraud and diagnostics map differently, and if anything derives location from IP it becomes Coarse Location. Settle the actual use before answering. |

Two mappings that look like judgement calls but are settled by Apple's own
wording:

- **Chat messages.** Apple defines Emails or Text Messages as covering "subject
  line, sender, recipients, and contents", explicitly including "both SMS and
  non-SMS messages". Private in-app chat belongs here, not in Other User Content.
- **Push token.** Apple's Device ID is "the device's advertising identifier or
  other device-level ID". An Expo push token is device-level, so Device ID is
  right and User ID is not.

**Tracking:** none. Apple defines tracking as linking app data with third-party
data for targeted advertising or ad measurement, or sharing with a data broker.
We do neither, there is no advertising SDK, so App Tracking Transparency does not
apply.

### Play category mapping

`[web]` Checked against
[Play's Data Safety data-type list](https://support.google.com/googleplay/android-developer/answer/10787469)
on 2026-08-19. **One row was wrong** and is corrected below.

| Our data | Play category |
| --- | --- |
| Email address | Personal info → Email address |
| Username, ids | Personal info → User IDs |
| Chat messages | Messages → Other in-app messages |
| Report text, card collection, blocks | **App activity** → Other user-generated content |
| Profile photo | Photos and videos → Photos |
| Push token | Device or other IDs |
| Crash logs, traces | App info and performance → Crash logs, Diagnostics |

The corrected row: "Other user-generated content" is not a top-level category in
Play's form, which is how this doc previously had it. It sits **under App
activity**, alongside App interactions and In-app search history. Looking for it
at the top level of the form will not find it.

`[web]` Play defines **collection** as "transmitting data from your app off a
user's device". Everything in the table above is transmitted to our backend, so
all of it is collected. Nothing here is on-device-only.

⚠ Play requires declaring data collected by **third-party SDKs** as well as our own
code. Clerk and Expo are the ones in the app; walk their SDK data disclosures before
finalizing.

### Selling, sharing, and processors are three different questions

Do not collapse these into "we don't share data":

- **Selling:** no. Nothing is sold, under either store's definition.
- **Processors:** Clerk (authentication), Expo (push delivery), the SMTP provider
  (report alerts), Sentry (if enabled), o2switch (hosting).
- **Store-defined "sharing":** `[web]` Play defines sharing as "transferring user
  data collected from your app to a third party", and explicitly exempts
  **service providers**, meaning entities that "process user data on behalf of
  the developer and based on the developer's instructions". Clerk, Expo, the SMTP
  provider, Sentry, and o2switch all fit that description, so on Play they are
  processing, not sharing, and are not disclosed as shared. Apple frames its
  questions differently and still expects integrated third-party partners to be
  accounted for. Answer each store in its own terms.

The processor list itself is `[repo]`: those are the services the code talks to.

### Encryption in transit

⚠ Do not answer "yes" globally on the strength of our own API. `[repo]`
`app.config.ts` enforces HTTPS for the production base URL, which proves *our*
endpoint and nothing else. It says nothing about Clerk, Expo push, SMTP, Sentry,
or any server-to-server hop, none of which have been checked. Confirm each before
answering.

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

## Deletion behavior, verified in production

Both stores expect account-associated data to be deleted, including content shared
with other users, unless retention is legally required *and disclosed*.

✅ `[user]` **Verified against o2switch production, 2026-08-19,** by Alexa running
the query below directly on the prod DB. `account-deletion-cascade.sql` is
applied: all four participant FKs report `confdeltype = 'c'`, so production
cascades rather than nulling.

This one is `[user]` and not `[cmd]` on purpose. I have no route to that
database, and an earlier draft of this section asserted the opposite state as
"re-verified" on the strength of a month-old note. The tag records who actually
looked.

With cascade live, the live `/delete-account` page §4 ("your conversations and
the messages in them" are removed) is accurate, and both store questionnaires can
repeat it. The query itself is below, covering all eight constraints at once.

| Item | Behavior | Source |
| --- | --- | --- |
| Clerk account | Deleted first, via `clerkClient.users.deleteUser` | `[repo]` `controllers/api/user.js` |
| `explorer` row | `DELETE FROM explorer` | `[repo]` `models/user.js:52` |
| Card collection | `explorer_has_cards` cascades | `[repo]` schema |
| Push tokens | `push_token` cascades | `[repo]` `migrations/push-token.sql` |
| Blocks | `user_block` cascades, both directions | `[user]` prod query, 2026-08-19 |
| Reports **you filed** | `user_report.reporter_id` cascades, destroying them with the account | `[user]` prod query, 2026-08-19 |
| Reports **about you** | `reported_id` set null, `reported_name` snapshot **retained** | `[user]` prod query, 2026-08-19 |
| Conversations and messages | Cascade | `[user]` prod query, 2026-08-19 |

✅ `[user]` **`moderation.sql` confirmed applied in production, 2026-08-19.**
`user_block_blocker_id_fkey`, `user_block_blocked_id_fkey`, and
`user_report_reporter_id_fkey` report `c`; `user_report_reported_id_fkey` reports
`n`. That is the intended asymmetry rather than a gap: reports you filed die with
your account, reports filed *about* you survive it with the username snapshot,
which is exactly what the deletion page discloses.

Every row in this table is now verified against production rather than read off a
migration file.

**What would invalidate this:** a migration that drops and recreates any of these
constraints, or a restore from a pre-migration backup. Nothing else changes an FK
on-delete action, so re-check after a schema change, not on a schedule.

```sql
SELECT conname, confdeltype FROM pg_constraint
WHERE conname IN ('conversation_creator_id_fkey','conversation_recipient_id_fkey',
                  'message_sender_id_fkey','message_recipient_id_fkey',
                  'user_block_blocker_id_fkey','user_block_blocked_id_fkey',
                  'user_report_reporter_id_fkey','user_report_reported_id_fkey');
-- expect c on all but user_report_reported_id_fkey, which is n.
-- An 'n' on reporter_id, or a 'c' on reported_id, means the deletion page and
-- these answers no longer describe what prod does.
```

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

✅ `[cmd]` Resolved 2026-08-19. `git rev-list --count main..native` returns 0, so
the branch is merged, and `curl` confirms the deploy: the live bundle is
`main.b683065e.js`, it contains all four route strings including
`/delete-account`, and all four URLs return HTTP 200.

`[cmd]` covers reachability and that the route exists in the bundle. It does not
cover whether the pages *render* correctly, which is why the manual check below
still stands.

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
these, so they are the largest remaining piece of work.

| Asset | Store | Requirement | Source |
| --- | --- | --- | --- |
| iPhone screenshots | Apple | One set, 6.9" **or** 6.5". 1 to 10 per set. `.png`/`.jpg`/`.jpeg`, **no alpha channel** | `[web]` |
| 6.9" portrait size | Apple | Any of `1260×2736`, `1290×2796`, `1320×2868` | `[web]` |
| 6.5" portrait size | Apple | `1284×2778` or `1242×2688` | `[web]` |
| iPad screenshots | Apple | Not needed, `supportsTablet: false` | `[repo]` `app.config.ts:129` |
| App icon 1024×1024 | Apple | Taken from the binary, no separate upload | `[model]` |
| Phone screenshots | Play | **At least 2**, up to 8 per device type. Min edge 320px, max 3840px, and the long edge may not exceed twice the short one | `[web]` |
| Play screenshot format | Play | JPEG or **24-bit PNG, no alpha**. Recommended: four at `1080×1920` (9:16 portrait) | `[web]` |
| App icon 512×512 | Play | **32-bit PNG with alpha**, max 1024KB | `[web]` |
| Feature graphic | Play | `1024×500`, JPEG or 24-bit PNG, no alpha. Required | `[web]` |

Apple specs fetched from
[App Store Connect Help](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
on 2026-08-19; Play specs from
[Play Console Help](https://support.google.com/googleplay/android-developer/answer/9866151)
the same day. **Re-fetch before you shoot the media.** Apple has moved which
display size is the required one before, and vendor docs change with no signal to
you.

**One iPhone set is enough to submit.** 6.5" is required only if 6.9" is absent,
and Apple scales down the cascade (6.9" → 6.5" → 6.3" → 6.1" → …) for any size
you skip. Apple's own recommendation is to supply both 6.9" and 6.5" for quality,
which is a judgement call about how the listing looks, not a submission blocker.

Note the alpha-channel trap: Play wants the app icon **with** alpha and everything
else **without**, and Apple rejects alpha in screenshots outright. Export
accordingly.

Shoot the same four screens for both stores, matching the review-notes flow:
My cards, search results for a card, a conversation, and the home or dashboard
view. Use the reviewer accounts, so the collections look populated rather than
empty, and check no real user's username is visible in a search result or chat.

`orientation: 'portrait'` means every capture is portrait. No landscape set.

---

## Reviewer accounts

Two pairs, one per store. Inboxes created 2026-08-19.

| | A | B |
| --- | --- | --- |
| **Android email** | `review-android-a@weswapcards.com` | `review-android-b@weswapcards.com` |
| **Android username** | `review-android-a` | `review-android-b` |
| **iOS email** | `review-ios-a@weswapcards.com` | `review-ios-b@weswapcards.com` |
| **iOS username** | `review-ios-a` (planned) | `review-ios-b` (planned) |
| Password | password manager | password manager |

Usernames deliberately match the mailbox and read as obvious test accounts. They
appear in the other account's search results and in the App Review notes, so
nothing here should be mistakable for a real collector.

**Why one pair per store.** A reviewer may test account deletion, which destroys
the account for good. Sharing a single pair across both stores means an Apple
reviewer can break a Play review running concurrently, and the failure arrives as
a rejection rather than as a warning. Separate pairs also keep block and report
state from one review out of the other's way.

Each pair needs its **own** conversation: iOS A ↔ iOS B, and Android A ↔ Android
B. A conversation across pairs does not satisfy the review notes, which tell the
reviewer to find an existing conversation with "the second demo account".

Requirements per pair:

- **Password sign-in must work.** ⚠ `[repo]` The app's sign-in screen
  (`app/(auth)/sign-in.tsx`) submits email and password only, with no
  one-time-code path in the UI. Password must therefore be enabled as a sign-in
  factor on the **production** Clerk instance; if that instance prefers email
  codes, the reviewer is stuck on a screen that cannot ask for one. Verify by
  signing in on a real build, not by reading Clerk's settings page.
- Both accounts hold a **card collection with doubles**, so search returns
  results rather than an empty state. Make the doubles complementary, A holding
  spares that B is missing and vice versa, so both directions described in the
  review notes actually demonstrate.
- A **conversation already exists** in the pair, so report and block can be
  exercised without the reviewer having to arrange a match first.
- Do not reuse a real user's account.
- Re-check both accounts of the pair before each submission. A reviewer may have
  deleted one since last time, and there is no signal when they do.

⚠ **These accounts are visible to real users.** An account holding doubles turns
up in other collectors' search results, and a real user can start a conversation
with it. Decide whether that is acceptable before shooting screenshots on these
accounts, and expect the possibility that a reviewer opens Messages to find an
unexpected real conversation there.

Credentials go in the console's review-notes fields, never in this repo.

### Recreate procedure

`[repo]` Steps follow the actual flows in the app rather than a guess at them.

**Inbox access is required.** Sign-up sends an email verification code
(`app/(auth)/sign-up.tsx`), so whoever recreates an account must be able to read
that mailbox. This is the step that turns a five-minute job into a blocked one if
the inboxes are ever lost.

1. **Sign up** in the app with the account's email and a password from the
   password manager.
2. **Enter the emailed verification code.** Clerk will not create the account
   without it.
3. **Set the username** at the "Enter your WeWard username" step
   (`app/(auth)/register-user.tsx`). The account is not usable until this is
   done, and the username is what the other account sees in search.
4. **Build the collection** in *My cards*: mark cards as owned, and mark several
   as doubles, complementary across the pair.
5. **Create the conversation** from *Swap*: search a card the partner account
   holds spare, open that collector, and send a message
   (`SwapScreen.tsx` routes into `/(modal)/chat/[conversationId]`).
6. **Update the console** if the username changed, since the review notes name it.

---

## Naming and IP

Working decisions, carried into every field above:

- The third-party platform name is **not** used in the Apple keyword field, the
  Apple subtitle, the Play title, or the Play short description.
- The full description does not mention it either, decided 2026-08-19, above.
- A non-affiliation statement is worth including, while recognizing that a
  disclaimer does not by itself create permission to use someone's mark. The web
  Terms already carry one (§7, "No Affiliation with Third-Party Platform").

⚠ Open review items, none of which are copy decisions. `[repo]` `grep` over
`src/` and `app/` on 2026-08-19, after the landing page was rebuilt on the web v2
design, which moved these lines and added one:

- `src/features/home/components/Hero.tsx:44`, "Not affiliated with the official
  WeWard app." Names the platform, but in a disclaimer.
- `src/features/home/components/LandingFooter.tsx:43`, "Not affiliated in any way
  with the official WeWard app." Same shape.
- `src/features/home/components/CatalogueCard.tsx:11`, "New chapters are added as
  they land in WeWard". Descriptive rather than a disclaimer, so this is the one
  closest to plain referential use.
- `app/(auth)/register-user.tsx:207`, "Enter your WeWard username". Arguably
  functionally necessary, unlike the marketing copy.
- `src/assets/images/illustrations/onboarding-*.png` and `LandingPageImage.png`,
  panda mascot artwork. The concern is cumulative rather than any single element.
- Chapter imagery comes from **Pexels**;
  `back/app/services/imageIngestionService.js` stores an `image_credit` string that
  the app never displays. Confirm the licence terms against actual use.

The old `HeroCard.tsx` reference this list used to carry no longer exists. Net
change since the last review: the two most prominent mentions now carry an
explicit non-affiliation statement in the app itself, matching web Terms §7.

---

## Submit configuration

Not added to `eas.json` until the store records exist. An incomplete block fails
confusingly, and placeholders invite committing real identifiers later.

`[model]` `submit.production.ios` needs `appleId`, `ascAppId`, `appleTeamId`.
`submit.production.android` needs `serviceAccountKeyPath` and `track`. Unverified
against the current EAS submit schema — check `eas submit --help` or the Expo docs
when you fill it in, rather than trusting this line.

`[repo]` The Play service-account JSON is already covered by `.gitignore` and
`.easignore` as `play-service-account*.json`. Keep it out of the repo.

`[cmd]` `submit.production` in `eas.json` is currently `{}`, confirmed 2026-08-19.
