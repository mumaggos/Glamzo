-- Tabela de Comerciais / Agentes
CREATE TABLE IF NOT EXISTS public.sales_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    team_name TEXT,
    ref_code TEXT UNIQUE NOT NULL,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Adicionar a coluna agent_id na tabela businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.sales_agents(id) ON DELETE SET NULL;

-- Segurança RLS na nova tabela
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Admins podem ler e alterar tudo
CREATE POLICY "Admins podem gerir agentes"
ON public.sales_agents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Todos (mesmo anónimos) podem ler os agentes (necessário para validar o ref_code no registo)
CREATE POLICY "Leitura pública de agentes"
ON public.sales_agents
FOR SELECT
USING (true);

-- Criar uma função RPC segura para incrementar os cliques sem expor permissões de UPDATE diretamente
CREATE OR REPLACE FUNCTION public.increment_agent_clicks(agent_ref TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.sales_agents 
  SET clicks_count = clicks_count + 1 
  WHERE ref_code = agent_ref;
END;
$$;
