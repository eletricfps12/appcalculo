import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Trilha } from "@/components/trilha";
import { Cabecalho, Esqueleto, cartao } from "@/components/ui";
import { buscarProduto } from "@/lib/dados";
import { EditorReceita } from "../editor";

export default function EditarProdutoPage({ params }: PageProps<"/cadastro/[id]">) {
  return (
    <Suspense fallback={<EsqueletoEditor />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: PageProps<"/cadastro/[id]">["params"] }) {
  const { id } = await params;
  const produto = await buscarProduto(id);
  if (!produto) notFound();
  return (
    <>
      <Cabecalho
        titulo="Editar produto"
        descricao="Alterações valem para as próximas produções."
        antes={<Trilha secao="Cadastro" href="/cadastro" atual={produto.nome} />}
      />
      <EditorReceita produto={produto} />
    </>
  );
}

function EsqueletoEditor() {
  return (
    <div role="status" aria-label="Carregando receita">
      <Esqueleto className="mb-3 h-4 w-40" />
      <Esqueleto className="mb-8 h-9 w-64" />
      <Esqueleto className="mb-6 h-11 w-full max-w-md rounded-xl" />
      <div className={`${cartao} divide-y divide-neutro-100`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 px-4 py-4">
            <Esqueleto className="h-11 flex-1 rounded-xl" />
            <Esqueleto className="h-11 w-24 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
