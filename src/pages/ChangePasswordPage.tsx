import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import {
  changePasswordFormSchema,
  type ChangePasswordFormData
} from '@/features/auth/auth.schemas';
import { AuthLayout } from '@/layouts/AuthLayout';
import { getApiErrorMessage } from '@/services/api';
import { changePassword } from '@/services/auth.service';

export function ChangePasswordPage() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: changePassword });
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  async function onSubmit(data: ChangePasswordFormData) {
    setError('');
    try {
      await mutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      queryClient.removeQueries({ queryKey: ['current-admin'] });
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  return (
    <AuthLayout>
      <Intro>Defina uma senha pessoal antes de continuar.</Intro>
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          {...form.register('currentPassword')}
          error={form.formState.errors.currentPassword?.message}
        />
        <FormField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          {...form.register('newPassword')}
          error={form.formState.errors.newPassword?.message}
        />
        <FormField
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          {...form.register('confirmPassword')}
          error={form.formState.errors.confirmPassword?.message}
        />
        {error ? <SubmitError role="alert">{error}</SubmitError> : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </Form>
    </AuthLayout>
  );
}

const Intro = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SubmitError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
`;
