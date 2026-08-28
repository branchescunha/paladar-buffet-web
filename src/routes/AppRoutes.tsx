import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminHomePage } from '@/pages/AdminHomePage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { FutureRoutePage } from '@/pages/FutureRoutePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { PublicHomePage } from '@/pages/PublicHomePage';
import { QuotePage } from '@/pages/QuotePage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ProtectedRoute } from './ProtectedRoute';

const futureRoutes = [
  ['quotes', 'Orcamentos'],
  ['clients', 'Clientes'],
  ['menu', 'Cardapios'],
  ['proposals', 'Propostas'],
  ['contracts', 'Contratos'],
  ['payments', 'Pagamentos'],
  ['events', 'Eventos'],
  ['calendar', 'Calendario'],
  ['gallery', 'Galeria'],
  ['settings', 'Configuracoes'],
  ['admins', 'Administradores']
] as const;

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route path="/orcamento" element={<QuotePage />} />
      <Route path="/privacidade" element={<PrivacyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          {futureRoutes.map(([path, title]) => (
            <Route key={path} path={path} element={<FutureRoutePage title={title} />} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
