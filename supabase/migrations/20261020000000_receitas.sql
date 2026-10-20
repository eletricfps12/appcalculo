-- Sistema de ajuste de receitas: produtos e ingredientes.

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  criado_em timestamptz not null default now()
);

create table public.ingredientes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  nome text not null check (length(trim(nome)) > 0),
  tipo text not null check (tipo in ('mp', 'tempero')),
  percentual numeric(7, 4) not null check (percentual >= 0 and percentual <= 100),
  papel text not null check (papel in ('base', 'espelho', 'variavel', 'calculado')),
  espelha_id uuid,
  ordem integer not null default 0,
  unique (produto_id, id),
  -- Só "espelho" aponta para outro ingrediente, e nunca para si mesmo.
  check (espelha_id is null or papel = 'espelho'),
  check (espelha_id is null or espelha_id <> id),
  -- O ingrediente espelhado precisa ser do mesmo produto.
  foreign key (produto_id, espelha_id)
    references public.ingredientes (produto_id, id)
    on delete set null (espelha_id)
);

create index ingredientes_produto_ordem_idx on public.ingredientes (produto_id, ordem);
create index ingredientes_produto_espelha_idx on public.ingredientes (produto_id, espelha_id);

-- RLS: apenas usuários autenticados.
alter table public.produtos enable row level security;
alter table public.ingredientes enable row level security;

create policy "autenticados leem produtos" on public.produtos
  for select to authenticated using (true);
create policy "autenticados criam produtos" on public.produtos
  for insert to authenticated with check (true);
create policy "autenticados editam produtos" on public.produtos
  for update to authenticated using (true) with check (true);
create policy "autenticados excluem produtos" on public.produtos
  for delete to authenticated using (true);

create policy "autenticados leem ingredientes" on public.ingredientes
  for select to authenticated using (true);
create policy "autenticados criam ingredientes" on public.ingredientes
  for insert to authenticated with check (true);
create policy "autenticados editam ingredientes" on public.ingredientes
  for update to authenticated using (true) with check (true);
create policy "autenticados excluem ingredientes" on public.ingredientes
  for delete to authenticated using (true);

revoke all on public.produtos, public.ingredientes from anon;

-- Salva produto + receita completa numa única transação.
-- p_ingredientes: [{ id, nome, tipo, percentual, papel, espelha_id }] na ordem de exibição.
-- Roda como o usuário chamador (security invoker), então o RLS vale.
create or replace function public.salvar_receita(
  p_produto_id uuid,
  p_nome text,
  p_ingredientes jsonb
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_produto_id is null then
    insert into public.produtos (nome) values (trim(p_nome)) returning id into v_id;
  else
    update public.produtos set nome = trim(p_nome) where id = p_produto_id returning id into v_id;
    if v_id is null then
      raise exception 'Produto não encontrado';
    end if;
  end if;

  delete from public.ingredientes i
  where i.produto_id = v_id
    and i.id not in (select (e ->> 'id')::uuid from jsonb_array_elements(p_ingredientes) e);

  -- Primeiro grava sem espelho, para que todos os ids existam.
  insert into public.ingredientes as i (id, produto_id, nome, tipo, percentual, papel, espelha_id, ordem)
  select (e ->> 'id')::uuid, v_id, trim(e ->> 'nome'), e ->> 'tipo',
         (e ->> 'percentual')::numeric, e ->> 'papel', null, n::integer
  from jsonb_array_elements(p_ingredientes) with ordinality as t (e, n)
  on conflict (id) do update
    set nome = excluded.nome,
        tipo = excluded.tipo,
        percentual = excluded.percentual,
        papel = excluded.papel,
        espelha_id = null,
        ordem = excluded.ordem
    where i.produto_id = v_id;

  update public.ingredientes i
  set espelha_id = (e ->> 'espelha_id')::uuid
  from jsonb_array_elements(p_ingredientes) e
  where i.id = (e ->> 'id')::uuid
    and i.produto_id = v_id
    and nullif(e ->> 'espelha_id', '') is not null;

  return v_id;
end;
$$;

revoke execute on function public.salvar_receita(uuid, text, jsonb) from public, anon;
grant execute on function public.salvar_receita(uuid, text, jsonb) to authenticated;
