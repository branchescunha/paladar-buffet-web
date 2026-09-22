import { CalendarDays, ClipboardList, FileText, KeyRound, LayoutDashboard, LogOut, Menu, Moon, Settings, ShieldCheck, Sun, UserRound, UsersRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { Button } from '@/components/Button';
import { useCurrentAdmin, useLogout } from '@/features/auth/useAuth';
import { darkTheme, lightTheme } from '@/styles/theme';

const adminThemeStorageKey = 'paladar-admin-theme';
const baseNavItems = [
  ['Visão geral', '/admin', LayoutDashboard], ['Solicitações', '/admin/quotes', ClipboardList],
  ['Clientes', '/admin/clients', UsersRound], ['Eventos', '/admin/events', CalendarDays],
  ['Propostas', '/admin/proposals', FileText], ['Configurações', '/admin/settings', Settings],
  ['Administradores', '/admin/users', ShieldCheck], ['Perfil', '/admin/profile', UserRound]
] as const;

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem(adminThemeStorageKey) === 'dark');
  const { data: admin } = useCurrentAdmin();
  const logout = useLogout();
  const navigate = useNavigate();
  useEffect(() => { window.localStorage.setItem(adminThemeStorageKey, darkMode ? 'dark' : 'light'); }, [darkMode]);
  async function handleLogout() { await logout.mutateAsync(); navigate('/login', { replace: true }); }

  return <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
    <Shell>
      <MobileBackdrop $mobileOpen={mobileOpen} aria-label="Fechar menu lateral" onClick={() => setMobileOpen(false)} />
      <Sidebar aria-label="Navegação administrativa" $mobileOpen={mobileOpen}>
        <LogoLink to="/" aria-label="Ir para o site público"><img src="/assets/paladar/logo-navbar.webp" alt="Paladar Buffet" /></LogoLink>
        <nav>{baseNavItems.map(([label, path, Icon]) => <NavItem key={path} to={path} end={path === '/admin'} onClick={() => setMobileOpen(false)}><Icon size={18} />{label}</NavItem>)}</nav>
      </Sidebar>
      <Content>
        <Header>
          <MobileMenu aria-label={mobileOpen ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((current) => !current)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</MobileMenu>
          <UserInfo><span>{admin?.name}</span><small>{admin?.email}</small><Role>Administrador</Role></UserInfo>
          <IconButton type="button" aria-label={darkMode ? 'Usar tema claro' : 'Usar tema escuro'} title={darkMode ? 'Usar tema claro' : 'Usar tema escuro'} onClick={() => setDarkMode((current) => !current)}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</IconButton>
          <IconButton as={Link} to="/change-password" aria-label="Alterar senha" title="Alterar senha"><KeyRound size={18} /></IconButton>
          <LogoutButton type="button" onClick={handleLogout} disabled={logout.isPending}><LogOut size={18} /><span>Sair</span></LogoutButton>
        </Header>
        <Main><Outlet /></Main>
      </Content>
    </Shell>
  </ThemeProvider>;
}

const Shell = styled.div`min-height:100dvh;background:${({ theme }) => theme.colors.background};@media(min-width:${({ theme }) => theme.breakpoints.lg}){padding-left:17rem;}`;
const Sidebar = styled.aside<{ $mobileOpen: boolean }>`position:fixed;inset:0 auto 0 0;z-index:${({ theme }) => theme.zIndex.sidebar};width:17rem;height:100dvh;overflow-y:auto;background:${({ theme }) => theme.colors.deepGreen};color:${({ theme }) => theme.palette.white};padding:${({ theme }) => theme.spacing.lg};nav{display:grid;gap:${({ theme }) => theme.spacing.xs};}@media(max-width:${({ theme }) => theme.breakpoints.lg}){width:min(19rem,84vw);transform:translateX(${({ $mobileOpen }) => $mobileOpen ? '0' : '-100%'});transition:transform ${({ theme }) => theme.transitions.base};}`;
const MobileBackdrop = styled.button<{ $mobileOpen: boolean }>`display:none;@media(max-width:${({ theme }) => theme.breakpoints.lg}){display:block;position:fixed;inset:0;z-index:${({ theme }) => theme.zIndex.sidebar - 1};border:0;background:rgba(16,23,19,.42);opacity:${({ $mobileOpen }) => $mobileOpen ? 1 : 0};pointer-events:${({ $mobileOpen }) => $mobileOpen ? 'auto' : 'none'};transition:opacity ${({ theme }) => theme.transitions.base};}`;
const LogoLink = styled(Link)`display:block;margin:0 0 ${({ theme }) => theme.spacing.xl};img{display:block;max-width:10.5rem;height:auto;}`;
const NavItem = styled(NavLink)`display:flex;align-items:center;gap:${({ theme }) => theme.spacing.sm};border-radius:${({ theme }) => theme.radius.md};color:${({ theme }) => theme.palette.white};padding:${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};text-decoration:none;&.active,&:hover{background:rgba(255,255,255,.12);}`;
const Content = styled.div`display:grid;min-width:0;min-height:100dvh;grid-template-rows:auto minmax(0,1fr);@media(min-width:${({ theme }) => theme.breakpoints.lg}){height:100dvh;}`;
const Header = styled.header`display:flex;min-width:0;min-height:4.5rem;align-items:center;justify-content:flex-end;gap:${({ theme }) => theme.spacing.sm};border-bottom:1px solid ${({ theme }) => theme.colors.border};background:${({ theme }) => theme.colors.surface};padding:${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};@media(max-width:${({ theme }) => theme.breakpoints.sm}){align-items:flex-start;flex-wrap:wrap;padding:${({ theme }) => theme.spacing.sm};}`;
const MobileMenu = styled.button`display:none;border:0;background:transparent;color:${({ theme }) => theme.colors.textStrong};@media(max-width:${({ theme }) => theme.breakpoints.lg}){display:inline-flex;margin-right:auto;}@media(max-width:${({ theme }) => theme.breakpoints.sm}){margin-right:0;}`;
const UserInfo = styled.div`display:grid;min-width:0;text-align:right;span,small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}span{color:${({ theme }) => theme.colors.textStrong};font-weight:700}small{color:${({ theme }) => theme.colors.textMuted}}@media(max-width:${({ theme }) => theme.breakpoints.sm}){flex:1 1 12rem;max-width:none;text-align:left;}`;
const Role = styled.small`color:${({ theme }) => theme.colors.accent} !important;font-weight:700;`;
const IconButton = styled.button`display:inline-flex;width:2.5rem;height:2.5rem;align-items:center;justify-content:center;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:transparent;color:${({ theme }) => theme.colors.textStrong};`;
const LogoutButton = styled(Button)`@media(max-width:${({ theme }) => theme.breakpoints.sm}){width:2.5rem;padding:0;span{display:none;}}`;
const Main = styled.main`min-width:0;overflow-y:auto;padding:${({ theme }) => theme.spacing.xl};@media(max-width:${({ theme }) => theme.breakpoints.sm}){padding:${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};}`;
