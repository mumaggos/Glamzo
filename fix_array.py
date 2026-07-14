with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Fix missing comma after apoio
text = text.replace(
    "{ id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' }\n            { id: 'perfil', icon: UserCircle, label: 'Editar Dados' },",
    "{ id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' },\n            { id: 'perfil', icon: UserCircle, label: 'Editar Dados' },"
)

# Fix duplicated perfil in desktop array
text = text.replace(
    "{ id: 'favoritos', icon: Heart, label: 'Favoritos' },\n          { id: 'perfil', icon: UserCircle, label: 'Perfil' }\n        ].map(tab => (\n            <button \n              key={tab.id} \n              onClick={() => setActiveTab(tab.id as 'reservas' | 'apoio' | 'perfil' | 'recompensas' | 'favoritos')}",
    "{ id: 'favoritos', icon: Heart, label: 'Favoritos' }\n          ].map(tab => (\n            <button \n              key={tab.id} \n              onClick={() => setActiveTab(tab.id as 'reservas' | 'apoio' | 'perfil' | 'recompensas' | 'favoritos')}"
)

# And check if we still have `{ id: 'perfil', icon: UserCircle, label: 'Perfil' }` in mobile array
# Because I might have broken it.

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)

