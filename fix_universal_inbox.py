with open("src/components/UniversalInbox.tsx", "r") as f:
    text = f.read()

target = "const { data: businesses } = await supabase.from('businesses').select('id, name').in('id', uniqueIds);"
replacement = "const { data: businesses } = await supabase.from('businesses').select('owner_id, name').in('owner_id', uniqueIds);"
text = text.replace(target, replacement)

target2 = """          const business = businesses?.find(b => b.id === id);"""
replacement2 = """          const business = businesses?.find(b => b.owner_id === id);"""
text = text.replace(target2, replacement2)

with open("src/components/UniversalInbox.tsx", "w") as f:
    f.write(text)
