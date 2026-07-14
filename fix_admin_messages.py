import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# Replace the block around 2530
target = re.compile(r"\{supportSubTab === 'messages' \? \([\s\S]*?\{supportSubTab === 'disputes' && \(")
replacement = "{supportSubTab === 'messages' && <UniversalInbox myId=\"admin\" myType=\"admin\" />}\n                  {supportSubTab === 'disputes' && ("
text = re.sub(target, replacement, text)

# Remove the useEffect that fetches support_messages
target2 = re.compile(r"// Fetch and sync real support messages[\s\S]*?\} catch \(_\) \{\}")
text = re.sub(target2, "", text)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
