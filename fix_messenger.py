import re

with open("src/components/GlamzoMessenger.tsx", "r") as f:
    content = f.read()

content = content.replace("const [isOpen, setIsOpen] = useState(false);", "const [isOpen, setIsOpen] = useState(false);\n  const [isStoreOnline, setIsStoreOnline] = useState(false);")

content = content.replace("if (data?.profiles?.last_active) {", "const p = Array.isArray(data?.profiles) ? data?.profiles[0] : data?.profiles;\n      if (p?.last_active) {")
content = content.replace("const last = new Date(data.profiles.last_active).getTime();", "const last = new Date(p.last_active).getTime();")

with open("src/components/GlamzoMessenger.tsx", "w") as f:
    f.write(content)
