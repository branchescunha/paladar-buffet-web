import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowRight, ChefHat, Coffee, GlassWater, HandPlatter, Leaf, Salad, Soup, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PublicLayout } from '@/layouts/PublicLayout';

const events = [
  {
    title: 'Casamentos',
    text: 'Jantar, recepção e equipe para celebrações planejadas com cuidado.',
    image: '/assets/paladar/event-wedding-final.jpg',
    alt: 'Mesa de buffet preparada para recepção de casamento'
  },
  {
    title: 'Aniversários e celebrações',
    text: 'Formatos flexíveis para encontros familiares e datas especiais.',
    image: '/assets/paladar/event-birthday-final.jpg',
    alt: 'Porções individuais organizadas para celebração'
  },
  {
    title: 'Eventos corporativos',
    text: 'Coffee break, brunch, almoço, jantar e recepção para equipes.',
    image: '/assets/paladar/event-corporate-final.jpg',
    alt: 'Mesa de coffee break montada para evento corporativo'
  },
  {
    title: 'Confraternizações e personalizados',
    text: 'Estrutura adaptada para churrascos, reuniões e eventos sob medida.',
    image: '/assets/paladar/event-custom-final.jpg',
    alt: 'Espetos assando na churrasqueira para confraternização'
  }
];

const menuItems = [
  { title: 'Entradas', icon: HandPlatter },
  { title: 'Saladas', icon: Salad },
  { title: 'Proteínas', icon: ChefHat },
  { title: 'Massas e molhos', icon: Soup },
  { title: 'Acompanhamentos', icon: Utensils },
  { title: 'Bebidas', icon: GlassWater },
  { title: 'Mesa de café', icon: Coffee },
  { title: 'Churrasco', icon: Leaf }
];

const gallery = [
  { src: '/assets/paladar/gallery-sliced-beef-final.jpg', title: 'Churrasco fatiado', label: 'CORTE' },
  { src: '/assets/paladar/gallery-grill-prep-final.jpg', title: 'Montagem na brasa', label: 'BRASA' },
  { src: '/assets/paladar/gallery-pasta-sides-final.jpg', title: 'Massas e acompanhamentos', label: 'BUFFET' },
  { src: '/assets/paladar/gallery-sauces-sides-final.jpg', title: 'Molhos e acompanhamentos', label: 'ACOMPANHAMENTOS' },
  { src: '/assets/paladar/gallery-coffee-drinks-final.jpg', title: 'Café e bebidas', label: 'CAFÉ' },
  { src: '/assets/paladar/gallery-table-setting-final.jpg', title: 'Mesa posta', label: 'MESA' },
  { src: '/assets/paladar/gallery-grilled-meats-final.jpg', title: 'Churrasco na brasa', label: 'CHURRASCO' },
  { src: '/assets/paladar/gallery-desserts-final.jpg', title: 'Sobremesas montadas', label: 'SOBREMESAS' }
];

const processSteps = [
  {
    title: 'Conte sobre seu evento',
    text: 'Você informa data, horário, local, perfil dos convidados e o tipo de atendimento desejado.'
  },
  {
    title: 'Conversamos sobre suas necessidades',
    text: 'A equipe entende o formato do evento e ajusta cardápio, estrutura e serviço.'
  },
  {
    title: 'Montamos uma proposta personalizada',
    text: 'A proposta considera convidados, escolhas de menu, montagem e equipe necessária.'
  },
  {
    title: 'Ajustamos os detalhes',
    text: 'Os pontos finais são alinhados com antecedência para reduzir improvisos no dia.'
  },
  {
    title: 'Cuidamos da experiência no dia',
    text: 'O atendimento acompanha montagem, serviço e finalização conforme o combinado.'
  }
];

export function PublicHomePage() {
  return (
    <PublicLayout>
      <main id="inicio">
        <HeroSection />
        <TrustBand />
        <EventsSection />
        <HistorySection />
        <MenuSection />
        <GallerySection />
        <ProcessSection />
        <FinalCta />
      </main>
    </PublicLayout>
  );
}

function HeroSection() {
  function updateReveal(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty('--x', `${x}%`);
    event.currentTarget.style.setProperty('--y', `${y}%`);
  }

  return (
    <Hero>
      <HeroCopy>
        <Eyebrow>Paladar Buffet · desde 2014</Eyebrow>
        <h1>Buffet completo para eventos em Brasília</h1>
        <p>
          Cozinha, equipe e estrutura para eventos sociais e corporativos em Brasília/DF e região, com atendimento
          personalizado para cada ocasião.
        </p>
        <HeroActions>
          <PrimaryLink to="/orcamento">Solicitar orçamento</PrimaryLink>
          <TextLink href="#galeria">Ver detalhes</TextLink>
        </HeroActions>
      </HeroCopy>

      <HeroMedia aria-label="Reveal garcom chef" onPointerMove={updateReveal}>
        <img src="/assets/paladar/owner-waiter-hero.png" alt="" />
        <img src="/assets/paladar/owner-chef-hero.png" alt="" />
      </HeroMedia>
    </Hero>
  );
}

function TrustBand() {
  return (
    <Trust aria-label="Diferenciais principais">
      <span>Atendimento personalizado</span>
      <span>Estrutura completa sob consulta</span>
      <span>Brasília/DF e região</span>
    </Trust>
  );
}

function EventsSection() {
  return (
    <Section id="eventos">
      <SectionHeader>
        <span>Eventos</span>
        <h2>Formatos atendidos pelo buffet</h2>
        <p>Quatro frentes principais cobrem eventos sociais, familiares, corporativos e personalizados.</p>
      </SectionHeader>
      <EventGrid>
        {events.map((event) => (
          <EventCard key={event.title}>
            <img src={event.image} alt={event.alt} loading="lazy" />
            <div>
              <h3>{event.title}</h3>
              <p>{event.text}</p>
            </div>
          </EventCard>
        ))}
      </EventGrid>
    </Section>
  );
}

function HistorySection() {
  const storyRef = useRef<HTMLElement>(null);
  const [visibleWords, setVisibleWords] = useState(5);
  const words = [
    'Desde',
    '2014,',
    'o',
    'Paladar',
    'Buffet',
    'atua',
    'em',
    'Brasília',
    'com',
    'alimentação,',
    'equipe',
    'e',
    'estrutura',
    'adaptadas',
    'a',
    'cada',
    'evento.'
  ];

  useEffect(() => {
    const storyElement = storyRef.current;
    if (!storyElement) {
      return undefined;
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reducedMotion?.matches) {
      setVisibleWords(words.length);
      return undefined;
    }

    let frame = 0;

    function update() {
      frame = 0;
      const rect = storyRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const viewportHeight = window.innerHeight || 1;
      const scrollRange = Math.max(1, rect.height - viewportHeight * 0.55);
      const progress = Math.min(1, Math.max(0, (viewportHeight * 0.74 - rect.top) / scrollRange));

      setVisibleWords(Math.max(5, Math.ceil(progress * words.length)));
    }

    function scheduleUpdate() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [words.length]);

  return (
    <Story id="historia" ref={storyRef} aria-labelledby="historia-title">
      <StorySticky>
        <StoryInner>
          <Eyebrow>Nossa história</Eyebrow>
          <StoryStatement id="historia-title">
            {words.map((word, index) => (
              <StoryWord key={`${word}-${index}`} $active={index < visibleWords}>
                {word}
              </StoryWord>
            ))}
          </StoryStatement>
          <StoryMeta>
            <strong>Desde 2014</strong>
            <p>Atendimento em Brasília/DF e região, construído por conversa direta e proposta sob medida.</p>
          </StoryMeta>
        </StoryInner>
      </StorySticky>
    </Story>
  );
}

function MenuSection() {
  return (
    <MenuSectionRoot id="cardapios">
      <SectionHeader>
        <span>Cardápios</span>
        <h2>Composições montadas conforme o evento</h2>
        <p>As categorias orientam a conversa inicial, sem pacotes fixos ou preços públicos.</p>
      </SectionHeader>
      <MenuList aria-label="Categorias de cardapio">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <MenuItem key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <Icon size={20} aria-hidden="true" />
              <strong>{item.title}</strong>
            </MenuItem>
          );
        })}
      </MenuList>
    </MenuSectionRoot>
  );
}

function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const dragRef = useRef<{ startX: number; startProgress: number; maxTranslate: number } | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !viewport || !track) {
      return undefined;
    }

    const sectionElement = section;
    const viewportElement = viewport;
    const trackElement = track;
    let frame = 0;
    let currentProgress = 0;

    function getMetrics() {
      const sectionRect = sectionElement.getBoundingClientRect();
      const sectionTop = window.scrollY + sectionRect.top;
      const availableScroll = Math.max(1, sectionElement.offsetHeight - window.innerHeight);
      const maxTranslate = Math.max(0, trackElement.scrollWidth - viewportElement.clientWidth);

      return { availableScroll, maxTranslate, sectionTop };
    }

    function update() {
      frame = 0;
      const { availableScroll, maxTranslate, sectionTop } = getMetrics();
      const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / availableScroll));
      const nextActiveIndex = Math.min(gallery.length - 1, Math.round(progress * (gallery.length - 1)));
      const isMobile = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 480px)').matches;
      currentProgress = progress;
      const offsetProgress = isMobile ? nextActiveIndex / Math.max(1, gallery.length - 1) : progress;
      const offset = Math.round(offsetProgress * maxTranslate * 100) / 100;

      trackElement.style.setProperty('--gallery-offset', `-${offset}px`);
      setActiveGalleryIndex(nextActiveIndex);
    }

    function scheduleUpdate() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    }

    function handlePointerDown(event: globalThis.PointerEvent) {
      if (!event.isPrimary || event.pointerType === 'mouse') {
        return;
      }

      const { maxTranslate } = getMetrics();
      dragRef.current = { startX: event.clientX, startProgress: currentProgress, maxTranslate };
      viewportElement.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: globalThis.PointerEvent) {
      const drag = dragRef.current;
      if (!drag || !event.isPrimary || drag.maxTranslate <= 0) {
        return;
      }

      const delta = drag.startX - event.clientX;
      const nextProgress = Math.min(1, Math.max(0, drag.startProgress + delta / drag.maxTranslate));
      const { availableScroll, sectionTop } = getMetrics();
      window.scrollTo({ top: sectionTop + availableScroll * nextProgress, behavior: 'auto' });
      scheduleUpdate();
    }

    function handlePointerEnd(event: globalThis.PointerEvent) {
      if (!dragRef.current) {
        return;
      }

      dragRef.current = null;
      if (viewportElement.hasPointerCapture(event.pointerId)) {
        viewportElement.releasePointerCapture(event.pointerId);
      }
    }

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    viewportElement.addEventListener('pointerdown', handlePointerDown);
    viewportElement.addEventListener('pointermove', handlePointerMove);
    viewportElement.addEventListener('pointerup', handlePointerEnd);
    viewportElement.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      viewportElement.removeEventListener('pointerdown', handlePointerDown);
      viewportElement.removeEventListener('pointermove', handlePointerMove);
      viewportElement.removeEventListener('pointerup', handlePointerEnd);
      viewportElement.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, []);

  function goToGalleryCard(index: number) {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const availableScroll = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = index / Math.max(1, gallery.length - 1);

    window.scrollTo({ top: sectionTop + availableScroll * progress, behavior: 'smooth' });
  }

  return (
    <GallerySectionRoot id="galeria" ref={sectionRef}>
      <GallerySticky>
        <GalleryIntro>
          <span>Galeria</span>
          <h2>Detalhes que compõem cada evento</h2>
          <p>Sabores, montagens e detalhes que fazem parte de cada evento.</p>
        </GalleryIntro>
        <GalleryViewport ref={viewportRef} aria-label="Galeria Paladar Buffet">
          <GalleryTrack ref={trackRef}>
            {gallery.map((item, index) => (
              <GalleryCard key={item.src} $active={activeGalleryIndex === index}>
                <img src={item.src} alt={item.title} loading="lazy" />
                <figcaption>
                  <span>{item.label}</span>
                  <strong>{item.title}</strong>
                </figcaption>
              </GalleryCard>
            ))}
          </GalleryTrack>
        </GalleryViewport>
        <GalleryPagination aria-label="Navegação da galeria">
          {gallery.map((item, index) => (
            <button
              key={item.src}
              type="button"
              aria-label={`Ver imagem ${index + 1}: ${item.title}`}
              aria-current={activeGalleryIndex === index}
              onClick={() => goToGalleryCard(index)}
            />
          ))}
        </GalleryPagination>
      </GallerySticky>
    </GallerySectionRoot>
  );
}

function ProcessSection() {
  return (
    <ProcessRoot>
      <SectionHeader>
        <span>Como funciona</span>
        <h2>Um processo claro para uma proposta personalizada</h2>
      </SectionHeader>
      <ProcessList aria-label="Processo de atendimento">
        {processSteps.map((step, index) => (
          <ProcessItem key={step.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </ProcessItem>
        ))}
      </ProcessList>
    </ProcessRoot>
  );
}

function FinalCta() {
  return (
    <CtaSection>
      <div>
        <span>Orçamento personalizado</span>
        <h2>Vamos planejar seu próximo evento?</h2>
        <p>Informe os dados principais e receba atendimento pelos canais oficiais do Paladar Buffet.</p>
      </div>
      <PrimaryLink to="/orcamento">
        Solicitar orçamento
        <ArrowRight size={18} aria-hidden="true" />
      </PrimaryLink>
    </CtaSection>
  );
}

const Hero = styled.section`
  position: relative;
  display: grid;
  min-height: calc(100svh - var(--public-header-height, 76px));
  align-items: center;
  overflow: hidden;
  background: ${({ theme }) => theme.palette.darkGreen};
  isolation: isolate;
  padding: clamp(4.5rem, 7vw, 6.5rem) max(1rem, calc((100vw - 1180px) / 2)) clamp(3.5rem, 6vw, 5.5rem);

  &::before {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: ${({ theme }) =>
      theme.mode === 'light'
        ? `linear-gradient(90deg, rgba(16, 23, 19, 0.70) 0%, rgba(16, 23, 19, 0.58) 24%, rgba(16, 23, 19, 0.36) 46%, rgba(16, 23, 19, 0.15) 65%, rgba(16, 23, 19, 0.04) 79%, rgba(16, 23, 19, 0) 93%)`
        : `linear-gradient(90deg, rgba(16, 23, 19, 0.90) 0%, rgba(16, 23, 19, 0.78) 24%, rgba(16, 23, 19, 0.50) 45%, rgba(16, 23, 19, 0.21) 64%, rgba(16, 23, 19, 0.06) 78%, rgba(16, 23, 19, 0) 92%)`};
    content: '';
    pointer-events: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    min-height: calc(100svh - var(--public-header-height, 68px));
    padding: clamp(2.4rem, 9vw, 4rem) 1rem clamp(2.4rem, 10vw, 4rem);

    &::before {
      background: ${({ theme }) =>
        theme.mode === 'light'
          ? `linear-gradient(180deg, rgba(16, 23, 19, 0.76) 0%, rgba(16, 23, 19, 0.62) 32%, rgba(16, 23, 19, 0.38) 56%, rgba(16, 23, 19, 0.16) 77%, rgba(16, 23, 19, 0.04) 96%)`
          : `linear-gradient(180deg, rgba(16, 23, 19, 0.91) 0%, rgba(16, 23, 19, 0.80) 32%, rgba(16, 23, 19, 0.52) 55%, rgba(16, 23, 19, 0.21) 76%, rgba(16, 23, 19, 0.05) 96%)`};
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 2rem 0.8rem 2.25rem;
  }
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 3;
  display: grid;
  align-content: center;
  max-width: min(40rem, 55vw);
  gap: 1.05rem;
  text-shadow: ${({ theme }) =>
    theme.mode === 'light'
      ? '0 1px 24px rgba(16, 23, 19, 0.62), 0 0 46px rgba(16, 23, 19, 0.42)'
      : '0 1px 24px rgba(16, 23, 19, 0.72), 0 0 42px rgba(16, 23, 19, 0.55)'};

  h1 {
    max-width: 18ch;
    margin: 0;
    color: ${({ theme }) => theme.palette.warmWhite};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(3.25rem, 4.3vw, 4.85rem);
    font-weight: ${({ theme }) => theme.typography.headingWeight};
    line-height: 0.96;
    text-wrap: balance;
  }

  p {
    max-width: 31rem;
    margin: 0;
    color: rgba(247, 245, 239, 0.88);
    font-size: clamp(1rem, 1.4vw, 1.15rem);
    line-height: 1.72;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-width: min(38rem, 62vw);

    h1 {
      max-width: 14ch;
      font-size: clamp(2.85rem, 8vw, 4.6rem);
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.72rem;
    max-width: min(100%, 22rem);

    h1 {
      max-width: 12ch;
      font-size: clamp(2.25rem, 11.2vw, 2.9rem);
      line-height: 1;
    }

    p {
      max-width: 18rem;
      font-size: 0.92rem;
      line-height: 1.5;
    }
  }
`;

const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 0.35rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.55rem;
    margin-top: 0.15rem;
  }
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  min-height: 3.05rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.palette.white};
  font-weight: 900;
  padding: 0 1.35rem;
  text-decoration: none;
  transition:
    transform ${({ theme }) => theme.transitions.fast},
    filter ${({ theme }) => theme.transitions.fast};

  &:hover {
    filter: brightness(0.94);
    transform: translateY(-1px);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 2.75rem;
    font-size: 0.9rem;
    padding-inline: 1rem;
  }
`;

const TextLink = styled.a`
  display: inline-flex;
  min-height: 3.05rem;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.palette.warmWhite};
  font-weight: 900;
  text-decoration: underline;
  text-underline-offset: 0.35em;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 2.75rem;
    font-size: 0.9rem;
  }
`;

const HeroMedia = styled.div`
  --x: 72%;
  --y: 48%;
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: auto;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
  }

  img + img {
    opacity: 0;
    transition: opacity 220ms ease;
    -webkit-mask-image: radial-gradient(circle 230px at var(--x) var(--y), #000 0 42%, rgba(0, 0, 0, 0.72) 58%, transparent 100%);
    mask-image: radial-gradient(circle 230px at var(--x) var(--y), #000 0 42%, rgba(0, 0, 0, 0.72) 58%, transparent 100%);
  }

  &:hover img + img {
    opacity: 1;
  }

  &::before {
    display: none;
  }

  @media (pointer: fine) {
    &:hover {
      cursor: crosshair;
    }
  }

  @media (pointer: coarse) {
    img + img {
      animation: chefCrossfade 9s ease-in-out infinite;
      -webkit-mask-image: none;
      mask-image: none;
    }
  }

  @keyframes chefCrossfade {
    0%,
    42% {
      opacity: 0;
    }
    54%,
    88% {
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
      transition: none;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    img {
      object-position: 58% 30%;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    img {
      object-position: 66% 30%;
    }
  }
`;

const Trust = styled.section`
  display: flex;
  width: min(1180px, calc(100% - 2rem));
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 auto;
  border-block: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: clamp(0.88rem, 1.3vw, 1rem);
  font-weight: 850;
  padding: 1.15rem 0;
  text-transform: uppercase;

  span + span {
    border-left: 1px solid ${({ theme }) => theme.colors.border};
    padding-left: clamp(1rem, 4vw, 3rem);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-start;
    flex-direction: column;

    span + span {
      border-left: 0;
      border-top: 1px solid ${({ theme }) => theme.colors.border};
      padding: 1rem 0 0;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    width: min(100% - 1.25rem, 1180px);
    align-items: stretch;
    gap: 0;
    font-size: 0.76rem;
    padding: 0.55rem 0;

    span {
      box-sizing: border-box;
      display: flex;
      min-height: 2.55rem;
      align-items: center;
      justify-self: stretch;
      position: relative;
      width: 100%;
      inline-size: 100%;
      line-height: 1.15;
      padding: 0;
    }

    span + span {
      border-top: 0;
      padding: 0;
    }

    span + span::before {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 1px;
      background: ${({ theme }) => theme.colors.border};
      content: '';
    }
  }
`;

const Section = styled.section`
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.section} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: min(100% - 1.25rem, 1180px);
    padding: 3.25rem 0;
  }
`;

const SectionHeader = styled.header`
  display: grid;
  gap: 0.65rem;
  margin-bottom: 2rem;

  span {
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    max-width: 16ch;
    margin: 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.25rem, 4.6vw, 4.25rem);
    line-height: 1;
  }

  p {
    max-width: 42rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.7;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.45rem;
    margin-bottom: 1.25rem;

    span {
      font-size: 0.68rem;
    }

    h2 {
      max-width: 15ch;
      font-size: clamp(1.9rem, 10vw, 2.45rem);
      line-height: 0.98;
    }

    p {
      font-size: 0.92rem;
      line-height: 1.5;
    }
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }
`;

const EventCard = styled.article`
  overflow: hidden;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.background};

  img {
    width: 100%;
    aspect-ratio: 4 / 4.65;
    object-fit: cover;
    transition: transform ${({ theme }) => theme.transitions.slow};
  }

  div {
    display: grid;
    gap: 0.55rem;
    padding: 1rem 0 0.9rem;
  }

  h3,
  p {
    margin: 0;
  }

  h3 {
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: 1.05rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.92rem;
    line-height: 1.55;
  }

  &:hover img {
    transform: scale(1.025);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    img {
      aspect-ratio: 4 / 3.25;
    }

    div {
      gap: 0.35rem;
      padding: 0.7rem 0 0.65rem;
    }

    h3 {
      font-size: 0.86rem;
      line-height: 1.15;
    }

    p {
      font-size: 0.74rem;
      line-height: 1.35;
    }
  }
`;

const Story = styled.section`
  min-height: 132svh;
  background: ${({ theme }) => theme.palette.darkGreen};
  color: ${({ theme }) => theme.palette.warmWhite};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    min-height: 118svh;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    min-height: auto;
  }
`;

const StorySticky = styled.div`
  position: sticky;
  top: 0;
  display: grid;
  min-height: 100svh;
  place-items: center;
  padding: 6rem 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding-block: 5rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    position: relative;
    min-height: auto;
    padding-block: 4.5rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-block: 3.35rem;
  }
`;

const StoryInner = styled.div`
  display: grid;
  width: min(960px, 100%);
  gap: 1.8rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 1.2rem;
  }
`;

const StoryStatement = styled.h2`
  display: flex;
  flex-wrap: wrap;
  gap: 0.08em 0.24em;
  margin: 0;
  color: ${({ theme }) => theme.palette.warmWhite};
  font-family: ${({ theme }) => theme.typography.headingFamily};
  font-size: clamp(2.35rem, 6.5vw, 6.4rem);
  line-height: 0.98;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: clamp(2rem, 10.5vw, 2.65rem);
    line-height: 1;
  }
`;

const StoryWord = styled.span<{ $active: boolean }>`
  opacity: ${({ $active }) => ($active ? 1 : 0.34)};
  transition: opacity 320ms ease;
`;

const StoryMeta = styled.div`
  display: grid;
  max-width: 42rem;
  gap: 0.65rem;
  border-top: 1px solid rgba(247, 245, 239, 0.18);
  padding-top: 1.25rem;

  strong {
    color: ${({ theme }) => theme.colors.gold};
    font-size: 0.78rem;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    color: rgba(247, 245, 239, 0.78);
    line-height: 1.75;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.45rem;
    padding-top: 0.9rem;

    strong {
      font-size: 0.68rem;
    }

    p {
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }
`;

const MenuSectionRoot = styled(Section)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const MenuList = styled.ol`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MenuItem = styled.li`
  display: grid;
  grid-template-columns: 3rem 2rem minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textStrong};
  padding: 1.15rem 0;

  span {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 900;
  }

  svg {
    color: ${({ theme }) => theme.colors.gold};
  }

  strong {
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(1.35rem, 2.5vw, 2.2rem);
    line-height: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1.25rem 1rem minmax(0, 1fr);
    gap: 0.22rem 0.32rem;
    align-content: start;
    align-items: center;
    padding: 0.72rem 0;

    span {
      font-size: 0.68rem;
    }

    svg {
      width: 0.9rem;
      height: 0.9rem;
    }

    strong {
      grid-column: 1 / -1;
      font-size: clamp(0.84rem, 3.9vw, 0.98rem);
      line-height: 1.05;
      overflow-wrap: normal;
      word-break: normal;
    }
  }
`;

const GallerySectionRoot = styled.section`
  position: relative;
  min-height: 285svh;
  overflow: clip;
  background: ${({ theme }) => theme.colors.background};

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    width: clamp(2.5rem, 7vw, 6.5rem);
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.background});
    content: '';
    pointer-events: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    min-height: 245svh;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 225svh;
  }
`;

const GallerySticky = styled.div`
  position: sticky;
  top: var(--public-header-height, 76px);
  display: grid;
  min-height: calc(100svh - var(--public-header-height, 76px));
  grid-template-columns: minmax(1rem, 1fr) minmax(18rem, 28rem) minmax(0, 1.9fr);
  align-items: center;
  gap: clamp(1.5rem, 4vw, 3.2rem);
  overflow: hidden;
  padding: clamp(2.8rem, 5vw, 5rem) 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(1rem, 1fr) minmax(0, 46rem) minmax(1rem, 1fr);
    align-content: center;
    gap: 1.5rem;
    padding: 2.5rem 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: calc(100svh - var(--public-header-height, 68px));
    gap: 1rem;
    padding: 1.55rem 0 3.65rem;
  }
`;

const GalleryIntro = styled.header`
  z-index: 3;
  display: grid;
  grid-column: 2;
  gap: 0.85rem;
  align-self: center;
  max-width: 28rem;

  span {
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    max-width: 10ch;
    margin: 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.75rem, 4.8vw, 5rem);
    line-height: 0.96;
    text-wrap: balance;
  }

  p {
    max-width: 25rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.7;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-width: 42rem;

    h2 {
      max-width: 14ch;
      font-size: clamp(2.35rem, 8vw, 4.4rem);
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.45rem;
    width: min(100% - 1.25rem, 28rem);
    margin: 0 auto;

    span {
      font-size: 0.68rem;
    }

    h2 {
      max-width: 12ch;
      font-size: clamp(1.95rem, 9.8vw, 2.55rem);
      line-height: 0.98;
    }

    p {
      max-width: 20rem;
      font-size: 0.9rem;
      line-height: 1.45;
    }
  }
`;

const GalleryViewport = styled.div`
  position: relative;
  z-index: 1;
  grid-column: 3 / -1;
  overflow: hidden;
  touch-action: pan-y;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-column: 1 / -1;
    padding-left: max(1rem, calc((100vw - 46rem) / 2 + 1rem));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-left: 2rem;
  }
`;

const GalleryTrack = styled.div`
  --gallery-offset: 0px;

  display: grid;
  grid-auto-columns: clamp(18rem, 24vw, 25rem);
  grid-auto-flow: column;
  gap: clamp(1.15rem, 2vw, 1.65rem);
  width: max-content;
  padding-right: clamp(7rem, 14vw, 16rem);
  transform: translate3d(var(--gallery-offset), 0, 0);
  transition: transform 90ms linear;
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-auto-columns: minmax(16.5rem, 66vw);
    gap: 1rem;
    padding-right: 28vw;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-auto-columns: minmax(16.5rem, 72vw);
    padding-right: 24vw;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-auto-columns: minmax(13.8rem, 74vw);
    gap: 0.75rem;
    padding-right: 21vw;
  }
`;

const GalleryCard = styled.figure<{ $active: boolean }>`
  position: relative;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.borderStrong : theme.colors.border)};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.panel : 'none')};
  scroll-snap-align: start;
  transform: ${({ $active }) => ($active ? 'translateY(-0.45rem)' : 'translateY(0)')};
  transition:
    border-color ${({ theme }) => theme.transitions.fast},
    box-shadow ${({ theme }) => theme.transitions.fast},
    transform ${({ theme }) => theme.transitions.fast};

  img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    opacity: ${({ $active }) => ($active ? 1 : 0.88)};
    transition: transform ${({ theme }) => theme.transitions.slow};
  }

  figcaption {
    display: grid;
    min-height: 5.35rem;
    align-content: center;
    gap: 0.35rem;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surfaceAlt};
    padding: 0.9rem 1rem;
  }

  span {
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.72rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  strong {
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: clamp(1rem, 1.4vw, 1.18rem);
    line-height: 1.2;
  }

  &:hover img {
    transform: scale(1.025);
    opacity: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    transform: none;

    figcaption {
      min-height: 5rem;
      padding: 0.85rem 0.9rem;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    border-radius: 7px;

    img {
      aspect-ratio: 4 / 4.15;
    }

    figcaption {
      min-height: 4.35rem;
      gap: 0.2rem;
      padding: 0.65rem 0.75rem;
    }

    span {
      font-size: 0.64rem;
    }

    strong {
      font-size: 0.9rem;
      line-height: 1.14;
    }
  }
`;

const GalleryPagination = styled.nav`
  position: absolute;
  right: 50%;
  bottom: clamp(1.2rem, 4vh, 2.5rem);
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 0.48rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  padding: 0.55rem 0.7rem;
  transform: translateX(50%);

  button {
    width: 0.52rem;
    height: 0.52rem;
    border: 0;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.borderStrong};
    padding: 0;
    transition:
      background ${({ theme }) => theme.transitions.fast},
      width ${({ theme }) => theme.transitions.fast};
  }

  button[aria-current='true'] {
    width: 1.55rem;
    background: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    bottom: 0.9rem;
    display: flex;
    gap: 0.38rem;
    padding: 0.45rem 0.58rem;

    button {
      width: 0.48rem;
      height: 0.48rem;
    }

    button[aria-current='true'] {
      width: 1.25rem;
    }
  }
`;

const ProcessRoot = styled(Section)``;

const ProcessList = styled.ol`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const ProcessItem = styled.li`
  display: grid;
  min-height: 13rem;
  grid-template-rows: 2rem 3.5rem 1fr;
  gap: 0.8rem;
  border-top: 1px solid ${({ theme }) => theme.colors.borderStrong};
  padding-top: 1rem;

  span {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 900;
  }

  h3 {
    max-width: 10rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: 1rem;
    line-height: 1.25;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
    line-height: 1.55;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: relative;
    min-height: auto;
    grid-template-columns: 3.5rem 1fr;
    grid-template-rows: auto auto;
    gap: 0.25rem 1rem;
    border-top: 0;
    padding: 0 0 2rem;

    &::before {
      position: absolute;
      top: 2rem;
      bottom: 0.35rem;
      left: 1.15rem;
      width: 1px;
      background: ${({ theme }) => theme.colors.borderStrong};
      content: '';
    }

    &:last-child::before {
      display: none;
    }

    span {
      grid-row: 1 / span 2;
    }

    h3 {
      max-width: none;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 2.6rem 1fr;
    gap: 0.18rem 0.7rem;
    padding-bottom: 1.25rem;

    &::before {
      top: 1.65rem;
      left: 0.92rem;
    }

    span {
      font-size: 0.86rem;
    }

    h3 {
      font-size: 0.92rem;
      line-height: 1.18;
    }

    p {
      font-size: 0.82rem;
      line-height: 1.42;
    }
  }
`;

const CtaSection = styled(Section)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  span {
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    max-width: 17ch;
    margin: 0.4rem 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.35rem, 5vw, 4.4rem);
    line-height: 1;
  }

  p {
    max-width: 36rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.7;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-start;
    flex-direction: column;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 1rem;

    span {
      font-size: 0.68rem;
    }

    h2 {
      max-width: 15ch;
      font-size: clamp(1.9rem, 9.6vw, 2.45rem);
    }

    p {
      font-size: 0.92rem;
      line-height: 1.5;
    }
  }
`;
