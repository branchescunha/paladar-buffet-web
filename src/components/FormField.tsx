import type { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  const inputId = id ?? inputProps.name;

  return (
    <Field>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={Boolean(error)} {...inputProps} />
      {error ? <ErrorText role="alert">{error}</ErrorText> : null}
    </Field>
  );
}

const Field = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};

  label {
    color: ${({ theme }) => theme.colors.deepGreen};
    font-size: 0.92rem;
    font-weight: 700;
  }

  input {
    min-height: 2.75rem;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.oliveGray};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.neutralText};
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.86rem;
`;
