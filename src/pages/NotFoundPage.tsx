import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <Page>
      <Content>
        <Brand to="/" aria-label="Paladar Buffet - início">
          <img src="/assets/paladar/logo-navbar.webp" alt="Paladar Buffet" />
        </Brand>
        <StatusCode>404</StatusCode>
        <h1>Página não encontrada</h1>
        <p>O endereço informado não está disponível ou pode ter sido movido.</p>
        <HomeLink to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para o início
        </HomeLink>
      </Content>
    </Page>
  );
}

const Page = styled.main`
  display: grid;
  min-height: 100svh;
  place-items: center;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const Content = styled.section`
  display: grid;
  width: min(100%, 34rem);
  justify-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  padding: clamp(2rem, 7vw, 4.5rem);

  h1,
  p {
    margin: 0;
  }

  h1 {
    color: ${({ theme }) => theme.colors.textStrong};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.2rem, 7vw, 3.5rem);
    line-height: 1;
  }

  p {
    max-width: 30rem;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.6;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  width: min(14rem, 70vw);
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  img {
    width: 100%;
    height: auto;
  }
`;

const StatusCode = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-size: clamp(4.5rem, 16vw, 7.5rem);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 0.8;
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.palette.white};
  font-weight: 700;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  text-decoration: none;

  &:hover {
    filter: brightness(0.94);
  }
`;
