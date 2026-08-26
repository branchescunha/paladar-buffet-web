import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '@/services/auth.service';

export function useCurrentAdmin() {
  return useQuery({
    queryKey: ['current-admin'],
    queryFn: authService.fetchCurrentAdmin,
    retry: false
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (admin) => {
      queryClient.setQueryData(['current-admin'], admin);
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['current-admin'] });
    }
  });
}
