import re

with open("src/components/GlamzoMessenger.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "const isBusinessPage = location.pathname.startsWith('/business/') || location.pathname.startsWith('/store/');",
    "const isBusinessPage = location.pathname.startsWith('/business/') || location.pathname.startsWith('/store/') || (location.pathname.split('/').length === 2 && location.pathname !== '/explore' && location.pathname !== '/favorites' && location.pathname !== '/login' && location.pathname !== '/signup');"
)

content = content.replace(
    "if (location.pathname.startsWith('/business/')) {\n       const slug = location.pathname.split('/business/')[1];",
    "let slug = null;\n    if (location.pathname.startsWith('/business/')) slug = location.pathname.split('/business/')[1];\n    else if (location.pathname.startsWith('/store/')) slug = location.pathname.split('/store/')[1];\n    else if (location.pathname.split('/').length === 2 && location.pathname !== '/explore' && location.pathname !== '/favorites' && location.pathname !== '/login' && location.pathname !== '/signup') slug = location.pathname.split('/')[1];\n\n    if (slug) {"
)

with open("src/components/GlamzoMessenger.tsx", "w") as f:
    f.write(content)
