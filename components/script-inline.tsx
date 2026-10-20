"use client";

/**
 * Script que roda durante a leitura do HTML (antes da pintura).
 * No servidor sai como "text/javascript" (executa); no cliente vira "text/plain",
 * para o React não avisar sobre <script> renderizado (padrão do guia "Preventing
 * flash before hydration" do Next.js). Precisa ser componente de cliente: como
 * componente de servidor, o navegador receberia sempre "text/javascript".
 */
export function ScriptInline({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
