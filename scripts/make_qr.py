"""Write the site's QR code as SVG (for print) and PNG."""
import sys

import segno

qr = segno.make(sys.argv[1], error="q")
qr.save("assets/qr.svg", scale=10, border=2)
qr.save("assets/qr.png", scale=20, border=2)
print(f"assets/qr.svg, assets/qr.png -> {sys.argv[1]}")
