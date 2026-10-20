"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ComponentType, type SVGProps } from "react";
import { IconeBusca, IconeCaixa, IconeFechar, IconeLista, IconeMais } from "./icones";
import { OPCOES_TEMA, definirTema } from "./tema";

export interface ProdutoNav {
  id: string;
  nome: string;
}

interface Comando {
  id: string;
  grupo: "Produtos" | "Ações" | "Tema";
  titulo: string;
  dica: string;
  /** Navega para cá... */
  href?: string;
  /** ...ou executa isto (sem navegar). */
  executar?: () => void;
  Icone: ComponentType<SVGProps<SVGSVGElement>>;
}

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

const ACOES: Comando[] = [
  { id: "novo", grupo: "Ações", titulo: "Novo produto", dica: "Cadastrar receita", href: "/cadastro/novo", Icone: IconeMais },
  { id: "cadastro", grupo: "Ações", titulo: "Receitas cadastradas", dica: "Cadastro", href: "/cadastro", Icone: IconeLista },
  ...OPCOES_TEMA.map(
    ({ valor, rotulo, Icone }): Comando => ({
      id: `tema-${valor}`,
      grupo: "Tema",
      titulo: `Tema ${rotulo.toLowerCase()}`,
      dica: "Aparência",
      executar: () => definirTema(valor),
      Icone,
    })
  ),
];

/** Busca rápida (Ctrl/⌘ K): abrir a produção de um produto ou ir a uma ação. */
export function PaletaComandos({ produtos, aoFechar }: { produtos: ProdutoNav[]; aoFechar: () => void }) {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [indice, setIndice] = useState(0);
  const listaId = useId();
  const anterior = useRef<Element | null>(null);

  // Ao fechar, devolve o foco para quem abriu a paleta.
  useEffect(() => {
    anterior.current = document.activeElement;
    return () => (anterior.current as HTMLElement | null)?.focus?.();
  }, []);

  const busca = normalizar(termo);
  const comandos = [
    ...produtos.map(
      (p): Comando => ({ id: p.id, grupo: "Produtos", titulo: p.nome, dica: "Abrir produção", href: `/produtos/${p.id}`, Icone: IconeCaixa })
    ),
    ...ACOES,
  ].filter((c) => !busca || normalizar(c.titulo).includes(busca));
  const ativo = Math.min(indice, Math.max(comandos.length - 1, 0));

  const abrir = (c: Comando) => {
    aoFechar();
    if (c.executar) c.executar();
    else if (c.href) router.push(c.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]" role="presentation">
      <div className="absolute inset-0 animate-surgir bg-black/40 backdrop-blur-sm" onClick={aoFechar} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar"
        className="relative w-full max-w-xl animate-cartao overflow-hidden rounded-2xl border border-neutro-200 bg-superficie shadow-flutuante"
        onKeyDown={(e) => {
          if (e.key === "Escape") aoFechar();
          else if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndice((ativo + 1) % Math.max(comandos.length, 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndice((ativo - 1 + comandos.length) % Math.max(comandos.length, 1));
          } else if (e.key === "Enter" && comandos[ativo]) {
            e.preventDefault();
            abrir(comandos[ativo]);
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-neutro-200 px-4">
          <IconeBusca className="shrink-0 text-neutro-400" />
          <input
            autoFocus
            value={termo}
            onChange={(e) => {
              setTermo(e.target.value);
              setIndice(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={listaId}
            aria-activedescendant={comandos[ativo] ? `${listaId}-${comandos[ativo].id}` : undefined}
            placeholder="Buscar produto ou ação…"
            className="min-h-14 flex-1 bg-transparent text-base text-neutro-900 outline-none placeholder:text-neutro-400"
          />
          <kbd className="hidden h-6 items-center rounded-md border border-neutro-200 bg-neutro-50 px-1.5 font-mono text-[11px] text-neutro-500 sm:inline-flex">
            Esc
          </kbd>
          <button type="button" onClick={aoFechar} aria-label="Fechar busca" className="-mr-2 flex size-11 items-center justify-center rounded-xl text-neutro-500 transition duration-150 hover:bg-neutro-100 hover:text-neutro-900">
            <IconeFechar width={18} height={18} />
          </button>
        </div>

        {comandos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <IconeBusca className="mb-2 text-neutro-300" width={24} height={24} />
            <p className="text-sm font-medium text-neutro-700">Nada encontrado para “{termo.trim()}”</p>
            <p className="mt-1 text-sm text-neutro-500">Confira a grafia ou cadastre um produto novo.</p>
          </div>
        ) : (
          <ul id={listaId} role="listbox" aria-label="Resultados" className="max-h-[50vh] overflow-y-auto p-2">
            {comandos.map((c, i) => {
              const primeiroDoGrupo = i === 0 || comandos[i - 1].grupo !== c.grupo;
              return (
                <li key={c.id} role="presentation">
                  {primeiroDoGrupo && (
                    <p className={`px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutro-400 ${i > 0 ? "pt-3" : "pt-1"}`}>{c.grupo}</p>
                  )}
                  <div
                    id={`${listaId}-${c.id}`}
                    role="option"
                    aria-selected={i === ativo}
                    onMouseMove={() => setIndice(i)}
                    onClick={() => abrir(c)}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 transition duration-100 ${
                      i === ativo ? "bg-marca-50 text-marca-900" : "text-neutro-800"
                    }`}
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${i === ativo ? "bg-superficie text-marca-texto ring-marca-200" : "bg-neutro-50 text-neutro-500 ring-neutro-200"}`}>
                      <c.Icone width={16} height={16} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.titulo}</span>
                    <span className={`text-xs ${i === ativo ? "text-marca-texto" : "text-neutro-400"}`}>{c.dica}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="hidden items-center gap-4 border-t border-neutro-100 bg-neutro-50/60 px-4 py-2.5 text-xs text-neutro-500 sm:flex">
          <span><kbd className="font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono">Enter</kbd> abrir</span>
          <span><kbd className="font-mono">Esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
