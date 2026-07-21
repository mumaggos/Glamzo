CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.sales_agents(id) ON DELETE CASCADE,
    estado_chamada TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all call_logs" ON public.call_logs FOR ALL USING (true) WITH CHECK (true);
