-- ============================================================
-- FinançasPessoais — Schema SQL
-- Rodar no Supabase SQL Editor (uma vez, em ordem)
-- ============================================================

-- Tabela de transações
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount decimal(10,2) not null check (amount > 0),
  date date not null,
  type text not null check (type in ('receita', 'despesa')),
  category text not null check (category in (
    'Alimentação', 'Transporte', 'Moradia', 'Lazer',
    'Saúde', 'Educação', 'Salário', 'Freelance', 'Outros'
  )),
  created_at timestamptz default now() not null
);

-- Tabela de perfil financeiro
create table public.user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  monthly_income decimal(10,2) not null default 0,
  average_monthly_expense decimal(10,2) not null default 0,
  savings_goal decimal(10,2) not null default 0,
  investment_goal decimal(10,2) not null default 0,
  onboarding_completed boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Habilitar Row Level Security
alter table public.transactions enable row level security;
alter table public.user_profiles enable row level security;

-- Policies: transactions
create policy "select own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Policies: user_profiles
create policy "select own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- Trigger para auto-atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();
