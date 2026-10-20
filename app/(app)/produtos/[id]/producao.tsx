"use client";

import { useMemo, useState } from "react";
import { baixarFicha, imprimirFicha } from "@/components/ficha/gerar";
import {
  IconeAlerta,
  IconeBorracha,
  IconeCadeado,
  IconeDownload,
  IconeGiro,
  IconeImpressora,
} from "@/components/icones";
import { Trilha } from "@/components/trilha";
import { Aviso, Badge, ValorAnimado, botao, cartao } from "@/components/ui";
import { calcularReceita, type IngredienteCalculado } from "@/lib/calculo";
import type { Produto } from "@/lib/dados";
import { ehPesoFino, montarFicha } from "@/lib/ficha";
import { formatarPercentual, formatarPeso, lerNumero } from "@/lib/formato";

type Gerando = "imprimir" | "baixar" | null;

export function Producao({ produto }: { produto: Produto }) {
  const [pesoBase, setPesoBase] = useState("");
  const [manuais, setManuais] = useState<Record<string, string>>({});
  const [gerando, setGerando] = useState<Gerando>(null);
  const [erroFicha, setErroFicha] = useState<string | null>(null);

  const entrada = useMemo(
    () => ({
      pesoBase: lerNumero(pesoBase),
      manuais: Object.fromEntries(Object.entries(manuais).map(([id, texto]) => [id, lerNumero(texto)])),
    }),
    [pesoBase, manuais]
  );
  const resultado = useMemo(() => calcularReceita(produto.ingredientes, entrada), [produto.ingredientes, entrada]);

  const nomes = new Map(produto.ingredientes.map((i) => [i.id, i.nome]));
  const mps = resultado.ingredientes.filter((i) => i.tipo === "mp");
  const temperos = resultado.ingredientes.filter((i) => i.tipo === "tempero");
  const manuaisUsados = resultado.ingredientes.filter((i) => i.manual);
  const base = resultado.ingredientes.find((i) => i.papel === "base");
  const pronto = resultado.totalKg !== null && !resultado.erro;

  async function gerarFicha(acao: Exclude<Gerando, null>) {
    const ficha = montarFicha(produto, entrada);
    if (!ficha) return;
    setErroFicha(null);
    setGerando(acao);
    try {
      await (acao === "imprimir" ? imprimirFicha(ficha) : baixarFicha(ficha));
    } catch (erro) {
      setErroFicha(erro instanceof Error ? erro.message : "Não foi possível gerar a ficha.");
    } finally {
      setGerando(null);
    }
  }

  const card = (i: IngredienteCalculado) => (
    <CardIngrediente
      key={i.id}
      ingrediente={i}
      espelhaNome={i.espelhaId ? nomes.get(i.espelhaId) : undefined}
      valor={i.papel === "base" ? pesoBase : (manuais[i.id] ?? "")}
      aoMudar={(texto) =>
        i.papel === "base" ? setPesoBase(texto) : setManuais((atual) => ({ ...atual, [i.id]: texto }))
      }
    />
  );

  return (
    <>
      <header className="mb-8">
        <Trilha secao="Produtos" href="/" atual={produto.nome} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{produto.nome}</h1>
          <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setPesoBase("");
                setManuais({});
              }}
              className={botao.fantasma}
            >
              <IconeBorracha width={18} height={18} />
              Limpar
            </button>
            <button type="button" disabled={!pronto || gerando !== null} onClick={() => gerarFicha("imprimir")} className={botao.secundario}>
              {gerando === "imprimir" ? <IconeGiro width={18} height={18} /> : <IconeImpressora width={18} height={18} />}
              Imprimir
            </button>
            <button type="button" disabled={!pronto || gerando !== null} onClick={() => gerarFicha("baixar")} className={botao.primario}>
              {gerando === "baixar" ? <IconeGiro width={18} height={18} /> : <IconeDownload width={18} height={18} />}
              Baixar PDF
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0 space-y-8">
          <section
            aria-live="polite"
            className="relative overflow-hidden rounded-2xl bg-carvao p-6 text-white shadow-elevado ring-1 ring-inset ring-carvao-borda sm:p-8"
          >
            {/* Filete bordô no topo. Card escuro nos dois temas (escala gray fixa). */}
            <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-marca-400/70 to-transparent sm:inset-x-8" />
            <p className="text-sm font-medium text-gray-300">Peso total da massa</p>
            <p className="mt-1 text-5xl font-semibold tracking-tight sm:text-6xl">
              {resultado.totalKg === null ? (
                <span className="text-gray-600">—</span>
              ) : (
                <ValorAnimado valor={formatarPeso(resultado.totalKg)} />
              )}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-300">
              {resultado.temManual ? (
                <>
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-200 ring-1 ring-inset ring-amber-300/30">
                    {manuaisUsados.map((i) => i.nome).join(", ")} manual
                  </span>
                  Pela receita seria <span className="tabular font-medium text-white">{formatarPeso(resultado.massaReferenciaKg)}</span>
                </>
              ) : resultado.totalKg === null ? (
                `Informe o peso de ${base?.nome ?? "MP 1"} para calcular.`
              ) : (
                "Calculado pelas porcentagens da receita."
              )}
            </p>
          </section>

          {(resultado.erro || resultado.avisos.length > 0 || erroFicha) && (
            <div className="space-y-2">
              {resultado.erro && (
                <Aviso tom="vermelho">
                  <IconeAlerta className="mt-0.5 shrink-0" width={18} height={18} />
                  {resultado.erro}
                </Aviso>
              )}
              {erroFicha && (
                <Aviso tom="vermelho">
                  <IconeAlerta className="mt-0.5 shrink-0" width={18} height={18} />
                  {erroFicha}
                </Aviso>
              )}
              {resultado.avisos.map((aviso) => (
                <Aviso key={aviso} tom="ambar">
                  <IconeAlerta className="mt-0.5 shrink-0" width={18} height={18} />
                  {aviso}
                </Aviso>
              ))}
            </div>
          )}

          {mps.length > 0 && (
            <section aria-labelledby="titulo-mps">
              <h2 id="titulo-mps" className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutro-600">
                Matérias-primas
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{mps.map(card)}</div>
            </section>
          )}

          {temperos.length > 0 && (
            <section aria-labelledby="titulo-temperos">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="titulo-temperos" className="text-sm font-semibold uppercase tracking-wide text-neutro-600">
                  Temperos
                </h2>
                {temperos.some((i) => ehPesoFino(i.pesoKg)) && (
                  <span className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                    <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
                    Pesagem fina: menos de 10 g
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{temperos.map(card)}</div>
            </section>
          )}
        </div>

        <aside className={`${cartao} p-5 lg:sticky lg:top-10`} aria-label="Resumo do lote">
          <h2 className="text-sm font-semibold text-neutro-900">Resumo do lote</h2>
          <dl className="mt-4 divide-y divide-neutro-100 text-sm">
            <ItemResumo rotulo="Total da massa" valor={formatarPeso(resultado.totalKg)} destaque />
            <ItemResumo rotulo={base?.nome ?? "Base"} valor={formatarPeso(base?.pesoKg ?? null)} />
            <ItemResumo rotulo="Ingredientes" valor={String(resultado.ingredientes.length)} />
            <ItemResumo
              rotulo="Soma da receita"
              valor={formatarPercentual(resultado.somaPercentuais)}
              tom={resultado.fechaEm100 ? undefined : "text-amber-800 dark:text-amber-300"}
            />
          </dl>
          {!pronto && <p className="mt-4 text-xs text-neutro-500">Impressão e PDF liberam após informar {base?.nome ?? "o peso base"}.</p>}
        </aside>
      </div>
    </>
  );
}

function ItemResumo({ rotulo, valor, destaque, tom }: { rotulo: string; valor: string; destaque?: boolean; tom?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <dt className="text-neutro-600">{rotulo}</dt>
      <dd className={`${destaque ? "text-lg font-semibold text-neutro-900" : "font-medium text-neutro-800"} ${tom ?? ""}`}>
        <ValorAnimado valor={valor} />
      </dd>
    </div>
  );
}

function CardIngrediente({
  ingrediente: i,
  espelhaNome,
  valor,
  aoMudar,
}: {
  ingrediente: IngredienteCalculado;
  espelhaNome?: string;
  valor: string;
  aoMudar: (texto: string) => void;
}) {
  const editavel = i.papel === "base" || i.papel === "variavel";
  const invalido = valor.trim() !== "" && lerNumero(valor) === null;
  const fino = ehPesoFino(i.pesoKg);
  const real = i.percentualReal === null ? null : `Real: ${formatarPercentual(i.percentualReal, 2)}`;

  if (!editavel) {
    const espelho = i.papel === "espelho";
    return (
      <div
        className={`rounded-2xl border p-4 transition duration-200 ${
          espelho
            ? "border-dashed border-neutro-300 bg-neutro-50"
            : fino
              ? "border-amber-300 bg-amber-50/60 shadow-card ring-1 ring-amber-200 dark:border-amber-400/40 dark:bg-amber-400/[0.07] dark:ring-amber-400/20"
              : "border-neutro-200/80 bg-superficie shadow-card"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-neutro-800">{i.nome}</span>
          <Badge tom={fino ? "ambar" : "neutro"}>{formatarPercentual(i.percentual)}</Badge>
        </div>
        <p className={`mt-3 font-semibold tracking-tight ${espelho ? "text-3xl text-neutro-700" : "text-2xl text-neutro-900"}`}>
          {i.pesoKg === null ? <span className="text-neutro-300">—</span> : <ValorAnimado valor={formatarPeso(i.pesoKg)} />}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutro-600">
          {espelho && (
            <span className="inline-flex items-center gap-1 font-medium text-neutro-700">
              <IconeCadeado width={14} height={14} />
              Espelha {espelhaNome ?? "—"}
            </span>
          )}
          {fino && <span className="font-semibold text-amber-800 dark:text-amber-300">Pesagem fina</span>}
          {real && <span className="tabular">{real}</span>}
        </p>
      </div>
    );
  }

  const idCampo = `peso-${i.id}`;
  const dica = invalido
    ? "Número inválido. Use vírgula para decimais."
    : i.papel === "base"
      ? "Digite o peso em kg"
      : i.manual
        ? "Peso manual. Apague para voltar ao cálculo."
        : "Opcional. Vazio = calculado pela receita.";

  return (
    <div className={`${cartao} p-4 transition duration-200 focus-within:border-marca-300 focus-within:shadow-elevado`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <label htmlFor={idCampo} className="text-sm font-semibold text-neutro-800">
          {i.nome}
        </label>
        <div className="flex gap-1">
          {i.manual && <Badge tom="ambar">Manual</Badge>}
          <Badge tom={i.papel === "base" ? "marca" : "neutro"}>{formatarPercentual(i.percentual)}</Badge>
        </div>
      </div>
      <div
        className={`flex items-center rounded-xl border bg-superficie transition duration-150 focus-within:ring-4 ${
          invalido
            ? "border-red-400 focus-within:ring-red-600/15"
            : "border-neutro-200 hover:border-neutro-300 focus-within:border-marca-500 focus-within:ring-marca-600/15"
        }`}
      >
        <input
          id={idCampo}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder={i.papel === "variavel" && i.pesoKg !== null ? formatarPeso(i.pesoKg) : "0,000"}
          aria-invalid={invalido}
          aria-describedby={`${idCampo}-dica`}
          className="tabular min-h-14 w-full min-w-0 rounded-xl bg-transparent px-4 text-3xl font-semibold tracking-tight text-neutro-900 outline-none placeholder:font-normal placeholder:text-neutro-300"
        />
        <span className="pr-4 text-base font-medium text-neutro-500">kg</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
        <span id={`${idCampo}-dica`} className={invalido ? "font-medium text-red-700 dark:text-red-400" : "text-neutro-600"}>
          {dica}
        </span>
        {real && <span className="tabular text-neutro-600">{real}</span>}
      </div>
    </div>
  );
}
