# Paladar Buffet Web

Aplicação web do Paladar Buffet. O projeto inclui site público institucional, formulário público de orçamento e área administrativa protegida.

## Stack

- React
- Vite
- TypeScript
- styled-components
- React Router
- React Hook Form
- Zod
- TanStack Query
- Axios
- Vitest
- React Testing Library
- Playwright

## Funcionalidades

- Tela de login administrativo
- Home pública em `/`
- Formulário público de orçamento em `/orcamento`
- Política de privacidade em `/privacidade`
- Botão "Continuar com Google" preparado para integração
- Validação de formulário com Zod
- Recuperação de senha
- Redefinição de senha por token
- Consulta de sessão atual
- Rotas protegidas
- Shell administrativo responsivo
- Logout
- Cliente Axios com cookies e header CSRF
- Tema base com tokens oficiais do Paladar Buffet
- Assets oficiais de logo e hero do proprietário
- SEO base, canonical, Open Graph e JSON-LD sem dados inventados
- Página 404
- Playwright configurado para smoke tests público e administrativo

## Estrutura

```text
src/
  app/
  components/
  config/
  features/
    auth/
    quote/
  layouts/
  pages/
  routes/
  services/
  styles/
  test/
  types/
```

## Environments

Crie um `.env` local com base em `.env.example`.

Variável pública:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

Somente variáveis seguras para exposição pública devem ser adicionadas ao frontend.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Autenticação

A sessão administrativa é controlada pelo backend via cookie HttpOnly. O frontend não usa `localStorage` para armazenar token sensível.

Não existe tela de cadastro. Administradores devem ser criados previamente no banco pela API/seed/processo operacional autorizado.

O formulário público de orçamento não cria conta de cliente e não concede acesso ao painel administrativo.

## Desenvolvimento Local

1. Instale as dependências com `npm install`.
2. Configure `.env` usando `.env.example`.
3. Inicie a API em `VITE_API_URL`.
4. Rode `npm run dev`.

O build Vite padrão pode ser publicado separadamente da API.
