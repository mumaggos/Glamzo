import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# 1. Add import
if "import SalesAgentsTab from '../components/SalesAgentsTab';" not in text:
    text = text.replace("import SuperAdminClub from '../components/SuperAdminClub';", "import SuperAdminClub from '../components/SuperAdminClub';\nimport SalesAgentsTab from '../components/SalesAgentsTab';")
    print("Import added")

# 2. Add state
target_state = "const [activeTab, setActiveTab] = useState<'users' | 'payouts' | 'support' | 'terminal' | 'analytics' | 'cms' | 'partners' | 'pages' | 'funnel' | 'club'>('users');"
replacement_state = "const [activeTab, setActiveTab] = useState<'users' | 'payouts' | 'support' | 'terminal' | 'analytics' | 'cms' | 'partners' | 'pages' | 'funnel' | 'club' | 'sales_teams'>('users');"
if target_state in text:
    text = text.replace(target_state, replacement_state)
    print("State updated")
elif replacement_state not in text:
    # Try generic replace if previous state isn't exact
    text = re.sub(r"useState<'([^']+)'(\s*\|\s*'[^']+'>\('users'\);)", r"useState<'\1'\2 | 'sales_teams'>('users');", text)
    print("State updated via regex")

# 3. Add to desktop tabs menu
# Look for `{ id: 'club', label: 'Glamzo Club & Afiliados', icon: Sparkles }`
if "id: 'sales_teams'" not in text:
    target_tab1 = "{ id: 'club', label: 'Glamzo Club & Afiliados', icon: Sparkles },"
    replacement_tab1 = "{ id: 'club', label: 'Glamzo Club & Afiliados', icon: Sparkles },\n                { id: 'sales_teams', label: 'Equipas de Vendas', icon: Briefcase },"
    if target_tab1 in text:
        text = text.replace(target_tab1, replacement_tab1)
        print("Tab menu updated")

# 4. Add render block
if "<SalesAgentsTab />" not in text:
    target_render = "{activeTab === 'club' && <SuperAdminClub />}"
    replacement_render = "{activeTab === 'club' && <SuperAdminClub />}\n              {activeTab === 'sales_teams' && <SalesAgentsTab />}"
    if target_render in text:
        text = text.replace(target_render, replacement_render)
        print("Render block added")
        
with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
