-- Produto de teste (idempotente: não duplica se já existir).
do $$
declare
  v_produto uuid;
  v_mp1 uuid;
begin
  if exists (select 1 from public.produtos where nome = 'Produto Teste Colonial') then
    return;
  end if;

  insert into public.produtos (nome) values ('Produto Teste Colonial') returning id into v_produto;

  insert into public.ingredientes (produto_id, nome, tipo, percentual, papel, ordem)
  values (v_produto, 'MP 1', 'mp', 30, 'base', 1)
  returning id into v_mp1;

  insert into public.ingredientes (produto_id, nome, tipo, percentual, papel, espelha_id, ordem) values
    (v_produto, 'MP 2', 'mp', 30, 'espelho', v_mp1, 2),
    (v_produto, 'MP 3', 'mp', 15, 'variavel', null, 3),
    (v_produto, 'Tempero 1', 'tempero', 4, 'calculado', null, 4),
    (v_produto, 'Tempero 2', 'tempero', 3, 'calculado', null, 5),
    (v_produto, 'Tempero 3', 'tempero', 0.01, 'calculado', null, 6),
    (v_produto, 'Tempero 4', 'tempero', 0.09, 'calculado', null, 7),
    (v_produto, 'Tempero 5', 'tempero', 7, 'calculado', null, 8),
    (v_produto, 'Tempero 6', 'tempero', 10.9, 'calculado', null, 9);
end;
$$;
