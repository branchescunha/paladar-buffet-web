import styled from 'styled-components';

export const Button = styled.button`
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 0;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.palette.white};
  font-weight: 700;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  transition:
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    filter: brightness(0.94);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

export const SecondaryButton = styled(Button)`
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textStrong};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;
