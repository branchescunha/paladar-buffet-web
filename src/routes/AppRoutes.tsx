import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminHomePage } from '@/pages/AdminHomePage';
import { AdminClientsPage } from '@/pages/AdminClientsPage';
import { AdminEventsPage } from '@/pages/AdminEventsPage';
import { AdminQuoteRequestsPage } from '@/pages/AdminQuoteRequestsPage';
import { AdminProposalsPage } from '@/pages/AdminProposalsPage';
import { AdminProfilePage } from '@/pages/AdminProfilePage';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { FutureRoutePage } from '@/pages/FutureRoutePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { PublicHomePage } from '@/pages/PublicHomePage';
import { QuotePage } from '@/pages/QuotePage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { AdminSettingsPage } from '@/pages/AdminSettingsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ScrollRestoration } from './ScrollRestoration';

const futureRoutes = [
  ['menu', 'Cardápios'],
  ['contracts', 'Contratos'],
  ['payments', 'Pagamentos'],
  ['calendar', 'Calendário'],
  ['gallery', 'Galeria']
] as const;

export function AppRoutes() {
  return (
    <>
      <RobotsMeta />
      <ScrollRestoration />
      <Routes>
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/orcamento" element={<QuotePage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="quotes" element={<AdminQuoteRequestsPage />} />
            <Route path="clients" element={<AdminClientsPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="proposals" element={<AdminProposalsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            {futureRoutes.map(([path, title]) => (
              <Route key={path} path={path} element={<FutureRoutePage title={title} />} />
            ))}
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function RobotsMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isRestricted = pathname === '/login' || pathname.startsWith('/admin');
    const managedAttr = 'data-paladar-managed';
    const existingMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');

    if (!isRestricted) {
      if (existingMeta?.hasAttribute(managedAttr)) {
        existingMeta.remove();
      }
      return;
    }

    const meta = existingMeta ?? document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow, noarchive');
    meta.setAttribute(managedAttr, 'true');

    if (!existingMeta) {
      document.head.append(meta);
    }
  }, [pathname]);

  return null;
}
