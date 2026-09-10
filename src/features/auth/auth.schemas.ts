import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.')
});

export const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.')
});

export const resetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(10, 'A senha deve ter pelo menos 10 caracteres.')
    .regex(/[a-z]/, 'Inclua letra minúscula.')
    .regex(/[A-Z]/, 'Inclua letra maiúscula.')
    .regex(/[0-9]/, 'Inclua número.')
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.'),
    newPassword: resetPasswordFormSchema.shape.password,
    confirmPassword: z.string().min(1, 'Confirme a nova senha.')
  })
  .refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword']
  });

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;
