#!/usr/bin/env bash
# Runs at login: refresh the local copy if there is a network, serve it on
# localhost, and open it full screen. With no network it shows the last copy.

DIR=${DEST:-$HOME/keyboards-kiosk}
PORT=8128
here=$(dirname "$(readlink -f "$0")")

timeout 60 "$here/update.sh" || echo "kiosk: offline, using the last copy"
if [ ! -f "$DIR/kiosk/index.html" ]; then
  echo "kiosk: no copy yet; run $here/update.sh once while online" >&2
  exit 1
fi

# The page uses root-relative paths (/assets/...), so it needs a web server
# rather than file://.
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$DIR" >/dev/null 2>&1 &
sleep 1

browser=$(command -v chromium || command -v chromium-browser)
exec "$browser" --kiosk --noerrdialogs --disable-infobars --no-first-run \
  --disable-session-crashed-bubble --incognito --password-store=basic \
  --check-for-update-interval=31536000 "http://127.0.0.1:$PORT/kiosk/"
