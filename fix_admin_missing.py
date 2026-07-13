import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

if "CreditCard" not in content[:1000]:
    content = content.replace("import { Users,", "import { Users, CreditCard, ArrowRightLeft, Package,")

content = content.replace("const [eliteTab, setEliteTab] = useState", "const [isSaving, setIsSaving] = useState(false);\n  const [eliteTab, setEliteTab] = useState")

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

