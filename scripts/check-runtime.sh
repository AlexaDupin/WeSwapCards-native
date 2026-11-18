#!/usr/bin/env bash
# Compare the runtime version of the current code with the build live in each
# store, before committing a config change, building, or publishing an OTA.
#
#   ./scripts/check-runtime.sh
#
# Both runtime versions hash the whole app.config.ts (android and ios sections
# alike), plus packages and native modules. Any config change, even an
# Android-only one, moves BOTH. An OTA only reaches a store build whose runtime
# matches, so a mismatch here means that store build would stop getting updates
# until a new build of that platform is live. When the runtimes move, build and
# release BOTH platforms together.
#
# The live store builds are listed in scripts/store-builds.json. Update it when a
# new build goes live in a store.
#
# Exits 1 if either platform no longer matches its live store build.

set -euo pipefail

cd "$(dirname "$0")/.."

BUILDS_FILE="scripts/store-builds.json"

json_field() {
  node -e '
    let s = "";
    process.stdin.on("data", (d) => (s += d)).on("end", () => {
      const value = process.argv[1].split(".").reduce((o, k) => (o == null ? o : o[k]), JSON.parse(s));
      console.log(value ?? "");
    });
  ' "$1"
}

status=0

printf '%-8s %-28s %-10s %-10s %s\n' "PLATFORM" "LIVE STORE BUILD" "STORE" "LOCAL" "RESULT"

for platform in android ios; do
  build_id=$(json_field "$platform.buildId" <"$BUILDS_FILE")
  label=$(json_field "$platform.label" <"$BUILDS_FILE")

  store_runtime=$(npx eas-cli build:view "$build_id" --json 2>/dev/null | json_field "runtime.version")
  local_runtime=$(APP_ENV=development npx expo-updates fingerprint:generate --platform "$platform" 2>/dev/null | json_field "hash")

  if [ -z "$store_runtime" ] || [ -z "$local_runtime" ]; then
    result="UNKNOWN (could not read a runtime)"
    status=1
  elif [ "$store_runtime" = "$local_runtime" ]; then
    result="OK, OTAs reach this build"
  else
    result="MISMATCH, this build gets no OTA until a new $platform build is live"
    status=1
  fi

  printf '%-8s %-28s %-10s %-10s %s\n' "$platform" "$label" "${store_runtime:0:8}" "${local_runtime:0:8}" "$result"
done

if [ "$status" -ne 0 ]; then
  echo
  echo "Runtimes moved. Build and release BOTH platforms together, or revert the change."
  echo "Details: npx eas-cli fingerprint:compare --build-id <store build id>"
fi

exit "$status"
