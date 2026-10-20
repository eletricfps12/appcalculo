import { emailUsuario, listarProdutos } from "@/lib/dados";
import { NavegacaoAtiva } from "./navegacao";

/** Busca no servidor o que a sidebar mostra (produtos e usuário). */
export async function NavegacaoComDados() {
  const [produtos, email] = await Promise.all([listarProdutos(), emailUsuario()]);
  return <NavegacaoAtiva produtos={produtos.map(({ id, nome }) => ({ id, nome }))} email={email} />;
}
