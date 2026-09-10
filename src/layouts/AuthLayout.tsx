import type { PropsWithChildren } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <Page>
      <Panel>
        <BackLink to="/">
          <ArrowLeft size={18} />
          Voltar ao site
        </BackLink>
        <Brand>
          <strong>Paladar Buffet</strong>
          <span>Acesso administrativo restrito</span>
        </Brand>
        {children}
      </Panel>
    </Page>
  );
}

const Page = styled.main`
  display: grid;
  min-width: 0;
  min-height: 100vh;
  place-items: center;
  background:
    linear-gradient(135deg, ${({ theme }) => theme.colors.background}, ${({ theme }) => theme.colors.surfaceAlt});
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Panel = styled.section`
  display: grid;
  min-width: 0;
  width: min(100%, 28rem);
  gap: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  width: max-content;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 800;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.textStrong};
  }
`;

const Brand = styled.header`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textStrong};

  strong {
    font-size: 1.65rem;
  }

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 700;
  }
`;
