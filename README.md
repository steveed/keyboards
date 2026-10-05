# Retro Keyboards

Source for https://keyboards.stephendurham.com/ — Amiga keycap sets, their Keyboard Layout
Editor layouts, and the open-source keyboard PCBs they fit. Built by GitHub Pages (Jekyll);
there is no build step to run before pushing.

## Editing

Almost everything is data:

- `_data/keycaps.yml` — the keycap sets: summary, details, status, photos, AmiBay threads.
- `_data/layouts.yml` — KLE layouts (gist id + local copy in `assets/layouts/`).
- `_data/pcbs.yml` — the PCB projects linked to.
- `_config.yml` — site title and contact links (AmiBay profile, email).

Photos are published to `assets/img/keycaps/`.
Drop originals in `keyboard_pics/` (not committed), pick them in `scripts/photos.yml`, then `make photos`. That resizes them and strips EXIF, including GPS. List the published names under a set's `photos:`; the first one becomes the card image.

AmiBay links take a title:

```yaml
amibay:
  - title: Amiga ISO keycaps — run 1
    url: https://www.amibay.com/threads/...
```

## Commands

All run in Docker:

- `make serve` — preview at http://localhost:4000/
- `make build` — build into `_site/`
- `make layouts` — refresh `assets/layouts/` from the gists after editing them in KLE
- `make qr` — write `assets/qr.svg` (for print) and `assets/qr.png` for the site URL;
  override with `make qr SITE_URL=https://…`

## Publishing

Push to `main`, then in the repo's Settings → Pages choose "Deploy from a branch", `main`, `/ (root)`.
