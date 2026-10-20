import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Esqueleto, cartao } from "@/components/ui";
import { buscarProduto } from "@/lib/dados";
import { Producao } from "./producao";

export default function ProducaoPage({ params }: PageProps<"/produtos/[id]">) {
  return (
    <Suspense fallback={<EsqueletoProducao />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: PageProps<"/produtos/[id]">["params"] }) {
  const { id } = await params;
  const produto = await buscarProduto(id);
  if (!produto) notFound();
  return <Producao produto={produto} />;
}

function EsqueletoProducao() {
  return (
    <div role="status" aria-label="Carregando receita">
      <Esqueleto className="mb-3 h-4 w-40" />
      <Esqueleto className="mb-8 h-9 w-72" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <Esqueleto className="h-36 rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`${cartao} p-4`}>
                <Esqueleto className="mb-4 h-4 w-16" />
                <Esqueleto className="h-12 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Esqueleto key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
        <Esqueleto className="hidden h-56 rounded-2xl lg:block" />
      </div>
    </div>
  );
}
