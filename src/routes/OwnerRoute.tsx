import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentAdmin } from '@/features/auth/useAuth';

export function OwnerRoute() {
  const currentAdmin = useCurrentAdmin();

  if (currentAdmin.data?.role !== 'OWNER') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
