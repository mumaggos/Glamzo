with open("src/pages/partner/tabs/MessagesTab.tsx", "r") as f:
    text = f.read()

text = text.replace("eq('receiver_id', business.id)", "eq('receiver_id', business.owner_id)")
text = text.replace("filter: `receiver_id=eq.${business.id}`", "filter: `receiver_id=eq.${business.owner_id}`")
text = text.replace("<UniversalInbox myId={business.id} myType=\"partner\" />", "<UniversalInbox myId={business.owner_id} myType=\"partner\" />")

with open("src/pages/partner/tabs/MessagesTab.tsx", "w") as f:
    f.write(text)
