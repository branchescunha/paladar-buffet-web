import { CalendarCheck, ChefHat, MessageCircle, ShieldCheck, Sparkles, UsersRound, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PublicLayout } from '@/layouts/PublicLayout';

const events = [
  { title: 'Casamentos', image: '/assets/paladar/event-wedding.webp' },
  { title: 'Aniversarios', image: '/assets/paladar/event-birthday.jpg' },
  { title: 'Eventos corporativos', image: '/assets/paladar/event-meeting.png' },
  { title: 'Confraternizacoes', image: '/assets/paladar/event-party.jpg' }
];

const menuItems = ['Jantar completo', 'Churrasco', 'Coffee break', 'Brunch', 'Entradas e acompanhamentos', 'Sobremesas'];

export function PublicHomePage() {
  return (
    <PublicLayout>
      <main>
        <Hero>
          <HeroContent>
            <Eyebrow>Paladar Buffet desde 2014</Eyebrow>
            <h1>Buffet completo para eventos em Brasilia</h1>
            <p>
              Cozinha, atendimento e estrutura para eventos sociais e corporativos em Brasilia-DF e regiao, com orcamento
              personalizado para cada ocasiao.
            </p>
            <Actions>
              <PrimaryLink to="/orcamento">Solicitar orcamento</PrimaryLink>
              <SecondaryLink href="https://wa.me/5561984163455">Falar no WhatsApp</SecondaryLink>
            </Actions>
          </HeroContent>
          <HeroVisual aria-label="Proprietario do Paladar Buffet em servico">
            <img src="/assets/paladar/owner-waiter-hero.png" alt="" />
            <img src="/assets/paladar/owner-chef-hero.png" alt="" />
          </HeroVisual>
        </Hero>

        <TrustBand aria-label="Informacoes principais">
          <TrustItem>
            <ShieldCheck size={22} />
            <span>Empresa formalizada</span>
          </TrustItem>
          <TrustItem>
            <ChefHat size={22} />
            <span>Buffet completo</span>
          </TrustItem>
          <TrustItem>
            <MessageCircle size={22} />
            <span>Atendimento direto</span>
          </TrustItem>
        </TrustBand>

        <Section id="eventos">
          <SectionHeader>
            <span>Eventos</span>
            <h2>Formatos atendidos pelo buffet</h2>
          </SectionHeader>
          <EventGrid>
            {events.map((event) => (
              <EventCard key={event.title}>
                <img src={event.image} alt="" loading="lazy" />
                <h3>{event.title}</h3>
              </EventCard>
            ))}
          </EventGrid>
        </Section>

        <SplitSection id="cardapios">
          <div>
            <SectionHeader>
              <span>Cardapios</span>
              <h2>Opcoes montadas conforme o evento</h2>
            </SectionHeader>
            <p>
              O Paladar Buffet trabalha com composicoes sob consulta, considerando tipo de evento, numero de convidados,
              estrutura desejada e preferencias do contratante.
            </p>
            <MenuList>
              {menuItems.map((item) => (
                <li key={item}>
                  <Utensils size={18} />
                  {item}
                </li>
              ))}
            </MenuList>
          </div>
          <ImageStack>
            <img src="/assets/paladar/buffet-table-1.webp" alt="Mesa de buffet preparada" loading="lazy" />
            <img src="/assets/paladar/buffet-table-2.webp" alt="Itens de buffet preparados para evento" loading="lazy" />
          </ImageStack>
        </SplitSection>

        <Section>
          <FeatureGrid>
            <Feature>
              <UsersRound />
              <h3>Equipe para servir</h3>
              <p>Atendimento pensado para recepcionar convidados com organizacao e discricao.</p>
            </Feature>
            <Feature>
              <CalendarCheck />
              <h3>Planejamento do evento</h3>
              <p>Levantamento das informacoes essenciais antes da proposta de orcamento.</p>
            </Feature>
            <Feature>
              <Sparkles />
              <h3>Apresentacao cuidada</h3>
              <p>Composicao visual coerente com eventos sociais, familiares e corporativos.</p>
            </Feature>
          </FeatureGrid>
        </Section>

        <CtaSection>
          <div>
            <span>Orcamento personalizado</span>
            <h2>Conte sobre o evento para receber um atendimento direcionado.</h2>
          </div>
          <PrimaryLink to="/orcamento">Pedir proposta</PrimaryLink>
        </CtaSection>
      </main>
    </PublicLayout>
  );
}

const Hero = styled.section`
  position: relative;
  display: grid;
  min-height: calc(100vh - 76px);
  grid-template-columns: minmax(0, 0.94fr) minmax(360px, 1.06fr);
  align-items: stretch;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.darkGreen};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const HeroContent = styled.div`
  z-index: 1;
  display: grid;
  align-content: center;
  max-width: 42rem;
  gap: 1.4rem;
  padding: clamp(4rem, 9vw, 8rem) 0 clamp(4rem, 7vw, 7rem) max(1rem, calc((100vw - 1180px) / 2));
  color: ${({ theme }) => theme.colors.warmWhite};

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(3.2rem, 7vw, 6.8rem);
    font-weight: 700;
    line-height: 0.92;
    max-width: 11ch;
  }

  p {
    max-width: 35rem;
    margin: 0;
    color: rgba(247, 245, 239, 0.82);
    font-size: clamp(1.05rem, 2vw, 1.25rem);
    line-height: 1.7;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 4rem 1rem 2rem;
  }
`;

const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.softGold};
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.paladarOrange};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 900;
  padding: 0 1.35rem;
  text-decoration: none;
`;

const SecondaryLink = styled.a`
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(247, 245, 239, 0.35);
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.warmWhite};
  font-weight: 900;
  padding: 0 1.35rem;
  text-decoration: none;
`;

const HeroVisual = styled.div`
  position: relative;
  min-height: 680px;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center right;
  }

  img + img {
    animation: chefFade 9s ease-in-out infinite;
  }

  &::before {
    position: absolute;
    inset: 0;
    z-index: 1;
    content: '';
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.darkGreen} 0%, rgba(16, 23, 19, 0.42) 34%, transparent 70%);
  }

  @keyframes chefFade {
    0%,
    42% {
      opacity: 0;
    }
    50%,
    92% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    img + img {
      animation: none;
      opacity: 0;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    min-height: 440px;
  }
`;

const TrustBand = styled.section`
  display: grid;
  width: min(1180px, calc(100% - 2rem));
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin: 0 auto;
  background: rgba(19, 36, 21, 0.14);

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.colors.warmWhite};
  color: ${({ theme }) => theme.colors.deepGreen};
  font-weight: 900;
  padding: 1.2rem;
`;

const Section = styled.section`
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(4rem, 8vw, 6rem) 0;
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 0.45rem;
  margin-bottom: 1.8rem;

  span {
    color: ${({ theme }) => theme.colors.paladarOrange};
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    max-width: 13ch;
    margin: 0;
    color: ${({ theme }) => theme.colors.deepGreen};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.4rem, 5vw, 4.5rem);
    line-height: 0.98;
  }
`;

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const EventCard = styled.article`
  display: grid;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.panel};

  img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
  }

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.deepGreen};
    font-size: 1rem;
    padding: 1rem;
  }
`;

const SplitSection = styled(Section)`
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
  gap: 3rem;
  align-items: center;

  p {
    max-width: 38rem;
    color: ${({ theme }) => theme.colors.neutralText};
    line-height: 1.75;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const MenuList = styled.ul`
  display: grid;
  gap: 0.8rem;
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: ${({ theme }) => theme.colors.deepGreen};
    font-weight: 800;
  }
`;

const ImageStack = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.82fr;
  gap: 1rem;
  align-items: end;

  img {
    width: 100%;
    border-radius: ${({ theme }) => theme.radius.md};
    object-fit: cover;
  }

  img:first-child {
    aspect-ratio: 4 / 5;
  }

  img:last-child {
    aspect-ratio: 4 / 4.6;
    margin-bottom: 2rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Feature = styled.article`
  border-top: 2px solid ${({ theme }) => theme.colors.softGold};
  padding-top: 1.25rem;

  svg {
    color: ${({ theme }) => theme.colors.paladarOrange};
  }

  h3 {
    color: ${({ theme }) => theme.colors.deepGreen};
    margin: 1rem 0 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.oliveGray};
    line-height: 1.65;
    margin: 0;
  }
`;

const CtaSection = styled(Section)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  border-top: 1px solid rgba(19, 36, 21, 0.14);

  span {
    color: ${({ theme }) => theme.colors.paladarOrange};
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    max-width: 18ch;
    margin: 0.5rem 0 0;
    color: ${({ theme }) => theme.colors.deepGreen};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.2rem, 5vw, 4.2rem);
    line-height: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-start;
    flex-direction: column;
  }
`;
