#!/usr/bin/env bash
# Download the kiosk page and every photo it shows into ~/keyboards-kiosk,
# replacing the old copy only once the new one is complete. Safe to run
# offline: it fails and leaves the last good copy in place.
set -euo pipefail

SITE=${SITE:-https://keyboards.stephendurham.com}
DEST=${DEST:-$HOME/keyboards-kiosk}

tmp=$(mktemp -d "$DEST.new.XXXX")
trap 'rm -rf "$tmp"' EXIT

wget --quiet --timeout=15 --tries=2 --page-requisites --no-host-directories \
  --directory-prefix="$tmp" "$SITE/kiosk/"
[ -s "$tmp/kiosk/index.html" ] || { echo "update: kiosk page missing from download" >&2; exit 1; }

rm -rf "$DEST.old"
[ -d "$DEST" ] && mv "$DEST" "$DEST.old"
mv "$tmp" "$DEST"
rm -rf "$DEST.old"
trap - EXIT
echo "update: $(find "$DEST" -name '*.jpg' | wc -l) photos from $SITE"
