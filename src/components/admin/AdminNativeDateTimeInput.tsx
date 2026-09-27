import type { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface AdminNativeDateTimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type: 'date' | 'time' | 'datetime-local';
  density?: 'regular' | 'compact';
}

export function AdminNativeDateTimeInput({ density = 'regular', ...inputProps }: AdminNativeDateTimeInputProps) {
  return <Control $density={density}><NativeInput {...inputProps} /></Control>;
}

const Control = styled.span<{ $density: 'regular' | 'compact' }>`
  display: flex;
  align-items: center;
  inline-size: 100%;
  min-inline-size: 0;
  max-inline-size: 100%;
  min-block-size: ${({ $density }) => $density === 'compact' ? '2.65rem' : '2.75rem'};
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.elevated};
  color: ${({ theme }) => theme.colors.textStrong};
  padding-block: ${({ $density, theme }) => $density === 'compact' ? '0' : theme.spacing.sm};
  padding-inline: ${({ $density, theme }) => $density === 'compact' ? theme.spacing.sm : theme.spacing.md};
`;

const NativeInput = styled.input`
  && {
    display: block;
    flex: 1 1 0;
    inline-size: 100%;
    min-inline-size: 0;
    max-inline-size: 100%;
    min-block-size: 0;
    box-sizing: border-box;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    padding: 0;
    padding-inline: 0;
  }
`;
