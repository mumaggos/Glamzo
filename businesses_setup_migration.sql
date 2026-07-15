ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS setup_status VARCHAR DEFAULT 'pending';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS welcome_kit_sent BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS terminal_sent BOOLEAN DEFAULT false;
