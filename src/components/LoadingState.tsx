import styled from 'styled-components';

export function LoadingState() {
  return <Loading role="status">Carregando</Loading>;
}

const Loading = styled.div`
  color: ${({ theme }) => theme.colors.deepGreen};
  font-weight: 700;
  padding: ${({ theme }) => theme.spacing.lg};
`;
