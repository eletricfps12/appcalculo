import Link from "next/link";

/** Breadcrumb de dois níveis: "Seção / Página atual". */
export function Trilha({ secao, href, atual }: { secao: string; href: string; atual: string }) {
  return (
    <nav aria-label="Trilha" className="mb-2 text-sm text-neutro-600">
      <ol className="flex min-w-0 items-center gap-1.5">
        <li>
          <Link href={href} className="rounded transition duration-150 hover:text-neutro-900">
            {secao}
          </Link>
        </li>
        <li aria-hidden="true" className="text-neutro-400">
          /
        </li>
        <li aria-current="page" className="truncate font-medium text-neutro-800">
          {atual}
        </li>
      </ol>
    </nav>
  );
}
