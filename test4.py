with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

idx1 = text.find("supportSubTab === 'disputes' && (")
if idx1 == -1:
    # try another way
    idx1 = text.find("{disputes.length === 0 ? (")

idx2 = text.find("activeTab === 'terminal' && (")
if idx1 != -1 and idx2 != -1:
    print(text[idx1-200:idx2])
