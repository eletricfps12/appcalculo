import type { SVGProps } from "react";

// Ícones de traço (24×24, estilo Lucide), sem dependência externa.
type Props = SVGProps<SVGSVGElement>;

const Icone = ({ children, ...props }: Props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    width={20}
    height={20}
    {...props}
  >
    {children}
  </svg>
);

export const IconeBalanca = (p: Props) => (
  <Icone {...p}>
    <path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7Zm14 0-3 7a3.5 3.5 0 0 0 6 0l-3-7Z" />
  </Icone>
);

export const IconeLista = (p: Props) => (
  <Icone {...p}>
    <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
  </Icone>
);

export const IconeSair = (p: Props) => (
  <Icone {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icone>
);

export const IconeBusca = (p: Props) => (
  <Icone {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icone>
);

export const IconeSeta = (p: Props) => (
  <Icone {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icone>
);

export const IconeVoltar = (p: Props) => (
  <Icone {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Icone>
);

export const IconeCadeado = (p: Props) => (
  <Icone {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icone>
);

export const IconeImpressora = (p: Props) => (
  <Icone {...p}>
    <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </Icone>
);

export const IconeDownload = (p: Props) => (
  <Icone {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Icone>
);

export const IconeBorracha = (p: Props) => (
  <Icone {...p}>
    <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 19M7 21h14M7 21l-4-4M9.5 8.5l6 6" />
  </Icone>
);

export const IconeAlerta = (p: Props) => (
  <Icone {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01" />
  </Icone>
);

export const IconeMais = (p: Props) => (
  <Icone {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icone>
);

export const IconeLixeira = (p: Props) => (
  <Icone {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </Icone>
);

export const IconeCima = (p: Props) => (
  <Icone {...p}>
    <path d="m6 15 6-6 6 6" />
  </Icone>
);

export const IconeBaixo = (p: Props) => (
  <Icone {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icone>
);

export const IconeCaixa = (p: Props) => (
  <Icone {...p}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8" />
  </Icone>
);

export const IconeChevronDireita = (p: Props) => (
  <Icone {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icone>
);

export const IconeRecolher = (p: Props) => (
  <Icone {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M16 15l-3-3 3-3" />
  </Icone>
);

export const IconeExpandir = (p: Props) => (
  <Icone {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M13 9l3 3-3 3" />
  </Icone>
);

export const IconeFechar = (p: Props) => (
  <Icone {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icone>
);

export const IconeSol = (p: Props) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icone>
);

export const IconeLua = (p: Props) => (
  <Icone {...p}>
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
  </Icone>
);

export const IconeOlho = (p: Props) => (
  <Icone {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icone>
);

export const IconeOlhoFechado = (p: Props) => (
  <Icone {...p}>
    <path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
  </Icone>
);

export const IconeGiro = (p: Props) => (
  <Icone {...p} className={`animate-spin ${p.className ?? ""}`}>
    <path d="M21 12a9 9 0 1 1-6.2-8.6" />
  </Icone>
);
