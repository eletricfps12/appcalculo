import Link from "next/link";
import { Suspense } from "react";
import { IconeCaixa, IconeMais, IconeSeta } from "@/components/icones";
import { SomaPercentual } from "@/components/soma-percentual";
import { Cabecalho, Esqueleto, EstadoVazio, botao, cartao } from "@/components/ui";
import { listarProdutos } from "@/lib/dados";

export default function CadastroPage() {
  return (
    <>
      <Cabecalho
        titulo="Cadastro"
        descricao="Produtos e receitas usados na produção."
        acoes={
          <Link href="/cadastro/novo" className={botao.primario}>
            <IconeMais width={18} height={18} />
            Novo produto
          </Link>
        }
      />
      <Suspense fallback={<EsqueletoTabela />}>
        <Tabela />
      </Suspense>
    </>
  );
}

async function Tabela() {
  const produtos = await listarProdutos();
  if (produtos.length === 0) {
    return (
      <EstadoVazio icone={<IconeCaixa />} titulo="Nenhum produto cadastrado">
        Use “Novo produto” para cadastrar a primeira receita.
      </EstadoVazio>
    );
  }

  return (
    <div className={`${cartao} overflow-hidden`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutro-200 bg-neutro-50/70 text-xs font-medium uppercase tracking-wide text-neutro-600">
          <tr>
            <th scope="col" className="px-5 py-3 font-medium">Produto</th>
            <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Ingredientes</th>
            <th scope="col" className="px-5 py-3 font-medium">Soma</th>
            <th scope="col" className="w-12 px-3 py-3"><span className="sr-only">Ação</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutro-100">
          {produtos.map((p) => (
            <tr key={p.id} className="group relative transition duration-150 hover:bg-neutro-50">
              <td className="px-5 py-4">
                {/* O link cobre a linha inteira (alvo de toque grande). */}
                <Link href={`/cadastro/${p.id}`} className="font-medium text-neutro-900 after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:outline-2 focus-visible:after:outline-marca-600">
                  {p.nome}
                </Link>
                <span className="tabular mt-0.5 block text-xs text-neutro-600 sm:hidden">{p.totalIngredientes} ingredientes</span>
              </td>
              <td className="tabular hidden px-5 py-4 text-neutro-700 sm:table-cell">{p.totalIngredientes}</td>
              <td className="px-5 py-4">
                <SomaPercentual soma={p.somaPercentuais} fecha={p.somaPercentuais === 100} />
              </td>
              <td className="px-3 py-4 text-neutro-400 transition duration-150 group-hover:text-marca-texto">
                <IconeSeta width={18} height={18} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EsqueletoTabela() {
  return (
    <div role="status" aria-label="Carregando produtos" className={`${cartao} divide-y divide-neutro-100`}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-5">
          <Esqueleto className="h-4 w-48" />
          <Esqueleto className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
