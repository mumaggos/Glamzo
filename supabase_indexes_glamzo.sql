-- 🚀 OTIMIZAÇÃO DE PERFORMANCE ELITE (GLAMZO)
-- Executa este script no Supabase SQL Editor para criar os índices
-- necessários para que as listagens e pesquisas carreguem em milissegundos.

-- 1. Índices para Tabela BOOKINGS (Pesada)
CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON public.bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON public.bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON public.bookings(booking_date, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);

-- 2. Índices para Tabela SERVICES
CREATE INDEX IF NOT EXISTS idx_services_business_id ON public.services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);

-- 3. Índices para Tabela STAFF
CREATE INDEX IF NOT EXISTS idx_staff_business_id ON public.staff(business_id);

-- 4. Índices para Tabela REVIEWS
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);

-- 5. Índices para Tabela BUSINESSES
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON public.businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);

-- 6. Índices para Tabela BUSINESS_HOURS
CREATE INDEX IF NOT EXISTS idx_business_hours_business_id ON public.business_hours(business_id);

-- 7. Índices para Tabela PAYMENTS & PAYOUTS
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON public.payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payouts_business_id ON public.payouts(business_id);
