"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { CHAVE_TEMA, type Tema } from "@/lib/tema";
import { IconeLua, IconeSol } from "./icones";

const EVENTO = "tema-alterado";

function lerTema(): Tema {
  try {
    return localStorage.getItem(CHAVE_TEMA) === "escuro" ? "escuro" : "claro";
  } catch {
    return "claro";
  }
}

// Ligado enquanto uma tela sempre clara (login) está aberta: ignora a preferência salva.
let forcarClaro = false;

function aplicarTema() {
  const raiz = document.documentElement;
  const tema = forcarClaro ? "claro" : lerTema();
  if (raiz.getAttribute("data-tema") === tema) return;
  // Troca instantânea: sem isso cada card animaria a cor separadamente.
  raiz.classList.add("trocando-tema");
  raiz.setAttribute("data-tema", tema);
  void raiz.offsetHeight; // força o navegador a aplicar as cores novas já sem transição
  requestAnimationFrame(() => raiz.classList.remove("trocando-tema"));
}

function assinar(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO, aviso);
    window.removeEventListener("storage", aviso);
  };
}

export function definirTema(tema: Tema) {
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // Sem armazenamento: o tema vale só até recarregar.
  }
  aplicarTema();
  window.dispatchEvent(new Event(EVENTO));
}

export function useTema() {
  return useSyncExternalStore(assinar, lerTema, () => "claro" as const);
}

/**
 * Deixa a tela sempre no tema claro enquanto estiver montada (ex.: login).
 * Cobre a navegação sem recarregar (ex.: "Sair" → login); ao sair dela, volta a preferência.
 * useLayoutEffect: aplica antes da pintura, sem piscar o escuro.
 */
export function ForcarTemaClaro() {
  useLayoutEffect(() => {
    forcarClaro = true;
    aplicarTema();
    return () => {
      forcarClaro = false;
      aplicarTema();
    };
  }, []);
  return null;
}

/** Mantém o tema igual em todas as abas abertas quando a preferência muda em uma delas. */
export function SincronizadorTema() {
  useEffect(() => {
    window.addEventListener("storage", aplicarTema);
    return () => window.removeEventListener("storage", aplicarTema);
  }, []);
  return null;
}

export const OPCOES_TEMA = [
  { valor: "claro", rotulo: "Claro", Icone: IconeSol },
  { valor: "escuro", rotulo: "Escuro", Icone: IconeLua },
] as const;

// A opção marcada é desenhada pelo CSS a partir de <html data-tema>, que o script do
// <head> já definiu: aparece certa antes do React hidratar (sem piscar o sol no escuro).
// Classes completas e literais para o Tailwind encontrá-las.
const MARCADO: Record<"pagina" | "nav", Record<(typeof OPCOES_TEMA)[number]["valor"], string>> = {
  pagina: {
    claro: "claro:bg-superficie claro:text-neutro-900 claro:shadow-card claro:ring-1 claro:ring-inset claro:ring-neutro-200",
    escuro: "dark:bg-superficie dark:text-neutro-900 dark:shadow-card dark:ring-1 dark:ring-inset dark:ring-neutro-200",
  },
  nav: {
    claro: "claro:bg-nav-campo claro:text-nav-forte claro:shadow-card claro:ring-1 claro:ring-inset claro:ring-nav-borda-forte",
    escuro: "dark:bg-nav-campo dark:text-nav-forte dark:shadow-card dark:ring-1 dark:ring-inset dark:ring-nav-borda-forte",
  },
};

/**
 * Seletor em pílula (sol/lua), com a opção marcada num círculo destacado.
 * `naNavegacao` = cores da sidebar; `compacto` = pílula vertical (sidebar recolhida).
 */
export function SeletorTema({ naNavegacao = false, compacto = false }: { naNavegacao?: boolean; compacto?: boolean }) {
  const tema = useTema();

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={`inline-flex items-center gap-1 rounded-full p-1 ring-1 ring-inset ${compacto ? "flex-col" : ""} ${
        naNavegacao ? "bg-nav-hover ring-nav-borda" : "bg-neutro-100 ring-neutro-200"
      }`}
    >
      {OPCOES_TEMA.map(({ valor, rotulo, Icone }) => {
        const marcado = tema === valor;
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={marcado}
            aria-label={`Tema ${rotulo.toLowerCase()}`}
            title={`Tema ${rotulo.toLowerCase()}`}
            onClick={() => definirTema(valor)}
            className={`flex size-9 items-center justify-center rounded-full transition duration-150 ${
              naNavegacao ? "text-nav-suave hover:text-nav-forte" : "text-neutro-500 hover:text-neutro-900"
            } ${MARCADO[naNavegacao ? "nav" : "pagina"][valor]}`}
          >
            <Icone width={17} height={17} />
          </button>
        );
      })}
    </div>
  );
}
