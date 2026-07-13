import re

with open("src/pages/Account.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "import { useAuth }\nimport ClientMessages from '../components/ClientMessages';\nimport SupportChat from '../components/SupportChat'; from '../hooks/useAuth';",
    "import { useAuth } from '../hooks/useAuth';\nimport ClientMessages from '../components/ClientMessages';\nimport SupportChat from '../components/SupportChat';"
)

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)
