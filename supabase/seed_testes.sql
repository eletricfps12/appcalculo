-- Produtos de TESTE (dados fictícios). Idempotente: produto que já existe
-- pelo nome é ignorado. Não toca no "Produto Teste Colonial".
-- Cada receita: [nome, tipo, percentual, papel]; a ordem segue a lista.
-- MP 2 (papel "espelho") espelha o MP 1 (papel "base") do mesmo produto.
do $$
declare
  v_receitas jsonb := $json$
  {
    "Linguiça Teste": [
      ["MP 1", "mp", "30", "base"],
      ["MP 2", "mp", "30", "espelho"],
      ["MP 3", "mp", "20", "variavel"],
      ["Tempero 1", "tempero", "2.5", "calculado"],
      ["Tempero 2", "tempero", "1.5", "calculado"],
      ["Tempero 3", "tempero", "0.02", "calculado"],
      ["Tempero 4", "tempero", "0.08", "calculado"],
      ["Tempero 5", "tempero", "6", "calculado"],
      ["Tempero 6", "tempero", "9.9", "calculado"]
    ],
    "Mortadela Teste": [
      ["MP 1", "mp", "25", "base"],
      ["MP 2", "mp", "25", "espelho"],
      ["MP 3", "mp", "25", "variavel"],
      ["Tempero 1", "tempero", "3", "calculado"],
      ["Tempero 2", "tempero", "2", "calculado"],
      ["Tempero 3", "tempero", "0.015", "calculado"],
      ["Tempero 4", "tempero", "0.085", "calculado"],
      ["Tempero 5", "tempero", "8", "calculado"],
      ["Tempero 6", "tempero", "11.9", "calculado"]
    ],
    "Salsicha Teste": [
      ["MP 1", "mp", "40", "base"],
      ["MP 2", "mp", "40", "espelho"],
      ["MP 3", "mp", "5", "variavel"],
      ["Tempero 1", "tempero", "2", "calculado"],
      ["Tempero 2", "tempero", "1.2", "calculado"],
      ["Tempero 3", "tempero", "0.02", "calculado"],
      ["Tempero 4", "tempero", "0.08", "calculado"],
      ["Tempero 5", "tempero", "11.7", "calculado"]
    ]
  }
  $json$;
  v_nome text;
  v_itens jsonb;
  v_produto uuid;
  v_base uuid;
begin
  for v_nome, v_itens in select key, value from jsonb_each(v_receitas) loop
    if exists (select 1 from public.produtos where nome = v_nome) then
      continue;
    end if;

    insert into public.produtos (nome) values (v_nome) returning id into v_produto;

    -- Percentual vem como texto para cair exato no numeric.
    insert into public.ingredientes (produto_id, nome, tipo, percentual, papel, ordem)
    select v_produto, item ->> 0, item ->> 1, (item ->> 2)::numeric, item ->> 3, ordem::integer
    from jsonb_array_elements(v_itens) with ordinality as t (item, ordem);

    select id into strict v_base
    from public.ingredientes
    where produto_id = v_produto and papel = 'base';

    update public.ingredientes
    set espelha_id = v_base
    where produto_id = v_produto and papel = 'espelho';
  end loop;
end;
$$;
