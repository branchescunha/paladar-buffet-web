import styled from 'styled-components';
import { PublicLayout } from '@/layouts/PublicLayout';

export function PrivacyPage() {
  return (
    <PublicLayout>
      <Main>
        <article>
          <span>Paladar Buffet</span>
          <h1>Politica de privacidade</h1>
          <p>
            Os dados enviados pelo formulario publico de orcamento personalizado sao usados para contato comercial,
            entendimento do evento e preparacao de proposta sob consulta.
          </p>
          <p>
            Podemos solicitar nome, telefone, e-mail, tipo de evento, data, quantidade de convidados, localidade e
            observacoes informadas livremente. Esses dados nao criam conta publica e nao liberam acesso administrativo.
          </p>
          <p>
            Para solicitar informacoes, atualizacao ou exclusao de dados enviados, entre em contato pelo e-mail oficial
            informado nesta pagina.
          </p>
        </article>
      </Main>
    </PublicLayout>
  );
}

const Main = styled.main`
  width: min(820px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(4rem, 10vw, 7rem) 0;

  article {
    display: grid;
    gap: 1rem;
  }

  span {
    color: ${({ theme }) => theme.colors.paladarOrange};
    font-weight: 900;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.deepGreen};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.8rem, 8vw, 5.5rem);
    line-height: 0.98;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.neutralText};
    line-height: 1.75;
  }
`;
