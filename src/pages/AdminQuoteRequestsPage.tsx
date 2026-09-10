import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, FilePlus2, Search, UserRoundPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  fetchAdminQuoteRequest,
  fetchAdminQuoteRequests,
  quoteRequestStatuses,
  type QuoteRequestStatus,
  updateAdminQuoteRequestStatus
} from '@/features/admin-quote-requests/admin-quote-requests.service';
import { convertQuoteRequest, fetchCustomers } from '@/features/admin-crm/crm.service';
import { createProposalDraft } from '@/features/admin-proposals/proposal.service';
import { getApiErrorMessage } from '@/services/api';

const statusLabels: Record<QuoteRequestStatus, string> = {
  NOVA: 'Nova',
  EM_ANALISE: 'Em análise',
  PROPOSTA_ENVIADA: 'Proposta enviada',
  APROVADA: 'Aprovada',
  RECUSADA: 'Recusada',
  CANCELADA: 'Cancelada'
};

export function AdminQuoteRequestsPage() {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuoteRequestStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const list = useQuery({
    queryKey: ['admin-quote-requests', search, status],
    queryFn: () => fetchAdminQuoteRequests({ search: search || undefined, status: status || undefined }),
    retry: false
  });
  const detail = useQuery({
    queryKey: ['admin-quote-request', selectedId],
    queryFn: () => fetchAdminQuoteRequest(selectedId ?? ''),
    enabled: Boolean(selectedId),
    retry: false
  });
  const updateStatus = useMutation({
    mutationFn: updateAdminQuoteRequestStatus,
    onSuccess: async () => {
      setConversionMessage('Status atualizado.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-quote-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-quote-request', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      ]);
    },
    onError: (error) => setConversionMessage(getApiErrorMessage(error))
  });
  const customers = useQuery({ queryKey: ['admin-customers', 'quote-conversion'], queryFn: () => fetchCustomers(), retry: false });
  const convertQuote = useMutation({
    mutationFn: () => convertQuoteRequest({ id: selectedId ?? '', customerId: selectedCustomerId || undefined }),
    onSuccess: async () => {
      setConversionMessage('Cliente e evento criados sem alterar o status da solicitação.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-quote-request', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['admin-customers'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-events'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      ]);
    },
    onError: (error) => setConversionMessage(getApiErrorMessage(error))
  });
  const createProposal = useMutation({
    mutationFn: () => createProposalDraft(selectedId ?? ''),
    onSuccess: (proposal) => navigate(`/admin/proposals?proposal=${proposal.id}`),
    onError: (error) => setConversionMessage(getApiErrorMessage(error))
  });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchDraft.trim());
  }

  return (
    <Page>
      <header>
        <Eyebrow>Atendimento</Eyebrow>
        <h1>Solicitações</h1>
        <p>Consulte os pedidos recebidos e mantenha cada atendimento atualizado.</p>
      </header>

      <Filters onSubmit={handleSearch}>
        <SearchField>
          <Search size={18} />
          <input
            aria-label="Buscar solicitações"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Nome, e-mail ou telefone"
          />
        </SearchField>
        <StatusSelect aria-label="Filtrar por status" value={status} onChange={(event) => setStatus(event.target.value as QuoteRequestStatus | '')}>
          <option value="">Todos os status</option>
          {quoteRequestStatuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </StatusSelect>
        <SearchButton type="submit">Buscar</SearchButton>
      </Filters>

      <ContentGrid>
        <ListPanel>
          <ListHeading>
            <h2>Solicitações recebidas</h2>
            <span>{list.data?.total ?? 0}</span>
          </ListHeading>
          {list.isLoading ? <Feedback>Carregando solicitações...</Feedback> : null}
          {list.isError ? <Feedback>Não foi possível carregar as solicitações agora.</Feedback> : null}
          {list.data?.items.length === 0 ? <Feedback>Nenhuma solicitação encontrada.</Feedback> : null}
          <RequestList>
            {list.data?.items.map((item) => (
              <RequestButton key={item.id} type="button" $selected={selectedId === item.id} onClick={() => setSelectedId(item.id)}>
                <div>
                  <strong>{item.fullName}</strong>
                  <span>{formatEvent(item)}</span>
                </div>
                <div>
                  <StatusBadge $status={item.status}>{statusLabels[item.status]}</StatusBadge>
                  <ChevronRight size={18} />
                </div>
              </RequestButton>
            ))}
          </RequestList>
        </ListPanel>

        <DetailPanel>
          {!selectedId ? <Feedback>Selecione uma solicitação para ver os detalhes.</Feedback> : null}
          {detail.isLoading ? <Feedback>Carregando detalhes...</Feedback> : null}
          {detail.isError ? <Feedback>Não foi possível carregar os detalhes agora.</Feedback> : null}
          {detail.data ? (
            <>
              <DetailHeading>
                <div>
                  <Eyebrow>{statusLabels[detail.data.status]}</Eyebrow>
                  <h2>{detail.data.fullName}</h2>
                  <p>{formatEvent(detail.data)}</p>
                </div>
                <StatusBadge $status={detail.data.status}>{statusLabels[detail.data.status]}</StatusBadge>
              </DetailHeading>
              <DetailGrid>
                <DetailItem label="E-mail" value={detail.data.email ?? 'Não informado'} />
                <DetailItem label="Telefone" value={detail.data.phone} />
                <DetailItem label="Convidados" value={`${detail.data.guestCount}`} />
                <DetailItem label="Local" value={detail.data.location ?? 'Não informado'} />
                <DetailItem label="Contato preferido" value={detail.data.preferredContact} />
                <DetailItem label="Recebida em" value={formatDateTime(detail.data.createdAt)} />
                <DetailItem label="Preferências de cardápio" value={formatList(detail.data.menuPreferences)} />
                <DetailItem label="Necessidades de serviço" value={formatList(detail.data.serviceNeeds)} />
                <DetailItem label="Restrições alimentares" value={detail.data.dietaryRestrictions ?? 'Não informado'} />
                <DetailItem label="Mensagem" value={detail.data.message ?? 'Não informada'} />
              </DetailGrid>
              <StatusAction>
                <label htmlFor="quote-status">Status</label>
                <select
                  id="quote-status"
                  value={detail.data.status}
                  disabled={updateStatus.isPending}
                  onChange={(event) => updateStatus.mutate({ id: detail.data.id, status: event.target.value as QuoteRequestStatus })}
                >
                  {quoteRequestStatuses.map((value) => (
                    <option key={value} value={value}>
                      {statusLabels[value]}
                    </option>
                  ))}
                </select>
              </StatusAction>
              <ConversionAction>
                <label htmlFor="quote-customer">Cliente existente (opcional)</label>
                <select id="quote-customer" value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                  <option value="">Criar ou reutilizar por e-mail e telefone</option>
                  {customers.data?.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}
                </select>
                <button type="button" disabled={convertQuote.isPending} onClick={() => convertQuote.mutate()}>
                  <UserRoundPlus size={18} />
                  {convertQuote.isPending ? 'Criando...' : 'Criar cliente e evento'}
                </button>
                {conversionMessage ? <p role="status">{conversionMessage}</p> : null}
              </ConversionAction>
              <ProposalButton type="button" disabled={createProposal.isPending} onClick={() => createProposal.mutate()}>
                <FilePlus2 size={18} />
                {createProposal.isPending ? 'Criando...' : 'Criar proposta'}
              </ProposalButton>
            </>
          ) : null}
        </DetailPanel>
      </ContentGrid>
    </Page>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatEvent(item: { eventType: string; eventTypeOther: string | null; eventDate: string | null; eventTime: string | null }) {
  const eventName = item.eventTypeOther ?? eventTypeLabels[item.eventType] ?? item.eventType;
  const date = item.eventDate ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(item.eventDate)) : null;
  return [eventName, date, item.eventTime].filter(Boolean).join(' · ');
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatList(values: string[]) {
  return values.length ? values.join(', ') : 'Não informado';
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

  h1,
  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.textStrong};
  }

  h1 {
    font-size: clamp(2rem, 3vw, 2.75rem);
  }

  p {
    margin: ${({ theme }) => theme.spacing.sm} 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Filters = styled.form`
  display: grid;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing.sm};
  grid-template-columns: minmax(0, 1fr) minmax(11rem, 13rem) auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const SearchField = styled.label`
  display: flex;
  min-width: 0;
  min-height: 2.75rem;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 ${({ theme }) => theme.spacing.md};

  input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textStrong};
    font: inherit;
  }
`;

const StatusSelect = styled.select`
  min-height: 2.75rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textStrong};
  font: inherit;
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const SearchButton = styled.button`
  min-height: 2.75rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.palette.white};
  font-weight: 700;
  padding: 0 ${({ theme }) => theme.spacing.lg};
`;

const ContentGrid = styled.div`
  display: grid;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: minmax(18rem, 0.9fr) minmax(0, 1.1fr);

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ListPanel = styled(Panel)``;
const DetailPanel = styled(Panel)`min-height: 24rem;`;

const ListHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    font-size: 1.125rem;
  }

  span {
    display: inline-flex;
    min-width: 1.75rem;
    height: 1.75rem;
    align-items: center;
    justify-content: center;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: 0.8rem;
    font-weight: 800;
  }
`;

const Feedback = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg} !important;
`;

const RequestList = styled.div`
  display: grid;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const RequestButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $selected, theme }) => ($selected ? theme.colors.surfaceAlt : 'transparent')};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;

  > div:first-child {
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  > div:last-child {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  strong {
    color: ${({ theme }) => theme.colors.textStrong};
  }

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.8rem;
  }
`;

const StatusBadge = styled.span<{ $status: QuoteRequestStatus }>`
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ $status, theme }) => ($status === 'NOVA' ? theme.colors.accentMuted : theme.colors.surfaceAlt)};
  color: ${({ theme }) => theme.colors.textStrong} !important;
  font-size: 0.72rem !important;
  font-weight: 800;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  white-space: nowrap;
`;

const DetailHeading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  h2 {
    margin-top: ${({ theme }) => theme.spacing.xs};
    font-size: 1.5rem;
  }
`;

const DetailGrid = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: ${({ theme }) => theme.spacing.lg} 0;

  > div {
    min-width: 0;
  }

  dt {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  dd {
    margin: ${({ theme }) => theme.spacing.xs} 0 0;
    color: ${({ theme }) => theme.colors.textStrong};
    overflow-wrap: anywhere;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatusAction = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  label {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.8rem;
    font-weight: 800;
  }

  select {
    min-height: 2.75rem;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textStrong};
    font: inherit;
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const ProposalButton = styled.button`
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  font-weight: 700;
  padding: 0 ${({ theme }) => theme.spacing.lg};

  small {
    font-weight: 600;
  }
`;

const ConversionAction = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  label {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.8rem;
    font-weight: 800;
  }

  select,
  button {
    min-height: 2.75rem;
    border-radius: ${({ theme }) => theme.radius.md};
    font: inherit;
  }

  select {
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textStrong};
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
    border: 0;
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.palette.white};
    font-weight: 800;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.85rem;
  }
`;
