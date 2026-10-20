import { describe, expect, it } from "vitest";
import { novoId, validarReceita, type LinhaReceita } from "./receita";

const linha = (mudanca: Partial<LinhaReceita>): LinhaReceita => ({
  id: novoId(),
  nome: "MP 1",
  tipo: "mp",
  percentual: "30",
  papel: "base",
  espelhaId: null,
  ...mudanca,
});

describe("validarReceita", () => {
  it("converte percentuais com vírgula e mantém o espelho", () => {
    const mp1 = linha({});
    const mp2 = linha({ nome: "MP 2", papel: "espelho", espelhaId: mp1.id });
    const t3 = linha({ nome: "Tempero 3", tipo: "tempero", percentual: "0,01", papel: "calculado" });
    const r = validarReceita("Produto", [mp1, mp2, t3]);

    expect("ingredientes" in r && r.ingredientes.map((i) => [i.percentual, i.espelha_id])).toEqual([
      [30, null],
      [30, mp1.id],
      [0.01, null],
    ]);
  });

  it("exige exatamente um ingrediente base", () => {
    expect(validarReceita("P", [linha({ papel: "calculado" })])).toEqual({
      erro: "A receita precisa de exatamente um ingrediente base.",
    });
    expect("erro" in validarReceita("P", [linha({}), linha({ nome: "Outra" })])).toBe(true);
  });

  it("exige a referência do espelho", () => {
    const r = validarReceita("P", [linha({}), linha({ nome: "MP 2", papel: "espelho" })]);
    expect(r).toEqual({ erro: "MP 2: escolha qual ingrediente ele espelha." });
  });

  it("rejeita percentual inválido ou com mais de 4 casas", () => {
    expect("erro" in validarReceita("P", [linha({ percentual: "abc" })])).toBe(true);
    expect("erro" in validarReceita("P", [linha({ percentual: "101" })])).toBe(true);
    expect("erro" in validarReceita("P", [linha({ percentual: "0,00001" })])).toBe(true);
  });

  it("gera ids no formato uuid v4", () => {
    expect(novoId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
