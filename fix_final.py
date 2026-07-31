import sys

def view_around(filepath):
    with open(filepath, "r") as f:
        lines = f.readlines()
    for i, line in enumerate(lines):
        if "position={coordinates" in line:
            print(f"--- {filepath} line {i} ---")
            for j in range(max(0, i-5), min(len(lines), i+6)):
                print(f"{j+1}: {lines[j].rstrip()}")
            break

view_around("src/pages/partner/SetupWizard.tsx")
view_around("src/pages/partner/tabs/SettingsTab.tsx")
