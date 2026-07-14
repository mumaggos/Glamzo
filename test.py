import re
with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Let's see what is above {reviewModalOpen
print("Before reviewModalOpen:")
idx = text.find("{reviewModalOpen")
print(text[idx-200:idx])
