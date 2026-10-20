import { Suspense } from "react";
import { Navegacao } from "@/components/navegacao";
import { NavegacaoComDados } from "@/components/navegacao-dados";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Produtos, usuário e item ativo chegam por streaming; o fallback é a mesma navegação vazia. */}
      <Suspense fallback={<Navegacao />}>
        <NavegacaoComDados />
      </Suspense>
      <main className="w-full flex-1 pb-28 transition-[padding] duration-300 ease-in-out lg:pb-12 lg:pl-[var(--largura-nav,16rem)]">
        <div className="mx-auto w-full max-w-6xl animate-surgir px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</div>
      </main>
    </div>
  );
}
