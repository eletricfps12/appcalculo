import { calcularReceita, type EntradaCalculo, type IngredienteReceita } from "./calculo";
import { CONFIG } from "./config";
import { formatarPercentual, formatarPeso } from "./formato";

// Dados da ficha de produção, já formatados. Sem layout: o PDF só desenha.

/** Abaixo disso (10 g) a pesagem pede atenção redobrada. */
export const LIMITE_PESO_FINO_KG = 0.01;

export const ehPesoFino = (kg: number | null) => kg !== null && kg > 0 && kg < LIMITE_PESO_FINO_KG;

export interface LinhaFicha {
  id: string;
  nome: string;
  tipo: string;
  percentualReceita: string;
  percentualReal: string;
  peso: string;
  manual: boolean;
  pesoFino: boolean;
}

export interface Ficha {
  sistema: string;
  empresa: string;
  produto: string;
  geradoEm: string;
  base: { nome: string; peso: string };
  total: string;
  linhas: LinhaFicha[];
  /** Ex.: "MP 3 informado manualmente: 6 kg (pela receita seria 8 kg)". */
  notas: string[];
  nomeArquivo: string;
}

export function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const dataHora = (agora: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: CONFIG.fusoHorario,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(agora);

// en-CA formata como AAAA-MM-DD.
const dataArquivo = (agora: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: CONFIG.fusoHorario, year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);

/** `null` quando ainda não há o que imprimir (sem peso base ou receita inválida). */
export function montarFicha(
  produto: { nome: string; ingredientes: IngredienteReceita[] },
  entrada: EntradaCalculo,
  agora = new Date()
): Ficha | null {
  const resultado = calcularReceita(produto.ingredientes, entrada);
  if (resultado.erro || resultado.totalKg === null) return null;

  // Mesmo peso base, sem os manuais: é o "pela receita seria".
  const pelaReceita = calcularReceita(produto.ingredientes, { pesoBase: entrada.pesoBase });
  const pesoReceita = new Map(pelaReceita.ingredientes.map((i) => [i.id, i.pesoKg]));
  const base = resultado.ingredientes.find((i) => i.papel === "base")!;

  return {
    sistema: CONFIG.sistema,
    empresa: CONFIG.empresa,
    produto: produto.nome,
    geradoEm: dataHora(agora),
    base: { nome: base.nome, peso: formatarPeso(base.pesoKg) },
    total: formatarPeso(resultado.totalKg),
    linhas: resultado.ingredientes.map((i) => ({
      id: i.id,
      nome: i.nome,
      tipo: i.tipo === "mp" ? "Matéria-prima" : "Tempero",
      percentualReceita: formatarPercentual(i.percentual),
      percentualReal: i.percentualReal === null ? "—" : formatarPercentual(i.percentualReal, 2),
      peso: formatarPeso(i.pesoKg),
      manual: i.manual,
      pesoFino: ehPesoFino(i.pesoKg),
    })),
    notas: resultado.ingredientes
      .filter((i) => i.manual)
      .map(
        (i) =>
          `${i.nome} informado manualmente: ${formatarPeso(i.pesoKg)} (pela receita seria ${formatarPeso(pesoReceita.get(i.id) ?? null)})`
      ),
    nomeArquivo: `ficha-${slug(produto.nome)}-${dataArquivo(agora)}.pdf`,
  };
}
