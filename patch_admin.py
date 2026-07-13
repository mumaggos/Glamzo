import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

# 1. activeTab type
content = re.sub(
    r"useState<'users' \| 'salons' \| 'payouts' \| 'support' \| 'terminal' \| 'analytics' \| 'cms' \| 'partners' \| 'pages' \| 'funnel'>\('users'\);",
    "useState<'users' | 'payouts' | 'support' | 'terminal' | 'analytics' | 'cms' | 'partners' | 'pages' | 'funnel'>('users');",
    content
)

# 2. Sidebar links (remove 'salons')
content = re.sub(
    r"\{ id: 'salons', label: 'Salões de Beleza', icon: Briefcase \},\n\s+",
    "",
    content
)

# 3. Remove salons tab section
content = re.sub(
    r"\{\/\* ==================================================== \*\/\}\s+\{\/\* SECTION 2: GESTÃO DE SALÕES DE BELEZA\s+\*\/\}.*?\{\/\* ==================================================== \*\/\}\s+\{\/\* SECTION 3: PLANÁRIO DE PAYOUTS E COMISSÕES\s+\*\/\}",
    "{/* ==================================================== */}\n              {/* SECTION 3: PLANÁRIO DE PAYOUTS E COMISSÕES                 */}",
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched basic stuff")
