import type { Papel, Tipo } from "./calculo";
import { lerNumero } from "./formato";

// Validação do cadastro de receita, usada no formulário e na Server Action.

export interface LinhaReceita {
  id: string;
  nome: string;
  tipo: Tipo;
  /** Como digitado no formulário (aceita vírgula). */
  percentual: string;
  papel: Papel;
  espelhaId: string | null;
}

export interface IngredienteParaSalvar {
  id: string;
  nome: string;
  tipo: Tipo;
  percentual: number;
  papel: Papel;
  espelha_id: string | null;
}

export const PAPEIS: { valor: Papel; rotulo: string }[] = [
  { valor: "base", rotulo: "Base (digitado)" },
  { valor: "espelho", rotulo: "Espelho" },
  { valor: "variavel", rotulo: "Variável" },
  { valor: "calculado", rotulo: "Calculado" },
];

export const TIPOS: { valor: Tipo; rotulo: string }[] = [
  { valor: "mp", rotulo: "Matéria-prima" },
  { valor: "tempero", rotulo: "Tempero" },
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** UUID v4 que funciona também em http:// na rede local (sem crypto.randomUUID). */
export function novoId(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function validarReceita(
  nome: string,
  linhas: LinhaReceita[]
): { erro: string } | { ingredientes: IngredienteParaSalvar[] } {
  if (!nome.trim()) return { erro: "Informe o nome do produto." };
  if (linhas.length === 0) return { erro: "Adicione pelo menos um ingrediente." };

  const ids = new Set(linhas.map((l) => l.id));
  const ingredientes: IngredienteParaSalvar[] = [];

  for (const [indice, l] of linhas.entries()) {
    const rotulo = l.nome.trim() || `Ingrediente ${indice + 1}`;
    if (!UUID.test(l.id)) return { erro: `${rotulo}: identificador inválido.` };
    if (!l.nome.trim()) return { erro: `Ingrediente ${indice + 1}: informe o nome.` };
    if (!TIPOS.some((t) => t.valor === l.tipo)) return { erro: `${rotulo}: tipo inválido.` };
    if (!PAPEIS.some((p) => p.valor === l.papel)) return { erro: `${rotulo}: papel inválido.` };

    const percentual = lerNumero(l.percentual);
    if (percentual === null || percentual > 100) {
      return { erro: `${rotulo}: percentual deve ser um número entre 0 e 100.` };
    }
    if (!/^\d+([.,]\d{0,4})?$/.test(l.percentual.trim())) {
      return { erro: `${rotulo}: use no máximo 4 casas decimais no percentual.` };
    }

    if (l.papel === "espelho" && (!l.espelhaId || l.espelhaId === l.id || !ids.has(l.espelhaId))) {
      return { erro: `${rotulo}: escolha qual ingrediente ele espelha.` };
    }

    ingredientes.push({
      id: l.id,
      nome: l.nome.trim(),
      tipo: l.tipo,
      percentual,
      papel: l.papel,
      espelha_id: l.papel === "espelho" ? l.espelhaId : null,
    });
  }

  const bases = ingredientes.filter((i) => i.papel === "base");
  if (bases.length !== 1) return { erro: "A receita precisa de exatamente um ingrediente base." };
  if (bases[0].percentual <= 0) return { erro: "O percentual do ingrediente base deve ser maior que zero." };

  return { ingredientes };
}
