import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

states_injection = """  const [selectedSalon, setSelectedSalon] = useState<Business | null>(null);
  const [eliteTab, setEliteTab] = useState<'overview' | 'stripe' | 'catalog' | 'edit'>('overview');"""

content = re.sub(
    r"const \[selectedSalon, setSelectedSalon\] = useState<Business \| null>\(null\);",
    states_injection,
    content
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched state for elite tab")
