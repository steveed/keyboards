SITE_URL ?= https://steveed.github.io/keyboards/

.PHONY: serve build layouts photos qr

# Preview at http://localhost:4000/keyboards/
serve:
	docker compose run --rm --service-ports jekyll

build:
	docker compose run --rm jekyll sh -c "bundle install --quiet && bundle exec jekyll build"

# Re-copy the KLE layouts from their gists into assets/layouts/.
layouts:
	docker compose run --rm tools python scripts/fetch_layouts.py

# Resize the photos picked in scripts/photos.yml and strip their EXIF/GPS.
photos:
	docker compose run --rm tools python scripts/prep_photos.py

# QR code for business cards: assets/qr.svg (vector, for print) and assets/qr.png.
qr:
	docker compose run --rm tools python scripts/make_qr.py "$(SITE_URL)"
