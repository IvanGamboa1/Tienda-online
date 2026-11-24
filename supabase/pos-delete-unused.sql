-- Run once in Supabase SQL Editor as postgres, after the POS product_units
-- table has been created.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;
revoke all on table public.admins from public, anon, authenticated;

do $$
begin
  if to_regclass('public.product_units') is null then
    raise exception 'Falta public.product_units. Ejecuta primero el SQL de configuración del POS.';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'product_units'
      and column_name = 'code'
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'product_units'
      and column_name = 'status'
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'product_units'
      and column_name = 'created_at'
  ) then
    raise exception 'public.product_units debe tener las columnas code, status y created_at.';
  end if;
end;
$$;

create or replace function public.delete_unused_units(p_limit integer default 50)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.admins as a
    where a.user_id = auth.uid()
  ) then
    raise exception 'Solo un administrador puede eliminar etiquetas.'
      using errcode = '42501';
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 50 then
    raise exception 'El límite debe estar entre 1 y 50.'
      using errcode = '22023';
  end if;

  with candidates as (
    select u.ctid as row_id
    from public.product_units as u
    where u.status = 'en_stock'
    order by u.created_at asc, u.code asc
    limit p_limit
    for update skip locked
  ),
  deleted as (
    delete from public.product_units as u
    using candidates as c
    where u.ctid = c.row_id
    returning 1
  )
  select count(*)::integer
    into deleted_count
    from deleted;

  return deleted_count;
end;
$$;

revoke all on function public.delete_unused_units(integer) from public, anon;
grant execute on function public.delete_unused_units(integer) to authenticated;

-- Register an admin account separately, replacing the email:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'TU_CORREO@ejemplo.com'
-- on conflict do nothing;
