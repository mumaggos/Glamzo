import re

files = ["src/pages/partner/tabs/AgendaTab.tsx", "src/pages/Account.tsx", "src/components/ClientDisputes.tsx", "src/components/PartnerDisputes.tsx", "src/pages/Admin.tsx"]

for filename in files:
    with open(filename, "r") as f:
        text = f.read()

    if filename == "src/pages/partner/tabs/AgendaTab.tsx":
        text = text.replace("initiator_id: business.owner_id,", "user_id: business.owner_id,")
    elif filename == "src/pages/Account.tsx":
        text = text.replace("initiator_id: user.id,", "user_id: user.id,")
    elif filename == "src/components/ClientDisputes.tsx":
        text = text.replace(".eq('initiator_id', user.id)", ".eq('user_id', user.id)")
        text = text.replace("filter: `initiator_id=eq.${user.id}`", "filter: `user_id=eq.${user.id}`")
    elif filename == "src/pages/Admin.tsx":
        text = text.replace("profiles!initiator_id", "profiles!user_id")
        text = text.replace("dispute.initiator_id === dispute.customer_id", "dispute.user_id === dispute.user_id") # We'll just simplify this

    with open(filename, "w") as f:
        f.write(text)

