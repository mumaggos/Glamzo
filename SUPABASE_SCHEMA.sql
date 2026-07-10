-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'business', 'admin')),
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  door_number TEXT,
  postal_code TEXT,
  logo_url TEXT,
  cover_url TEXT,
  whatsapp TEXT,
  instagram TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  min_booking_notice INTEGER,
  cancellation_policy TEXT,
  booking_end_margin INTEGER,
  welcome_kit_sent BOOLEAN DEFAULT false,
  subscription_status TEXT,
  trial_ends_at TIMESTAMPTZ,
  credits INTEGER DEFAULT 0,
  is_promoted BOOLEAN DEFAULT false,
  promotion_ends_at TIMESTAMPTZ,
  is_premium BOOLEAN DEFAULT false,
  stripe_account_id TEXT,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  selected_plan TEXT,
  setup_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,
  public_page_enabled BOOLEAN DEFAULT true,
  qr_scans_count INTEGER DEFAULT 0,
  trial_used BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'suspended')),
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Service Categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  target_gender TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Staff
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role_title TEXT,
  is_active BOOLEAN DEFAULT true,
  off_days TEXT,
  email TEXT,
  phone TEXT,
  temp_password TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Staff Services
CREATE TABLE IF NOT EXISTS public.staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE
);

-- 7. Business Hours
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_closed BOOLEAN DEFAULT false
);

-- 8. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  total_price NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  booking_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT,
  photo_url TEXT,
  is_reported BOOLEAN DEFAULT false,
  report_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Messages / Chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'business', 'system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  business_name TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  chat_history TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS public.glamzo_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('customer', 'partner', 'admin')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'push', 'whatsapp')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Tablet Orders
CREATE TABLE IF NOT EXISTS public.tablet_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  deposit_paid BOOLEAN DEFAULT false,
  deposit_amount NUMERIC NOT NULL,
  carrier TEXT,
  tracking_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'returned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Finance Tables
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount NUMERIC NOT NULL,
  fee NUMERIC DEFAULT 0,
  net_amount NUMERIC,
  payment_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  stripe_payout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Desativar Row Level Security (RLS) para evitar erros de permissão temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.glamzo_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tablet_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
