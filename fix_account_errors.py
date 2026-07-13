import re

with open("src/pages/Account.tsx", "r") as f:
    content = f.read()

# Fix duplicates
content = re.sub(r"import \{ User, MessageSquare, ShieldAlert,([^}]+)MessageSquare, ShieldAlert,", r"import { User, MessageSquare, ShieldAlert,\1", content)
content = re.sub(r"import \{ User, MessageSquare, ShieldAlert,([^}]+)ShieldAlert,", r"import { User, MessageSquare, ShieldAlert,\1", content)
content = re.sub(r"import \{ User, MessageSquare, ShieldAlert,([^}]+)MessageSquare,", r"import { User, MessageSquare, ShieldAlert,\1", content)

# Fix missing state
if "const [messageTab, setMessageTab]" not in content:
    content = content.replace("const [activeTab, setActiveTab] = useState('reservas');", "const [activeTab, setActiveTab] = useState('reservas');\n  const [messageTab, setMessageTab] = useState<'lojas' | 'suporte'>('lojas');")

# Fix missing imports
if "ClientMessages" not in content[:1000]:
    content = content.replace("import { useAuth }", "import { useAuth }\nimport ClientMessages from '../components/ClientMessages';\nimport SupportChat from '../components/SupportChat';")

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)
