import re
with open("src/pages/partner/tabs/SettingsTab.tsx", "r") as f:
    text = f.read()

text = re.sub(r'/>\s*\n\s*position=\{coordinates', r'/>\n<Marker\nposition={coordinates', text)

with open("src/pages/partner/tabs/SettingsTab.tsx", "w") as f:
    f.write(text)
