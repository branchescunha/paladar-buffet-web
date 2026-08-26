import styled from 'styled-components';

export function AdminHomePage() {
  return (
    <Page>
      <h1>Painel Administrativo</h1>
      <p>Fundacao administrativa ativa para receber os proximos modulos do Paladar Buffet.</p>
    </Page>
  );
}

const Page = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.deepGreen};
    font-size: clamp(1.75rem, 3vw, 2.4rem);
  }

  p {
    max-width: 42rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.oliveGray};
  }
`;
