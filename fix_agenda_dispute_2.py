import re

with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "business_id: business.id,\n        title: disputeReason,",
    "business_id: business.id,\n        initiator_id: business.owner_id,\n        title: disputeReason,"
)

with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(text)

