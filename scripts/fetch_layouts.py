"""Copy each KLE gist listed in _data/layouts.yml into assets/layouts/."""
import json
import urllib.request

import yaml

for layout in yaml.safe_load(open("_data/layouts.yml")):
    url = f"https://api.github.com/gists/{layout['gist']}"
    with urllib.request.urlopen(url) as resp:
        files = json.load(resp)["files"]
    content = next(f["content"] for name, f in files.items() if name.endswith(".kbd.json"))
    with open(f"assets/layouts/{layout['file']}", "w") as out:
        out.write(content)
    print(f"{layout['file']}: {len(content)} bytes")
