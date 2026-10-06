#!/usr/bin/env bash
# One-time setup on Raspberry Pi OS (desktop): start the kiosk at login,
# refresh the copy hourly when online, and stop the screen blanking.
set -euo pipefail
here=$(dirname "$(readlink -f "$0")")
chmod +x "$here"/*.sh

mkdir -p "$HOME/.config/autostart"
cat > "$HOME/.config/autostart/keyboards-kiosk.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Keyboards kiosk
Exec=$here/kiosk.sh
DESKTOP

( crontab -l 2>/dev/null | grep -v keyboards-kiosk-update || true
  echo "17 * * * * $here/update.sh >/dev/null 2>&1 # keyboards-kiosk-update" ) | crontab -

if command -v raspi-config >/dev/null; then
  sudo raspi-config nonint do_blanking 1   # 1 = blanking off
fi

"$here/update.sh" || echo "install: no network yet; run update.sh once you are online"
echo "install: done. Log out and back in (or reboot) to start the kiosk."
