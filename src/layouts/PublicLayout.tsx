import { Moon, Sun } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { scrollToTopForSameRoute } from '@/routes/scroll-utils';
import { useThemeMode } from '@/styles/theme-mode.context';

const whatsappUrl = 'https://wa.me/5561984163455';
const instagramUrl = 'https://www.instagram.com/buffetpaladardf/';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { mode, toggleTheme } = useThemeMode();
  const scrollHomeToTop = useSameRouteTopHandler('/');
  const scrollQuoteToTop = useSameRouteTopHandler('/orcamento');
  const scrollPrivacyToTop = useSameRouteTopHandler('/privacidade');

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <Brand to="/" aria-label="Paladar Buffet" onClick={scrollHomeToTop}>
            <img src="/assets/paladar/logo-navbar.webp" alt="Paladar Buffet" />
          </Brand>

          <HeaderActions>
            <ThemeToggle
              type="button"
              onClick={toggleTheme}
              aria-label={mode === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
            >
              {mode === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            </ThemeToggle>
            <QuoteLink to="/orcamento" onClick={scrollQuoteToTop}>
              <span>Solicitar orçamento</span>
              <small>Orçamento</small>
            </QuoteLink>
          </HeaderActions>
        </HeaderInner>
      </Header>

      {children}

      <Footer id="contato">
        <FooterInner>
          <FooterBrand>
            <FooterLogoLink to="/" aria-label="Paladar Buffet" onClick={scrollHomeToTop}>
              <img src="/assets/paladar/logo-footer.webp" alt="Paladar Buffet" />
            </FooterLogoLink>
            <p>Buffet completo para eventos personalizados em Brasília/DF e cidades próximas.</p>
          </FooterBrand>

          <FooterColumn>
            <h2>Navegação</h2>
            <Link to="/" onClick={scrollHomeToTop}>Home</Link>
            <Link to="/orcamento" onClick={scrollQuoteToTop}>Solicitar orçamento</Link>
            <Link to="/privacidade" onClick={scrollPrivacyToTop}>Política de Privacidade</Link>
          </FooterColumn>

          <FooterColumn>
            <h2>Contato</h2>
            <a href={whatsappUrl}>WhatsApp: (61) 98416-3455</a>
            <a href="mailto:buffet.paladar.df@gmail.com">buffet.paladar.df@gmail.com</a>
            <span>Brasília/DF e região</span>
          </FooterColumn>

          <FooterColumn>
            <h2>Redes</h2>
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              Instagram: @buffetpaladardf
            </a>
          </FooterColumn>
        </FooterInner>
        <FooterBottom>
          <span>© {new Date().getFullYear()} Paladar Buffet.</span>
          <FooterLegal>
            <span>Buffet e Restaurante Paladar LTDA</span>
            <span aria-hidden="true">·</span>
            <span>CNPJ <LegalDocument>59.973.986/0001-29</LegalDocument></span>
          </FooterLegal>
        </FooterBottom>
      </Footer>
    </Shell>
  );
}

function useSameRouteTopHandler(targetPathname: string) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    if (window.location.pathname !== targetPathname || window.location.hash) {
      return;
    }

    event.preventDefault();
    scrollToTopForSameRoute();
  };
}

const Shell = styled.div`
  --public-header-height: 76px;

  min-height: 100vh;
  overflow-x: clip;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    --public-header-height: 68px;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.navbar};
  backdrop-filter: blur(18px);
`;

const HeaderInner = styled.div`
  display: flex;
  width: min(1180px, calc(100% - 1.5rem));
  min-height: var(--public-header-height);
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: min(100% - 1rem, 1180px);
    min-height: 64px;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  flex: 0 1 auto;
  align-items: center;
  min-width: 0;

  img {
    display: block;
    width: clamp(90px, 10vw, 128px);
    height: auto;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    img {
      width: clamp(82px, 24vw, 96px);
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 380px) {
    gap: 0.35rem;
  }
`;

const IconButton = styled.button`
  display: inline-grid;
  width: 2.7rem;
  height: 2.7rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textStrong};
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
    transform: translateY(-1px);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 2.55rem;
    height: 2.55rem;
  }
`;

const ThemeToggle = styled(IconButton)``;

const QuoteLink = styled(NavLink)`
  display: inline-flex;
  min-height: 2.7rem;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.palette.white};
  font-size: 0.9rem;
  font-weight: 900;
  padding: 0 1rem;
  text-decoration: none;

  small {
    display: none;
    font: inherit;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 2.55rem;
    font-size: 0.82rem;
    padding-inline: 0.72rem;

    span {
      display: none;
    }

    small {
      display: inline;
    }
  }

  @media (max-width: 360px) {
    padding-inline: 0.6rem;
  }
`;

const Footer = styled.footer`
  background: ${({ theme }) => theme.palette.darkGreen};
  color: ${({ theme }) => theme.palette.warmWhite};
`;

const FooterInner = styled.div`
  display: grid;
  width: min(1180px, calc(100% - 2rem));
  grid-template-columns: 1.2fr repeat(3, 1fr);
  gap: clamp(1.1rem, 3vw, 2.25rem);
  margin: 0 auto;
  padding: clamp(2.35rem, 5vw, 4rem) 0 clamp(1.9rem, 4vw, 3rem);

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: min(100% - 1.25rem, 1180px);
    padding: 2rem 0 1.35rem;
  }
`;

const FooterBrand = styled.div`
  display: grid;
  align-content: start;
  gap: 0.75rem;
  max-width: 22rem;

  p {
    margin: 0;
    color: rgba(247, 245, 239, 0.86);
    line-height: 1.65;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.55rem;

    p {
      font-size: 0.88rem;
      line-height: 1.45;
    }
  }
`;

const FooterLogoLink = styled(Link)`
  display: inline-flex;
  width: fit-content;

  img {
    width: 150px;
    height: auto;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    img {
      width: 116px;
    }
  }
`;

const FooterColumn = styled.div`
  display: grid;
  align-content: start;
  gap: 0.55rem;

  h2 {
    margin: 0 0 0.2rem;
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.78rem;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  a,
  span {
    color: rgba(247, 245, 239, 0.9);
    line-height: 1.45;
    text-decoration: none;
  }

  a:hover {
    color: ${({ theme }) => theme.palette.white};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.38rem;

    h2 {
      margin-bottom: 0.05rem;
      font-size: 0.68rem;
    }

    a,
    span {
      font-size: 0.88rem;
      line-height: 1.35;
    }
  }
`;

const FooterBottom = styled.div`
  display: flex;
  width: min(1180px, calc(100% - 2rem));
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0 auto;
  border-top: 1px solid rgba(247, 245, 239, 0.16);
  color: rgba(247, 245, 239, 0.78);
  font-size: 0.88rem;
  padding: 0.9rem 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-start;
    flex-direction: column;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: min(100% - 1.25rem, 1180px);
    gap: 0.4rem;
    font-size: 0.76rem;
    padding: 0.7rem 0;
  }
`;

const FooterLegal = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: grid;
    gap: 0.12rem;

    span[aria-hidden='true'] {
      display: none;
    }
  }
`;

const LegalDocument = styled.span`
  white-space: nowrap;
`;
