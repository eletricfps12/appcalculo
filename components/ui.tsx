import type { ReactNode } from "react";

// Primitivos visuais compartilhados. Classes em constantes para reuso em
// <button>, <Link> e <label> sem repetir o estilo.

// Desabilitado = fundo e texto neutros apagados (não só opacidade), em todas as variantes.
const baseBotao =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:shadow-none";

export const botao = {
  primario: `${baseBotao} bg-marca-600 text-white shadow-card hover:bg-marca-700 active:bg-marca-800 disabled:bg-neutro-200 disabled:text-neutro-500`,
  secundario: `${baseBotao} border border-marca-texto bg-superficie text-marca-texto shadow-card hover:bg-marca-50 active:bg-marca-100 disabled:border-neutro-200 disabled:bg-neutro-50 disabled:text-neutro-400`,
  fantasma: `${baseBotao} text-neutro-700 hover:bg-neutro-200/60 hover:text-neutro-900 disabled:text-neutro-400`,
  perigo: `${baseBotao} bg-red-600 text-white shadow-card hover:bg-red-700 disabled:bg-neutro-200 disabled:text-neutro-500`,
  perigoFantasma: `${baseBotao} text-red-700 hover:bg-red-50 disabled:text-neutro-400 dark:text-red-400 dark:hover:bg-red-500/10`,
  icone:
    "inline-flex size-11 items-center justify-center rounded-xl text-neutro-600 transition duration-150 hover:bg-neutro-100 hover:text-neutro-900 disabled:pointer-events-none disabled:text-neutro-300",
};

export const campo =
  "min-h-11 w-full rounded-xl border border-neutro-200 bg-superficie px-3.5 text-base text-neutro-900 shadow-[inset_0_1px_1px_rgb(32_35_40/0.03)] transition duration-150 placeholder:text-neutro-400 hover:border-neutro-300 focus:border-marca-500 focus:outline-none focus:ring-4 focus:ring-marca-600/15";

export const cartao = "rounded-2xl border border-neutro-200 bg-superficie shadow-card";

// "marca" = identidade (bordô); "sucesso" = status positivo (verde). Nunca trocar um pelo outro.
type Tom = "neutro" | "marca" | "sucesso" | "ambar" | "vermelho" | "info";
const tons: Record<Tom, string> = {
  neutro: "bg-neutro-100 text-neutro-700 ring-neutro-200",
  marca: "bg-marca-50 text-marca-texto ring-marca-200",
  sucesso: "bg-sucesso-50 text-sucesso-800 ring-sucesso-200",
  // Amber/red/blue são do Tailwind (fixos), por isso têm variante escura explícita.
  ambar: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/25",
  vermelho: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/25",
  info: "bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-400/25",
};

export function Badge({ tom = "neutro", children, className = "" }: { tom?: Tom; children: ReactNode; className?: string }) {
  return (
    <span
      className={`tabular inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tons[tom]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Aviso({ tom, children }: { tom: "ambar" | "vermelho" | "sucesso" | "info"; children: ReactNode }) {
  return (
    <div
      role={tom === "vermelho" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1 ring-inset ${tons[tom]}`}
    >
      {children}
    </div>
  );
}

export function Esqueleto({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-neutro-200/70 ${className}`} />;
}

export function EstadoVazio({ icone, titulo, children }: { icone: ReactNode; titulo: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutro-300 bg-superficie/60 px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-marca-50 text-marca-texto ring-1 ring-marca-100">
        {icone}
      </div>
      <p className="text-base font-semibold text-neutro-900">{titulo}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-neutro-600">{children}</div>}
    </div>
  );
}

/** Reaparece suavemente sempre que o texto muda (chave = valor). */
export function ValorAnimado({ valor, className = "" }: { valor: string; className?: string }) {
  return (
    <span key={valor} className={`tabular inline-block animate-valor ${className}`}>
      {valor}
    </span>
  );
}

export function Cabecalho({ titulo, descricao, acoes, antes }: { titulo: string; descricao?: string; acoes?: ReactNode; antes?: ReactNode }) {
  return (
    <header className="mb-8">
      {antes}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-neutro-900 sm:text-3xl">{titulo}</h1>
          {descricao && <p className="mt-1 text-neutro-600">{descricao}</p>}
        </div>
        {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
      </div>
    </header>
  );
}
