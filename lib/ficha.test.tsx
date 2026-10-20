import { writeFileSync } from "node:fs";
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";
import { FichaPDF } from "../components/ficha/ficha-pdf";
import type { IngredienteReceita } from "./calculo";
import { montarFicha, slug } from "./ficha";

// Mesma receita do seed_testes.sql ("Linguiça Teste").
const linguica: IngredienteReceita[] = [
  ["MP 1", "mp", 30, "base"],
  ["MP 2", "mp", 30, "espelho"],
  ["MP 3", "mp", 20, "variavel"],
  ["Tempero 1", "tempero", 2.5, "calculado"],
  ["Tempero 2", "tempero", 1.5, "calculado"],
  ["Tempero 3", "tempero", 0.02, "calculado"],
  ["Tempero 4", "tempero", 0.08, "calculado"],
  ["Tempero 5", "tempero", 6, "calculado"],
  ["Tempero 6", "tempero", 9.9, "calculado"],
].map(([nome, tipo, percentual, papel], i) => ({
  id: `i${i + 1}`,
  nome,
  tipo,
  percentual,
  papel,
  espelhaId: papel === "espelho" ? "i1" : null,
  ordem: i + 1,
})) as IngredienteReceita[];

const produto = { nome: "Linguiça Teste", ingredientes: linguica };
// 20/10/2026 13:05 UTC = 10:05 em São Paulo.
const agora = new Date("2026-10-20T13:05:00Z");

// Conta as páginas do PDF gerado (objetos /Type /Page, sem /Pages).
const paginas = (pdf: Buffer) => pdf.toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g)?.length ?? 0;

describe("montarFicha", () => {
  it("gabarito: Linguiça Teste com MP 1 = 12 kg", () => {
    const ficha = montarFicha(produto, { pesoBase: 12 }, agora)!;

    expect(ficha.total).toBe("40 kg");
    expect(ficha.base).toEqual({ nome: "MP 1", peso: "12 kg" });
    expect(ficha.linhas.map((l) => [l.nome, l.peso])).toEqual([
      ["MP 1", "12 kg"],
      ["MP 2", "12 kg"],
      ["MP 3", "8 kg"],
      ["Tempero 1", "1 kg"],
      ["Tempero 2", "600 g"],
      ["Tempero 3", "8 g"],
      ["Tempero 4", "32 g"],
      ["Tempero 5", "2,4 kg"],
      ["Tempero 6", "3,96 kg"],
    ]);
    expect(ficha.linhas[3]).toMatchObject({ tipo: "Tempero", percentualReceita: "2,5%", percentualReal: "2,5%" });
    expect(ficha.linhas.filter((l) => l.pesoFino).map((l) => l.nome)).toEqual(["Tempero 3"]);
    expect(ficha.notas).toEqual([]);
    expect(ficha.geradoEm).toBe("20/10/2026, 10:05");
    expect(ficha.nomeArquivo).toBe("ficha-linguica-teste-2026-10-20.pdf");
  });

  it("MP 3 manual gera a nota com o valor pela receita", () => {
    const ficha = montarFicha(produto, { pesoBase: 12, manuais: { i3: 6 } }, agora)!;

    expect(ficha.total).toBe("38 kg");
    expect(ficha.notas).toEqual(["MP 3 informado manualmente: 6 kg (pela receita seria 8 kg)"]);
    expect(ficha.linhas[2]).toMatchObject({ manual: true, percentualReal: "15,79%" });
  });

  it("sem peso base não há ficha", () => {
    expect(montarFicha(produto, { pesoBase: null }, agora)).toBeNull();
  });

  it("slug remove acentos e espaços", () => {
    expect(slug("  Salsicha Teste (Lote B)  ")).toBe("salsicha-teste-lote-b");
  });
});

describe("FichaPDF", () => {
  it("gera um PDF A4 de 1 página para a Linguiça", async () => {
    const pdf = await renderToBuffer(<FichaPDF ficha={montarFicha(produto, { pesoBase: 12 }, agora)!} />);

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(paginas(pdf)).toBe(1);
    // Gera o arquivo para conferência visual: FICHA_SAIDA=caminho.pdf npm test
    if (process.env.FICHA_SAIDA) writeFileSync(process.env.FICHA_SAIDA, pdf);
  });

  it("15 ingredientes, com nota de manual, ainda cabem em 1 página", async () => {
    const quinze = Array.from({ length: 15 }, (_, i) => ({
      ...linguica[Math.min(i, linguica.length - 1)],
      id: `q${i}`,
      nome: `Ingrediente ${i + 1}`,
      papel: i === 0 ? "base" : i === 1 ? "variavel" : "calculado",
      espelhaId: null,
      ordem: i,
    })) as IngredienteReceita[];
    const ficha = montarFicha({ nome: "Teste 15", ingredientes: quinze }, { pesoBase: 10, manuais: { q1: 3 } }, agora)!;

    expect(ficha.notas).toHaveLength(1);
    expect(paginas(await renderToBuffer(<FichaPDF ficha={ficha} />))).toBe(1);
  });
});
