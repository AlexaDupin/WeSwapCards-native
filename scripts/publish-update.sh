#!/usr/bin/env bash
# Publish an OTA update against the EAS environment rather than the local .env.
#
#   ./scripts/publish-update.sh production -m "what changed"
#   ./scripts/publish-update.sh preview    -m "what changed"
#
# A bare `eas update` loads .env, which points at the test stack. EXPO_PUBLIC_*
# values are inlined into the JS bundle, so that publishes a bundle aimed at the
# test backend and test Clerk instance onto whichever branch you named. The
# app.config.ts validation does not catch it: .env sets APP_ENV=development, so
# every production check is skipped and it looks like a clean publish.
#
# Deliberately a shell script rather than an npm script: package.json "scripts"
# is part of the EAS Update fingerprint, so adding one changes the runtime
# version and cuts existing installs off from updates.

set -euo pipefail

ENVIRONMENT="${1:-}"

case "$ENVIRONMENT" in
  production | preview) shift ;;
  *)
    echo "usage: $0 {production|preview} [eas update flags]" >&2
    exit 1
    ;;
esac

exec eas update \
  --branch "$ENVIRONMENT" \
  --environment "$ENVIRONMENT" \
  "$@"
