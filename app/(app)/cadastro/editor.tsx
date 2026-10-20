"use client";

import { useState, useTransition } from "react";
import { IconeAlerta, IconeBaixo, IconeCima, IconeGiro, IconeLixeira, IconeMais } from "@/components/icones";
import { SomaPercentual } from "@/components/soma-percentual";
import { Aviso, EstadoVazio, botao, campo, cartao } from "@/components/ui";
import { somaPercentuais } from "@/lib/calculo";
import type { Produto } from "@/lib/dados";
import { lerNumero, paraCampo } from "@/lib/formato";
import { novoId, PAPEIS, TIPOS, type LinhaReceita } from "@/lib/receita";
import { excluirProduto, salvarReceita } from "./actions";

// Colunas da tabela no desktop; no celular cada linha vira um card.
const GRADE = "lg:grid-cols-[5.5rem_minmax(0,1fr)_10.5rem_10.5rem_9.5rem_7rem_2.75rem]";
const rotuloCelular = "mb-1 block text-xs font-medium text-neutro-600 lg:sr-only";

export function EditorReceita({ produto }: { produto?: Produto }) {
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [linhas, setLinhas] = useState<LinhaReceita[]>(
    () =>
      produto?.ingredientes.map((i) => ({
        id: i.id,
        nome: i.nome,
        tipo: i.tipo,
        percentual: paraCampo(i.percentual),
        papel: i.papel,
        espelhaId: i.espelhaId,
      })) ?? []
  );
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();

  const soma = somaPercentuais(linhas.map((l) => ({ percentual: lerNumero(l.percentual) ?? 0 })));
  const fecha = soma.equals(100);

  const alterar = (id: string, mudanca: Partial<LinhaReceita>) =>
    setLinhas((atual) => atual.map((l) => (l.id === id ? { ...l, ...mudanca } : l)));

  const mover = (indice: number, direcao: -1 | 1) =>
    setLinhas((atual) => {
      const nova = [...atual];
      const destino = indice + direcao;
      if (destino < 0 || destino >= nova.length) return atual;
      [nova[indice], nova[destino]] = [nova[destino], nova[indice]];
      return nova;
    });

  const remover = (id: string) =>
    setLinhas((atual) =>
      atual.filter((l) => l.id !== id).map((l) => (l.espelhaId === id ? { ...l, espelhaId: null } : l))
    );

  const adicionar = (tipo: LinhaReceita["tipo"]) =>
    setLinhas((atual) => [
      ...atual,
      { id: novoId(), nome: "", tipo, percentual: "", papel: atual.length === 0 ? "base" : "calculado", espelhaId: null },
    ]);

  const executar = (acao: () => Promise<{ erro: string }>) =>
    iniciar(async () => {
      setErro(null);
      const resposta = await acao();
      if (resposta?.erro) setErro(resposta.erro);
    });

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        executar(() => salvarReceita(produto?.id ?? null, nome, linhas));
      }}
    >
      <label className="block max-w-md">
        <span className="mb-1.5 block text-sm font-medium text-neutro-800">Nome do produto</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex.: Linguiça Colonial" className={campo} />
      </label>

      <section aria-labelledby="titulo-ingredientes" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-ingredientes" className="text-sm font-semibold uppercase tracking-wide text-neutro-600">
            Ingredientes
          </h2>
          <span className="flex items-center gap-2 text-sm text-neutro-600">
            Soma da receita <SomaPercentual soma={soma.toNumber()} fecha={fecha} />
          </span>
        </div>

        <p className="text-sm text-neutro-600">
          <strong className="font-medium text-neutro-800">Base</strong>: peso digitado na produção ·{" "}
          <strong className="font-medium text-neutro-800">Espelho</strong>: igual a outro ingrediente ·{" "}
          <strong className="font-medium text-neutro-800">Variável</strong>: calculado ou digitado ·{" "}
          <strong className="font-medium text-neutro-800">Calculado</strong>: sempre pela receita
        </p>

        {linhas.length > 0 && !fecha && (
          <Aviso tom="ambar">
            <IconeAlerta className="mt-0.5 shrink-0" width={18} height={18} />
            A soma das porcentagens não é 100%. Dá para salvar mesmo assim, mas confira a receita.
          </Aviso>
        )}

        {linhas.length === 0 ? (
          <EstadoVazio icone={<IconeMais />} titulo="Nenhum ingrediente">
            Adicione as matérias-primas e os temperos da receita.
          </EstadoVazio>
        ) : (
          <div className={`${cartao} lg:overflow-hidden`}>
            <div
              aria-hidden="true"
              className={`hidden gap-3 border-b border-neutro-200 bg-neutro-50/70 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-neutro-600 lg:grid ${GRADE}`}
            >
              <span>Ordem</span>
              <span>Nome</span>
              <span>Tipo</span>
              <span>Papel</span>
              <span>Espelha</span>
              <span className="text-right">%</span>
              <span />
            </div>

            <ol className="divide-y divide-neutro-100">
              {linhas.map((l, indice) => (
                <li key={l.id} className={`grid grid-cols-2 items-end gap-3 p-4 transition duration-150 hover:bg-neutro-50/60 lg:items-center lg:px-4 lg:py-2.5 ${GRADE}`}>
                  <div className="order-last col-span-2 flex items-center gap-1 lg:order-none lg:col-span-1">
                    <span className="tabular mr-1 hidden w-5 text-center text-xs text-neutro-500 lg:inline">{indice + 1}</span>
                    <button type="button" onClick={() => mover(indice, -1)} disabled={indice === 0} className={botao.icone} aria-label={`Subir ${l.nome || "ingrediente"}`}>
                      <IconeCima width={18} height={18} />
                    </button>
                    <button type="button" onClick={() => mover(indice, 1)} disabled={indice === linhas.length - 1} className={botao.icone} aria-label={`Descer ${l.nome || "ingrediente"}`}>
                      <IconeBaixo width={18} height={18} />
                    </button>
                    <button type="button" onClick={() => remover(l.id)} className={`${botao.icone} ml-auto hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400 lg:hidden`} aria-label={`Remover ${l.nome || "ingrediente"}`}>
                      <IconeLixeira width={18} height={18} />
                    </button>
                  </div>

                  <label className="col-span-2 lg:col-span-1">
                    <span className={rotuloCelular}>Nome</span>
                    <input value={l.nome} onChange={(e) => alterar(l.id, { nome: e.target.value })} placeholder="Ex.: MP 1" className={campo} />
                  </label>

                  <label>
                    <span className={rotuloCelular}>Tipo</span>
                    <select value={l.tipo} onChange={(e) => alterar(l.id, { tipo: e.target.value as LinhaReceita["tipo"] })} className={campo}>
                      {TIPOS.map((t) => (
                        <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className={rotuloCelular}>Papel</span>
                    <select
                      value={l.papel}
                      onChange={(e) => {
                        const papel = e.target.value as LinhaReceita["papel"];
                        alterar(l.id, { papel, espelhaId: papel === "espelho" ? l.espelhaId : null });
                      }}
                      className={campo}
                    >
                      {PAPEIS.map((p) => (
                        <option key={p.valor} value={p.valor}>{p.rotulo}</option>
                      ))}
                    </select>
                  </label>

                  <label className={l.papel === "espelho" ? "" : "hidden lg:block"}>
                    <span className={rotuloCelular}>Espelha</span>
                    {l.papel === "espelho" ? (
                      <select value={l.espelhaId ?? ""} onChange={(e) => alterar(l.id, { espelhaId: e.target.value || null })} className={campo}>
                        <option value="">Escolha…</option>
                        {linhas
                          .filter((outra) => outra.id !== l.id)
                          .map((outra) => (
                            <option key={outra.id} value={outra.id}>{outra.nome || "(sem nome)"}</option>
                          ))}
                      </select>
                    ) : (
                      <span className="block px-3.5 text-neutro-400">—</span>
                    )}
                  </label>

                  <label>
                    <span className={rotuloCelular}>Percentual</span>
                    <span className="relative block">
                      <input
                        value={l.percentual}
                        inputMode="decimal"
                        onChange={(e) => alterar(l.id, { percentual: e.target.value })}
                        placeholder="0"
                        className={`${campo} tabular pr-8 text-right`}
                      />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-neutro-500">%</span>
                    </span>
                  </label>

                  <button type="button" onClick={() => remover(l.id)} className={`${botao.icone} hidden hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400 lg:inline-flex`} aria-label={`Remover ${l.nome || "ingrediente"}`}>
                    <IconeLixeira width={18} height={18} />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => adicionar("mp")} className={botao.secundario}>
            <IconeMais width={18} height={18} />
            Matéria-prima
          </button>
          <button type="button" onClick={() => adicionar("tempero")} className={botao.secundario}>
            <IconeMais width={18} height={18} />
            Tempero
          </button>
        </div>
      </section>

      {erro && (
        <Aviso tom="vermelho">
          <IconeAlerta className="mt-0.5 shrink-0" width={18} height={18} />
          {erro}
        </Aviso>
      )}

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-neutro-200/80 bg-superficie/90 p-3 shadow-elevado backdrop-blur lg:bottom-6">
        <button disabled={salvando} className={`${botao.primario} min-w-32`}>
          {salvando && <IconeGiro width={18} height={18} />}
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <span className="hidden text-sm text-neutro-600 sm:inline">
          {linhas.length} {linhas.length === 1 ? "ingrediente" : "ingredientes"}
        </span>
        {produto && <ExcluirProduto aoConfirmar={() => executar(() => excluirProduto(produto.id))} desabilitado={salvando} />}
      </div>
    </form>
  );
}

// Confirmação inline (sem window.confirm, que bloqueia a página).
function ExcluirProduto({ aoConfirmar, desabilitado }: { aoConfirmar: () => void; desabilitado: boolean }) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className={`${botao.perigoFantasma} ml-auto`}>
        <IconeLixeira width={18} height={18} />
        Excluir produto
      </button>
    );
  }
  return (
    <div className="ml-auto flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-red-800 dark:text-red-300">Excluir de vez?</span>
      <button type="button" onClick={() => setConfirmando(false)} className={botao.secundario}>
        Cancelar
      </button>
      <button type="button" disabled={desabilitado} onClick={aoConfirmar} className={botao.perigo}>
        Sim, excluir
      </button>
    </div>
  );
}
