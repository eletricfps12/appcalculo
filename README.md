# Sistema de ajuste de receitas

MVP para a fábrica de embutidos. O operador escolhe um produto e digita o peso da matéria-prima base (MP 1). O sistema calcula o peso de todos os outros ingredientes pelas porcentagens da receita e mostra o total da massa.

Stack: Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind 4 + Supabase (Postgres + Auth).

## 1. Configurar o Supabase

### 1.1 Criar as tabelas

No painel do Supabase, abra **SQL Editor → New query**, cole o conteúdo de
[`supabase/migrations/20261020000000_receitas.sql`](supabase/migrations/20261020000000_receitas.sql) e clique em **Run**.

Esse SQL cria:

- `produtos` (id, nome, criado_em)
- `ingredientes` (id, produto_id, nome, tipo, percentual, papel, espelha_id, ordem)
- RLS ligado nas duas tabelas, com acesso liberado **somente para usuários autenticados**
- a função `salvar_receita`, que grava um produto e a receita inteira numa única transação

> Se você usa a Supabase CLI: `supabase link --project-ref <ref>` e depois `supabase db push`.

### 1.2 Carregar o produto de teste

No SQL Editor, rode [`supabase/seed.sql`](supabase/seed.sql). Ele cria o "Produto Teste Colonial". Rodar de novo não duplica.

Opcional: [`supabase/seed_testes.sql`](supabase/seed_testes.sql) cria mais três produtos fictícios ("Linguiça Teste", "Mortadela Teste" e "Salsicha Teste", esta com só 5 temperos). Também pode ser rodado de novo sem duplicar.

### 1.3 Criar o usuário e fechar o cadastro público

1. **Authentication → Users → Add user → Create new user**: informe e-mail e senha e marque *Auto Confirm User*.
2. **Authentication → Sign In / Providers**: **desligue "Allow new users to sign up"**.

> ⚠ O passo 2 é importante. As regras de RLS liberam o acesso para qualquer usuário autenticado. Com o cadastro público ligado, qualquer pessoa com a URL do projeto poderia criar uma conta e editar as receitas.

### 1.4 Variáveis de ambiente

Crie `.env.local` na raiz, com os dados de **Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## 2. Rodar localmente

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # testes unitários do cálculo
npm run build     # build de produção
```

Para usar no tablet pela rede local, rode `npm run dev -- -H 0.0.0.0` e acesse `http://<ip-do-pc>:3000`.

## 3. Regras de cálculo

Cada ingrediente tem um **papel**:

| Papel       | Comportamento                                                         |
| ----------- | --------------------------------------------------------------------- |
| `base`      | Peso digitado pelo operador (ex.: MP 1). Exatamente um por receita.   |
| `espelho`   | Sempre igual ao peso de outro ingrediente (ex.: MP 2 = MP 1).         |
| `variavel`  | Calculado pela % da receita ou digitado manualmente (ex.: MP 3).      |
| `calculado` | Sempre derivado da % da receita (ex.: temperos).                      |

- `massa = peso_base / (percentual_base / 100)`; cada ingrediente = `percentual / 100 × massa`.
- **MP 3 manual:** os demais ingredientes continuam calculados a partir do peso base. O total passa a ser a soma real dos pesos, e a tela mostra o **% real** de cada ingrediente ao lado do % da receita.
- **MP 3 vazio:** calculado pela % da receita.
- Pesos abaixo de 1 kg aparecem em gramas (0,003 kg → 3 g). A vírgula é aceita como separador decimal.
- A conta usa `decimal.js`, sem erro de ponto flutuante, e os resultados saem com 6 casas.
- Se a soma das porcentagens não der 100%, o sistema mostra um alerta, mas não bloqueia o cálculo nem o cadastro.

**Teste de aceitação** (em `lib/calculo.test.ts`): MP 1 = 9 kg → MP 2 = 9 kg, MP 3 = 4,5 kg, T1 = 1,2 kg, T2 = 900 g, T3 = 3 g, T4 = 27 g, T5 = 2,1 kg, T6 = 3,27 kg, total = 30 kg.

## 4. Ficha de produção (imprimir e PDF)

Na tela de produção, os botões **Imprimir** e **Baixar PDF** são liberados depois de informar o MP 1. Os dois usam o mesmo layout: um PDF A4 gerado no navegador com `@react-pdf/renderer`, salvo como `ficha-<produto>-<AAAA-MM-DD>.pdf`.

- O nome da empresa, o nome do sistema e o fuso horário ficam em [`lib/config.ts`](lib/config.ts).
- Para gerar um PDF de exemplo (Linguiça Teste, MP 1 = 12 kg): `FICHA_SAIDA=ficha.pdf npm test`.
- O botão Imprimir abre uma nova aba. Se o navegador bloquear, permita pop-ups para o site.

**Problema conhecido em dev:** se as cores ou o tema não atualizarem depois de editar `app/globals.css`, pare o `npm run dev`, apague a pasta `.next/dev/cache` e suba de novo. O cache do Turbopack às vezes guarda a versão antiga do CSS.

**Foto da tela de login:** `public/login-embutidos.jpg`, do [Unsplash](https://images.unsplash.com/photo-1529241160658-a8a2a0d86620), sob a [Licença Unsplash](https://unsplash.com/license) (uso livre, inclusive comercial). Para trocar, substitua o arquivo mantendo o nome.

**Tema claro/escuro:** o seletor (sol/lua) fica no rodapé da sidebar. O login é sempre claro (`ROTAS_SEMPRE_CLARAS` em `lib/tema.ts`). No celular, use **Buscar** e digite "tema". O padrão é o claro, e a escolha fica salva no navegador. As cores dos dois modos estão em `app/globals.css`: o modo escuro só redefine os mesmos tokens em `html[data-tema="escuro"]`. A sidebar usa os tokens `nav-*`, que são claros num tema e carvão no outro.

## 5. Estrutura

```
lib/
  calculo.ts        função pura do cálculo (sem UI nem banco)
  formato.ts        leitura com vírgula, exibição em kg/g e %
  receita.ts        validação do cadastro (usada no form e no servidor)
  ficha.ts          dados da ficha de produção, já formatados
  config.ts         nome da empresa/sistema e fuso horário
  dados.ts          consultas ao Supabase (somente servidor)
  *.test.ts(x)      testes (Vitest)
components/
  ui.tsx            botões, badges, skeleton, estado vazio
  navegacao.tsx     sidebar recolhível (desktop) e barra inferior (tablet/celular)
  paleta-comandos.tsx  busca rápida Ctrl/⌘ K (produtos e ações)
  ficha/            layout do PDF e geração (download/impressão)
app/
  login/            tela de login
  (app)/page.tsx    seleção de produto
  (app)/produtos/[id]/   tela de produção
  (app)/cadastro/        CRUD de produtos e receitas
proxy.ts            exige login em todas as telas (exceto /login)
supabase/
  migrations/       SQL das tabelas, RLS e função salvar_receita
  seed.sql          produto de teste
```

Nenhuma receita fica no código: tudo vem do banco.
