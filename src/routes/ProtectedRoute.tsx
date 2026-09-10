import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '@/components/LoadingState';
import { useCurrentAdmin } from '@/features/auth/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const currentAdmin = useCurrentAdmin();

  if (currentAdmin.isLoading) {
    return <LoadingState />;
  }

  if (!currentAdmin.data) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (currentAdmin.data.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
