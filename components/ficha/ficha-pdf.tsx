import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Ficha } from "@/lib/ficha";

// Sem hifenização automática ("% RECEI-TA" quebrado no cabeçalho).
Font.registerHyphenationCallback((palavra) => [palavra]);

// Layout único da ficha (download e impressão). Pensado para impressora:
// preto no branco, cinzas leves e nenhum fundo escuro.
// Helvetica é embutida no PDF e cobre os acentos do português.

const PRETO = "#111111";
const CINZA = "#555555";
const CINZA_CLARO = "#8a8a8a";
const LINHA = "#d4d4d4";
const ZEBRA = "#f4f4f4";

const COLUNAS = [
  { titulo: "Ingrediente", largura: "26%", alinhar: "left" },
  { titulo: "Tipo", largura: "17%", alinhar: "left" },
  { titulo: "% receita", largura: "14%", alinhar: "right" },
  { titulo: "% real", largura: "12%", alinhar: "right" },
  { titulo: "Peso", largura: "16%", alinhar: "right" },
  { titulo: "Conferido", largura: "15%", alinhar: "center" },
] as const;

const s = StyleSheet.create({
  pagina: { paddingTop: 40, paddingBottom: 56, paddingHorizontal: 42, fontFamily: "Helvetica", fontSize: 11, color: PRETO },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  empresa: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  sistema: { fontSize: 9, color: CINZA, marginTop: 2 },
  geradoTopo: { fontSize: 9, color: CINZA, textAlign: "right" },
  titulo: { fontFamily: "Helvetica-Bold", fontSize: 22, marginTop: 18 },
  produto: { fontSize: 15, marginTop: 4 },
  divisor: { borderBottomWidth: 1, borderBottomColor: PRETO, marginTop: 14, marginBottom: 16 },
  campos: { flexDirection: "row", gap: 16, marginBottom: 18 },
  campo: { flex: 1 },
  campoRotulo: { fontSize: 9, color: CINZA, textTransform: "uppercase", letterSpacing: 0.6 },
  campoLinha: { borderBottomWidth: 1, borderBottomColor: CINZA_CLARO, height: 24 },
  resumo: { flexDirection: "row", gap: 12, marginBottom: 14 },
  caixa: { flex: 1, borderWidth: 1, borderColor: LINHA, borderRadius: 6, padding: 12 },
  caixaTotal: { flex: 1.3, borderWidth: 1.5, borderColor: PRETO, borderRadius: 6, padding: 12 },
  caixaRotulo: { fontSize: 9, color: CINZA, textTransform: "uppercase", letterSpacing: 0.6 },
  caixaValor: { fontFamily: "Helvetica-Bold", fontSize: 17, marginTop: 4 },
  caixaValorTotal: { fontFamily: "Helvetica-Bold", fontSize: 24, marginTop: 2 },
  nota: { borderLeftWidth: 3, borderLeftColor: PRETO, backgroundColor: ZEBRA, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 14 },
  notaTexto: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  tabelaCabecalho: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: PRETO, paddingBottom: 6 },
  th: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: CINZA, textTransform: "uppercase", letterSpacing: 0.3, paddingHorizontal: 6 },
  linha: { flexDirection: "row", alignItems: "center", minHeight: 27, borderBottomWidth: 0.5, borderBottomColor: LINHA },
  td: { paddingHorizontal: 6, paddingVertical: 5 },
  nome: { fontFamily: "Helvetica-Bold" },
  detalhe: { fontSize: 8, color: CINZA, marginTop: 1 },
  peso: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  caixinha: { width: 14, height: 14, borderWidth: 1, borderColor: PRETO, borderRadius: 2, alignSelf: "center" },
  rodape: {
    position: "absolute",
    bottom: 24,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    color: CINZA,
    borderTopWidth: 0.5,
    borderTopColor: LINHA,
    paddingTop: 6,
  },
});

export function FichaPDF({ ficha }: { ficha: Ficha }) {
  return (
    <Document title={`Ficha de Produção — ${ficha.produto}`} author={ficha.empresa} creator={ficha.sistema} language="pt-BR">
      <Page size="A4" orientation="portrait" style={s.pagina}>
        <View style={s.topo}>
          <View>
            <Text style={s.empresa}>{ficha.empresa}</Text>
            <Text style={s.sistema}>{ficha.sistema}</Text>
          </View>
          <Text style={s.geradoTopo}>Gerada em {ficha.geradoEm}</Text>
        </View>

        <Text style={s.titulo}>Ficha de Produção</Text>
        <Text style={s.produto}>{ficha.produto}</Text>
        <View style={s.divisor} />

        <View style={s.campos}>
          {["Lote", "Responsável", "Data de produção"].map((rotulo) => (
            <View key={rotulo} style={s.campo}>
              <Text style={s.campoRotulo}>{rotulo}</Text>
              <View style={s.campoLinha} />
            </View>
          ))}
        </View>

        <View style={s.resumo}>
          <View style={s.caixa}>
            <Text style={s.caixaRotulo}>Peso informado · {ficha.base.nome}</Text>
            <Text style={s.caixaValor}>{ficha.base.peso}</Text>
          </View>
          <View style={s.caixaTotal}>
            <Text style={s.caixaRotulo}>Peso total da massa</Text>
            <Text style={s.caixaValorTotal}>{ficha.total}</Text>
          </View>
        </View>

        {ficha.notas.map((nota) => (
          <View key={nota} style={s.nota}>
            <Text style={s.notaTexto}>{nota}</Text>
          </View>
        ))}

        <View style={s.tabelaCabecalho} fixed>
          {COLUNAS.map((c) => (
            <Text key={c.titulo} style={[s.th, { width: c.largura, textAlign: c.alinhar }]}>
              {c.titulo}
            </Text>
          ))}
        </View>

        {ficha.linhas.map((l, i) => (
          <View key={l.id} style={[s.linha, i % 2 === 1 ? { backgroundColor: ZEBRA } : {}]} wrap={false}>
            <View style={[s.td, { width: COLUNAS[0].largura }]}>
              <Text style={s.nome}>{l.nome}</Text>
              {l.manual && <Text style={s.detalhe}>informado manualmente</Text>}
            </View>
            <Text style={[s.td, { width: COLUNAS[1].largura }]}>{l.tipo}</Text>
            <Text style={[s.td, { width: COLUNAS[2].largura, textAlign: "right" }]}>{l.percentualReceita}</Text>
            <Text style={[s.td, { width: COLUNAS[3].largura, textAlign: "right" }]}>{l.percentualReal}</Text>
            <View style={[s.td, { width: COLUNAS[4].largura, alignItems: "flex-end" }]}>
              <Text style={s.peso}>{l.peso}</Text>
              {l.pesoFino && <Text style={s.detalhe}>pesagem fina</Text>}
            </View>
            <View style={[s.td, { width: COLUNAS[5].largura }]}>
              <View style={s.caixinha} />
            </View>
          </View>
        ))}

        <View style={s.rodape} fixed>
          <Text>Gerado pelo sistema em {ficha.geradoEm}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
