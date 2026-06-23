-- A) Adicionar colunas de onboarding e controle de setup à tabela businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS setup_step INTEGER DEFAULT 1;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS selected_plan TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS selected_plan_price_id TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS tablet_requested BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS tablet_deposit_amount NUMERIC DEFAULT 9.99;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS tablet_deposit_status TEXT DEFAULT 'not_applicable';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS accepts_online_payments BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS payments_mode TEXT DEFAULT 'offline_only';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'not_started';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS last_onboarding_update_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- B) Adicionar colunas de Google Maps / Morada estruturada
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS address_line_2 TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Portugal';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- C) Garantir a unicidade e consistência da loja por parceiro (impede múltiplos "setups" concorrentes)
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_owner_id_key;
ALTER TABLE public.businesses ADD CONSTRAINT businesses_owner_id_key UNIQUE (owner_id);

-- D) Limpeza de legado e normalização de dados baseados no estado atual
UPDATE public.businesses SET status = 'setup' WHERE status IS NULL;
UPDATE public.businesses SET setup_completed = true WHERE status = 'active';
UPDATE public.businesses SET address_line_1 = address WHERE address_line_1 IS NULL AND address IS NOT NULL;

-- E) Atualizar RLS de policies na tabela businesses (se necessário reforçar)
-- Garante que o insert é feito apenas se o utilizador não tem já uma loja
CREATE POLICY IF NOT EXISTS "Prevent duplicate business insert" 
ON public.businesses 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Opcional (apenas se não houver já uma constraint ou policy para RLS nas businesses)
