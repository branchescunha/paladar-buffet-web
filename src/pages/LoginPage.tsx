import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { AuthLayout } from '@/layouts/AuthLayout';
import { getApiErrorMessage } from '@/services/api';
import { useCurrentAdmin, useLogin } from '@/features/auth/useAuth';
import { loginFormSchema, type LoginFormData } from '@/features/auth/auth.schemas';

export function LoginPage() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const currentAdmin = useCurrentAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin';
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' }
  });

  async function onSubmit(data: LoginFormData) {
    setError('');
    try {
      const admin = await login.mutateAsync(data);
      navigate(admin.mustChangePassword ? '/change-password' : redirectTo, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  if (currentAdmin.data) {
    return <Navigate to={currentAdmin.data.mustChangePassword ? '/change-password' : '/admin'} replace />;
  }

  return (
    <AuthLayout>
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
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          {...form.register('password')}
          error={form.formState.errors.password?.message}
          trailingAction={
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
            </button>
          }
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

const SubmitError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
`;

const RecoveryLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-weight: 700;
  text-align: center;
`;
