import { useState } from 'react';
import { Database, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SupabaseSetupHelper() {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- 1. Create profiles table linked to Supabase Auth
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'business', 'admin')),
  loyalty_points integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Set up secure security policy rules
create policy "Allow public read access to profiles"
  on public.profiles for select
  using (true);

create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Create trigger to automatically insert a profile row on signup/OAuth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function after any user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Create businesses table
create table public.businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  category text not null,
  phone text not null,
  email text,
  district text not null,
  city text not null,
  address text not null,
  postal_code text,
  logo_url text,
  cover_url text,
  whatsapp text,
  instagram text,
  website text,
  stripe_account_id text, -- Connected Stripe Standard/Express Account ID
  charges_enabled boolean default false not null,
  payouts_enabled boolean default false not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  subscription_active boolean default false not null,
  trial_started_at timestamp with time zone,
  trial_ends_at timestamp with time zone,
  is_verified boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for businesses
alter table public.businesses enable row level security;

-- Policies for businesses
create policy "Allow read access to all businesses"
  on public.businesses for select
  using (true);

create policy "Allow owners to insert their businesses"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "Allow owners to update their businesses"
  on public.businesses for update
  using (auth.uid() = owner_id);

create policy "Allow owners to delete their businesses"
  on public.businesses for delete
  using (auth.uid() = owner_id);

-- 6. Create service_categories table
create table public.service_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for service_categories
alter table public.service_categories enable row level security;

create policy "Allow read access to service_categories for all"
  on public.service_categories for select
  using (true);

-- 7. Insert initial service categories
insert into public.service_categories (name, icon) values
  ('Barbearia', 'Smile'),
  ('Cabeleireiro', 'Sparkles'),
  ('Estética', 'Heart'),
  ('Massagem', 'Activity'),
  ('Spa & Wellness', 'Flower'),
  ('Manicure', 'Scissors'),
  ('Pedicure', 'Sparkly'),
  ('Sobrancelhas', 'Eye'),
  ('Pestanas', 'Eye'),
  ('Maquilhagem', 'Brush'),
  ('Tatuagem', 'Edit-3'),
  ('Depilação', 'Flame')
on conflict (name) do nothing;

-- 8. Create services table
create table public.services (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  category_id uuid references public.service_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes >= 5),
  image_url text,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for services
alter table public.services enable row level security;

create policy "Allow read access to services for all"
  on public.services for select
  using (true);

create policy "Allow business owner to insert their services"
  on public.services for insert
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = services.business_id and b.owner_id = auth.uid()
    )
  );

create policy "Allow business owner to update their services"
  on public.services for update
  using (
    exists (
      select 1 from public.businesses b
      where b.id = services.business_id and b.owner_id = auth.uid()
    )
  );

create policy "Allow business owner to delete their services"
  on public.services for delete
  using (
    exists (
      select 1 from public.businesses b
      where b.id = services.business_id and b.owner_id = auth.uid()
    )
  );

-- 9. Create staff table
create table public.staff (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  full_name text not null,
  avatar_url text,
  role_title text,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for staff
alter table public.staff enable row level security;

create policy "Allow read access to staff for all"
  on public.staff for select
  using (true);

create policy "Allow owners to manage staff"
  on public.staff for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = staff.business_id and b.owner_id = auth.uid()
    )
  );

-- 10. Create staff_services table (junction for many-to-many relationship)
create table public.staff_services (
  id uuid default gen_random_uuid() primary key,
  staff_id uuid references public.staff(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete cascade not null,
  unique (staff_id, service_id)
);

-- Enable RLS for staff_services
alter table public.staff_services enable row level security;

create policy "Allow read access to staff_services for all"
  on public.staff_services for select
  using (true);

create policy "Allow owners to manage staff_services"
  on public.staff_services for all
  using (
    exists (
      select 1 from public.staff s
      join public.businesses b on s.business_id = b.id
      where s.id = staff_services.staff_id and b.owner_id = auth.uid()
    )
  );

-- 11. Create business_hours table
create table public.business_hours (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  weekday integer not null check (weekday >= 0 and weekday <= 6), -- 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  open_time text not null default '09:00',
  close_time text not null default '18:00',
  is_closed boolean default false not null,
  unique (business_id, weekday)
);

-- Enable RLS for business_hours
alter table public.business_hours enable row level security;

create policy "Allow read access to business_hours for all"
  on public.business_hours for select
  using (true);

create policy "Allow owners to manage business_hours"
  on public.business_hours for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_hours.business_id and b.owner_id = auth.uid()
    )
  );

-- 12. Create bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete cascade not null,
  staff_id uuid references public.staff(id) on delete cascade,
  booking_date date not null,
  start_time text not null, -- format e.g. "14:30"
  end_time text not null,   -- format e.g. "15:00"
  total_price numeric(10,2) not null check (total_price >= 0),
  payment_method text not null default 'local', -- 'local', 'stripe'
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for bookings
alter table public.bookings enable row level security;

create policy "Allow users to select their own or custom bookings"
  on public.bookings for select
  using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.businesses b
      where b.id = bookings.business_id and b.owner_id = auth.uid()
    )
  );

create policy "Allow users to insert their own bookings"
  on public.bookings for insert
  with check (auth.uid() = customer_id);

create policy "Allow users or business owners to update bookings"
  on public.bookings for update
  using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.businesses b
      where b.id = bookings.business_id and b.owner_id = auth.uid()
    )
  );

create policy "Allow users or business owners to delete bookings"
  on public.bookings for delete
  using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.businesses b
      where b.id = bookings.business_id and b.owner_id = auth.uid()
    )
  );

-- 13. Create subscriptions table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  plan_name text not null, -- 'FREE TRIAL', 'PRO'
  status text not null, -- 'active', 'expired'
  monthly_price numeric(10,2) not null default 0.00,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  stripe_subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for subscriptions
alter table public.subscriptions enable row level security;

create policy "Allow read access to subscriptions for all"
  on public.subscriptions for select
  using (true);

create policy "Allow owners to manage subscriptions"
  on public.subscriptions for all
  using (
    exists (
      select 1 from public.businesses b
      where b.id = subscriptions.business_id and b.owner_id = auth.uid()
    )
  );

-- 14. Create payments table
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  customer_id uuid references public.profiles(id) on delete set null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  amount_total numeric(10,2) not null check (amount_total >= 0),
  glamzo_fee numeric(10,2) not null check (glamzo_fee >= 0),
  business_amount numeric(10,2) not null check (business_amount >= 0),
  payment_method text not null, -- 'local', 'stripe'
  payment_status text not null, -- 'unpaid', 'paid', 'pending_local', 'refunded'
  stripe_payment_intent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for payments
alter table public.payments enable row level security;

create policy "Allow users to read their own payments or business payments"
  on public.payments for select
  using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.businesses b
      where b.id = payments.business_id and b.owner_id = auth.uid()
    )
  );

create policy "Allow users to insert payments"
  on public.payments for insert
  with check (true);

create policy "Allow owners and users to update payments"
  on public.payments for update
  using (
    auth.uid() = customer_id or
    exists (
      select 1 from public.businesses b
      where b.id = payments.business_id and b.owner_id = auth.uid()
    )
  );

-- 15. Create payouts table
create table public.payouts (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  amount numeric(10,2) not null check (amount >= 0),
  payout_method text not null, -- 'bank_transfer', 'stripe_connect', 'mbway'
  payout_status text not null default 'pending' check (payout_status in ('pending', 'processing', 'completed', 'rejected')),
  requested_at timestamp with time zone default timezone('utc'::text, now()) not null,
  processed_at timestamp with time zone,
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for payouts
alter table public.payouts enable row level security;

create policy "Allow owners to view their own payouts"
  on public.payouts for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = payouts.business_id and b.owner_id = auth.uid()
    )
  );

create policy "Allow owners to insert payout requests"
  on public.payouts for insert
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = payouts.business_id and b.owner_id = auth.uid()
    )
  );

create policy "Allow admin to manage all payouts"
  on public.payouts for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 16. Create reward_coupons table for loyalty system
create table public.reward_coupons (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  code text not null unique,
  value numeric(10,2) not null,
  used boolean default false not null,
  used_at timestamp with time zone,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for reward_coupons
alter table public.reward_coupons enable row level security;

create policy "Allow read access to reward_coupons for owners and admin"
  on public.reward_coupons for select
  using (auth.uid() = customer_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Allow owners to insert reward_coupons"
  on public.reward_coupons for insert
  with check (auth.uid() = customer_id);

create policy "Allow owners to update reward_coupons"
  on public.reward_coupons for update
  using (auth.uid() = customer_id);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="supabase-setup-container" className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div id="supabase-setup-card" className="max-w-3xl w-full bg-slate-800 border border-slate-750 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="relative flex items-start gap-4 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-950 rounded-full font-semibold">
              PASSO IMPORTANTE
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-2 text-white">Configuração do Supabase pendente</h1>
            <p className="text-slate-400 text-sm mt-1">
              A Glamzo precisa estar conectada a uma instância real do Supabase para funcionar sem autenticações falsas ou simulações.
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          {/* Step 1 */}
          <div className="p-5 bg-slate-850 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2 text-sm">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-xs text-semibold">1</span>
              Como definir as chaves de ambiente
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Abra as Configurações de Segredos (<strong>Secrets / Environment Variables</strong>) no painel do AI Studio e insira as seguintes variáveis com os valores do seu projeto Supabase:
            </p>
            <div className="mt-3 font-mono text-xs bg-slate-900 p-3 rounded border border-slate-800/80 space-y-1 text-slate-400 select-all">
              <div>VITE_SUPABASE_URL="https://sua-url-do-projeto.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="sua-chave-anonima-aqui"</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 bg-slate-850 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between gap-2 text-emerald-400 font-semibold mb-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-xs text-semibold">2</span>
                Criar tabela Profiles & Trigger Automático
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-3">
              No painel do Supabase, vá em <strong>SQL Editor &gt; New Query</strong>, cole o código abaixo e execute. Ele criará a tabela <code>profiles</code> segura com RLS e gatilhos para Google Login e cadastros por email:
            </p>

            <div className="max-h-56 overflow-y-auto bg-slate-900 rounded border border-slate-800 text-xs font-mono p-4 text-emerald-300 leading-relaxed scrollbar-thin">
              <pre className="whitespace-pre-wrap">{sqlCode}</pre>
            </div>
          </div>

          {/* Tips block */}
          <div className="flex gap-2.5 p-4 bg-sky-950/20 text-sky-400 border border-sky-900/40 rounded-xl text-xs">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 text-sky-300">Autenticação com Google OAuth</span>
              <p className="text-slate-400">
                Se você habilitar o Google no Supabase (Authentication &gt; Providers &gt; Google), os usuários serão direcionados para o seu fluxo real. O trigger inserido acima cuidará do profile <code>customer</code> automaticamente!
              </p>
            </div>
          </div>

          {/* Quick Sandbox Bypass Option */}
          <div className="p-5 bg-rose-950/20 border border-rose-900/30 rounded-xl text-center mt-6">
            <h3 className="text-sm font-bold text-rose-400">Pretende testar ou avaliar agora?</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Explore o ecossistema Glamzo instantaneamente utilizando o nosso barramento de comunicação local e mock persistent em tempo real (Fase 13).
            </p>
            <button
              onClick={() => {
                localStorage.setItem('glamzo_bypass_supabase', 'true');
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-950/20"
            >
              Iniciar Modo de Demonstração &amp; Testes
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700/60 text-xs">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span>Ir para o painel do Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-slate-500 font-mono">Glamzo SaaS - Fase 01</span>
        </div>
      </div>
    </div>
  );
}
