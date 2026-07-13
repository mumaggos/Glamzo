import re

with open("src/pages/Account.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "{ id: 'suporte', icon: HelpCircle, label: 'Apoio Técnico' }\n            <button ",
    "{ id: 'suporte', icon: HelpCircle, label: 'Apoio Técnico' }\n          ].map(tab => (\n            <button "
)

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)
