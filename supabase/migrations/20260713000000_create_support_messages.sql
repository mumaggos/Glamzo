CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_role ON public.support_messages(sender_role);

-- Assuming RLS is needed, but we don't know the exact RLS setup. We will disable RLS for simplicity as this is a prototype, or maybe we don't enable it unless necessary.
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own support messages" ON public.support_messages;
CREATE POLICY "Users can read own support messages" ON public.support_messages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own support messages" ON public.support_messages;
CREATE POLICY "Users can insert own support messages" ON public.support_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can do everything. Assuming there's a way to check admin, or just let service_role bypass RLS.
