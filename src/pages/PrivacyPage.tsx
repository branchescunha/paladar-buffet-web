import styled from 'styled-components';
import { PublicLayout } from '@/layouts/PublicLayout';

const sections = [
  {
    title: 'Quem somos',
    body: [
      'O Paladar Buffet é operado por Buffet e Restaurante Paladar LTDA, CNPJ 59.973.986/0001-29, com atendimento para Brasília/DF e região.',
      'Esta política explica como tratamos dados enviados pelo site público para solicitação de orçamento.'
    ]
  },
  {
    title: 'Dados pessoais coletados',
    body: [
      'Podemos coletar nome, telefone, e-mail, tipo de evento, data, horário previsto, quantidade de convidados, localidade, preferências de cardápio, estrutura desejada, restrições alimentares e observações informadas no formulário.'
    ]
  },
  {
    title: 'Como os dados são usados',
    body: [
      'Usamos as informações para entender o evento, responder ao contato comercial e preparar um orçamento personalizado sob consulta.',
      'Também podemos usar registros técnicos básicos para segurança, prevenção de abuso e funcionamento correto do formulário.'
    ]
  },
  {
    title: 'Compartilhamento e terceiros',
    body: [
      'As informações podem ser acessadas por prestadores de infraestrutura necessários ao funcionamento do site, hospedagem, banco de dados e envio de comunicações, sempre dentro da finalidade operacional.',
      'Links externos, como WhatsApp e Instagram, seguem as políticas das respectivas plataformas.'
    ]
  },
  {
    title: 'Armazenamento e segurança',
    body: [
      'Adotamos medidas técnicas e organizacionais adequadas para proteger as informações contra acesso não autorizado, perda, alteração ou divulgação indevida.',
      'Os dados são mantidos pelo período necessário para atendimento da solicitação, relacionamento comercial e cumprimento de obrigações legais, quando aplicável.'
    ]
  },
  {
    title: 'Direitos do titular',
    body: [
      'Você pode solicitar confirmação de tratamento, acesso, correção, atualização ou exclusão de dados, quando aplicável pela LGPD.',
      'Para exercer esses direitos, entre em contato pelo e-mail buffet.paladar.df@gmail.com.'
    ]
  },
  {
    title: 'Alterações desta política',
    body: [
      'Esta política pode ser atualizada para refletir mudanças no site, no atendimento ou em requisitos legais. A versão publicada nesta página é a referência vigente.'
    ]
  },
  {
    title: 'Contato',
    body: ['Para dúvidas ou solicitações relacionadas a dados pessoais, escreva para buffet.paladar.df@gmail.com.']
  }
];

export function PrivacyPage() {
  return (
    <PublicLayout>
      <Main>
        <Hero>
          <span>Paladar Buffet</span>
          <h1>Política de Privacidade</h1>
          <p>
            Esta página descreve como os dados enviados pelo formulário público de orçamento são tratados para contato
            comercial e preparação de orçamento personalizado.
          </p>
        </Hero>

        <Article>
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <UpdatedAt>Última atualização: agosto de 2026</UpdatedAt>
        </Article>
      </Main>
    </PublicLayout>
  );
}

const Main = styled.main`
  width: min(960px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(7rem, 12vw, 10rem) 0 ${({ theme }) => theme.spacing.section};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: min(100% - 1.25rem, 960px);
    padding: 5.1rem 0 3.25rem;
  }
`;

const Hero = styled.header`
  display: grid;
  gap: 0.85rem;
  margin-bottom: 3rem;

  span {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 900;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.8rem, 7vw, 5rem);
    line-height: 1;
  }

  p {
    max-width: 46rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 1.04rem;
    line-height: 1.75;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.5rem;
    margin-bottom: 1.6rem;

    span {
      font-size: 0.68rem;
    }

    h1 {
      font-size: clamp(2rem, 10vw, 2.55rem);
      line-height: 0.98;
    }

    p {
      font-size: 0.92rem;
      line-height: 1.5;
    }
  }
`;

const Article = styled.article`
  display: grid;
  gap: 1.25rem;

  section {
    display: grid;
    gap: 0.7rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-top: 1.25rem;
  }

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: 1.15rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.75;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.9rem;

    section {
      gap: 0.45rem;
      padding-top: 0.9rem;
    }

    h2 {
      font-size: 1rem;
      line-height: 1.2;
    }

    p {
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }
`;

const UpdatedAt = styled.p`
  margin: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.92rem;
  padding-top: 1.25rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.82rem;
    padding-top: 0.9rem;
  }
`;
