## Instruções SQL

Para resolver os problemas do Chat e das Avaliações, por favor corra o seguinte código SQL no **SQL Editor** do seu painel Supabase:

```sql
-- 1. Criar a tabela de Mensagens (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('customer', 'business', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para as mensagens
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages" ON public.messages
    FOR SELECT
    USING (auth.uid() = customer_id OR auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id));

CREATE POLICY "Users can insert messages" ON public.messages
    FOR INSERT
    WITH CHECK (auth.uid() = customer_id OR auth.uid() IN (SELECT owner_id FROM public.businesses WHERE id = business_id));

-- 2. Atualizar a tabela de Avaliações (Reviews)
-- Adicionar as colunas que estão em falta
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS report_reason TEXT;

-- Corrigir as políticas de RLS das avaliações para permitir que os clientes as enviem
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can insert their own reviews" ON public.reviews;

CREATE POLICY "Anyone can read reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Customers can insert their own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

```
