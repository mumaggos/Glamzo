import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "business_id: disputeBooking.business_id,\n        reason:",
    "business_id: disputeBooking.business_id,\n        title: disputeReason,\n        reason:"
)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)

