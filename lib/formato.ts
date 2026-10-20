import Decimal from "decimal.js";

/**
 * Converte o texto digitado em número. Aceita vírgula ou ponto como decimal
 * ("9,5", "9.5") e ponto como milhar quando há vírgula ("1.234,5").
 * Retorna `null` para campo vazio ou valor inválido/negativo.
 */
export function lerNumero(texto: string): number | null {
  let limpo = texto.trim().replace(/\s/g, "");
  if (limpo === "") return null;
  if (limpo.includes(",")) limpo = limpo.replace(/\./g, "").replace(",", ".");
  if (!/^\d*\.?\d+$|^\d+\.$/.test(limpo)) return null;
  const valor = Number(limpo);
  return Number.isFinite(valor) && valor >= 0 ? valor : null;
}

const numero = (valor: number, casas: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: casas }).format(
    new Decimal(valor).toDecimalPlaces(casas).toNumber()
  );

/** Pesos abaixo de 1 kg aparecem em gramas: 0,003 → "3 g"; 3,27 → "3,27 kg". */
export function formatarPeso(kg: number | null): string {
  if (kg === null) return "—";
  if (kg < 1) return `${numero(new Decimal(kg).times(1000).toNumber(), 2)} g`;
  return `${numero(kg, 3)} kg`;
}

export function formatarPercentual(valor: number | string, casas = 4): string {
  return `${numero(Number(valor), casas)}%`;
}

/** Valor para preencher um campo de texto (vírgula decimal, sem milhar). */
export function paraCampo(valor: number | string | null): string {
  if (valor === null || valor === "") return "";
  return new Decimal(valor).toString().replace(".", ",");
}
