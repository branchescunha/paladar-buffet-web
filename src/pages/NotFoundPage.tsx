import { Link } from 'react-router-dom';
import styled from 'styled-components';

export function NotFoundPage() {
  return (
    <Page>
      <h1>Pagina nao encontrada</h1>
      <Link to="/admin">Voltar ao painel</Link>
    </Page>
  );
}

const Page = styled.main`
  display: grid;
  min-height: 100vh;
  place-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.deepGreen};
  }

  a {
    color: ${({ theme }) => theme.colors.paladarOrange};
    font-weight: 700;
  }
`;
