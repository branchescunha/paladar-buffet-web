import { Link, NavLink } from 'react-router-dom';
import styled from 'styled-components';

const whatsappUrl = 'https://wa.me/5561984163455';
const instagramUrl = 'https://www.instagram.com/buffetpaladardf/';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <Header>
        <HeaderInner>
          <Brand to="/" aria-label="Paladar Buffet">
            <img src="/assets/paladar/logo-navbar.webp" alt="Paladar Buffet" />
          </Brand>
          <Nav aria-label="Navegacao publica">
            <NavLink to="/">Inicio</NavLink>
            <a href="/#eventos">Eventos</a>
            <a href="/#cardapios">Cardapios</a>
            <NavLink to="/orcamento">Orcamento</NavLink>
            <NavLink to="/login">Entrar</NavLink>
          </Nav>
        </HeaderInner>
      </Header>
      {children}
      <Footer>
        <FooterInner>
          <FooterBrand>
            <img src="/assets/paladar/logo-footer.webp" alt="Paladar Buffet" />
            <p>Buffet completo para eventos em Brasilia-DF e regiao.</p>
          </FooterBrand>
          <FooterLinks>
            <a href={whatsappUrl}>WhatsApp: (61) 98416-3455</a>
            <a href={instagramUrl}>Instagram: @buffetpaladardf</a>
            <a href="mailto:buffet.paladar.df@gmail.com">buffet.paladar.df@gmail.com</a>
            <Link to="/privacidade">Politica de privacidade</Link>
          </FooterLinks>
        </FooterInner>
      </Footer>
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.warmWhite};
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  border-bottom: 1px solid rgba(19, 36, 21, 0.1);
  background: rgba(247, 245, 239, 0.95);
  backdrop-filter: blur(12px);
`;

const HeaderInner = styled.div`
  display: flex;
  width: min(1180px, calc(100% - 2rem));
  min-height: 76px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-start;
    flex-direction: column;
    padding: 0.75rem 0;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;

  img {
    display: block;
    width: 118px;
    height: auto;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
  justify-content: flex-end;

  a {
    border-radius: ${({ theme }) => theme.radius.sm};
    color: ${({ theme }) => theme.colors.deepGreen};
    font-size: 0.92rem;
    font-weight: 800;
    padding: 0.65rem 0.75rem;
    text-decoration: none;
  }

  a:hover,
  a.active {
    background: ${({ theme }) => theme.colors.softGreen};
  }
`;

const Footer = styled.footer`
  background: ${({ theme }) => theme.colors.darkGreen};
  color: ${({ theme }) => theme.colors.warmWhite};
`;

const FooterInner = styled.div`
  display: grid;
  width: min(1180px, calc(100% - 2rem));
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 0 auto;
  padding: 3rem 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FooterBrand = styled.div`
  max-width: 26rem;

  img {
    width: 150px;
    height: auto;
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.warmWhite};
  }

  p {
    margin: 1rem 0 0;
    color: rgba(247, 245, 239, 0.78);
  }
`;

const FooterLinks = styled.div`
  display: grid;
  align-content: start;
  gap: 0.75rem;

  a {
    color: inherit;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;
