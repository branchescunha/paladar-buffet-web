import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { AuthLayout } from '@/layouts/AuthLayout';
import { getApiErrorMessage } from '@/services/api';
import { requestPasswordReset } from '@/services/auth.service';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormData
} from '@/features/auth/auth.schemas';

export function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({ mutationFn: requestPasswordReset });
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' }
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setError('');
    setMessage('');
    try {
      const responseMessage = await mutation.mutateAsync(data.email);
      setMessage(responseMessage);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
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
        {message ? <Success role="status">{message}</Success> : null}
        {error ? <Error role="alert">{error}</Error> : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Enviando...' : 'Enviar instruções'}
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
  color: ${({ theme }) => theme.colors.textStrong};
`;

const Error = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
`;

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-weight: 700;
  text-align: center;
`;
