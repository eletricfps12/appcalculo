"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ComponentType, type ReactNode, type SVGProps } from "react";
import { sair } from "@/app/(app)/actions";
import { CONFIG } from "@/lib/config";
import {
  IconeBalanca,
  IconeBusca,
  IconeCaixa,
  IconeChevronDireita,
  IconeExpandir,
  IconeLista,
  IconeMais,
  IconeRecolher,
  IconeSair,
} from "./icones";
import { PaletaComandos, type ProdutoNav } from "./paleta-comandos";
import { SeletorTema } from "./tema";

type Icone = ComponentType<SVGProps<SVGSVGElement>>;

// --- Preferências do navegador (sem estado no servidor) ---

const CHAVE_RECOLHIDA = "nav-recolhida";
const EVENTO_RECOLHIDA = "nav-recolhida";

function lerRecolhida() {
  try {
    return localStorage.getItem(CHAVE_RECOLHIDA) === "1";
  } catch {
    return false;
  }
}

function assinarRecolhida(aviso: () => void) {
  window.addEventListener(EVENTO_RECOLHIDA, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO_RECOLHIDA, aviso);
    window.removeEventListener("storage", aviso);
  };
}

function gravarRecolhida(valor: boolean) {
  try {
    localStorage.setItem(CHAVE_RECOLHIDA, valor ? "1" : "0");
  } catch {
    // Sem armazenamento (aba anônima etc.): vale só até recarregar.
  }
  window.dispatchEvent(new Event(EVENTO_RECOLHIDA));
}

const ehMac = () => /Mac|iPhone|iPad/.test(navigator.platform);
const assinarNada = () => () => {};

// --- Peças visuais ---

/** Logo + nome. `escura` = dentro da sidebar (tokens nav-*); sem ela, sobre o fundo da página. */
export function Marca({ compacta = false, escura = false }: { compacta?: boolean; escura?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {/* Selo da marca: bordô com ícone branco. */}
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-marca-600 text-white shadow-destaque ring-1 ring-inset ring-white/15">
        <IconeBalanca width={18} height={18} />
      </span>
      {!compacta && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className={`truncate text-[13px] font-semibold ${escura ? "text-nav-forte" : "text-neutro-900"}`}>{CONFIG.sistema}</span>
          <span className={`truncate text-[11px] ${escura ? "text-nav-suave" : "text-neutro-500"}`}>{CONFIG.empresa}</span>
        </span>
      )}
    </span>
  );
}

function Grupo({ titulo, recolhida, children }: { titulo?: string; recolhida: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      {titulo &&
        (recolhida ? (
          <span aria-hidden="true" className="mx-auto mb-1 h-px w-6 bg-nav-borda" />
        ) : (
          <span className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-nav-suave">{titulo}</span>
        ))}
      {children}
    </div>
  );
}

// Sidebar (tokens nav-*, clara ou escura conforme o tema): ativo sempre bordô com texto branco.
const classeItem = (ativo: boolean, recolhida: boolean) =>
  `group flex min-h-10 w-full items-center gap-2.5 rounded-lg text-[13px] transition duration-150 select-none ${
    recolhida ? "justify-center px-0" : "px-3"
  } ${
    ativo
      ? "bg-marca-600 font-medium text-white shadow-destaque"
      : "text-nav-texto hover:bg-nav-hover hover:text-nav-forte"
  }`;

const classeIcone = (ativo: boolean) =>
  `shrink-0 ${ativo ? "text-white" : "text-nav-suave group-hover:text-nav-forte"}`;

function ItemNav({
  href,
  titulo,
  Icone,
  ativo,
  recolhida,
  badge,
}: {
  href: string;
  titulo: string;
  Icone: Icone;
  ativo: boolean;
  recolhida: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} aria-current={ativo ? "page" : undefined} title={recolhida ? titulo : undefined} className={classeItem(ativo, recolhida)}>
      <Icone width={17} height={17} className={classeIcone(ativo)} />
      {recolhida ? <span className="sr-only">{titulo}</span> : <span className="flex-1 truncate">{titulo}</span>}
      {!recolhida && badge !== undefined && <Contador valor={badge} ativo={ativo} />}
    </Link>
  );
}

function Contador({ valor, ativo = false }: { valor: number; ativo?: boolean }) {
  return (
    <span
      className={`tabular flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
        ativo ? "bg-white/20 text-white" : "bg-nav-hover text-nav-texto ring-1 ring-inset ring-nav-borda"
      }`}
    >
      {valor}
    </span>
  );
}

/** "Produtos" com a lista de produtos expansível (cada um abre a produção). */
function ItemProdutos({ produtos, caminho, recolhida }: { produtos: ProdutoNav[]; caminho: string; recolhida: boolean }) {
  const [aberto, setAberto] = useState(true);
  const noInicio = caminho === "/";
  const naProducao = caminho.startsWith("/produtos/");

  if (recolhida || produtos.length === 0) {
    return <ItemNav href="/" titulo="Produtos" Icone={IconeCaixa} ativo={noInicio || naProducao} recolhida={recolhida} />;
  }

  return (
    <div className="flex flex-col">
      <div className={`${classeItem(noInicio, false)} pr-1`}>
        <Link href="/" aria-current={noInicio ? "page" : undefined} className="flex min-h-10 flex-1 items-center gap-2.5 rounded-lg">
          <IconeCaixa width={17} height={17} className={classeIcone(noInicio)} />
          <span className="flex-1 truncate">Produtos</span>
        </Link>
        <Contador valor={produtos.length} ativo={noInicio} />
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-label={aberto ? "Recolher lista de produtos" : "Mostrar lista de produtos"}
          className={`flex size-8 items-center justify-center rounded-md transition duration-150 ${
            noInicio ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-nav-suave hover:bg-nav-hover hover:text-nav-forte"
          }`}
        >
          <IconeChevronDireita width={14} height={14} className={`transition-transform duration-200 ${aberto ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Abre/fecha com animação de altura (grid 0fr → 1fr). */}
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${aberto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="relative min-h-0 overflow-hidden">
          <span aria-hidden="true" className="absolute inset-y-1 left-[21px] border-l border-nav-borda-forte" />
          <ul className="mt-0.5 flex flex-col gap-0.5 py-0.5">
            {produtos.map((p) => {
              const ativo = caminho === `/produtos/${p.id}`;
              return (
                <li key={p.id}>
                  <Link
                    href={`/produtos/${p.id}`}
                    tabIndex={aberto ? undefined : -1}
                    aria-current={ativo ? "page" : undefined}
                    className={`relative flex min-h-9 items-center gap-2.5 rounded-lg pl-9 pr-3 text-[13px] transition duration-150 ${
                      ativo ? "bg-nav-filho-ativo font-medium text-nav-forte shadow-card" : "text-nav-suave hover:bg-nav-hover hover:text-nav-forte"
                    }`}
                  >
                    {/* Indicador do produto aberto: barra bordô (legível nos dois temas). */}
                    {ativo && <span aria-hidden="true" className="absolute left-[19px] h-4 w-[3px] rounded-full bg-marca-500" />}
                    <span className="truncate">{p.nome}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Conta({ email, recolhida }: { email: string | null; recolhida: boolean }) {
  if (!email) return null;
  return (
    <div className={`flex items-center gap-2.5 rounded-lg py-2 ${recolhida ? "justify-center" : "px-3"}`} title={recolhida ? email : undefined}>
      <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-marca-50 text-xs font-semibold uppercase text-marca-texto ring-1 ring-inset ring-marca-200">
        {email.charAt(0)}
      </span>
      {recolhida ? <span className="sr-only">{email}</span> : <span className="min-w-0 truncate text-[12px] text-nav-suave">{email}</span>}
    </div>
  );
}

// --- Navegação principal ---

/**
 * Sidebar no desktop (recolhível) e barra inferior no tablet/celular.
 * Sem `caminho`, nenhum item fica ativo (fallback enquanto a URL não é lida).
 */
export function Navegacao({
  caminho = "",
  produtos = [],
  email = null,
}: {
  caminho?: string;
  produtos?: ProdutoNav[];
  email?: string | null;
}) {
  const recolhida = useSyncExternalStore(assinarRecolhida, lerRecolhida, () => false);
  const atalho = useSyncExternalStore(assinarNada, () => (ehMac() ? "⌘K" : "Ctrl K"), () => "Ctrl K");
  const [buscando, setBuscando] = useState(false);

  // O conteúdo principal acompanha a largura da sidebar.
  useEffect(() => {
    document.documentElement.style.setProperty("--largura-nav", recolhida ? "4.5rem" : "16rem");
  }, [recolhida]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBuscando((v) => !v);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  const emCadastro = caminho === "/cadastro" || (caminho.startsWith("/cadastro/") && caminho !== "/cadastro/novo");

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-nav-borda bg-nav py-4 transition-[width] duration-300 ease-in-out lg:flex ${
          recolhida ? "w-[4.5rem] px-2.5" : "w-64 px-3"
        }`}
      >
        <div className={`mb-4 flex items-center gap-2 ${recolhida ? "flex-col" : "justify-between pl-1"}`}>
          <Link href="/" className="min-w-0 rounded-xl p-1" aria-label={`${CONFIG.sistema}, início`}>
            <Marca compacta={recolhida} escura />
          </Link>
          <button
            type="button"
            onClick={() => gravarRecolhida(!recolhida)}
            aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
            title={recolhida ? "Expandir menu" : "Recolher menu"}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-nav-suave transition duration-150 hover:bg-nav-hover hover:text-nav-forte"
          >
            {recolhida ? <IconeExpandir width={18} height={18} /> : <IconeRecolher width={18} height={18} />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setBuscando(true)}
          title={recolhida ? `Buscar (${atalho})` : undefined}
          className={`group mb-5 flex min-h-10 items-center gap-2.5 rounded-lg border border-nav-borda bg-nav-campo text-[13px] text-nav-suave shadow-card transition duration-150 hover:border-nav-borda-forte hover:text-nav-forte ${
            recolhida ? "justify-center" : "px-3"
          }`}
        >
          <IconeBusca width={16} height={16} className="shrink-0" />
          {recolhida ? (
            <span className="sr-only">Buscar</span>
          ) : (
            <>
              <span className="flex-1 text-left">Buscar…</span>
              <kbd className="rounded-md border border-nav-borda bg-nav px-1.5 py-0.5 font-mono text-[10px] text-nav-suave">{atalho}</kbd>
            </>
          )}
        </button>

        <nav aria-label="Principal" className="flex flex-1 flex-col gap-5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Grupo titulo="Produção" recolhida={recolhida}>
            <ItemProdutos produtos={produtos} caminho={caminho} recolhida={recolhida} />
          </Grupo>
          <Grupo titulo="Cadastro" recolhida={recolhida}>
            <ItemNav href="/cadastro" titulo="Receitas" Icone={IconeLista} ativo={emCadastro} recolhida={recolhida} />
            <ItemNav href="/cadastro/novo" titulo="Novo produto" Icone={IconeMais} ativo={caminho === "/cadastro/novo"} recolhida={recolhida} />
          </Grupo>
        </nav>

        <div className="mt-4 flex flex-col gap-0.5 border-t border-nav-borda pt-3">
          {recolhida ? (
            <div className="mb-2 flex justify-center">
              <SeletorTema naNavegacao compacto />
            </div>
          ) : (
            <div className="mb-2 flex items-center justify-between pl-3">
              <span className="text-[12px] text-nav-suave">Aparência</span>
              <SeletorTema naNavegacao />
            </div>
          )}
          <Conta email={email} recolhida={recolhida} />
          <form action={sair}>
            <button title={recolhida ? "Sair" : undefined} className={classeItem(false, recolhida)}>
              <IconeSair width={17} height={17} className={classeIcone(false)} />
              {recolhida ? <span className="sr-only">Sair</span> : <span className="flex-1 text-left">Sair</span>}
            </button>
          </form>
        </div>
      </aside>

      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-nav-borda bg-nav pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          <ItemBarra href="/" rotulo="Produção" Icone={IconeBalanca} ativo={caminho === "/" || caminho.startsWith("/produtos")} />
          <button type="button" onClick={() => setBuscando(true)} className={classeBarra(false)}>
            <span className="flex h-7 w-12 items-center justify-center rounded-full">
              <IconeBusca />
            </span>
            Buscar
          </button>
          <ItemBarra href="/cadastro" rotulo="Cadastro" Icone={IconeLista} ativo={caminho.startsWith("/cadastro")} />
          <form action={sair} className="contents">
            <button className={classeBarra(false)}>
              <span className="flex h-7 w-12 items-center justify-center rounded-full">
                <IconeSair />
              </span>
              Sair
            </button>
          </form>
        </div>
      </nav>

      {buscando && <PaletaComandos produtos={produtos} aoFechar={() => setBuscando(false)} />}
    </>
  );
}

const classeBarra = (ativo: boolean) =>
  `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition duration-150 ${
    ativo ? "text-nav-forte" : "text-nav-suave hover:text-nav-forte"
  }`;

// Item ativo: ícone numa pílula bordô + texto branco (não depende só da cor).
function ItemBarra({ href, rotulo, Icone, ativo }: { href: string; rotulo: string; Icone: Icone; ativo: boolean }) {
  return (
    <Link href={href} aria-current={ativo ? "page" : undefined} className={classeBarra(ativo)}>
      <span className={`flex h-7 w-12 items-center justify-center rounded-full transition duration-150 ${ativo ? "bg-marca-600 text-white" : ""}`}>
        <Icone />
      </span>
      {rotulo}
    </Link>
  );
}

export function NavegacaoAtiva(props: { produtos: ProdutoNav[]; email: string | null }) {
  return <Navegacao caminho={usePathname()} {...props} />;
}
