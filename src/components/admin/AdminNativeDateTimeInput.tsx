import type { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface AdminNativeDateTimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type: 'date' | 'time' | 'datetime-local';
}

export const AdminNativeDateTimeInput = styled.input<AdminNativeDateTimeInputProps>`
  display: block;
  inline-size: 100%;
  min-inline-size: 0;
  max-inline-size: 100%;
`;
