import re

with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "booking_id: selectedBooking.id,\n        customer_id: selectedBooking.customer_id,\n        business_id: business.id,\n        initiator_id: business.owner_id,",
    "booking_id: selectedBooking.id,\n        business_id: business.id,\n        initiator_id: business.owner_id,"
)

with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(text)

