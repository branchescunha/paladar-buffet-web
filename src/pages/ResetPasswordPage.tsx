import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { AuthLayout } from '@/layouts/AuthLayout';
import { getApiErrorMessage } from '@/services/api';
import { resetPassword } from '@/services/auth.service';
import { resetPasswordFormSchema, type ResetPasswordFormData } from '@/features/auth/auth.schemas';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = searchParams.get('token') ?? '';
  const mutation = useMutation({ mutationFn: resetPassword });
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: '' }
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setMessage('');
    setError('');
    try {
      const responseMessage = await mutation.mutateAsync({ token, password: data.password });
      setMessage(responseMessage);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  return (
    <AuthLayout>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          {...form.register('password')}
          error={form.formState.errors.password?.message}
        />
        {message ? <Success role="status">{message}</Success> : null}
        {error ? <Error role="alert">{error}</Error> : null}
        <Button type="submit" disabled={mutation.isPending || !token}>
          {mutation.isPending ? 'Redefinindo...' : 'Redefinir senha'}
        </Button>
      </Form>
      <BackLink to="/login">Voltar para login</BackLink>
    </AuthLayout>
  );
}

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Success = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.deepGreen};
`;

const Error = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
`;

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.deepGreen};
  font-weight: 700;
  text-align: center;
`;
