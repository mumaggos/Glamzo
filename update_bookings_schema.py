import re
with open("SUPABASE_SCHEMA.sql", "r") as f:
    text = f.read()

target = r"""  payment_method TEXT NOT NULL,"""
replacement = """  payment_method TEXT NOT NULL,
  client_completed BOOLEAN DEFAULT false,
  business_completed BOOLEAN DEFAULT false,"""

text = re.sub(target, replacement, text)

target2 = r"""-- 12. Support Tickets"""
replacement2 = """-- 12a. Dispute Messages
CREATE TABLE IF NOT EXISTS public.dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'business', 'admin')),
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Support Tickets"""

text = re.sub(target2, replacement2, text)

with open("SUPABASE_SCHEMA.sql", "w") as f:
    f.write(text)
