# Paladar Buffet Web

Aplicação web completa do Paladar Buffet, com experiência pública para apresentação dos serviços e solicitação de orçamento, além de um painel administrativo responsivo para a operação comercial.

## Demonstração

- Site público: [buffetpaladar.com.br](https://buffetpaladar.com.br)

## Funcionalidades

### Site público

- Home institucional responsiva com identidade e acervo oficial do Paladar Buffet
- Apresentação de eventos, cardápios, história, galeria e processo de atendimento
- Formulário público de orçamento com validação, consentimento de privacidade e proteção anti-spam
- Catálogo dinâmico de cardápio com limites de seleção por grupo
- Política de Privacidade e página 404 personalizada
- Navegação adaptada para desktop, tablet e celular

### Painel administrativo

- Autenticação por senha e Google para contas previamente autorizadas
- Recuperação e troca obrigatória de senha inicial
- Dashboard com indicadores e solicitações recentes
- Gestão de solicitações, clientes e eventos
- Conversão de solicitação em cliente e evento
- Propostas por itens e por valor por convidado
- Cálculos em BRL, ajustes, parcelas, serviços e formas de pagamento
- Preservação de snapshots comerciais do cardápio e dos pagamentos
- Download de proposta comercial em PDF
- Configuração administrativa de cardápios e formas de pagamento
- Perfil, tema claro/escuro persistido e gestão das contas administrativas

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form e Zod
- styled-components
- Axios
- Vitest e React Testing Library
- Playwright

## Estrutura

```text
src/
  app/          providers e configuração global
  components/   componentes compartilhados
  features/     serviços e contratos por domínio
  layouts/      estruturas pública e administrativa
  pages/        páginas públicas, autenticação e Admin
  routes/       roteamento e proteção de acesso
  services/     cliente HTTP e serviços transversais
  styles/       temas, tokens e estilos globais
  test/         infraestrutura de testes
e2e/            cenários de navegação e responsividade
public/         assets oficiais e configuração do host
```

## Segurança no cliente

- Sessão mantida pela API em cookie HttpOnly
- Token CSRF enviado nas mutações administrativas
- Nenhum cadastro público de administrador
- Rotas administrativas protegidas
- Mensagens públicas sem detalhes internos da API
- Metadados `noindex` nas áreas restritas

## Qualidade

O projeto possui testes unitários, testes de integração de componentes e cenários E2E para os fluxos públicos, administrativos, comerciais e responsivos.

## Autor

[André Branches](https://github.com/branchescunha)
