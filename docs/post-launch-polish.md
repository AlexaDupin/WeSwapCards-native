# Post-launch polish

Non-blocking improvements deferred past the first store submission. Nothing here
should hold up a release; each item names what triggers it and what "done" means.

Source tags follow `store-listing.md`: `[repo]` read from a file, `[user]`
confirmed against something external, `[model]` general knowledge checked against
nothing.

---

## Persist the explorer ID to remove the per-launch loading spinner

`[repo]` Every cold launch shows a brief `PageLoader` while the app restores the
session and re-fetches the profile over the network. Confirmed expected behavior
on the first TestFlight build (2026-09-10), not a bug.

Two things run on each open:

- Clerk restores the cached session asynchronously; `app/index.tsx:52` shows
  `<PageLoader />` while `!isLoaded`.
- `ExplorerHydration.tsx` fetches explorer info from `api.weswapcards.com` on
  every cold start, because `explorerId` lives in in-memory `ExplorerContext`
  and is not persisted — so it starts `null` each launch and blocks on the fetch.

**Improvement.** Persist the explorer ID (and name) to disk, alongside Clerk's
token cache, and hydrate `ExplorerContext` from it on mount so a returning user
renders `/(tabs)/cards` immediately while the profile refresh runs in the
background. Keep the network fetch as the source of truth — treat the persisted
value as a cache, and fall back to the current loading path on a miss or an error.

**Done when:** a returning signed-in user sees the cards screen on launch without
a full-screen spinner, and a stale/absent cache still recovers correctly.

**Watch:** don't let the cached ID outlive a sign-out or an account deletion —
clear it wherever `resetExplorer()` runs, so a deleted or switched account can't
render behind a stale profile.
