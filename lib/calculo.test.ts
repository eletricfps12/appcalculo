import { describe, expect, it } from "vitest";
import { calcularReceita, type IngredienteReceita } from "./calculo";
import { formatarPeso, lerNumero } from "./formato";

// Mesma receita do seed "Produto Teste Colonial".
const receita: IngredienteReceita[] = [
  { id: "mp1", nome: "MP 1", tipo: "mp", percentual: 30, papel: "base", espelhaId: null, ordem: 1 },
  { id: "mp2", nome: "MP 2", tipo: "mp", percentual: 30, papel: "espelho", espelhaId: "mp1", ordem: 2 },
  { id: "mp3", nome: "MP 3", tipo: "mp", percentual: 15, papel: "variavel", espelhaId: null, ordem: 3 },
  { id: "t1", nome: "Tempero 1", tipo: "tempero", percentual: 4, papel: "calculado", espelhaId: null, ordem: 4 },
  { id: "t2", nome: "Tempero 2", tipo: "tempero", percentual: 3, papel: "calculado", espelhaId: null, ordem: 5 },
  { id: "t3", nome: "Tempero 3", tipo: "tempero", percentual: 0.01, papel: "calculado", espelhaId: null, ordem: 6 },
  { id: "t4", nome: "Tempero 4", tipo: "tempero", percentual: 0.09, papel: "calculado", espelhaId: null, ordem: 7 },
  { id: "t5", nome: "Tempero 5", tipo: "tempero", percentual: 7, papel: "calculado", espelhaId: null, ordem: 8 },
  { id: "t6", nome: "Tempero 6", tipo: "tempero", percentual: 10.9, papel: "calculado", espelhaId: null, ordem: 9 },
];

const pesos = (r: ReturnType<typeof calcularReceita>) =>
  Object.fromEntries(r.ingredientes.map((i) => [i.id, i.pesoKg]));

describe("calcularReceita", () => {
  it("teste de aceitação: MP1 = 9 kg", () => {
    const r = calcularReceita(receita, { pesoBase: 9 });

    expect(pesos(r)).toEqual({
      mp1: 9,
      mp2: 9,
      mp3: 4.5,
      t1: 1.2,
      t2: 0.9,
      t3: 0.003,
      t4: 0.027,
      t5: 2.1,
      t6: 3.27,
    });
    expect(r.totalKg).toBe(30);
    expect(r.massaReferenciaKg).toBe(30);
    expect(r.fechaEm100).toBe(true);
    expect(r.avisos).toEqual([]);
    expect(r.erro).toBeNull();
  });

  it("exibe os temperos pequenos em gramas", () => {
    const r = calcularReceita(receita, { pesoBase: 9 });
    const t = Object.fromEntries(r.ingredientes.map((i) => [i.id, formatarPeso(i.pesoKg)]));

    expect(t.t3).toBe("3 g");
    expect(t.t4).toBe("27 g");
    expect(t.t2).toBe("900 g");
    expect(t.t6).toBe("3,27 kg");
    expect(formatarPeso(r.totalKg)).toBe("30 kg");
  });

  it("MP3 vazio é calculado pela % da receita", () => {
    const r = calcularReceita(receita, { pesoBase: 9, manuais: { mp3: null } });
    const mp3 = r.ingredientes.find((i) => i.id === "mp3")!;

    expect(mp3.pesoKg).toBe(4.5);
    expect(mp3.manual).toBe(false);
    expect(r.temManual).toBe(false);
  });

  it("MP3 manual: demais seguem o peso base e o total vira a soma real", () => {
    const r = calcularReceita(receita, { pesoBase: 9, manuais: { mp3: 6 } });
    const porId = Object.fromEntries(r.ingredientes.map((i) => [i.id, i]));

    expect(porId.mp3.pesoKg).toBe(6);
    expect(porId.mp3.manual).toBe(true);
    expect(porId.mp2.pesoKg).toBe(9);
    expect(porId.t1.pesoKg).toBe(1.2);
    expect(porId.t6.pesoKg).toBe(3.27);
    expect(r.totalKg).toBe(31.5);
    expect(r.massaReferenciaKg).toBe(30);
    expect(r.temManual).toBe(true);

    // Percentual real sobre o novo total (31,5 kg).
    expect(porId.mp3.percentualReal).toBe(19.047619);
    expect(porId.mp1.percentualReal).toBe(28.571429);
  });

  it("não sofre com erro de ponto flutuante", () => {
    // Em float puro, 0.1 + 0.2 e 0.01/100*30 geram dízimas.
    const r = calcularReceita(receita, { pesoBase: 0.3 });

    expect(pesos(r).t3).toBe(0.0001);
    expect(pesos(r).t6).toBe(0.109);
    expect(r.totalKg).toBe(1);
  });

  it("sem peso base, não há pesos nem total", () => {
    const r = calcularReceita(receita, { pesoBase: null });

    expect(r.totalKg).toBeNull();
    expect(r.ingredientes.every((i) => i.pesoKg === null)).toBe(true);
    expect(r.erro).toBeNull();
  });

  it("alerta sem bloquear quando a soma das % não é 100", () => {
    const incompleta = receita.filter((i) => i.id !== "t6");
    const r = calcularReceita(incompleta, { pesoBase: 9 });

    expect(r.fechaEm100).toBe(false);
    expect(r.somaPercentuais).toBe(89.1);
    expect(r.avisos[0]).toContain("89,1%");
    expect(r.totalKg).toBe(26.73);
  });

  it("acusa erro quando a receita não tem base", () => {
    const semBase = receita.map((i) => (i.papel === "base" ? { ...i, papel: "calculado" as const } : i));
    const r = calcularReceita(semBase, { pesoBase: 9 });

    expect(r.erro).toBe("A receita não tem ingrediente base.");
    expect(r.totalKg).toBeNull();
  });

  it("aceita percentuais vindos do banco como texto", () => {
    const comoTexto = receita.map((i) => ({ ...i, percentual: String(i.percentual) }));
    expect(calcularReceita(comoTexto, { pesoBase: 9 }).totalKg).toBe(30);
  });
});

describe("lerNumero", () => {
  it("aceita vírgula e ponto como separador decimal", () => {
    expect(lerNumero("9")).toBe(9);
    expect(lerNumero("4,5")).toBe(4.5);
    expect(lerNumero("4.5")).toBe(4.5);
    expect(lerNumero(" 0,003 ")).toBe(0.003);
    expect(lerNumero("1.234,5")).toBe(1234.5);
  });

  it("retorna null para vazio ou inválido", () => {
    expect(lerNumero("")).toBeNull();
    expect(lerNumero("abc")).toBeNull();
    expect(lerNumero("-2")).toBeNull();
    expect(lerNumero("1,2,3")).toBeNull();
  });
});
