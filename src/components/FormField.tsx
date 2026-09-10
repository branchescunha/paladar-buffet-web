import type { InputHTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  trailingAction?: ReactNode;
}

export function FormField({ label, error, id, trailingAction, ...inputProps }: FormFieldProps) {
  const inputId = id ?? inputProps.name;

  return (
    <Field>
      <label htmlFor={inputId}>{label}</label>
      {trailingAction ? (
        <InputWithAction>
          <input id={inputId} aria-invalid={Boolean(error)} {...inputProps} />
          {trailingAction}
        </InputWithAction>
      ) : (
        <input id={inputId} aria-invalid={Boolean(error)} {...inputProps} />
      )}
      {error ? <ErrorText role="alert">{error}</ErrorText> : null}
    </Field>
  );
}

const Field = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xs};

  label {
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: 0.92rem;
    font-weight: 700;
  }

  input {
    min-height: 2.75rem;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.elevated};
    color: ${({ theme }) => theme.colors.text};
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.86rem;
`;

const InputWithAction = styled.div`
  position: relative;

  input {
    padding-right: 3rem;
  }

  button {
    align-items: center;
    background: transparent;
    border: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    min-height: 2.75rem;
    min-width: 2.75rem;
    padding: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
`;
