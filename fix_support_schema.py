with open("SUPABASE_SCHEMA.sql", "r") as f:
    text = f.read()

import re

target = re.compile(r"CREATE TABLE IF NOT EXISTS public\.support_messages \([\s\S]*?\);")

text = re.sub(target, "", text)

with open("SUPABASE_SCHEMA.sql", "w") as f:
    f.write(text)
