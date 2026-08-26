import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.warmWhite};
    color: ${({ theme }) => theme.colors.neutralText};
    font-family: ${({ theme }) => theme.typography.fontFamily};
  }

  button,
  input {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  a {
    color: inherit;
  }
`;
