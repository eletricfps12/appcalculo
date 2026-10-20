"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  IconeAlerta,
  IconeBalanca,
  IconeGiro,
  IconeImpressora,
  IconeOlho,
  IconeOlhoFechado,
} from "@/components/icones";
import { Marca } from "@/components/navegacao";
import { ForcarTemaClaro } from "@/components/tema";
import { CONFIG } from "@/lib/config";
import { createClient } from "@/utils/supabase/client";
import foto from "@/public/login-embutidos.jpg";

// Atraso de entrada escalonado (ms) para cada bloco da tela.
const atraso = (ms: number) => ({ animationDelay: `${ms}ms` });

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [ajudaSenha, setAjudaSenha] = useState(false);

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    setErro(null);
    setEnviando(true);

    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("senha")),
    });

    if (error) {
      setErro(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      setEnviando(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-fundo md:flex-row">
      {/* Formulário */}
      <section className="relative flex flex-1 flex-col px-6 py-8 sm:px-10 md:py-10">
        {/* O login é sempre claro, seja qual for o tema escolhido dentro do sistema. */}
        <ForcarTemaClaro />
        <div className="animate-entrar" style={atraso(0)}>
          <Marca />
        </div>

        {/* Faixa com a foto no celular (no desktop ela vira a coluna da direita). */}
        <div className="relative mt-6 h-36 animate-entrar overflow-hidden rounded-3xl md:hidden" style={atraso(80)}>
          {/* Sem preload: cada foto só carrega no tamanho de tela em que aparece. */}
          <Image src={foto} alt="" fill placeholder="blur" sizes="calc(100vw - 3rem)" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-carvao/80 to-transparent" />
          <p className="absolute bottom-4 left-5 text-sm font-medium text-white">Cada lote no ponto certo.</p>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <h1 className="animate-entrar text-4xl font-semibold leading-[1.1] tracking-tight text-neutro-900 md:text-5xl" style={atraso(100)}>
              <span className="font-light tracking-tighter text-neutro-600">Bem-vindo</span> de volta
            </h1>
            <p className="mt-4 animate-entrar text-neutro-600" style={atraso(200)}>
              Entre para calcular a receita do lote e imprimir a ficha de produção.
            </p>

            <form onSubmit={entrar} className="mt-10 space-y-5">
              <div className="animate-entrar" style={atraso(300)}>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutro-700">
                  E-mail
                </label>
                <CampoVidro>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="voce@fabrica.com.br"
                    className="min-h-14 w-full rounded-2xl bg-transparent px-4 text-base text-neutro-900 placeholder:text-neutro-400 focus:outline-none"
                  />
                </CampoVidro>
              </div>

              <div className="animate-entrar" style={atraso(400)}>
                <label htmlFor="senha" className="mb-2 block text-sm font-medium text-neutro-700">
                  Senha
                </label>
                <CampoVidro>
                  <div className="relative">
                    <input
                      id="senha"
                      name="senha"
                      type={verSenha ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      className="min-h-14 w-full rounded-2xl bg-transparent px-4 pr-14 text-base text-neutro-900 placeholder:text-neutro-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setVerSenha((v) => !v)}
                      aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={verSenha}
                      className="absolute inset-y-0 right-1.5 my-auto flex size-11 items-center justify-center rounded-xl text-neutro-500 transition duration-150 hover:bg-neutro-100 hover:text-neutro-900"
                    >
                      {verSenha ? <IconeOlhoFechado /> : <IconeOlho />}
                    </button>
                  </div>
                </CampoVidro>
              </div>

              <div className="animate-entrar text-sm" style={atraso(500)}>
                <button
                  type="button"
                  onClick={() => setAjudaSenha((v) => !v)}
                  aria-expanded={ajudaSenha}
                  className="min-h-11 rounded-lg font-medium text-marca-texto transition duration-150 hover:text-marca-900 hover:underline"
                >
                  Esqueceu a senha?
                </button>
                {ajudaSenha && (
                  <p className="animate-surgir rounded-xl bg-blue-50 px-4 py-3 text-blue-900 ring-1 ring-inset ring-blue-200">
                    Peça ao responsável pelo sistema para redefinir sua senha. Por segurança, o acesso é liberado só pela
                    administração.
                  </p>
                )}
              </div>

              {erro && (
                <div role="alert" className="flex animate-surgir items-start gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-inset ring-red-200">
                  <IconeAlerta className="mt-0.5 shrink-0" width={18} height={18} />
                  {erro}
                </div>
              )}

              <button
                disabled={enviando}
                className="flex min-h-14 w-full animate-entrar items-center justify-center gap-2 rounded-2xl bg-marca-600 text-base font-semibold text-white shadow-destaque transition duration-150 hover:bg-marca-700 active:scale-[0.99] active:bg-marca-800 disabled:bg-neutro-200 disabled:text-neutro-500 disabled:shadow-none"
                style={atraso(600)}
              >
                {enviando && <IconeGiro />}
                {enviando ? "Entrando…" : "Entrar"}
              </button>
            </form>

            <p className="mt-8 animate-entrar text-center text-sm text-neutro-500" style={atraso(700)}>
              Acesso restrito à equipe da {CONFIG.empresa}.
            </p>
          </div>
        </div>
      </section>

      {/* Foto + cartões com o que o sistema faz */}
      <section className="relative hidden flex-1 p-4 md:block">
        <div className="absolute inset-4 animate-deslizar overflow-hidden rounded-3xl bg-carvao" style={atraso(300)}>
          <Image src={foto} alt="Embutidos curando, pendurados na câmara de maturação" fill fetchPriority="high" placeholder="blur" sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-carvao/95 via-carvao/55 to-carvao/25" />

          <div className="absolute inset-x-0 bottom-0 p-6 lg:p-10">
            <p className="mb-3 flex animate-entrar items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-marca-200" style={atraso(600)}>
              <span aria-hidden="true" className="h-px w-8 bg-marca-300/70" />
              Precisão em cada lote
            </p>
            <p className="max-w-lg animate-entrar text-3xl font-semibold leading-tight tracking-tight text-white lg:text-4xl" style={atraso(700)}>
              Cada lote no ponto certo, do primeiro ao último quilo.
            </p>

            <div className="mt-8 flex gap-4">
              <CartaoVidro atrasoMs={1000}>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/70">
                  <IconeBalanca width={14} height={14} />
                  Lote calculado
                </div>
                <p className="mt-2 font-semibold text-white">Linguiça Colonial</p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <LinhaCartao rotulo="MP 1 informado" valor="12 kg" />
                  <LinhaCartao rotulo="Temperos" valor="6 itens" />
                  <div className="mt-2 flex items-baseline justify-between border-t border-white/15 pt-2">
                    <span className="text-white/70">Total da massa</span>
                    <span className="tabular text-lg font-semibold text-white">40 kg</span>
                  </div>
                </div>
              </CartaoVidro>

              <div className="hidden xl:flex">
                <CartaoVidro atrasoMs={1200}>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/70">
                    <span className="size-2 rounded-full bg-amber-400" aria-hidden="true" />
                    Pesagem fina
                  </div>
                  <p className="mt-2 font-semibold text-white">Tempero 3</p>
                  <p className="tabular mt-1 text-3xl font-semibold tracking-tight text-amber-200">8 g</p>
                  <p className="mt-2 text-sm text-white/70">Abaixo de 10 g o sistema destaca para ninguém errar na balança.</p>
                </CartaoVidro>
              </div>

              <div className="hidden 2xl:flex">
                <CartaoVidro atrasoMs={1400}>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/70">
                    <IconeImpressora width={14} height={14} />
                    Ficha de produção
                  </div>
                  <p className="mt-2 font-semibold text-white">Pronta para imprimir</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-white/80">
                    {["Lote e responsável", "Peso de cada ingrediente", "Caixa de conferência"].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="size-3.5 rounded-[4px] border border-white/50" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CartaoVidro>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CampoVidro({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutro-200 bg-superficie shadow-[inset_0_1px_2px_rgb(32_35_40/0.04)] backdrop-blur-sm transition duration-150 hover:border-neutro-300 focus-within:border-marca-500 focus-within:bg-superficie focus-within:ring-4 focus-within:ring-marca-600/15">
      {children}
    </div>
  );
}

function CartaoVidro({ atrasoMs, children }: { atrasoMs: number; children: ReactNode }) {
  return (
    <div
      className="w-64 animate-cartao rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_8px_32px_-8px_rgb(0_0_0/0.4)] backdrop-blur-xl"
      style={atraso(atrasoMs)}
    >
      {children}
    </div>
  );
}

function LinhaCartao({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-white/70">{rotulo}</span>
      <span className="tabular font-medium text-white">{valor}</span>
    </div>
  );
}
