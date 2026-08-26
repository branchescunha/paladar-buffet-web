import styled from 'styled-components';

interface FutureRoutePageProps {
  title: string;
}

export function FutureRoutePage({ title }: FutureRoutePageProps) {
  return (
    <Page>
      <h1>{title}</h1>
    </Page>
  );
}

const Page = styled.section`
  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.deepGreen};
    font-size: 1.75rem;
  }
`;
