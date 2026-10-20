"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/dados";
import { validarReceita, type LinhaReceita } from "@/lib/receita";

async function clienteAutenticado() {
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getUser();
  return data.user ? supabase : null;
}

export async function salvarReceita(
  produtoId: string | null,
  nome: string,
  linhas: LinhaReceita[]
): Promise<{ erro: string }> {
  const supabase = await clienteAutenticado();
  if (!supabase) return { erro: "Sua sessão expirou. Entre novamente." };

  const validacao = validarReceita(nome, linhas);
  if ("erro" in validacao) return validacao;

  const { error } = await supabase.rpc("salvar_receita", {
    p_produto_id: produtoId,
    p_nome: nome.trim(),
    p_ingredientes: validacao.ingredientes,
  });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidatePath("/", "layout");
  redirect("/cadastro");
}

export async function excluirProduto(produtoId: string): Promise<{ erro: string }> {
  const supabase = await clienteAutenticado();
  if (!supabase) return { erro: "Sua sessão expirou. Entre novamente." };

  const { error } = await supabase.from("produtos").delete().eq("id", produtoId);
  if (error) return { erro: `Não foi possível excluir: ${error.message}` };

  revalidatePath("/", "layout");
  redirect("/cadastro");
}
