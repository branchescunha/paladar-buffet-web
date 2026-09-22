import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';
import { fetchAdminUsers, setAdminUserActive } from '@/features/admin-users/admin-users.service';
import { getApiErrorMessage } from '@/services/api';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const users = useQuery({ queryKey: ['admin-users'], queryFn: fetchAdminUsers, retry: false });
  const updateActivity = useMutation({
    mutationFn: setAdminUserActive,
    onSuccess: async () => { setMessage({ type: 'success', text: 'Acesso administrativo atualizado.' }); await queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (error) => setMessage({ type: 'error', text: getApiErrorMessage(error) })
  });

  return <Page>
    <header><Eyebrow>Gestão</Eyebrow><h1>Administradores</h1><p>Controle o acesso das contas administrativas autorizadas.</p></header>
    {users.isLoading ? <Feedback>Carregando administradores...</Feedback> : null}
    {users.error ? <Error role="alert">{getApiErrorMessage(users.error)}</Error> : null}
    <Panel>
      <Table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>Função</th><th>Status</th><th><span className="sr-only">Ação</span></th></tr></thead>
        <tbody>{users.data?.map((user) => <tr key={user.id}>
          <td>{user.name}</td><td>{user.email}</td><td>Administrador</td><td>{user.isActive ? 'Ativo' : 'Inativo'}</td>
          <td><Action type="button" disabled={updateActivity.isPending} onClick={() => updateActivity.mutate({ id: user.id, isActive: !user.isActive })}>{user.isActive ? 'Desativar' : 'Ativar'}</Action></td>
        </tr>)}</tbody>
      </Table>
      {message ? <Message $type={message.type} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</Message> : null}
    </Panel>
  </Page>;
}

const Page = styled.section`display:grid;gap:${({ theme }) => theme.spacing.xl};h1{margin:0;color:${({ theme }) => theme.colors.textStrong}}p{margin:${({ theme }) => theme.spacing.sm} 0 0;color:${({ theme }) => theme.colors.textMuted}}`;
const Eyebrow = styled.span`color:${({ theme }) => theme.colors.accent};font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;`;
const Panel = styled.section`min-width:0;border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};padding:${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){padding:${({ theme }) => theme.spacing.md};}`;
const Table = styled.table`width:100%;border-collapse:collapse;color:${({ theme }) => theme.colors.textStrong};th,td{border-bottom:1px solid ${({ theme }) => theme.colors.border};padding:${({ theme }) => theme.spacing.md};text-align:left;overflow-wrap:anywhere}th{color:${({ theme }) => theme.colors.textMuted};font-size:.78rem;text-transform:uppercase}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}@media(max-width:${({ theme }) => theme.breakpoints.md}){thead{display:none}tbody,tr,td{display:block;width:100%}tr{border-bottom:1px solid ${({ theme }) => theme.colors.border};padding:${({ theme }) => theme.spacing.sm} 0}td{display:grid;grid-template-columns:7rem minmax(0,1fr);gap:${({ theme }) => theme.spacing.sm};border:0;padding:${({ theme }) => theme.spacing.xs} 0}td::before{color:${({ theme }) => theme.colors.textMuted};font-size:.75rem;font-weight:800;text-transform:uppercase}td:nth-child(1)::before{content:'Nome'}td:nth-child(2)::before{content:'E-mail'}td:nth-child(3)::before{content:'Função'}td:nth-child(4)::before{content:'Status'}td:nth-child(5)::before{content:'Ação'}}`;
const Action = styled.button`min-height:2.25rem;width:max-content;max-width:100%;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:transparent;color:${({ theme }) => theme.colors.textStrong};font-weight:700;padding:0 ${({ theme }) => theme.spacing.md};`;
const Feedback = styled.p`margin:0 !important;`;
const Error = styled.p`margin:0 !important;color:${({ theme }) => theme.colors.danger} !important;`;
const Message = styled.p<{ $type: 'success' | 'error' }>`margin:${({ theme }) => theme.spacing.md} 0 0 !important;color:${({ $type, theme }) => $type === 'success' ? theme.colors.accent : theme.colors.danger} !important;font-weight:700;`;
