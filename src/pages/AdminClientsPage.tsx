import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { createCustomer, deleteCustomer, fetchCustomer, fetchCustomers, updateCustomer, type CustomerInput } from '@/features/admin-crm/crm.service';
import { getApiErrorMessage } from '@/services/api';

const emptyCustomer: CustomerInput = { name: '', phone: '', email: null, notes: null };

export function AdminClientsPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerInput>(emptyCustomer);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const queryClient = useQueryClient();
  const customers = useQuery({ queryKey: ['admin-customers', search], queryFn: () => fetchCustomers(search || undefined), retry: false });
  const selected = useQuery({ queryKey: ['admin-customer', selectedId], queryFn: () => fetchCustomer(selectedId ?? ''), enabled: Boolean(selectedId), retry: false });
  const save = useMutation({
    mutationFn: () => selectedId ? updateCustomer({ id: selectedId, data: form }) : createCustomer(form),
    onSuccess: async (customer) => {
      setSelectedId(customer.id);
      setError(null);
      setSuccess('Cliente salvo.');
      await queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-customer', customer.id] });
    },
    onError: (reason) => setError(getApiErrorMessage(reason))
  });
  const remove = useMutation({
    mutationFn: () => deleteCustomer(selectedId ?? ''),
    onSuccess: async () => {
      const deletedId = selectedId;
      setSelectedId(null);
      setForm(emptyCustomer);
      setConfirmingDelete(false);
      setError(null);
      setSuccess('Cliente excluído com sucesso.');
      if (deletedId) queryClient.removeQueries({ queryKey: ['admin-customer', deletedId], exact: true });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-customers'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      ]);
    },
    onError: (reason) => {
      setConfirmingDelete(false);
      setSuccess(null);
      setError(getApiErrorMessage(reason));
    }
  });

  function selectCustomer(id: string) {
    const customer = customers.data?.find((item) => item.id === id);
    setSelectedId(id);
    if (customer) setForm({ name: customer.name, phone: customer.phone, email: customer.email, notes: customer.notes });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate();
  }

  return <Page>
    <header><Eyebrow>Relacionamento</Eyebrow><h1>Clientes</h1><p>Cadastre e acompanhe os dados de contato dos clientes.</p></header>
    <Workspace>
      <Panel><SearchInput aria-label="Buscar clientes" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, e-mail ou telefone" />
        <NewButton type="button" onClick={() => { setSelectedId(null); setForm(emptyCustomer); setError(null); setSuccess(null); setConfirmingDelete(false); }}>Novo cliente</NewButton>
        {customers.isLoading ? <Feedback>Carregando clientes...</Feedback> : null}
        {!customers.isLoading && !customers.isError && customers.data?.length === 0 ? <Feedback>Nenhum cliente cadastrado.</Feedback> : null}
        <List>{customers.data?.map((customer) => <ListItem key={customer.id} type="button" $selected={customer.id === selectedId} onClick={() => selectCustomer(customer.id)}><strong>{customer.name}</strong><span>{customer.phone}</span></ListItem>)}</List>
      </Panel>
      <Panel><h2>{selectedId ? 'Editar cliente' : 'Novo cliente'}</h2>{selected.isLoading ? <Feedback>Carregando detalhes...</Feedback> : null}
        <Form onSubmit={submit}>
          <Field><label htmlFor="customer-name">Nome</label><input id="customer-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field><label htmlFor="customer-phone">Telefone</label><input id="customer-phone" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
          <Field><label htmlFor="customer-email">E-mail</label><input id="customer-email" type="email" value={form.email ?? ''} onChange={(event) => setForm({ ...form, email: event.target.value || null })} /></Field>
          <Field><label htmlFor="customer-notes">Observações</label><textarea id="customer-notes" value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value || null })} /></Field>
          {error ? <Error role="alert">{error}</Error> : null}{success ? <Success role="status">{success}</Success> : null}<FormActions><SaveButton disabled={save.isPending || remove.isPending}>{save.isPending ? 'Salvando...' : 'Salvar cliente'}</SaveButton>{selectedId ? <DeleteButton type="button" disabled={save.isPending || remove.isPending} onClick={() => setConfirmingDelete(true)}>Excluir cliente</DeleteButton> : null}</FormActions>
        </Form>
      </Panel>
    </Workspace>
    {confirmingDelete ? <ConfirmDeleteDialog title="Excluir cliente?" confirmLabel="Excluir cliente" isPending={remove.isPending} onCancel={() => setConfirmingDelete(false)} onConfirm={() => remove.mutate()} /> : null}
  </Page>;
}

const Page = styled.section`display:grid;gap:${({ theme }) => theme.spacing.xl}; h1,h2{margin:0;color:${({ theme }) => theme.colors.textStrong}} p{margin:${({ theme }) => theme.spacing.sm} 0 0;color:${({ theme }) => theme.colors.textMuted}}`;
const Eyebrow = styled.span`color:${({ theme }) => theme.colors.accent};font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;`;
const Workspace = styled.div`display:grid;min-width:0;grid-template-columns:minmax(16rem,.8fr) minmax(0,1.2fr);gap:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.lg}){grid-template-columns:1fr}`;
const Panel = styled.section`min-width:0;border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};padding:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){padding:${({ theme }) => theme.spacing.md};}`;
const SearchInput = styled.input`width:100%;min-height:2.75rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.md};`;
const NewButton = styled.button`width:100%;min-height:2.5rem;margin-top:${({ theme }) => theme.spacing.sm};border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:transparent;color:${({ theme }) => theme.colors.textStrong};font-weight:700;`;
const List = styled.div`display:grid;margin-top:${({ theme }) => theme.spacing.md};`;
const ListItem = styled.button<{ $selected: boolean }>`display:grid;gap:${({ theme }) => theme.spacing.xs};border:0;border-top:1px solid ${({ theme }) => theme.colors.border};background:${({ $selected, theme }) => $selected ? theme.colors.surfaceAlt : 'transparent'};color:${({ theme }) => theme.colors.textStrong};padding:${({ theme }) => theme.spacing.md};text-align:left;strong{font-size:.95rem}span{color:${({ theme }) => theme.colors.textMuted};font-size:.82rem}`;
const Form = styled.form`display:grid;gap:${({ theme }) => theme.spacing.md};margin-top:${({ theme }) => theme.spacing.lg};`;
const Field = styled.div`display:grid;gap:${({ theme }) => theme.spacing.xs};label{font-weight:700;color:${({ theme }) => theme.colors.textStrong}}input,textarea{width:100%;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md}}textarea{min-height:7rem;resize:vertical}`;
const SaveButton = styled.button`min-height:2.75rem;border:0;border-radius:${({ theme }) => theme.radius.pill};background:${({ theme }) => theme.colors.accent};color:${({ theme }) => theme.palette.white};font-weight:800;padding:0 ${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){width:100%;}`;
const FormActions = styled.div`display:flex;flex-wrap:wrap;gap:${({ theme }) => theme.spacing.sm};`;
const DeleteButton = styled.button`min-height:2.75rem;border:1px solid ${({ theme }) => theme.colors.danger};border-radius:${({ theme }) => theme.radius.pill};background:transparent;color:${({ theme }) => theme.colors.danger};font-weight:800;padding:0 ${({ theme }) => theme.spacing.lg};`;
const Feedback = styled.p`margin-top:${({ theme }) => theme.spacing.md} !important;`;
const Error = styled.p`color:${({ theme }) => theme.colors.danger} !important;`;
const Success = styled.p`color:${({ theme }) => theme.colors.accent} !important;font-weight:700;`;
