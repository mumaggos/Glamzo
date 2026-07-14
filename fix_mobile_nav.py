import re
with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

left_array_old = "{\n          { id: 'reservas', icon: Calendar, label: 'Reservas' },\n          { id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' },\n          { id: 'perfil', icon: UserCircle, label: 'Perfil' }\n        ]"
left_array_new = "{\n          { id: 'reservas', icon: Calendar, label: 'Reservas' },\n          { id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' }\n        ]"

right_array_old = "{\n          { id: 'favoritos', icon: Heart, label: 'Favoritos' }\n        ]"
right_array_new = "{\n          { id: 'favoritos', icon: Heart, label: 'Favoritos' },\n          { id: 'perfil', icon: UserCircle, label: 'Perfil' }\n        ]"

text = text.replace(left_array_old, left_array_new)
text = text.replace(right_array_old, right_array_new)

# Let's use regex because spacing might be different.
text = re.sub(
    r"\{\s*id:\s*'perfil',\s*icon:\s*UserCircle,\s*label:\s*'Perfil'\s*\}([\s\n]*\])",
    r"\1",
    text
)
# We need to remove the trailing comma from 'apoio'
text = re.sub(
    r"(\{\s*id:\s*'apoio',\s*icon:\s*MessageSquare,\s*label:\s*'Centro de Apoio'\s*\}),",
    r"\1",
    text
)

# And add perfil to the right
text = re.sub(
    r"(\{\s*id:\s*'favoritos',\s*icon:\s*Heart,\s*label:\s*'Favoritos'\s*\})([\s\n]*\])",
    r"\1,\n          { id: 'perfil', icon: UserCircle, label: 'Perfil' }\2",
    text
)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)

