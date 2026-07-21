CREATE TABLE IF NOT EXISTS public.sms_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, processando, enviado, erro
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.sms_queue ENABLE ROW LEVEL SECURITY;

-- Allow insert by authenticated users or public (depending on how they authenticate)
CREATE POLICY "Allow insert for all" ON public.sms_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for all" ON public.sms_queue FOR SELECT USING (true);
CREATE POLICY "Allow update for all" ON public.sms_queue FOR UPDATE USING (true);
