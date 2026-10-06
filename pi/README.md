# Meetup kiosk on a Raspberry Pi

Shows https://keyboards.stephendurham.com/kiosk/ full screen: a photo slideshow
next to the business-card QR code, laid out for a 1920x1080 display. Works with
no network — the Pi keeps its own copy and serves it to itself.

## Setup (once, on Raspberry Pi OS with desktop, while online)

    git clone https://github.com/steveed/keyboards.git ~/keyboards
    ~/keyboards/pi/install.sh
    sudo reboot

`install.sh` adds a login autostart entry, an hourly refresh, turns off screen
blanking, and downloads the first copy (about 15 MB) to `~/keyboards-kiosk`.

## At the meetup

Power on. It logs in, tries a quick refresh (gives up after a minute with no
network) and opens the slideshow. To get out of it, press Alt+F4.

## Updating

New photos or text pushed to the site reach the Pi the next time it is online:
hourly, at login, or by running `~/keyboards/pi/update.sh`. The page reloads
itself every six hours. Changes to these scripts need `git -C ~/keyboards pull`.

## If it doesn't start at login

The autostart entry is `~/.config/autostart/keyboards-kiosk.desktop`. If your
desktop ignores it, add this line to `~/.config/labwc/autostart` instead:

    ~/keyboards/pi/kiosk.sh &
