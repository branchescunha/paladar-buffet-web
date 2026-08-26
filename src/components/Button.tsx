import styled from 'styled-components';

export const Button = styled.button`
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 0;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.deepGreen};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 700;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  transition:
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.darkGreen};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

export const SecondaryButton = styled(Button)`
  border: 1px solid ${({ theme }) => theme.colors.oliveGray};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.deepGreen};

  &:hover {
    background: ${({ theme }) => theme.colors.softGreen};
  }
`;
