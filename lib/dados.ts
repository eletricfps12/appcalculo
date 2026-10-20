import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { somaPercentuais, type IngredienteReceita, type Papel, type Tipo } from "./calculo";

export interface ResumoProduto {
  id: string;
  nome: string;
  totalIngredientes: number;
  somaPercentuais: number;
  /** Composição da receita por tipo (quantidade e % da massa). */
  materiasPrimas: { quantidade: number; percentual: number };
  temperos: { quantidade: number; percentual: number };
}

export interface Produto {
  id: string;
  nome: string;
  ingredientes: IngredienteReceita[];
}

interface LinhaIngrediente {
  id: string;
  nome: string;
  tipo: Tipo;
  percentual: number;
  papel: Papel;
  espelha_id: string | null;
  ordem: number;
}

export async function supabaseServidor() {
  // O cliente do Supabase lê o relógio (Date.now) para validar a sessão;
  // isso precisa rodar na requisição, não no prerender (Cache Components).
  await connection();
  return createClient(await cookies());
}

/** E-mail de quem está logado (lido do token da sessão). */
export async function emailUsuario(): Promise<string | null> {
  const supabase = await supabaseServidor();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  return typeof email === "string" ? email : null;
}

export async function listarProdutos() {
  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome, ingredientes(percentual, tipo)")
    .order("nome");
  if (error) throw new Error(error.message);
  return data.map((p): ResumoProduto => {
    const ingredientes = p.ingredientes as { percentual: number; tipo: Tipo }[];
    const porTipo = (tipo: Tipo) => {
      const doTipo = ingredientes.filter((i) => i.tipo === tipo);
      return { quantidade: doTipo.length, percentual: somaPercentuais(doTipo).toNumber() };
    };
    return {
      id: p.id as string,
      nome: p.nome as string,
      totalIngredientes: ingredientes.length,
      somaPercentuais: somaPercentuais(ingredientes).toNumber(),
      materiasPrimas: porTipo("mp"),
      temperos: porTipo("tempero"),
    };
  });
}

export async function buscarProduto(id: string): Promise<Produto | null> {
  const supabase = await supabaseServidor();
  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome, ingredientes(id, nome, tipo, percentual, papel, espelha_id, ordem)")
    .eq("id", id)
    .order("ordem", { referencedTable: "ingredientes" })
    .maybeSingle();
  // id fora do formato uuid também significa "não encontrado".
  if (error?.code === "22P02") return null;
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id,
    nome: data.nome,
    ingredientes: (data.ingredientes as LinhaIngrediente[]).map((i) => ({
      id: i.id,
      nome: i.nome,
      tipo: i.tipo,
      percentual: i.percentual,
      papel: i.papel,
      espelhaId: i.espelha_id,
      ordem: i.ordem,
    })),
  };
}
