import { Trilha } from "@/components/trilha";
import { Cabecalho } from "@/components/ui";
import { EditorReceita } from "../editor";

export default function NovoProdutoPage() {
  return (
    <>
      <Cabecalho
        titulo="Novo produto"
        descricao="Defina o nome e os ingredientes da receita."
        antes={<Trilha secao="Cadastro" href="/cadastro" atual="Novo produto" />}
      />
      <EditorReceita />
    </>
  );
}
