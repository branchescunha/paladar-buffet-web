import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { createEvent, deleteEvent, eventStatuses, fetchEvent, fetchEvents, fetchCustomers, updateEvent, type EventInput, type EventStatus } from '@/features/admin-crm/crm.service';
import { getApiErrorMessage } from '@/services/api';
import { formatAdminControlledValue } from '@/utils/admin-presentation';

const statusLabels: Record<EventStatus, string> = { PLANEJAMENTO: 'Planejamento', CONFIRMADO: 'Confirmado', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado' };
const emptyEvent: EventInput = { customerId: '', eventType: '', eventDate: '', eventTime: '', location: '', guestCount: 1, notes: null, status: 'PLANEJAMENTO' };

export function AdminEventsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<EventInput>(emptyEvent);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const queryClient = useQueryClient();
  const customers = useQuery({ queryKey: ['admin-customers', 'event-form'], queryFn: () => fetchCustomers(), retry: false });
  const events = useQuery({ queryKey: ['admin-events', search, status], queryFn: () => fetchEvents({ search: search || undefined, status: status || undefined }), retry: false });
  const selected = useQuery({ queryKey: ['admin-event', selectedId], queryFn: () => fetchEvent(selectedId ?? ''), enabled: Boolean(selectedId), retry: false });
  const save = useMutation({
    mutationFn: () => selectedId ? updateEvent({ id: selectedId, data: form }) : createEvent(form),
    onSuccess: async (event) => {
      setSelectedId(event.id);
      setError(null);
      setSuccess('Evento salvo.');
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['admin-events'] }), queryClient.invalidateQueries({ queryKey: ['admin-event', event.id] }), queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })]);
    },
    onError: (reason) => setError(getApiErrorMessage(reason))
  });
  const remove = useMutation({
    mutationFn: () => deleteEvent(selectedId ?? ''),
    onSuccess: async () => {
      const deletedId = selectedId;
      setSelectedId(null);
      setForm(emptyEvent);
      setConfirmingDelete(false);
      setError(null);
      setSuccess('Evento excluído com sucesso.');
      if (deletedId) queryClient.removeQueries({ queryKey: ['admin-event', deletedId], exact: true });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-events'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      ]);
    },
    onError: (reason) => {
      setConfirmingDelete(false);
      setSuccess(null);
      setError(getApiErrorMessage(reason));
    }
  });

  function selectEvent(id: string) {
    const event = events.data?.find((item) => item.id === id);
    setSelectedId(id);
    if (event) setForm({ customerId: event.customerId, eventType: event.eventType, eventDate: event.eventDate.slice(0, 10), eventTime: event.eventTime, location: event.location, guestCount: event.guestCount, notes: event.notes, status: event.status });
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); save.mutate(); }

  return <Page>
    <header><Eyebrow>Operação</Eyebrow><h1>Eventos</h1><p>Organize os eventos vinculados aos clientes do Paladar Buffet.</p></header>
    <Filters><input aria-label="Buscar eventos" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Evento ou cliente" /><select aria-label="Filtrar eventos por status" value={status} onChange={(event) => setStatus(event.target.value as EventStatus | '')}><option value="">Todos os status</option>{eventStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select><button type="button" onClick={() => { setSelectedId(null); setForm(emptyEvent); setError(null); setSuccess(null); setConfirmingDelete(false); }}>Novo evento</button></Filters>
    <Workspace>
      {!events.isLoading && !events.isError && events.data?.length === 0 ? <EmptyState>Nenhum evento encontrado.</EmptyState> : null}
      <Panel>{events.isLoading ? <Feedback>Carregando eventos...</Feedback> : null}<List>{events.data?.map((event) => <ListItem key={event.id} type="button" $selected={event.id === selectedId} onClick={() => selectEvent(event.id)}><strong>{formatAdminControlledValue(event.eventType)}</strong><span>{event.customer?.name ?? 'Cliente'} · {formatDate(event.eventDate)}</span><small>{statusLabels[event.status]}</small></ListItem>)}</List></Panel>
      <Panel><h2>{selectedId ? 'Editar evento' : 'Novo evento'}</h2>{selected.isLoading ? <Feedback>Carregando detalhes...</Feedback> : null}<Form onSubmit={submit}>
        <Field><label htmlFor="event-customer">Cliente</label><select id="event-customer" required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}><option value="">Selecione</option>{customers.data?.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}</select></Field>
        <TwoColumns><Field><label htmlFor="event-type">Tipo de evento</label><input id="event-type" required value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value })} /></Field><Field><label htmlFor="event-guests">Convidados</label><input id="event-guests" required type="number" min="1" value={form.guestCount} onChange={(event) => setForm({ ...form, guestCount: Number(event.target.value) })} /></Field></TwoColumns>
        <TwoColumns><Field><label htmlFor="event-date">Data</label><input id="event-date" required type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} /></Field><Field><label htmlFor="event-time">Horário</label><input id="event-time" required type="time" value={form.eventTime} onChange={(event) => setForm({ ...form, eventTime: event.target.value })} /></Field></TwoColumns>
        <Field><label htmlFor="event-location">Local</label><input id="event-location" required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></Field>
        <Field><label htmlFor="event-status">Status</label><select id="event-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EventStatus })}>{eventStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></Field>
        <Field><label htmlFor="event-notes">Observações</label><textarea id="event-notes" value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value || null })} /></Field>
        {error ? <Error role="alert">{error}</Error> : null}{success ? <Success role="status">{success}</Success> : null}<FormActions><SaveButton disabled={save.isPending || remove.isPending}>{save.isPending ? 'Salvando...' : 'Salvar evento'}</SaveButton>{selectedId ? <DeleteButton type="button" disabled={save.isPending || remove.isPending} onClick={() => setConfirmingDelete(true)}>Excluir evento</DeleteButton> : null}</FormActions>
      </Form></Panel>
    </Workspace>
    {confirmingDelete ? <ConfirmDeleteDialog title="Excluir evento?" confirmLabel="Excluir evento" isPending={remove.isPending} onCancel={() => setConfirmingDelete(false)} onConfirm={() => remove.mutate()} /> : null}
  </Page>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)); }
const Page = styled.section`display:grid;gap:${({ theme }) => theme.spacing.xl};h1,h2{margin:0;color:${({ theme }) => theme.colors.textStrong}}p{margin:${({ theme }) => theme.spacing.sm} 0 0;color:${({ theme }) => theme.colors.textMuted}}`;
const Eyebrow = styled.span`color:${({ theme }) => theme.colors.accent};font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;`;
const Filters = styled.div`display:grid;grid-template-columns:minmax(0,1fr) 12rem auto;gap:${({ theme }) => theme.spacing.sm};input,select,button{min-height:2.75rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.md}}button{font-weight:700}@media(max-width:${({ theme }) => theme.breakpoints.md}){grid-template-columns:1fr}`;
const Workspace = styled.div`display:grid;min-width:0;grid-template-columns:minmax(16rem,.8fr) minmax(0,1.2fr);gap:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.lg}){grid-template-columns:1fr}`;
const Panel = styled.section`min-width:0;border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};padding:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){padding:${({ theme }) => theme.spacing.md};}`;
const EmptyState = styled.p`grid-column:1/-1;margin:0!important;color:${({ theme }) => theme.colors.textMuted}!important;`;
const List = styled.div`display:grid;`;
const ListItem = styled.button<{ $selected: boolean }>`display:grid;gap:${({ theme }) => theme.spacing.xs};border:0;border-top:1px solid ${({ theme }) => theme.colors.border};background:${({ $selected, theme }) => $selected ? theme.colors.surfaceAlt : 'transparent'};color:${({ theme }) => theme.colors.textStrong};padding:${({ theme }) => theme.spacing.md};text-align:left;span{color:${({ theme }) => theme.colors.textMuted};font-size:.82rem}small{width:max-content;border-radius:${({ theme }) => theme.radius.pill};background:${({ theme }) => theme.colors.surfaceAlt};color:${({ theme }) => theme.colors.textStrong};font-size:.75rem;font-weight:800;padding:.2rem .5rem}`;
const Form = styled.form`display:grid;gap:${({ theme }) => theme.spacing.md};margin-top:${({ theme }) => theme.spacing.lg};`;
const TwoColumns = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${({ theme }) => theme.spacing.md};@media(max-width:${({ theme }) => theme.breakpoints.sm}){grid-template-columns:1fr}`;
const Field = styled.div`display:grid;gap:${({ theme }) => theme.spacing.xs};label{font-weight:700;color:${({ theme }) => theme.colors.textStrong}}input,select,textarea{width:100%;min-height:2.75rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md}}input[type='date'],input[type='time']{color-scheme:${({ theme }) => theme.mode}}textarea{min-height:7rem;resize:vertical}`;
const SaveButton = styled.button`min-height:2.75rem;border:0;border-radius:${({ theme }) => theme.radius.pill};background:${({ theme }) => theme.colors.accent};color:${({ theme }) => theme.palette.white};font-weight:800;padding:0 ${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){width:100%;}`;
const FormActions = styled.div`display:flex;flex-wrap:wrap;gap:${({ theme }) => theme.spacing.sm};`;
const DeleteButton = styled.button`min-height:2.75rem;border:1px solid ${({ theme }) => theme.colors.danger};border-radius:${({ theme }) => theme.radius.pill};background:transparent;color:${({ theme }) => theme.colors.danger};font-weight:800;padding:0 ${({ theme }) => theme.spacing.lg};`;
const Feedback = styled.p`margin-top:${({ theme }) => theme.spacing.md} !important;`;
const Error = styled.p`color:${({ theme }) => theme.colors.danger} !important;`;
const Success = styled.p`color:${({ theme }) => theme.colors.accent} !important;font-weight:700;`;
