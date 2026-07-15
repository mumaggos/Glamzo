with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# Replace state definition
target_state = "const [activeTab, setActiveTab] = useState<'users' | 'payouts' | 'support' | 'terminal' | 'analytics' | 'cms' | 'partners' | 'pages' | 'funnel'>('users');"
replacement_state = "const [activeTab, setActiveTab] = useState<'users' | 'payouts' | 'support' | 'terminal' | 'analytics' | 'cms' | 'partners' | 'pages' | 'funnel' | 'club'>('users');"
if target_state in text:
    text = text.replace(target_state, replacement_state)
    print("State replaced")
else:
    print("State not found")

# Replace desktop tabs array element
target_tab1 = "{ id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },"
replacement_tab1 = "{ id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },\n                { id: 'club', label: 'Glamzo Club & Afiliados', icon: Sparkles },"
if target_tab1 in text:
    text = text.replace(target_tab1, replacement_tab1)
    print("Tabs replaced")
else:
    print("Tabs not found")

# Insert import
target_import = "import { "
replacement_import = "import SuperAdminClub from '../components/SuperAdminClub';\nimport { "
if "SuperAdminClub" not in text:
    text = text.replace(target_import, replacement_import, 1)
    print("Import added")

# Insert component render
target_render = "{activeTab === 'payouts' && ("
replacement_render = "{activeTab === 'club' && <SuperAdminClub />}\n        \n        {activeTab === 'payouts' && ("
if target_render in text:
    text = text.replace(target_render, replacement_render)
    print("Render added")
else:
    print("Render not found")

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
