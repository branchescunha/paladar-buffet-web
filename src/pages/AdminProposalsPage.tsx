import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { fetchCustomers, fetchEvents } from '@/features/admin-crm/crm.service';
import { centsFromCurrencyInput, currencyInputFromCents } from '@/features/admin-proposals/currency';
import {
  createProposal, deleteProposal, downloadProposalPdf, fetchProposal, fetchProposals,
  proposalStatuses, updateProposal, updateProposalStatus, type Proposal,
  type ProposalInput, type ProposalStatus
} from '@/features/admin-proposals/proposal.service';
import { fetchPaymentMethods } from '@/features/admin-settings/settings.service';
import { getApiErrorMessage } from '@/services/api';
import { formatAdminControlledValue } from '@/utils/admin-presentation';

const labels: Record<ProposalStatus, string> = {
  RASCUNHO: 'Rascunho', ENVIADA: 'Enviada', APROVADA: 'Aprovada',
  RECUSADA: 'Recusada', CANCELADA: 'Cancelada'
};
const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

function defaultValidity() {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString().slice(0, 10);
}

function emptyProposal(): ProposalInput {
  return {
    customerId: '', validUntil: defaultValidity(), adjustmentCents: 0,
    pricingMode: 'PER_GUEST', includedServices: ['Buffet'], paymentMethodIds: [], items: [],
    paymentInstallments: [
      { description: 'Na contratação', percentage: 50 },
      { description: 'No dia do evento', percentage: 50 }
    ]
  };
}

function hydrateProposal(proposal: Proposal): ProposalInput {
  return {
    customerId: proposal.customerId,
    eventId: proposal.eventId ?? undefined,
    quoteRequestId: proposal.quoteRequestId ?? undefined,
    description: proposal.description ?? undefined,
    notes: proposal.notes ?? undefined,
    validUntil: proposal.validUntil.slice(0, 10),
    adjustmentCents: proposal.adjustmentCents,
    pricingMode: proposal.pricingMode,
    guestCount: proposal.guestCount ?? undefined,
    pricePerGuestCents: proposal.pricePerGuestCents ?? undefined,
    includedServices: proposal.includedServices.map((item) => item.description),
    paymentMethodIds: proposal.paymentMethods.map((item) => item.paymentMethodId),
    paymentInstallments: proposal.paymentInstallments.map(({ description, percentage }) => ({ description, percentage })),
    items: proposal.items.map(({ description, quantity, unitPriceCents }) => ({ description, quantity, unitPriceCents }))
  };
}

export function AdminProposalsPage() {
  const client = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProposalStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get('proposal'));
  const [form, setForm] = useState<ProposalInput>(() => emptyProposal());
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const proposals = useQuery({ queryKey: ['admin-proposals', search, status], queryFn: () => fetchProposals({ search: search || undefined, status: status || undefined }), retry: false });
  const customers = useQuery({ queryKey: ['admin-customers', 'proposal-form'], queryFn: () => fetchCustomers(), retry: false });
  const events = useQuery({ queryKey: ['admin-events', 'proposal-form'], queryFn: () => fetchEvents({}), retry: false });
  const paymentMethods = useQuery({ queryKey: ['admin-payment-methods', 'proposal-form'], queryFn: fetchPaymentMethods, retry: false });
  const detail = useQuery({ queryKey: ['admin-proposal', selectedId], queryFn: () => fetchProposal(selectedId ?? ''), enabled: Boolean(selectedId), retry: false });

  useEffect(() => { if (detail.data) setForm(hydrateProposal(detail.data)); }, [detail.data]);

  const refresh = () => Promise.all([
    client.invalidateQueries({ queryKey: ['admin-proposals'] }),
    client.invalidateQueries({ queryKey: ['admin-dashboard'] }),
    selectedId ? client.invalidateQueries({ queryKey: ['admin-proposal', selectedId] }) : Promise.resolve()
  ]);
  const save = useMutation({
    mutationFn: () => selectedId ? updateProposal({ id: selectedId, data: form }) : createProposal(form),
    onSuccess: async (proposal) => { setSelectedId(proposal.id); setNotice({ type: 'success', text: 'Proposta salva.' }); await refresh(); },
    onError: (error) => setNotice({ type: 'error', text: getApiErrorMessage(error) })
  });
  const changeStatus = useMutation({
    mutationFn: (next: ProposalStatus) => updateProposalStatus({ id: selectedId ?? '', status: next }),
    onSuccess: async () => { setNotice({ type: 'success', text: 'Status atualizado.' }); await refresh(); },
    onError: (error) => setNotice({ type: 'error', text: getApiErrorMessage(error) })
  });
  const download = useMutation({
    mutationFn: () => downloadProposalPdf(selectedId ?? ''),
    onSuccess: () => setNotice({ type: 'success', text: 'Download do PDF iniciado.' }),
    onError: (error) => setNotice({ type: 'error', text: getApiErrorMessage(error) })
  });
  const remove = useMutation({
    mutationFn: () => deleteProposal(selectedId ?? ''),
    onSuccess: async () => {
      const deletedId = selectedId;
      setSelectedId(null); setForm(emptyProposal()); setConfirmingDelete(false);
      setNotice({ type: 'success', text: 'Proposta excluída com sucesso.' });
      if (deletedId) client.removeQueries({ queryKey: ['admin-proposal', deletedId], exact: true });
      await Promise.all([client.invalidateQueries({ queryKey: ['admin-proposals'] }), client.invalidateQueries({ queryKey: ['admin-dashboard'] })]);
    },
    onError: (error) => { setConfirmingDelete(false); setNotice({ type: 'error', text: getApiErrorMessage(error) }); }
  });

  const itemizedSubtotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
  const perGuestSubtotal = (form.guestCount ?? 0) * (form.pricePerGuestCents ?? 0);
  const subtotal = form.pricingMode === 'PER_GUEST' ? perGuestSubtotal : itemizedSubtotal;
  const total = subtotal + form.adjustmentCents;
  const installmentTotal = (form.paymentInstallments ?? []).reduce((sum, item) => sum + item.percentage, 0);
  const installmentAmounts = useMemo(() => {
    let allocated = 0;
    return (form.paymentInstallments ?? []).map((item, index, entries) => {
      const amount = index === entries.length - 1 ? total - allocated : Math.floor(total * item.percentage / 100);
      allocated += amount;
      return amount;
    });
  }, [form.paymentInstallments, total]);

  const snapshots = useMemo(() => detail.data?.paymentMethods ?? [], [detail.data?.paymentMethods]);
  const availablePaymentMethods = useMemo(() => {
    const current = paymentMethods.data?.filter((item) => item.isActive) ?? [];
    const byId = new Map(current.map((item) => [item.id, item]));
    for (const snapshot of snapshots) if (!byId.has(snapshot.paymentMethodId)) byId.set(snapshot.paymentMethodId, { ...snapshot, id: snapshot.paymentMethodId, isActive: false });
    return [...byId.values()].sort((a, b) => a.position - b.position);
  }, [paymentMethods.data, snapshots]);

  function chooseNewProposal() { setSelectedId(null); setForm(emptyProposal()); setNotice(null); }
  function chooseEvent(eventId: string) {
    const selectedEvent = events.data?.find((item) => item.id === eventId);
    setForm((current) => ({ ...current, eventId: eventId || undefined, guestCount: current.pricingMode === 'PER_GUEST' && selectedEvent ? selectedEvent.guestCount : current.guestCount }));
  }
  function updateItem(index: number, patch: Partial<ProposalInput['items'][number]>) {
    setForm((current) => ({ ...current, items: current.items.map((item, position) => position === index ? { ...item, ...patch } : item) }));
  }
  function moveService(index: number, offset: number) {
    setForm((current) => {
      const includedServices = [...current.includedServices];
      const destination = index + offset;
      if (destination < 0 || destination >= includedServices.length) return current;
      [includedServices[index], includedServices[destination]] = [includedServices[destination], includedServices[index]];
      return { ...current, includedServices };
    });
  }
  function updateInstallment(index: number, patch: Partial<NonNullable<ProposalInput['paymentInstallments']>[number]>) {
    setForm((current) => ({ ...current, paymentInstallments: (current.paymentInstallments ?? []).map((item, position) => position === index ? { ...item, ...patch } : item) }));
  }
  function togglePaymentMethod(id: string) {
    setForm((current) => ({ ...current, paymentMethodIds: current.paymentMethodIds.includes(id) ? current.paymentMethodIds.filter((item) => item !== id) : [...current.paymentMethodIds, id] }));
  }
  function submit(event: FormEvent) {
    event.preventDefault(); setNotice(null);
    if (form.pricingMode === 'PER_GUEST' && installmentTotal !== 100) return setNotice({ type: 'error', text: 'Os percentuais de pagamento devem totalizar 100%.' });
    if (form.pricingMode === 'PER_GUEST' && form.paymentMethodIds.length === 0) return setNotice({ type: 'error', text: 'Selecione pelo menos uma forma de pagamento.' });
    save.mutate();
  }

  const menuGroups = useMemo(() => groupMenuSelections(detail.data?.menuSelections ?? []), [detail.data?.menuSelections]);

  return <Page>
    <Header><div><Eyebrow>Comercial</Eyebrow><h1>Propostas</h1><p>Prepare, acompanhe e formalize propostas comerciais.</p></div><Primary type="button" onClick={chooseNewProposal}>Nova proposta</Primary></Header>
    <Filters><input aria-label="Buscar propostas" placeholder="Buscar por cliente ou descrição" value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filtrar propostas por status" value={status} onChange={(event) => setStatus(event.target.value as ProposalStatus | '')}><option value="">Todos os status</option>{proposalStatuses.map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select></Filters>
    <Workspace>
      <Panel><h2>Propostas cadastradas</h2>{proposals.isLoading ? <Feedback>Carregando propostas...</Feedback> : null}{proposals.isError ? <Feedback>Não foi possível carregar as propostas.</Feedback> : null}{!proposals.isLoading && proposals.data?.length === 0 ? <Feedback>Nenhuma proposta encontrada.</Feedback> : null}<List>{proposals.data?.map((proposal) => <ListItem type="button" $selected={selectedId === proposal.id} key={proposal.id} onClick={() => { setSelectedId(proposal.id); setNotice(null); }}><strong>{proposal.customer?.name ?? 'Cliente'}</strong><span><Badge $status={proposal.status}>{labels[proposal.status]}</Badge>{money(proposal.totalCents)}</span></ListItem>)}</List></Panel>
      <Panel>
        <EditorHeader><div><Eyebrow>{selectedId ? 'Edição' : 'Cadastro'}</Eyebrow><h2>{selectedId ? 'Editar proposta' : 'Nova proposta'}</h2></div>{selectedId ? <Secondary type="button" disabled={download.isPending} onClick={() => download.mutate()}>{download.isPending ? 'Gerando...' : 'Baixar PDF'}</Secondary> : null}</EditorHeader>
        {selectedId && detail.isLoading ? <Feedback>Carregando proposta...</Feedback> : null}
        <Form onSubmit={submit}>
          <SectionTitle>Dados da proposta</SectionTitle>
          <FieldGrid>
            <Field><label>Cliente<select required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value, eventId: undefined })}><option value="">Selecione</option>{customers.data?.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></Field>
            <Field><label>Evento<select value={form.eventId ?? ''} onChange={(event) => chooseEvent(event.target.value)}><option value="">Sem evento</option>{events.data?.filter((item) => item.customerId === form.customerId).map((item) => <option value={item.id} key={item.id}>{formatAdminControlledValue(item.eventType)}</option>)}</select></label></Field>
            <Field><label>Validade<input required type="date" value={form.validUntil} onChange={(event) => setForm({ ...form, validUntil: event.target.value })} /></label></Field>
            {detail.data?.responsibleNameSnapshot ? <ReadOnly><span>Responsável</span><strong>{detail.data.responsibleNameSnapshot}</strong>{detail.data.responsibleTitleSnapshot ? <small>{detail.data.responsibleTitleSnapshot}</small> : null}</ReadOnly> : null}
          </FieldGrid>
          {form.pricingMode === 'PER_GUEST' ? <PerGuestEditor form={form} setForm={setForm} subtotal={subtotal} total={total} installmentTotal={installmentTotal} installmentAmounts={installmentAmounts} menuGroups={menuGroups} paymentMethods={availablePaymentMethods} snapshots={snapshots} moveService={moveService} updateInstallment={updateInstallment} togglePaymentMethod={togglePaymentMethod} /> : <ItemizedEditor form={form} setForm={setForm} subtotal={subtotal} total={total} updateItem={updateItem} />}
          <Field><label>Descrição<input value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value || undefined })} /></label></Field>
          <Field><label>Observações<textarea value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value || undefined })} /></label></Field>
          {selectedId && detail.data ? <Field><label>Status <Badge $status={detail.data.status}>{labels[detail.data.status]}</Badge><select value={detail.data.status} disabled={changeStatus.isPending} onChange={(event) => changeStatus.mutate(event.target.value as ProposalStatus)}>{proposalStatuses.map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select></label></Field> : null}
          {notice ? <Notice $type={notice.type} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</Notice> : null}
          <FormActions><Save type="submit" disabled={save.isPending || remove.isPending}>{save.isPending ? 'Salvando...' : 'Salvar proposta'}</Save>{selectedId ? <DeleteButton type="button" disabled={save.isPending || remove.isPending} onClick={() => setConfirmingDelete(true)}>Excluir proposta</DeleteButton> : null}</FormActions>
        </Form>
      </Panel>
    </Workspace>
    {confirmingDelete ? <ConfirmDeleteDialog title="Excluir proposta?" confirmLabel="Excluir proposta" isPending={remove.isPending} onCancel={() => setConfirmingDelete(false)} onConfirm={() => remove.mutate()} /> : null}
  </Page>;
}

type FormSetter = Dispatch<SetStateAction<ProposalInput>>;

function PerGuestEditor(props: {
  form: ProposalInput;
  setForm: FormSetter;
  subtotal: number;
  total: number;
  installmentTotal: number;
  installmentAmounts: number[];
  menuGroups: ReturnType<typeof groupMenuSelections>;
  paymentMethods: Array<{ id: string; name: string; pixKey: string | null; instructions: string | null }>;
  snapshots: Proposal['paymentMethods'];
  moveService: (index: number, offset: number) => void;
  updateInstallment: (index: number, patch: Partial<NonNullable<ProposalInput['paymentInstallments']>[number]>) => void;
  togglePaymentMethod: (id: string) => void;
}) {
  const { form, setForm } = props;
  return <>
    <SectionTitle>Valores por pessoa</SectionTitle>
    <FieldGrid>
      <Field><label>Quantidade de convidados<input required type="number" min="1" value={form.guestCount ?? ''} onChange={(event) => setForm({ ...form, guestCount: event.target.value ? Number(event.target.value) : undefined })} /></label></Field>
      <Field><label>Valor por pessoa<Currency><span>R$</span><input aria-label="Valor por pessoa" required inputMode="numeric" value={form.pricePerGuestCents === undefined ? '' : currencyInputFromCents(form.pricePerGuestCents)} onChange={(event) => setForm({ ...form, pricePerGuestCents: event.target.value ? centsFromCurrencyInput(event.target.value) : undefined })} /></Currency></label></Field>
      <Field><label>Ajuste (desconto ou acréscimo)<Currency><span>R$</span><input inputMode="numeric" value={currencyInputFromCents(form.adjustmentCents)} onChange={(event) => setForm({ ...form, adjustmentCents: centsFromCurrencyInput(event.target.value, true) })} /></Currency><Help>Use sinal negativo para desconto e positivo para acréscimo.</Help></label></Field>
    </FieldGrid>
    <Totals><span>Valor base: {money(props.subtotal)}</span><strong>Total: {money(props.total)}</strong></Totals>

    <SectionTitle>Cardápio selecionado</SectionTitle>
    {props.menuGroups.length ? <MenuGroups>{props.menuGroups.map((group) => <MenuGroup key={`${group.groupPosition}-${group.name}`}><strong>{group.name}</strong>{group.sections.map((section) => <div key={`${section.sectionPosition}-${section.name}`}><span>{section.name}</span><ul>{section.options.map((option) => <li key={`${option.optionPosition}-${option.name}`}>{option.name}</li>)}</ul></div>)}</MenuGroup>)}</MenuGroups> : <Help>Nenhuma escolha de cardápio vinculada a esta proposta.</Help>}

    <SectionTitle>Serviços inclusos</SectionTitle>
    <Stack>{form.includedServices.map((service, index) => <CompactRow key={index}>
      <input aria-label={`Serviço incluso ${index + 1}`} required value={service} onChange={(event) => setForm({ ...form, includedServices: form.includedServices.map((item, position) => position === index ? event.target.value : item) })} />
      <IconButton type="button" aria-label={`Mover serviço ${index + 1} para cima`} disabled={index === 0} onClick={() => props.moveService(index, -1)}>↑</IconButton>
      <IconButton type="button" aria-label={`Mover serviço ${index + 1} para baixo`} disabled={index === form.includedServices.length - 1} onClick={() => props.moveService(index, 1)}>↓</IconButton>
      <IconButton type="button" aria-label={`Remover serviço ${index + 1}`} onClick={() => setForm({ ...form, includedServices: form.includedServices.filter((_, position) => position !== index) })}>×</IconButton>
    </CompactRow>)}</Stack>
    <Secondary type="button" onClick={() => setForm({ ...form, includedServices: [...form.includedServices, ''] })}>Adicionar serviço</Secondary>

    <SectionTitle>Pagamento</SectionTitle>
    <PaymentMethods>{props.paymentMethods.map((method) => {
      const data = props.snapshots.find((item) => item.paymentMethodId === method.id) ?? method;
      return <PaymentMethod key={method.id}>
        <label><input type="checkbox" checked={form.paymentMethodIds.includes(method.id)} onChange={() => props.togglePaymentMethod(method.id)} />{method.name}</label>
        {form.paymentMethodIds.includes(method.id) && data.pixKey ? <small>{data.pixKey}</small> : null}
        {form.paymentMethodIds.includes(method.id) && data.instructions ? <small>{data.instructions}</small> : null}
      </PaymentMethod>;
    })}</PaymentMethods>

    <Stack>{(form.paymentInstallments ?? []).map((installment, index) => <InstallmentRow key={index}>
      <input aria-label={`Descrição da parcela ${index + 1}`} required value={installment.description} onChange={(event) => props.updateInstallment(index, { description: event.target.value })} />
      <label><span>Percentual</span><input aria-label={`Percentual da parcela ${index + 1}`} required type="number" min="1" max="100" value={installment.percentage} onChange={(event) => props.updateInstallment(index, { percentage: Number(event.target.value) })} /></label>
      <strong>{money(props.installmentAmounts[index] ?? 0)}</strong>
      <IconButton type="button" aria-label={`Remover parcela ${index + 1}`} onClick={() => setForm({ ...form, paymentInstallments: form.paymentInstallments?.filter((_, position) => position !== index) })}>×</IconButton>
    </InstallmentRow>)}</Stack>
    <Secondary type="button" onClick={() => setForm({ ...form, paymentInstallments: [...(form.paymentInstallments ?? []), { description: '', percentage: 1 }] })}>Adicionar parcela</Secondary>
    <Help $invalid={props.installmentTotal !== 100}>Total dos percentuais: {props.installmentTotal}%.</Help>
  </>;
}

function ItemizedEditor(props: {
  form: ProposalInput;
  setForm: FormSetter;
  subtotal: number;
  total: number;
  updateItem: (index: number, patch: Partial<ProposalInput['items'][number]>) => void;
}) {
  const { form, setForm } = props;
  return <>
    <SectionTitle>Itens e serviços</SectionTitle>
    <Items>{form.items.map((item, index) => <Item key={index}>
      <input required placeholder="Serviço" value={item.description} onChange={(event) => props.updateItem(index, { description: event.target.value })} />
      <input aria-label={`Quantidade do item ${index + 1}`} required type="number" min="1" value={item.quantity} onChange={(event) => props.updateItem(index, { quantity: Number(event.target.value) })} />
      <Currency><span>R$</span><input aria-label={`Valor do item ${index + 1}`} required inputMode="numeric" value={currencyInputFromCents(item.unitPriceCents)} onChange={(event) => props.updateItem(index, { unitPriceCents: centsFromCurrencyInput(event.target.value) })} /></Currency>
      <ItemSubtotal>{money(item.quantity * item.unitPriceCents)}</ItemSubtotal>
    </Item>)}</Items>
    <Secondary type="button" onClick={() => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPriceCents: 0 }] })}>Adicionar item</Secondary>
    <Field><label>Ajuste (desconto ou acréscimo)<Currency><span>R$</span><input inputMode="numeric" value={currencyInputFromCents(form.adjustmentCents)} onChange={(event) => setForm({ ...form, adjustmentCents: centsFromCurrencyInput(event.target.value, true) })} /></Currency><Help>Use sinal negativo para desconto e positivo para acréscimo.</Help></label></Field>
    <Totals><span>Subtotal: {money(props.subtotal)}</span><strong>Total: {money(props.total)}</strong></Totals>
  </>;
}

function groupMenuSelections(selections: Proposal['menuSelections']) {
  const groups = new Map<string, { name: string; groupPosition: number; sections: Map<string, { name: string; sectionPosition: number; options: Array<{ name: string; optionPosition: number }> }> }>();
  for (const selection of selections) {
    const groupKey = `${selection.groupPosition}:${selection.groupName}`;
    const group = groups.get(groupKey) ?? { name: selection.groupName, groupPosition: selection.groupPosition, sections: new Map() };
    const sectionKey = `${selection.sectionPosition}:${selection.sectionName}`;
    const section = group.sections.get(sectionKey) ?? { name: selection.sectionName, sectionPosition: selection.sectionPosition, options: [] };
    section.options.push({ name: selection.optionName, optionPosition: selection.optionPosition });
    group.sections.set(sectionKey, section); groups.set(groupKey, group);
  }
  return [...groups.values()].sort((a, b) => a.groupPosition - b.groupPosition).map((group) => ({
    ...group,
    sections: [...group.sections.values()].sort((a, b) => a.sectionPosition - b.sectionPosition).map((section) => ({ ...section, options: section.options.sort((a, b) => a.optionPosition - b.optionPosition) }))
  }));
}

const Page = styled.section`display:grid;min-width:0;gap:${({ theme }) => theme.spacing.xl};h1,h2,h3{margin:0;color:${({ theme }) => theme.colors.textStrong}}p{color:${({ theme }) => theme.colors.textMuted}}`;
const Header = styled.header`display:flex;align-items:end;justify-content:space-between;gap:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){align-items:stretch;flex-direction:column}`;
const Eyebrow = styled.span`color:${({ theme }) => theme.colors.accent};font-size:.75rem;font-weight:800;text-transform:uppercase`;
const Primary = styled.button`min-height:2.75rem;border:0;border-radius:${({ theme }) => theme.radius.pill};background:${({ theme }) => theme.colors.accent};color:${({ theme }) => theme.palette.white};font-weight:800;padding:0 ${({ theme }) => theme.spacing.lg}`;
const Filters = styled.div`display:grid;min-width:0;grid-template-columns:minmax(0,1fr) 12rem;gap:${({ theme }) => theme.spacing.sm};input,select{min-width:0;min-height:2.75rem;padding:0 ${({ theme }) => theme.spacing.md};border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};color:${({ theme }) => theme.colors.textStrong};font:inherit}@media(max-width:${({ theme }) => theme.breakpoints.md}){grid-template-columns:1fr}`;
const Workspace = styled.div`display:grid;min-width:0;grid-template-columns:minmax(16rem,.75fr) minmax(0,1.25fr);gap:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.xl}){grid-template-columns:1fr}`;
const Panel = styled.section`min-width:0;border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};padding:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){padding:${({ theme }) => theme.spacing.md}}`;
const EditorHeader = styled.div`display:flex;align-items:center;justify-content:space-between;gap:${({ theme }) => theme.spacing.md};@media(max-width:${({ theme }) => theme.breakpoints.sm}){align-items:stretch;flex-direction:column}`;
const List = styled.div`display:grid;min-width:0`;
const ListItem = styled.button<{ $selected: boolean }>`display:grid;min-width:0;gap:.25rem;border:0;border-top:1px solid ${({ theme }) => theme.colors.border};background:${({ $selected, theme }) => $selected ? theme.colors.surfaceAlt : 'transparent'};color:${({ theme }) => theme.colors.textStrong};padding:${({ theme }) => theme.spacing.md};text-align:left;span{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;color:${({ theme }) => theme.colors.textMuted};font-size:.82rem}`;
const Form = styled.form`display:grid;min-width:0;gap:${({ theme }) => theme.spacing.md};margin-top:${({ theme }) => theme.spacing.lg}`;
const SectionTitle = styled.h3`margin-top:${({ theme }) => theme.spacing.md}!important;padding-bottom:${({ theme }) => theme.spacing.xs};border-bottom:1px solid ${({ theme }) => theme.colors.border};font-size:1rem`;
const FieldGrid = styled.div`display:grid;min-width:0;grid-template-columns:repeat(2,minmax(0,1fr));gap:${({ theme }) => theme.spacing.md};@media(max-width:${({ theme }) => theme.breakpoints.sm}){grid-template-columns:1fr}`;
const Field = styled.div`min-width:0;label{display:grid;min-width:0;gap:.35rem;color:${({ theme }) => theme.colors.textStrong};font-weight:700}input,select,textarea{width:100%;min-width:0;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.sm}}input,select{min-height:2.65rem}textarea{min-height:6rem;padding-top:${({ theme }) => theme.spacing.sm};resize:vertical}input[type='date']{color-scheme:${({ theme }) => theme.mode}}`;
const ReadOnly = styled.div`display:grid;align-content:start;gap:.25rem;color:${({ theme }) => theme.colors.textStrong};span,small{color:${({ theme }) => theme.colors.textMuted}}`;
const Items = styled.div`display:grid;min-width:0;gap:${({ theme }) => theme.spacing.sm}`;
const Item = styled.div`display:grid;min-width:0;grid-template-columns:minmax(12rem,1fr) 4.5rem minmax(8rem,10rem) minmax(7.5rem,auto);gap:${({ theme }) => theme.spacing.sm};align-items:center;input{min-width:0;min-height:2.65rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.sm}}@media(max-width:${({ theme }) => theme.breakpoints.md}){grid-template-columns:minmax(0,1fr) 4.5rem minmax(8rem,10rem);strong{grid-column:1/-1;justify-self:end}}@media(max-width:${({ theme }) => theme.breakpoints.sm}){grid-template-columns:minmax(0,1fr) 5rem}`;
const ItemSubtotal = styled.strong`justify-self:end;color:${({ theme }) => theme.colors.textStrong};white-space:nowrap;@media(max-width:${({ theme }) => theme.breakpoints.sm}){justify-self:start}`;
const Currency = styled.span`display:flex;min-width:0;align-items:center;min-height:2.65rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};overflow:hidden;&:focus-within{outline:3px solid ${({ theme }) => theme.colors.focus};outline-offset:3px}>span{padding-left:${({ theme }) => theme.spacing.sm};color:${({ theme }) => theme.colors.textMuted};font-weight:700}input{width:100%;min-width:0;border:0!important;background:transparent!important;&:focus-visible{outline:0}}`;
const Secondary = styled.button`min-height:2.75rem;justify-self:start;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:transparent;color:${({ theme }) => theme.colors.textStrong};font-weight:700;padding:0 ${({ theme }) => theme.spacing.md}`;
const Stack = styled.div`display:grid;min-width:0;gap:${({ theme }) => theme.spacing.sm}`;
const CompactRow = styled.div`display:grid;min-width:0;grid-template-columns:minmax(0,1fr) repeat(3,2.65rem);gap:${({ theme }) => theme.spacing.xs};input{min-width:0;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.sm}}`;
const IconButton = styled.button`min-width:2.65rem;min-height:2.65rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:transparent;color:${({ theme }) => theme.colors.textStrong};font:inherit;font-weight:800`;
const InstallmentRow = styled.div`display:grid;min-width:0;grid-template-columns:minmax(10rem,1fr) 7rem 8rem 2.65rem;gap:${({ theme }) => theme.spacing.sm};align-items:end;>input,label input{width:100%;min-width:0;min-height:2.65rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.sm}}label{display:grid;gap:.25rem;color:${({ theme }) => theme.colors.textMuted};font-size:.75rem}strong{align-self:center;text-align:right;color:${({ theme }) => theme.colors.textStrong};white-space:nowrap}@media(max-width:${({ theme }) => theme.breakpoints.md}){grid-template-columns:minmax(0,1fr) 7rem;strong{justify-self:start}}`;
const PaymentMethods = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${({ theme }) => theme.spacing.sm};@media(max-width:${({ theme }) => theme.breakpoints.sm}){grid-template-columns:1fr}`;
const PaymentMethod = styled.div`display:grid;gap:.25rem;padding:${({ theme }) => theme.spacing.sm};border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};color:${({ theme }) => theme.colors.textStrong};label{display:flex;align-items:center;gap:.5rem;font-weight:700}small{overflow-wrap:anywhere;color:${({ theme }) => theme.colors.textMuted}}`;
const MenuGroups = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${({ theme }) => theme.spacing.md};@media(max-width:${({ theme }) => theme.breakpoints.sm}){grid-template-columns:1fr}`;
const MenuGroup = styled.div`display:grid;align-content:start;gap:${({ theme }) => theme.spacing.sm};padding:${({ theme }) => theme.spacing.md};border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};color:${({ theme }) => theme.colors.textStrong};div>span{color:${({ theme }) => theme.colors.textMuted};font-size:.8rem;font-weight:700}ul{margin:.3rem 0 0;padding-left:1.1rem}`;
const Totals = styled.div`display:grid;gap:.25rem;justify-items:end;color:${({ theme }) => theme.colors.textStrong}`;
const Save = styled.button`min-height:2.75rem;border:0;border-radius:${({ theme }) => theme.radius.pill};background:${({ theme }) => theme.colors.accent};color:${({ theme }) => theme.palette.white};font-weight:800;@media(max-width:${({ theme }) => theme.breakpoints.sm}){width:100%}`;
const Help = styled.small<{ $invalid?: boolean }>`color:${({ $invalid, theme }) => $invalid ? theme.colors.danger : theme.colors.textMuted};font-weight:${({ $invalid }) => $invalid ? 700 : 400}`;
const Feedback = styled.p`margin:0!important;color:${({ theme }) => theme.colors.textMuted}!important`;
const Notice = styled.p<{ $type: 'success' | 'error' }>`margin:0;color:${({ $type, theme }) => $type === 'success' ? theme.colors.accent : theme.colors.danger};font-weight:700`;
const Badge = styled.span<{ $status: ProposalStatus }>`display:inline-flex;align-items:center;width:max-content;border-radius:${({ theme }) => theme.radius.pill};background:${({ $status, theme }) => $status === 'APROVADA' ? theme.colors.accentMuted : $status === 'RECUSADA' || $status === 'CANCELADA' ? 'rgba(179,38,30,.14)' : theme.colors.surfaceAlt};color:${({ $status, theme }) => $status === 'RECUSADA' || $status === 'CANCELADA' ? theme.colors.danger : theme.colors.textStrong};font-size:.75rem;font-weight:800;padding:.2rem .5rem`;
const FormActions = styled.div`display:flex;flex-wrap:wrap;gap:${({ theme }) => theme.spacing.sm}`;
const DeleteButton = styled.button`min-height:2.75rem;border:1px solid ${({ theme }) => theme.colors.danger};border-radius:${({ theme }) => theme.radius.pill};background:transparent;color:${({ theme }) => theme.colors.danger};font-weight:800;padding:0 ${({ theme }) => theme.spacing.lg}`;
