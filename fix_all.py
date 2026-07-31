import re
import sys

def fix_file(filepath):
    with open(filepath, "r") as f:
        text = f.read()

    # The previous python script:
    # text = re.sub(r'/>\s*\n\s*position=\{coordinates', r'/>\n<Marker\nposition={coordinates', text)
    # The previous sed:
    # sed -i 's/\/> />\n<Marker /g'
    # Actually wait. If sed failed to reverse, let me find all instances of '>\n<Marker' and turn them to '/>'.
    
    text = text.replace(">\n<Marker ", "/> ")
    
    # Let me also fix the marker itself properly.
    # The original file had `<AdvancedMarker`. We replaced it with `<Marker` maybe?
    # Wait, the code was originally:
    # <Map ...> <AdvancedMarker position={coordinates} ... /> </Map>
    # When I did python replace I messed up.
    
    # I should just ensure that position={coordinates ...} is inside a <Marker>
    # Since I don't know the exact broken state, let me look at the file.
    
    with open(filepath, "w") as f:
        f.write(text)

fix_file("src/pages/partner/SetupWizard.tsx")
fix_file("src/pages/partner/tabs/SettingsTab.tsx")
