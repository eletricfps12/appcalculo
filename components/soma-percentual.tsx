import { formatarPercentual } from "@/lib/formato";
import { IconeAlerta } from "./icones";
import { Badge } from "./ui";

/** Verde (sucesso) quando a receita fecha 100%, âmbar quando não fecha. Ícone + texto, não só cor. */
export function SomaPercentual({ soma, fecha, rotulo }: { soma: number; fecha: boolean; rotulo?: string }) {
  return (
    <Badge tom={fecha ? "sucesso" : "ambar"}>
      {fecha ? (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12 5 5L20 7" />
        </svg>
      ) : (
        <IconeAlerta width={12} height={12} strokeWidth={2.25} />
      )}
      {rotulo && <span>{rotulo}</span>}
      {formatarPercentual(soma)}
      <span className="sr-only">{fecha ? "(fecha 100%)" : "(não fecha 100%)"}</span>
    </Badge>
  );
}
