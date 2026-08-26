import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail valido.'),
  password: z.string().min(1, 'Informe a senha.')
});

export const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail valido.')
});

export const resetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(10, 'A senha deve ter pelo menos 10 caracteres.')
    .regex(/[a-z]/, 'Inclua letra minuscula.')
    .regex(/[A-Z]/, 'Inclua letra maiuscula.')
    .regex(/[0-9]/, 'Inclua numero.')
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;
