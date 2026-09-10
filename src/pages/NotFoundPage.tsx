import { Link } from 'react-router-dom';
import styled from 'styled-components';

export function NotFoundPage() {
  return (
    <Page>
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar ao site</Link>
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
    color: ${({ theme }) => theme.colors.textStrong};
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 700;
  }
`;
