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
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'setup';
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

-- =========================================================================================
-- V2 MIGRATIONS: INSPIRATION, AWARDS, TOP PARTNERS, COLLECTIONS
-- =========================================================================================

-- F) Top Partner & Awards on businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_top_partner BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS top_partner_score NUMERIC DEFAULT 0;

-- G) Inspiration Posts
CREATE TABLE IF NOT EXISTS public.inspiration_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    style TEXT,
    tags TEXT[] DEFAULT '{}',
    price NUMERIC,
    duration_minutes INTEGER,
    season TEXT,
    visibility TEXT DEFAULT 'public',
    is_before_after BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    bookings_generated INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT false,
    is_editors_choice BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- H) Inspiration Media
CREATE TABLE IF NOT EXISTS public.inspiration_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.inspiration_posts(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    is_before BOOLEAN DEFAULT false,
    is_after BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

-- I) Collections
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- J) Saved Posts (Customer Favorites)
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.inspiration_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(customer_id, post_id)
);

-- K) Awards
CREATE TABLE IF NOT EXISTS public.awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL,
    category TEXT NOT NULL,
    winner_business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    nominees_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- L) Business Hours
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL, -- 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
    open_time TEXT NOT NULL DEFAULT '09:00',
    close_time TEXT NOT NULL DEFAULT '19:00',
    is_closed BOOLEAN DEFAULT false,
    UNIQUE(business_id, weekday)
);

-- M) Tablet Orders
CREATE TABLE IF NOT EXISTS public.tablet_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_postal_code TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    deposit_paid BOOLEAN DEFAULT false,
    deposit_amount NUMERIC DEFAULT 9.99,
    carrier TEXT,
    tracking_code TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
