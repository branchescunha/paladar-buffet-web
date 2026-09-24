import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import styled from 'styled-components';
import {
  createMenuGroup,
  createMenuOption,
  createMenuSection,
  createPaymentMethod,
  deleteMenuGroup,
  deleteMenuOption,
  deleteMenuSection,
  deletePaymentMethod,
  fetchAdminMenu,
  fetchPaymentMethods,
  updateMenuGroup,
  updateMenuOption,
  updateMenuSection,
  updatePaymentMethod,
  type AdminMenuGroup,
  type AdminMenuOption,
  type AdminMenuSection,
  type PaymentMethod
} from '@/features/admin-settings/settings.service';
import { menuSelectionInstruction } from '@/features/menu/menu.service';
import { getApiErrorMessage } from '@/services/api';

type AsyncAction = () => Promise<unknown>;

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const menu = useQuery({ queryKey: ['admin-menu'], queryFn: fetchAdminMenu, retry: false });
  const payments = useQuery({ queryKey: ['admin-payment-methods'], queryFn: fetchPaymentMethods, retry: false });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function run(action: AsyncAction, success: string) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-menu'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] })
      ]);
      setMessage({ type: 'success', text: success });
      return true;
    } catch (error) {
      setMessage({ type: 'error', text: getApiErrorMessage(error) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <header>
        <Eyebrow>Administração</Eyebrow>
        <h1>Configurações</h1>
        <p>Gerencie o cardápio oferecido no orçamento e as formas de pagamento.</p>
      </header>

      {message ? <Message $type={message.type} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</Message> : null}

      <Section>
        <SectionHeading>
          <div><h2>Cardápio</h2><p>As regras definidas aqui são aplicadas ao formulário público.</p></div>
        </SectionHeading>
        {menu.isLoading ? <Feedback>Carregando cardápio...</Feedback> : null}
        {menu.isError ? <Error role="alert">Não foi possível carregar o cardápio.</Error> : null}
        <Stack>
          {menu.data?.map((group) => <GroupEditor key={group.id} group={group} busy={busy} run={run} />)}
          <NewGroupForm busy={busy} position={(menu.data?.length ?? 0) + 1} run={run} />
        </Stack>
      </Section>

      <Section>
        <SectionHeading>
          <div><h2>Formas de pagamento</h2><p>Cadastre instruções e chave quando aplicável.</p></div>
        </SectionHeading>
        {payments.isLoading ? <Feedback>Carregando formas de pagamento...</Feedback> : null}
        {payments.isError ? <Error role="alert">Não foi possível carregar as formas de pagamento.</Error> : null}
        <Stack>
          {payments.data?.map((method) => <PaymentEditor key={method.id} method={method} busy={busy} run={run} />)}
          <NewPaymentForm busy={busy} position={(payments.data?.length ?? 0) + 1} run={run} />
        </Stack>
      </Section>
    </Page>
  );
}

function GroupEditor({ group, busy, run }: { group: AdminMenuGroup; busy: boolean; run: (action: AsyncAction, success: string) => Promise<boolean> }) {
  const [name, setName] = useState(group.name);
  const [min, setMin] = useState(String(group.minSelections));
  const [max, setMax] = useState(group.maxSelections === null ? '' : String(group.maxSelections));
  const [position, setPosition] = useState(String(group.position));
  const [sectionName, setSectionName] = useState('');

  async function save(event: FormEvent) {
    event.preventDefault();
    await run(() => updateMenuGroup(group.id, {
      name,
      minSelections: Number(min),
      maxSelections: max === '' ? null : Number(max),
      position: Number(position),
      isActive: group.isActive
    }), 'Regra do cardápio atualizada.');
  }

  async function addSection(event: FormEvent) {
    event.preventDefault();
    const succeeded = await run(() => createMenuSection({
      groupId: group.id,
      name: sectionName,
      position: group.sections.length + 1,
      isActive: true
    }), 'Seção adicionada.');
    if (succeeded) setSectionName('');
  }

  return (
    <GroupCard>
      <RuleHeader>
        <div><strong>{group.name}</strong><span>Escolha: {ruleSummary(group)}</span></div>
        <Status>{group.isActive ? 'Ativo' : 'Inativo'}</Status>
      </RuleHeader>
      <InlineForm onSubmit={save}>
        <Field><label htmlFor={`group-name-${group.id}`}>Nome</label><input id={`group-name-${group.id}`} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <SmallField><label htmlFor={`group-min-${group.id}`}>Mínimo</label><input id={`group-min-${group.id}`} type="number" min="0" value={min} onChange={(event) => setMin(event.target.value)} required /></SmallField>
        <SmallField><label htmlFor={`group-max-${group.id}`}>Máximo</label><input id={`group-max-${group.id}`} type="number" min="0" value={max} onChange={(event) => setMax(event.target.value)} placeholder="Livre" /></SmallField>
        <SmallField><label htmlFor={`group-position-${group.id}`}>Ordem</label><input id={`group-position-${group.id}`} type="number" min="0" value={position} onChange={(event) => setPosition(event.target.value)} required /></SmallField>
        <Actions>
          <PrimaryButton disabled={busy}>Salvar grupo</PrimaryButton>
          <SecondaryButton type="button" disabled={busy} onClick={() => run(() => updateMenuGroup(group.id, { name, minSelections: Number(min), maxSelections: max === '' ? null : Number(max), position: Number(position), isActive: !group.isActive }), group.isActive ? 'Grupo desativado.' : 'Grupo ativado.')}>{group.isActive ? 'Desativar' : 'Ativar'}</SecondaryButton>
          <DangerButton type="button" disabled={busy} onClick={() => confirmDelete('Remover este grupo e seus itens?') && run(() => deleteMenuGroup(group.id), 'Grupo removido.')}>Remover</DangerButton>
        </Actions>
      </InlineForm>

      <SubsectionList>
        {group.sections.map((section) => <SectionEditor key={section.id} section={section} busy={busy} run={run} />)}
      </SubsectionList>
      <CompactForm onSubmit={addSection}>
        <Field><label htmlFor={`new-section-${group.id}`}>Nova seção em {group.name}</label><input id={`new-section-${group.id}`} value={sectionName} onChange={(event) => setSectionName(event.target.value)} required /></Field>
        <SecondaryButton disabled={busy}>Adicionar seção</SecondaryButton>
      </CompactForm>
    </GroupCard>
  );
}

function SectionEditor({ section, busy, run }: { section: AdminMenuSection; busy: boolean; run: (action: AsyncAction, success: string) => Promise<boolean> }) {
  const [name, setName] = useState(section.name);
  const [position, setPosition] = useState(String(section.position));
  const [optionName, setOptionName] = useState('');

  async function addOption(event: FormEvent) {
    event.preventDefault();
    const succeeded = await run(() => createMenuOption({ sectionId: section.id, name: optionName, position: section.options.length + 1, isActive: true }), 'Opção adicionada.');
    if (succeeded) setOptionName('');
  }

  const sectionInput = { groupId: section.groupId, name, position: Number(position), isActive: section.isActive };

  return (
    <Subsection>
      <InlineForm onSubmit={(event) => { event.preventDefault(); void run(() => updateMenuSection(section.id, sectionInput), 'Seção atualizada.'); }}>
        <Field><label htmlFor={`section-name-${section.id}`}>Seção</label><input id={`section-name-${section.id}`} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <SmallField><label htmlFor={`section-position-${section.id}`}>Ordem</label><input id={`section-position-${section.id}`} type="number" min="0" value={position} onChange={(event) => setPosition(event.target.value)} required /></SmallField>
        <Actions>
          <SecondaryButton disabled={busy}>Salvar seção</SecondaryButton>
          <SecondaryButton type="button" disabled={busy} onClick={() => run(() => updateMenuSection(section.id, { ...sectionInput, isActive: !section.isActive }), section.isActive ? 'Seção desativada.' : 'Seção ativada.')}>{section.isActive ? 'Desativar' : 'Ativar'}</SecondaryButton>
          <DangerButton type="button" disabled={busy} onClick={() => confirmDelete('Remover esta seção e suas opções?') && run(() => deleteMenuSection(section.id), 'Seção removida.')}>Remover</DangerButton>
        </Actions>
      </InlineForm>
      <Options>
        {section.options.map((option) => <OptionEditor key={option.id} sectionId={section.id} option={option} busy={busy} run={run} />)}
      </Options>
      <CompactForm onSubmit={addOption}>
        <Field><label htmlFor={`new-option-${section.id}`}>Nova opção em {section.name}</label><input id={`new-option-${section.id}`} value={optionName} onChange={(event) => setOptionName(event.target.value)} required /></Field>
        <SecondaryButton aria-label={`Adicionar opção em ${section.name}`} disabled={busy}>Adicionar opção</SecondaryButton>
      </CompactForm>
    </Subsection>
  );
}

function OptionEditor({ sectionId, option, busy, run }: { sectionId: string; option: AdminMenuOption; busy: boolean; run: (action: AsyncAction, success: string) => Promise<boolean> }) {
  const [name, setName] = useState(option.name);
  const [position, setPosition] = useState(String(option.position));
  const input = { sectionId, name, position: Number(position), isActive: option.isActive };

  return (
    <OptionRow>
      <input aria-label={`Nome da opção ${option.name}`} value={name} onChange={(event) => setName(event.target.value)} />
      <input aria-label={`Ordem da opção ${option.name}`} type="number" min="0" value={position} onChange={(event) => setPosition(event.target.value)} />
      <SecondaryButton type="button" disabled={busy} onClick={() => run(() => updateMenuOption(option.id, input), 'Opção atualizada.')}>Salvar</SecondaryButton>
      <SecondaryButton type="button" disabled={busy} onClick={() => run(() => updateMenuOption(option.id, { ...input, isActive: !option.isActive }), option.isActive ? 'Opção desativada.' : 'Opção ativada.')}>{option.isActive ? 'Desativar' : 'Ativar'}</SecondaryButton>
      <DangerButton type="button" disabled={busy} onClick={() => confirmDelete('Remover esta opção?') && run(() => deleteMenuOption(option.id), 'Opção removida.')}>Remover</DangerButton>
    </OptionRow>
  );
}

function NewGroupForm({ busy, position, run }: { busy: boolean; position: number; run: (action: AsyncAction, success: string) => Promise<boolean> }) {
  const [name, setName] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    const succeeded = await run(() => createMenuGroup({ name, minSelections: 0, maxSelections: null, position, isActive: true }), 'Grupo adicionado.');
    if (succeeded) setName('');
  }
  return <CompactForm onSubmit={submit}><Field><label htmlFor="new-menu-group">Novo grupo do cardápio</label><input id="new-menu-group" value={name} onChange={(event) => setName(event.target.value)} required /></Field><PrimaryButton disabled={busy}>Adicionar grupo</PrimaryButton></CompactForm>;
}

function PaymentEditor({ method, busy, run }: { method: PaymentMethod; busy: boolean; run: (action: AsyncAction, success: string) => Promise<boolean> }) {
  const [name, setName] = useState(method.name);
  const [instructions, setInstructions] = useState(method.instructions ?? '');
  const [pixKey, setPixKey] = useState(method.pixKey ?? '');
  const [position, setPosition] = useState(String(method.position));
  const input = { name, instructions, pixKey, position: Number(position), isActive: method.isActive };

  return (
    <InlineForm onSubmit={(event) => { event.preventDefault(); void run(() => updatePaymentMethod(method.id, input), 'Forma de pagamento atualizada.'); }}>
      <Field><label htmlFor={`payment-name-${method.id}`}>Nome</label><input id={`payment-name-${method.id}`} value={name} onChange={(event) => setName(event.target.value)} required /></Field>
      <Field><label htmlFor={`payment-instructions-${method.id}`}>Instruções</label><input id={`payment-instructions-${method.id}`} value={instructions} onChange={(event) => setInstructions(event.target.value)} /></Field>
      <Field><label htmlFor={`payment-pix-${method.id}`}>Chave</label><input id={`payment-pix-${method.id}`} value={pixKey} onChange={(event) => setPixKey(event.target.value)} /></Field>
      <SmallField><label htmlFor={`payment-position-${method.id}`}>Ordem</label><input id={`payment-position-${method.id}`} type="number" min="0" value={position} onChange={(event) => setPosition(event.target.value)} required /></SmallField>
      <Actions>
        <PrimaryButton disabled={busy}>Salvar</PrimaryButton>
        <SecondaryButton type="button" disabled={busy} onClick={() => run(() => updatePaymentMethod(method.id, { ...input, isActive: !method.isActive }), method.isActive ? 'Forma de pagamento desativada.' : 'Forma de pagamento ativada.')}>{method.isActive ? 'Desativar' : 'Ativar'}</SecondaryButton>
        <DangerButton type="button" disabled={busy} onClick={() => confirmDelete('Remover esta forma de pagamento?') && run(() => deletePaymentMethod(method.id), 'Forma de pagamento removida.')}>Remover</DangerButton>
      </Actions>
    </InlineForm>
  );
}

function NewPaymentForm({ busy, position, run }: { busy: boolean; position: number; run: (action: AsyncAction, success: string) => Promise<boolean> }) {
  const [name, setName] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    const succeeded = await run(() => createPaymentMethod({ name, position, isActive: true }), 'Forma de pagamento adicionada.');
    if (succeeded) setName('');
  }
  return <CompactForm onSubmit={submit}><Field><label htmlFor="new-payment-method">Nova forma de pagamento</label><input id="new-payment-method" value={name} onChange={(event) => setName(event.target.value)} required /></Field><PrimaryButton disabled={busy}>Adicionar forma</PrimaryButton></CompactForm>;
}

function ruleSummary(group: AdminMenuGroup) {
  return menuSelectionInstruction(group).replace(/^Escolha /, '').replace(/^Seleção livre$/, 'livre');
}

function confirmDelete(message: string) {
  return window.confirm(message);
}

const Page = styled.section`display:grid;gap:${({ theme }) => theme.spacing.xl};h1,h2{margin:0;color:${({ theme }) => theme.colors.textStrong}}p{margin:${({ theme }) => theme.spacing.sm} 0 0;color:${({ theme }) => theme.colors.textMuted}}`;
const Eyebrow = styled.span`color:${({ theme }) => theme.colors.accent};font-size:.75rem;font-weight:800;text-transform:uppercase;`;
const Section = styled.section`display:grid;gap:${({ theme }) => theme.spacing.md};min-width:0;`;
const SectionHeading = styled.div`display:flex;align-items:end;justify-content:space-between;gap:${({ theme }) => theme.spacing.md};`;
const Stack = styled.div`display:grid;gap:${({ theme }) => theme.spacing.md};min-width:0;`;
const GroupCard = styled.article`display:grid;gap:${({ theme }) => theme.spacing.md};min-width:0;border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};padding:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){padding:${({ theme }) => theme.spacing.md}}`;
const RuleHeader = styled.div`display:flex;align-items:center;justify-content:space-between;gap:${({ theme }) => theme.spacing.md};div{display:grid;gap:${({ theme }) => theme.spacing.xs}}span{color:${({ theme }) => theme.colors.textMuted};font-size:.85rem}`;
const Status = styled.span`border-radius:${({ theme }) => theme.radius.pill};background:${({ theme }) => theme.colors.surfaceAlt};color:${({ theme }) => theme.colors.textStrong}!important;font-weight:700;padding:${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};`;
const InlineForm = styled.form`display:grid;grid-template-columns:minmax(10rem,1fr) repeat(3,minmax(5rem,.28fr));gap:${({ theme }) => theme.spacing.sm};min-width:0;border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};padding:${({ theme }) => theme.spacing.md};@media(max-width:${({ theme }) => theme.breakpoints.lg}){grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:${({ theme }) => theme.breakpoints.sm}){grid-template-columns:1fr}`;
const CompactForm = styled.form`display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:${({ theme }) => theme.spacing.sm};min-width:0;@media(max-width:${({ theme }) => theme.breakpoints.sm}){grid-template-columns:1fr}`;
const Field = styled.div`display:grid;gap:${({ theme }) => theme.spacing.xs};min-width:0;label{color:${({ theme }) => theme.colors.textMuted};font-size:.78rem;font-weight:700}input{width:100%;min-width:0;min-height:2.5rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.sm}}`;
const SmallField = styled(Field)``;
const Actions = styled.div`display:flex;grid-column:1/-1;flex-wrap:wrap;gap:${({ theme }) => theme.spacing.sm};`;
const BaseButton = styled.button`min-height:2.5rem;border-radius:${({ theme }) => theme.radius.md};font-weight:700;padding:0 ${({ theme }) => theme.spacing.md};`;
const PrimaryButton = styled(BaseButton)`border:0;background:${({ theme }) => theme.colors.accent};color:${({ theme }) => theme.palette.white};`;
const SecondaryButton = styled(BaseButton)`border:1px solid ${({ theme }) => theme.colors.borderStrong};background:transparent;color:${({ theme }) => theme.colors.textStrong};`;
const DangerButton = styled(SecondaryButton)`color:${({ theme }) => theme.colors.danger};`;
const SubsectionList = styled.div`display:grid;gap:${({ theme }) => theme.spacing.md};`;
const Subsection = styled.section`display:grid;gap:${({ theme }) => theme.spacing.sm};min-width:0;padding-left:${({ theme }) => theme.spacing.md};border-left:2px solid ${({ theme }) => theme.colors.border};@media(max-width:${({ theme }) => theme.breakpoints.sm}){padding-left:0;border-left:0}`;
const Options = styled.div`display:grid;gap:${({ theme }) => theme.spacing.xs};`;
const OptionRow = styled.div`display:grid;grid-template-columns:minmax(8rem,1fr) 5rem repeat(3,auto);gap:${({ theme }) => theme.spacing.xs};min-width:0;input{width:100%;min-width:0;min-height:2.5rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.sm}}@media(max-width:${({ theme }) => theme.breakpoints.lg}){grid-template-columns:minmax(0,1fr) 5rem;button{width:100%}}@media(max-width:${({ theme }) => theme.breakpoints.sm}){grid-template-columns:minmax(0,1fr)}`;
const Message = styled.p<{ $type: 'success' | 'error' }>`margin:0!important;color:${({ $type, theme }) => $type === 'success' ? theme.colors.accent : theme.colors.danger}!important;font-weight:700;`;
const Feedback = styled.p`margin:0!important;`;
const Error = styled(Feedback)`color:${({ theme }) => theme.colors.danger}!important;`;
