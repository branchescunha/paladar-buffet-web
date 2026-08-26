import { LogOut, Menu } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@/components/Button';
import { useCurrentAdmin, useLogout } from '@/features/auth/useAuth';

const navItems = [
  ['Inicio', '/admin'],
  ['Orcamentos', '/admin/quotes'],
  ['Clientes', '/admin/clients'],
  ['Cardapios', '/admin/menu'],
  ['Propostas', '/admin/proposals'],
  ['Contratos', '/admin/contracts'],
  ['Pagamentos', '/admin/payments'],
  ['Eventos', '/admin/events'],
  ['Calendario', '/admin/calendar'],
  ['Galeria', '/admin/gallery'],
  ['Configuracoes', '/admin/settings'],
  ['Administradores', '/admin/admins']
] as const;

export function AdminLayout() {
  const { data: admin } = useCurrentAdmin();
  const logout = useLogout();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout.mutateAsync();
    navigate('/login', { replace: true });
  }

  return (
    <Shell>
      <Sidebar aria-label="Navegacao administrativa">
        <Logo>Paladar Buffet</Logo>
        <nav>
          {navItems.map(([label, path]) => (
            <NavItem key={path} to={path} end={path === '/admin'}>
              {label}
            </NavItem>
          ))}
        </nav>
      </Sidebar>
      <Content>
        <Header>
          <MobileMenu aria-label="Abrir navegacao">
            <Menu size={20} />
          </MobileMenu>
          <UserInfo>
            <span>{admin?.name}</span>
            <small>{admin?.email}</small>
          </UserInfo>
          <Button type="button" onClick={handleLogout} disabled={logout.isPending}>
            <LogOut size={18} />
            Sair
          </Button>
        </Header>
        <Main>
          <Outlet />
        </Main>
      </Content>
    </Shell>
  );
}

const Shell = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-columns: 17rem 1fr;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: ${({ theme }) => theme.colors.deepGreen};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};

  nav {
    display: grid;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const Logo = styled.strong`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: 1.2rem;
`;

const NavItem = styled(NavLink)`
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  text-decoration: none;

  &.active,
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const Content = styled.div`
  display: grid;
  min-width: 0;
  grid-template-rows: auto 1fr;
`;

const Header = styled.header`
  display: flex;
  min-height: 4.5rem;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.softGreen};
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`;

const MobileMenu = styled.button`
  display: none;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.deepGreen};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: inline-flex;
    margin-right: auto;
  }
`;

const UserInfo = styled.div`
  display: grid;
  text-align: right;

  span {
    font-weight: 700;
  }

  small {
    color: ${({ theme }) => theme.colors.oliveGray};
  }
`;

const Main = styled.main`
  padding: ${({ theme }) => theme.spacing.xl};
`;
