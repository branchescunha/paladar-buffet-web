import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FilePlus2, Inbox, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchAdminDashboard } from '@/features/admin-dashboard/dashboard.service';

const operationalMetrics = [
  { label: 'Solicitações novas', icon: Inbox, key: 'newRequests' },
  { label: 'Em andamento', icon: UsersRound, key: 'inProgress' },
  { label: 'Propostas enviadas', icon: FilePlus2, key: 'proposalsSent' },
  { label: 'Eventos aprovados', icon: ArrowRight, key: 'approvedEvents' }
] as const;

export function AdminHomePage() {
  const dashboard = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    retry: false
  });

  return (
    <Page>
      <Intro>
        <div>
          <Eyebrow>Visão geral</Eyebrow>
          <h1>Painel administrativo</h1>
          <p>Acompanhe as solicitações recebidas e prepare o atendimento do Paladar Buffet.</p>
        </div>
        <Actions>
          <PrimaryAction to="/admin/proposals">
            <FilePlus2 size={18} />
            Nova proposta
          </PrimaryAction>
          <SecondaryAction to="/admin/quotes">
            Ver solicitações
            <ArrowRight size={18} />
          </SecondaryAction>
        </Actions>
      </Intro>

      <MetricGrid>
        {operationalMetrics.map(({ label, icon: Icon, key }) => {
          const value = dashboard.data?.metrics[key] ?? null;

          return (
          <MetricCard key={label}>
            <MetricIcon>
              <Icon size={19} />
            </MetricIcon>
            <div>
              <h2>{label}</h2>
              <strong>{value ?? '--'}</strong>
              <p>{value === null ? 'Ainda indisponível' : 'Atualizado em tempo real'}</p>
            </div>
          </MetricCard>
          );
        })}
      </MetricGrid>

      <RecentSection>
        <SectionHeading>
          <div>
            <Eyebrow>Recebimento</Eyebrow>
            <h2>Últimas solicitações recebidas</h2>
          </div>
          <Link to="/admin/quotes">Ver todas</Link>
        </SectionHeading>

        {dashboard.isLoading ? <Feedback>Carregando solicitações...</Feedback> : null}
        {dashboard.isError ? <Feedback>Não foi possível carregar as solicitações agora.</Feedback> : null}
        {dashboard.data?.latestRequests.length === 0 ? <Feedback>Nenhuma solicitação recebida até o momento.</Feedback> : null}
        {dashboard.data?.latestRequests.length ? (
          <RequestList>
            {dashboard.data.latestRequests.map((request) => (
              <RequestItem key={request.id}>
                <div>
                  <strong>{request.fullName}</strong>
                  <span>{formatEvent(request)}</span>
                </div>
                <time dateTime={request.createdAt}>{formatReceivedAt(request.createdAt)}</time>
              </RequestItem>
            ))}
          </RequestList>
        ) : null}
      </RecentSection>
    </Page>
  );
}

function formatEvent(request: { eventType: string; eventTypeOther: string | null; eventDate: string | null; eventTime: string | null }) {
  const eventName = request.eventTypeOther ?? eventTypeLabels[request.eventType] ?? request.eventType;
  const date = request.eventDate ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(request.eventDate)) : null;
  return [eventName, date, request.eventTime].filter(Boolean).join(' · ');
}

function formatReceivedAt(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

const eventTypeLabels: Record<string, string> = {
  casamento: 'Casamento',
  aniversario: 'Aniversário',
  corporativo: 'Corporativo',
  confraternizacao: 'Confraternização',
  churrasco: 'Churrasco',
  reuniao: 'Reunião',
  'coffee-break': 'Coffee break',
  brunch: 'Brunch',
  outro: 'Outro'
};

const Page = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: clamp(2rem, 3vw, 2.75rem);
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Intro = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};

  p {
    max-width: 42rem;
    margin-top: ${({ theme }) => theme.spacing.sm};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
  }
`;

const Action = styled(Link)`
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-weight: 700;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  text-decoration: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex: 1 1 100%;
  }
`;

const PrimaryAction = styled(Action)`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.palette.white};
`;

const SecondaryAction = styled(Action)`
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.textStrong};
`;

const MetricGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.article`
  display: flex;
  min-height: 9.5rem;
  gap: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
  }

  strong {
    display: block;
    margin: ${({ theme }) => theme.spacing.xs} 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: 1.75rem;
  }

  p {
    font-size: 0.8rem;
  }
`;

const MetricIcon = styled.span`
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.accentMuted};
  color: ${({ theme }) => theme.colors.accent};
`;

const RecentSection = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  h2 {
    margin: ${({ theme }) => theme.spacing.xs} 0 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: 1.25rem;
  }

  a {
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: 0.9rem;
    font-weight: 700;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const Feedback = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg} !important;
`;

const RequestList = styled.ul`
  margin: ${({ theme }) => theme.spacing.lg} 0 0;
  padding: 0;
`;

const RequestItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} 0;

  div {
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  strong {
    color: ${({ theme }) => theme.colors.textStrong};
  }

  span,
  time {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.875rem;
  }

  time {
    flex: 0 0 auto;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    align-items: flex-start;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;
