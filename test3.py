with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

idx1 = text.find("supportSubTab === 'messages' ? (")
idx2 = text.find("activeTab === 'terminal' && (")
block = text[idx1:idx2]
print(block[:1000])
print("-----")
print(block[-1000:])
