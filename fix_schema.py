with open("SUPABASE_SCHEMA.sql", "r") as f:
    text = f.read()

import re

target = re.compile(r"CREATE TABLE IF NOT EXISTS public\.messages \([\s\S]*?\);")

replacement = """CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);"""

text = re.sub(target, replacement, text)

with open("SUPABASE_SCHEMA.sql", "w") as f:
    f.write(text)
