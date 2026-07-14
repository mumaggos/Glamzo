import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# Add to state
state_target = r"const \[activeTab, setActiveTab\] = useState<'users' \| 'payouts' \| 'support' \| 'terminal' \| 'analytics' \| 'cms' \| 'partners' \| 'pages' \| 'funnel'>\('users'\);"
new_state = """const [activeTab, setActiveTab] = useState<'users' | 'payouts' | 'support' | 'terminal' | 'analytics' | 'cms' | 'partners' | 'pages' | 'funnel' | 'club'>('users');"""
text = text.replace(state_target, new_state)

# Add to arrays of tabs (desktop)
tab_target_desktop = r"\{ id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert \},"
new_tab_desktop = """{ id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },
                { id: 'club', label: 'Glamzo Club & Afiliados', icon: Sparkles },"""
text = text.replace(tab_target_desktop, new_tab_desktop)

# We will need to create the view for `activeTab === 'club'`. I will place it after `{activeTab === 'users' && (`
import_target = "import { "
new_import = "import SuperAdminClub from '../components/SuperAdminClub';\nimport { "
if "SuperAdminClub" not in text:
    text = text.replace(import_target, new_import, 1)
    
view_target = r"\{activeTab === 'payouts' && \("
new_view = """{activeTab === 'club' && <SuperAdminClub />}
        
        {activeTab === 'payouts' && ("""
text = text.replace(view_target, new_view)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
