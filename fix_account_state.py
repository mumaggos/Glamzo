with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

target = "const [activeTab, setActiveTab] = useState('reservas');"
replacement = "const [isClubModalOpen, setIsClubModalOpen] = useState(false);\n  const [activeTab, setActiveTab] = useState('reservas');"

if target in text:
    text = text.replace(target, replacement)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
