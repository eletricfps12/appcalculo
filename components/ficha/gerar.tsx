import type { Ficha } from "@/lib/ficha";

// O renderizador de PDF é pesado: só é baixado quando o usuário pede a ficha.
async function gerarBlob(ficha: Ficha) {
  const [{ pdf }, { FichaPDF }] = await Promise.all([import("@react-pdf/renderer"), import("./ficha-pdf")]);
  return pdf(<FichaPDF ficha={ficha} />).toBlob();
}

export async function baixarFicha(ficha: Ficha) {
  const url = URL.createObjectURL(await gerarBlob(ficha));
  const link = document.createElement("a");
  link.href = url;
  link.download = ficha.nomeArquivo;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Abre o mesmo PDF numa nova aba e dispara a impressão. A aba é aberta já no
 * clique (antes de gerar o PDF) para o navegador não bloquear como pop-up.
 */
export async function imprimirFicha(ficha: Ficha) {
  const janela = window.open("", "_blank");
  if (!janela) throw new Error("O navegador bloqueou a nova aba. Permita pop-ups para este site.");
  janela.document.title = ficha.nomeArquivo;
  janela.document.body.style.cssText = "margin:0;font:16px system-ui,sans-serif;color:#46423c";
  janela.document.body.textContent = "Gerando a ficha de produção…";

  try {
    const url = URL.createObjectURL(await gerarBlob(ficha));
    const quadro = janela.document.createElement("iframe");
    quadro.title = ficha.nomeArquivo;
    quadro.src = url;
    quadro.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0";
    quadro.addEventListener("load", () => setTimeout(() => quadro.contentWindow?.print(), 300));
    janela.document.body.replaceChildren(quadro);
  } catch (erro) {
    janela.close();
    throw erro;
  }
}
