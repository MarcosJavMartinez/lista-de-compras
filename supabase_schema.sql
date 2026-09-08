-- Tabla de productos, uno por fila, atada al usuario dueño
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity integer not null default 1,
  price numeric not null default 0,
  purchased boolean not null default false,
  category text not null default 'Otros',
  priority boolean not null default false,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Users can view their own products"
  on public.products for select
  using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own products"
  on public.products for update
  using (auth.uid() = user_id);

create policy "Users can delete their own products"
  on public.products for delete
  using (auth.uid() = user_id);

-- Metadata por usuario: hasta que version del catalogo base ya se sincronizo
create table if not exists public.user_meta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  catalog_version integer not null default 0
);

alter table public.user_meta enable row level security;

create policy "Users can view their own meta"
  on public.user_meta for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meta"
  on public.user_meta for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meta"
  on public.user_meta for update
  using (auth.uid() = user_id);
