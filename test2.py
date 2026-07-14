with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

idx1 = text.find("activeTab === 'support' && (")
idx2 = text.find("activeTab === 'terminal' && (")
print(text[idx1:idx1+1500])
