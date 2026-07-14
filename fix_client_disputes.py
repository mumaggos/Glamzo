import re

with open("src/components/ClientDisputes.tsx", "r") as f:
    text = f.read()

text = text.replace(
    ".eq('customer_id', user.id)",
    ".eq('initiator_id', user.id)"
)
text = text.replace(
    "filter: `customer_id=eq.${user.id}`",
    "filter: `initiator_id=eq.${user.id}`"
)

with open("src/components/ClientDisputes.tsx", "w") as f:
    f.write(text)

