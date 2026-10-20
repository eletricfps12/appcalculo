import Decimal from "decimal.js";

// Cálculo puro da receita: sem dependência de UI ou banco.
// Toda a aritmética usa Decimal; os resultados saem arredondados a 6 casas.

export type Tipo = "mp" | "tempero";
export type Papel = "base" | "espelho" | "variavel" | "calculado";

export interface IngredienteReceita {
  id: string;
  nome: string;
  tipo: Tipo;
  /** Percentual da massa total (ex.: 30 = 30%). */
  percentual: number | string;
  papel: Papel;
  espelhaId: string | null;
  ordem: number;
}

export interface EntradaCalculo {
  /** Peso digitado do ingrediente base, em kg. `null` = campo vazio. */
  pesoBase: number | null;
  /** Pesos digitados manualmente para ingredientes "variavel", por id (kg). */
  manuais?: Record<string, number | null | undefined>;
}

export interface IngredienteCalculado extends IngredienteReceita {
  /** Peso em kg; `null` enquanto o peso base não foi informado. */
  pesoKg: number | null;
  /** Percentual real sobre o total calculado; `null` sem total. */
  percentualReal: number | null;
  /** `true` quando o peso veio do campo manual. */
  manual: boolean;
}

export interface ResultadoCalculo {
  ingredientes: IngredienteCalculado[];
  /** Soma real de todos os pesos (kg). */
  totalKg: number | null;
  /** Massa pela fórmula padrão: peso_base / (percentual_base / 100). */
  massaReferenciaKg: number | null;
  somaPercentuais: number;
  fechaEm100: boolean;
  temManual: boolean;
  /** Problema estrutural que impede o cálculo (ex.: receita sem base). */
  erro: string | null;
  /** Alertas que não bloqueiam o cálculo. */
  avisos: string[];
}

const CASAS = 6;
const CEM = new Decimal(100);

const arredondar = (valor: Decimal) => valor.toDecimalPlaces(CASAS).toNumber();

export function somaPercentuais(ingredientes: Pick<IngredienteReceita, "percentual">[]): Decimal {
  return ingredientes.reduce((soma, i) => soma.plus(i.percentual || 0), new Decimal(0));
}

export function calcularReceita(
  receita: IngredienteReceita[],
  entrada: EntradaCalculo
): ResultadoCalculo {
  const ingredientes = [...receita].sort((a, b) => a.ordem - b.ordem);
  const soma = somaPercentuais(ingredientes);
  const fechaEm100 = soma.equals(CEM);
  const avisos: string[] = [];
  if (!fechaEm100) {
    avisos.push(`A soma das porcentagens da receita é ${soma.toString().replace(".", ",")}%, e não 100%.`);
  }

  const vazio = (erro: string | null): ResultadoCalculo => ({
    ingredientes: ingredientes.map((i) => ({ ...i, pesoKg: null, percentualReal: null, manual: false })),
    totalKg: null,
    massaReferenciaKg: null,
    somaPercentuais: soma.toNumber(),
    fechaEm100,
    temManual: false,
    erro,
    avisos,
  });

  const bases = ingredientes.filter((i) => i.papel === "base");
  if (bases.length === 0) return vazio("A receita não tem ingrediente base.");
  if (bases.length > 1) return vazio("A receita tem mais de um ingrediente base.");
  const base = bases[0];
  const percentualBase = new Decimal(base.percentual);
  if (percentualBase.lte(0)) return vazio("O percentual do ingrediente base deve ser maior que zero.");

  if (entrada.pesoBase === null || !Number.isFinite(entrada.pesoBase)) return vazio(null);

  const pesoBase = new Decimal(entrada.pesoBase);
  const massaReferencia = pesoBase.div(percentualBase.div(CEM));
  const porId = new Map(ingredientes.map((i) => [i.id, i]));
  const pesos = new Map<string, Decimal>();
  const manuaisUsados = new Set<string>();

  const manualDe = (i: IngredienteReceita) => {
    const valor = entrada.manuais?.[i.id];
    return i.papel === "variavel" && valor !== null && valor !== undefined && Number.isFinite(valor)
      ? new Decimal(valor)
      : null;
  };

  const pesoDe = (i: IngredienteReceita, visitando: Set<string>): Decimal => {
    const conhecido = pesos.get(i.id);
    if (conhecido) return conhecido;

    let peso: Decimal;
    if (i.papel === "base") {
      peso = pesoBase;
    } else if (i.papel === "espelho") {
      const alvo = i.espelhaId ? porId.get(i.espelhaId) : undefined;
      if (alvo && !visitando.has(alvo.id)) {
        peso = pesoDe(alvo, new Set(visitando).add(i.id));
      } else {
        avisos.push(`"${i.nome}" espelha um ingrediente inválido; calculado pela % da receita.`);
        peso = new Decimal(i.percentual).div(CEM).times(massaReferencia);
      }
    } else {
      const manual = manualDe(i);
      if (manual) manuaisUsados.add(i.id);
      peso = manual ?? new Decimal(i.percentual).div(CEM).times(massaReferencia);
    }

    pesos.set(i.id, peso);
    return peso;
  };

  for (const i of ingredientes) pesoDe(i, new Set([i.id]));

  const total = ingredientes.reduce((t, i) => t.plus(pesos.get(i.id)!), new Decimal(0));

  return {
    ingredientes: ingredientes.map((i) => {
      const peso = pesos.get(i.id)!;
      return {
        ...i,
        pesoKg: arredondar(peso),
        percentualReal: total.gt(0) ? arredondar(peso.div(total).times(CEM)) : null,
        manual: manuaisUsados.has(i.id),
      };
    }),
    totalKg: arredondar(total),
    massaReferenciaKg: arredondar(massaReferencia),
    somaPercentuais: soma.toNumber(),
    fechaEm100,
    temManual: manuaisUsados.size > 0,
    erro: null,
    avisos,
  };
}
