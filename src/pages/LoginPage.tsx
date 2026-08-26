import { zodResolver } from '@hookform/resolvers/zod';
import { Chrome } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, SecondaryButton } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { AuthLayout } from '@/layouts/AuthLayout';
import { getApiErrorMessage } from '@/services/api';
import { useCurrentAdmin, useLogin } from '@/features/auth/useAuth';
import { loginFormSchema, type LoginFormData } from '@/features/auth/auth.schemas';

export function LoginPage() {
  const [error, setError] = useState('');
  const login = useLogin();
  const currentAdmin = useCurrentAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin';
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' }
  });

  if (currentAdmin.data) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(data: LoginFormData) {
    setError('');
    try {
      await login.mutateAsync(data);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  return (
    <AuthLayout>
      <SecondaryButton type="button">
        <Chrome size={18} />
        Continuar com Google
      </SecondaryButton>
      <Divider>ou</Divider>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          label="E-mail"
          type="email"
          autoComplete="email"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
        />
        <FormField
          label="Senha"
          type="password"
          autoComplete="current-password"
          {...form.register('password')}
          error={form.formState.errors.password?.message}
        />
        {error ? <SubmitError role="alert">{error}</SubmitError> : null}
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </Form>
      <RecoveryLink to="/forgot-password">Esqueci minha senha</RecoveryLink>
    </AuthLayout>
  );
}

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Divider = styled.div`
  color: ${({ theme }) => theme.colors.oliveGray};
  text-align: center;
`;

const SubmitError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
`;

const RecoveryLink = styled(Link)`
  color: ${({ theme }) => theme.colors.deepGreen};
  font-weight: 700;
  text-align: center;
`;
