-- Tarefa 1: Script SQL de Migração (Fase 1 Internacionalização)
-- Este script adiciona as colunas de internacionalização, a tabela hardware_orders e o RLS

-- 1. Adicionar campos à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT 'pt-PT';

-- 2. Adicionar campos à tabela businesses
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT 'PT',
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'eur',
ADD COLUMN IF NOT EXISTS timezone VARCHAR DEFAULT 'Europe/Lisbon',
ADD COLUMN IF NOT EXISTS stripe_payments_enabled BOOLEAN DEFAULT false;

-- 3. Adicionar campos à tabela bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS booking_datetime_utc TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'eur';

-- 4. Criar a nova tabela hardware_orders
CREATE TABLE IF NOT EXISTS public.hardware_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  stripe_terminal_reader_id VARCHAR,
  device_type VARCHAR,
  status VARCHAR DEFAULT 'pending',
  tracking_code VARCHAR,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Habilitar RLS na nova tabela
ALTER TABLE public.hardware_orders ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de RLS para hardware_orders

-- Política para Admins (Acesso Total: SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can do everything on hardware_orders"
ON public.hardware_orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Política para Businesses (Ler apenas as suas encomendas)
CREATE POLICY "Businesses can read own hardware_orders"
ON public.hardware_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = hardware_orders.business_id AND businesses.owner_id = auth.uid()
  )
);

-- Política para Businesses (Criar apenas as suas encomendas)
CREATE POLICY "Businesses can insert own hardware_orders"
ON public.hardware_orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = hardware_orders.business_id AND businesses.owner_id = auth.uid()
  )
);
