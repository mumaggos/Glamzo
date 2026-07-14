with open("src/components/GlamzoMessenger.tsx", "r") as f:
    text = f.read()

text = text.replace("m.sender === 'customer'", "m.sender_id === userId")

with open("src/components/GlamzoMessenger.tsx", "w") as f:
    f.write(text)
