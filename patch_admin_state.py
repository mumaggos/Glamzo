import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

content = re.sub(
    r"const \[tickets, setTickets\] = useState<any\[\]>\(\[\n.*?\]\);",
    "const [supportChats, setSupportChats] = useState<any[]>([]);\n  const [selectedSupportUser, setSelectedSupportUser] = useState<any>(null);\n  const [supportInput, setSupportInput] = useState(\"\");",
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched state")
