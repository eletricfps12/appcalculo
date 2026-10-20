"use client";

import Link from "next/link";
import { useState } from "react";
import { IconeBusca, IconeSeta } from "@/components/icones";
import { SomaPercentual } from "@/components/soma-percentual";
import { EstadoVazio, campo } from "@/components/ui";
import type { ResumoProduto } from "@/lib/dados";
import { formatarPercentual } from "@/lib/formato";

// Busca sem diferenciar maiúsculas nem acentos ("linguica" acha "Linguiça").
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

/** Iniciais das duas primeiras palavras: "Linguiça Teste" → "LT". */
const monograma = (nome: string) =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palavra) => palavra.charAt(0))
    .join("")
    .toUpperCase();

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export function GradeProdutos({ produtos }: { produtos: ResumoProduto[] }) {
  const [busca, setBusca] = useState("");
  const termo = normalizar(busca);
  const visiveis = termo ? produtos.filter((p) => normalizar(p.nome).includes(termo)) : produtos;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <label className="relative block w-full max-w-md">
          <span className="sr-only">Buscar produto</span>
          <IconeBusca className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutro-400" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto…"
            className={`${campo} pl-11`}
          />
        </label>
        <p className="tabular text-sm text-neutro-500" aria-live="polite">
          {termo ? `${visiveis.length} de ${plural(produtos.length, "produto", "produtos")}` : plural(produtos.length, "produto", "produtos")}
        </p>
      </div>

      {visiveis.length === 0 ? (
        <EstadoVazio icone={<IconeBusca />} titulo="Nenhum produto encontrado">
          Nada corresponde a “{busca.trim()}”. Confira a grafia ou limpe a busca.
        </EstadoVazio>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((produto) => (
            <li key={produto.id}>
              <CardProduto produto={produto} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CardProduto({ produto: p }: { produto: ResumoProduto }) {
  const fecha = p.somaPercentuais === 100;
  // A barra usa 100% como escala (ou a soma, se a receita passar de 100).
  const escala = Math.max(p.somaPercentuais, 100);
  const largura = (percentual: number) => `${(percentual / escala) * 100}%`;

  return (
    <Link
      href={`/produtos/${p.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutro-200 bg-superficie shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:border-marca-300 hover:shadow-elevado active:translate-y-0"
    >
      {/* Filete bordô no topo, só no hover: o único brilho do card. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-marca-400 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-marca-600 text-[13px] font-semibold tracking-wide text-white shadow-destaque ring-1 ring-inset ring-white/15 transition duration-200 group-hover:ring-white/30"
          >
            {monograma(p.nome)}
          </span>
          <SomaPercentual soma={p.somaPercentuais} fecha={fecha} rotulo="Receita" />
        </div>

        <h2 className="mt-5 text-[17px] font-semibold leading-snug tracking-tight text-neutro-900">{p.nome}</h2>
        <p className="tabular mt-1 text-sm text-neutro-500">
          {plural(p.totalIngredientes, "ingrediente", "ingredientes")}
          <span aria-hidden="true" className="mx-1.5 text-neutro-300">
            ·
          </span>
          {plural(p.materiasPrimas.quantidade, "MP", "MP")}
          <span aria-hidden="true" className="mx-1.5 text-neutro-300">
            ·
          </span>
          {plural(p.temperos.quantidade, "tempero", "temperos")}
        </p>

        {/* Composição da massa: matéria-prima (bordô) × temperos (bordô claro). */}
        <div className="mt-auto pt-6">
          <div
            role="img"
            aria-label={`Composição: matéria-prima ${formatarPercentual(p.materiasPrimas.percentual)}, temperos ${formatarPercentual(p.temperos.percentual)}`}
            className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-neutro-100"
          >
            <span className="h-full rounded-full bg-marca-600" style={{ width: largura(p.materiasPrimas.percentual) }} />
            <span className="h-full rounded-full bg-marca-apoio" style={{ width: largura(p.temperos.percentual) }} />
          </div>
          <div aria-hidden="true" className="tabular mt-2.5 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-neutro-500">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-marca-600" />
              Matéria-prima <strong className="font-medium text-neutro-700">{formatarPercentual(p.materiasPrimas.percentual, 2)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-marca-apoio" />
              Temperos <strong className="font-medium text-neutro-700">{formatarPercentual(p.temperos.percentual, 2)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutro-200 px-5 py-3 text-sm">
        <span className="font-medium text-neutro-500 transition duration-200 group-hover:text-marca-texto">Abrir produção</span>
        <span className="flex size-8 items-center justify-center rounded-full text-neutro-400 ring-1 ring-inset ring-neutro-200 transition duration-200 group-hover:bg-marca-600 group-hover:text-white group-hover:ring-marca-600">
          <IconeSeta width={16} height={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
