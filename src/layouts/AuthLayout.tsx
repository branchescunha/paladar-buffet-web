import type { PropsWithChildren } from 'react';
import styled from 'styled-components';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <Page>
      <Panel>
        <Brand>
          <strong>Paladar Buffet</strong>
          <span>Painel Administrativo</span>
        </Brand>
        {children}
      </Panel>
    </Page>
  );
}

const Page = styled.main`
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Panel = styled.section`
  display: grid;
  width: min(100%, 28rem);
  gap: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.softGreen};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Brand = styled.header`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.deepGreen};

  strong {
    font-size: 1.65rem;
  }

  span {
    color: ${({ theme }) => theme.colors.oliveGray};
    font-weight: 700;
  }
`;
