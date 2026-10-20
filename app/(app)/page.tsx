import Link from "next/link";
import { Suspense } from "react";
import { IconeCaixa } from "@/components/icones";
import { Cabecalho, Esqueleto, EstadoVazio, botao, cartao } from "@/components/ui";
import { listarProdutos } from "@/lib/dados";
import { GradeProdutos } from "./grade-produtos";

export default function SelecaoProdutoPage() {
  return (
    <>
      <Cabecalho titulo="Qual produto será fabricado?" descricao="Escolha o produto para calcular a receita do lote." />
      <Suspense fallback={<EsqueletoGrade />}>
        <ListaProdutos />
      </Suspense>
    </>
  );
}

async function ListaProdutos() {
  const produtos = await listarProdutos();

  if (produtos.length === 0) {
    return (
      <EstadoVazio icone={<IconeCaixa />} titulo="Nenhum produto cadastrado">
        <p>Cadastre um produto e sua receita para começar a produzir.</p>
        <Link href="/cadastro/novo" className={`${botao.primario} mt-5`}>
          Cadastrar produto
        </Link>
      </EstadoVazio>
    );
  }
  return <GradeProdutos produtos={produtos} />;
}

function EsqueletoGrade() {
  return (
    <div role="status" aria-label="Carregando produtos">
      <Esqueleto className="mb-6 h-11 w-full max-w-md rounded-xl" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${cartao} overflow-hidden`}>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <Esqueleto className="size-11 rounded-xl" />
                <Esqueleto className="h-5 w-24 rounded-full" />
              </div>
              <Esqueleto className="mb-2 mt-5 h-5 w-2/3" />
              <Esqueleto className="h-4 w-1/2" />
              <Esqueleto className="mt-6 h-1.5 w-full rounded-full" />
              <Esqueleto className="mt-2.5 h-3 w-full" />
            </div>
            <div className="flex items-center justify-between border-t border-neutro-200 px-5 py-3">
              <Esqueleto className="h-4 w-28" />
              <Esqueleto className="size-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
