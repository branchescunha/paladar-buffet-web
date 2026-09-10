import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
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
import { env } from '@/config/env';
import { googleLogin } from '@/services/auth.service';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(input: { client_id: string; callback(response: { credential?: string }): void }): void;
          renderButton(
            parent: HTMLElement,
            options: { theme: 'outline'; size: 'large'; text: 'continue_with'; width?: number }
          ): void;
        };
      };
    };
  }
}

export function LoginPage() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const login = useLogin();
  const queryClient = useQueryClient();
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

  useEffect(() => {
    if (!env.VITE_GOOGLE_CLIENT_ID || !googleButtonRef.current) {
      return;
    }

    let isMounted = true;

    async function initializeGoogleLogin() {
      try {
        await loadGoogleIdentityScript();
        if (!isMounted || !googleButtonRef.current) {
          return;
        }

        window.google?.accounts.id.initialize({
          client_id: env.VITE_GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            if (!credential) {
              setError('Não foi possível autenticar com Google.');
              return;
            }

            try {
              const admin = await googleLogin(credential);
              queryClient.setQueryData(['current-admin'], admin);
              navigate(admin.mustChangePassword ? '/change-password' : '/admin', { replace: true });
            } catch (requestError) {
              setError(getApiErrorMessage(requestError));
            }
          }
        });
        window.google?.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: googleButtonRef.current.offsetWidth
        });
      } catch {
        if (isMounted) {
          setError('Não foi possível carregar o login Google.');
        }
      }
    }

    void initializeGoogleLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate, queryClient]);

  if (currentAdmin.data) {
    return <Navigate to={currentAdmin.data.mustChangePassword ? '/change-password' : '/admin'} replace />;
  }

  return (
    <AuthLayout>
      {env.VITE_GOOGLE_CLIENT_ID ? (
        <>
          <GoogleButtonMount ref={googleButtonRef} aria-label="Continuar com Google" />
          <Divider>ou</Divider>
        </>
      ) : null}
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

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google script failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed'));
    document.head.appendChild(script);
  });
}

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const GoogleButtonMount = styled.div`
  min-height: 40px;
`;

const Divider = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
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
