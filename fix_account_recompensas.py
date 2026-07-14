import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

start_str = "{/* 3. RECOMPENSAS & FIDELIDADE */}"
end_str = "{/* 4. FAVORITOS */}"

if start_str in text and end_str in text:
    start_idx = text.find(start_str)
    end_idx = text.find(end_str)
    text = text[:start_idx] + end_str + text[end_idx + len(end_str):]
    
with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
