import { QueryClient } from '@tanstack/react-query';

const refreshableAdminQueryKeys = new Set([
  'current-admin', 'admin-dashboard', 'admin-users', 'admin-quote-requests',
  'admin-customers', 'admin-events', 'admin-proposals', 'admin-menu', 'admin-payment-methods'
]);

export function shouldRefreshAdminQuery(query: { queryKey: readonly unknown[] }) {
  const key = query.queryKey[0];
  return typeof key === 'string' && refreshableAdminQueryKeys.has(key);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: shouldRefreshAdminQuery
    }
  }
});
