import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { updateOwnAdminProfile } from '@/features/admin-users/admin-users.service';
import { useCurrentAdmin } from '@/features/auth/useAuth';
import { getApiErrorMessage } from '@/services/api';

export function AdminProfilePage() {
  const { data: admin } = useCurrentAdmin();
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [commercialTitle, setCommercialTitle] = useState('Administrador');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  useEffect(() => setName(admin?.name ?? ''), [admin?.name]);
  useEffect(() => setCommercialTitle(admin?.commercialTitle ?? 'Administrador'), [admin?.commercialTitle]);
  const save = useMutation({
    mutationFn: () => updateOwnAdminProfile({ name: name.trim(), commercialTitle: commercialTitle.trim() }),
    onSuccess: (updated) => { client.setQueryData(['current-admin'], (current: typeof updated | undefined) => current ? { ...current, name: updated.name, commercialTitle: updated.commercialTitle } : updated); setMessage({ type: 'success', text: 'Perfil atualizado.' }); },
    onError: (error) => setMessage({ type: 'error', text: getApiErrorMessage(error) })
  });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage(null); save.mutate(); }

  return <Page><header><Eyebrow>Conta</Eyebrow><h1>Perfil</h1><p>Dados da sua conta administrativa.</p></header><Panel as="form" onSubmit={submit}>
    <Field><label htmlFor="profile-name">Nome de exibição</label><input id="profile-name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></Field>
    <Field><label htmlFor="profile-title">Cargo comercial</label><input id="profile-title" required minLength={2} maxLength={120} value={commercialTitle} onChange={(event) => setCommercialTitle(event.target.value)} /></Field>
    <Field><label htmlFor="profile-email">E-mail</label><input id="profile-email" value={admin?.email ?? ''} readOnly /></Field>
    <Field><label htmlFor="profile-role">Função</label><input id="profile-role" value="Administrador" readOnly /></Field>
    {message ? <Notice $type={message.type} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</Notice> : null}
    <Actions><Save type="submit" disabled={save.isPending}>{save.isPending ? 'Salvando...' : 'Salvar perfil'}</Save><PasswordLink to="/change-password">Alterar senha</PasswordLink></Actions>
  </Panel></Page>;
}

const Page = styled.section`display:grid;gap:${({ theme }) => theme.spacing.xl};h1{margin:0;color:${({ theme }) => theme.colors.textStrong}}p{margin:${({ theme }) => theme.spacing.sm} 0 0;color:${({ theme }) => theme.colors.textMuted}}`;
const Eyebrow = styled.span`color:${({ theme }) => theme.colors.accent};font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;`;
const Panel = styled.div`display:grid;gap:${({ theme }) => theme.spacing.md};max-width:42rem;margin:0;border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};padding:${({ theme }) => theme.spacing.lg};`;
const Field = styled.div`display:grid;gap:${({ theme }) => theme.spacing.xs};label{font-weight:700;color:${({ theme }) => theme.colors.textStrong}}input{width:100%;min-height:2.75rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.elevated};color:${({ theme }) => theme.colors.textStrong};font:inherit;padding:0 ${({ theme }) => theme.spacing.md}}input[readonly]{color:${({ theme }) => theme.colors.textMuted};cursor:not-allowed}`;
const Actions = styled.div`display:flex;flex-wrap:wrap;gap:${({ theme }) => theme.spacing.sm};`;
const Save = styled.button`min-height:2.75rem;border:0;border-radius:${({ theme }) => theme.radius.pill};background:${({ theme }) => theme.colors.accent};color:${({ theme }) => theme.palette.white};font-weight:800;padding:0 ${({ theme }) => theme.spacing.lg};`;
const PasswordLink = styled(Link)`display:inline-flex;min-height:2.75rem;align-items:center;justify-content:center;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.pill};color:${({ theme }) => theme.colors.textStrong};font-weight:700;padding:0 ${({ theme }) => theme.spacing.lg};text-decoration:none;`;
const Notice = styled.p<{ $type: 'success' | 'error' }>`margin:0 !important;color:${({ $type, theme }) => $type === 'success' ? theme.colors.accent : theme.colors.danger} !important;font-weight:700;`;
