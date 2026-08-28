# Paladar Buffet Web

Aplicacao web do Paladar Buffet. O projeto inclui site publico institucional, formulario publico de orcamento e area administrativa protegida.

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
- Home publica em `/`
- Formulario publico de orcamento em `/orcamento`
- Politica de privacidade em `/privacidade`
- Botao "Continuar com Google" preparado para integracao
- Validacao de formulario com Zod
- Recuperacao de senha
- Redefinicao de senha por token
- Consulta de sessao atual
- Rotas protegidas
- Shell administrativo responsivo
- Logout
- Cliente Axios com cookies e header CSRF
- Tema base com tokens oficiais do Paladar Buffet
- Assets oficiais de logo e hero do proprietario
- SEO base, canonical, Open Graph e JSON-LD sem dados inventados
- Pagina 404
- Playwright configurado para smoke tests publico e administrativo

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

Variavel publica:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

Somente variaveis seguras para exposicao publica devem ser adicionadas ao frontend.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Autenticacao

A sessao administrativa e controlada pelo backend via cookie HttpOnly. O frontend nao usa `localStorage` para armazenar token sensivel.

Nao existe tela de cadastro. Administradores devem ser criados previamente no banco pela API/seed/processo operacional autorizado.

O formulario publico de orcamento nao cria conta de cliente e nao concede acesso ao painel administrativo.

## Desenvolvimento Local

1. Instale as dependencias com `npm install`.
2. Configure `.env` usando `.env.example`.
3. Inicie a API em `VITE_API_URL`.
4. Rode `npm run dev`.

O build Vite padrao pode ser publicado separadamente da API.
