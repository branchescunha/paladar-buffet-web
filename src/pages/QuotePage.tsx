import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Handshake, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@/components/Button';
import {
  menuPreferenceValues,
  formatBrazilianPhone,
  quoteRequestFormSchema,
  serviceNeedValues,
  type QuoteRequestFormData
} from '@/features/quote/quote.schemas';
import { PublicLayout } from '@/layouts/PublicLayout';
import { submitQuoteRequest } from '@/services/quote-request.service';

const publicSubmitErrorMessage =
  'Não foi possível enviar sua solicitação agora. Tente novamente em instantes ou fale conosco pelo WhatsApp.';

export function QuotePage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const form = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      eventType: undefined,
      eventTypeOther: '',
      eventDate: '',
      eventTime: '',
      guestCount: undefined,
      location: '',
      message: '',
      preferredContact: 'whatsapp',
      menuPreferences: [],
      serviceNeeds: [],
      dietaryRestrictions: '',
      acceptedPrivacy: false,
      website: ''
    }
  });
  const acceptedPrivacy = form.watch('acceptedPrivacy');
  const selectedEventType = form.watch('eventType');
  const isCustomEventType = selectedEventType === 'outro';
  const phoneRegistration = form.register('phone');

  useEffect(() => {
    if (!isCustomEventType) {
      form.setValue('eventTypeOther', '');
    }
  }, [form, isCustomEventType]);

  async function onSubmit(data: QuoteRequestFormData) {
    setError('');
    setSuccess(false);
    try {
      await submitQuoteRequest(data);
      setSuccess(true);
      form.reset();
    } catch {
      setError(publicSubmitErrorMessage);
    }
  }

  return (
    <PublicLayout>
      <Main>
        <Intro>
          <span>Orçamento</span>
          <h1>Solicite um orçamento personalizado</h1>
          <p>
            Conte os principais detalhes do seu evento e entraremos em contato para preparar uma proposta personalizada.
          </p>
        </Intro>

        <ContentGrid>
          <Aside>
            <AsideItem>
              <Handshake size={22} />
              <div>
                <strong>Atendimento personalizado</strong>
                <p>Cada solicitação é analisada de acordo com as características do evento.</p>
              </div>
            </AsideItem>
            <AsideItem>
              <Sparkles size={22} />
              <div>
                <strong>Proposta sob medida</strong>
                <p>Cardápio, estrutura e serviço são definidos conforme as necessidades do evento.</p>
              </div>
            </AsideItem>
          </Aside>

          <FormPanel onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <Honeypot aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" {...form.register('website')} />
            </Honeypot>

            <GroupTitle>Dados de contato</GroupTitle>
            <FieldGroup>
              <Field>
                <label htmlFor="fullName">Nome completo</label>
                <input id="fullName" autoComplete="name" required {...form.register('fullName')} />
                <ErrorText>{form.formState.errors.fullName?.message}</ErrorText>
              </Field>
              <Field>
                <label htmlFor="phone">WhatsApp ou telefone</label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={15}
                  required
                  {...phoneRegistration}
                  onChange={(event) => {
                    form.setValue('phone', formatBrazilianPhone(event.target.value), {
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                  onPaste={(event) => {
                    event.preventDefault();
                    const pastedText = event.clipboardData?.getData('text') ?? '';
                    form.setValue('phone', formatBrazilianPhone(pastedText), {
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                />
                <ErrorText>{form.formState.errors.phone?.message}</ErrorText>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" autoComplete="email" {...form.register('email')} />
                <ErrorText>{form.formState.errors.email?.message}</ErrorText>
              </Field>
              <Field>
                <label htmlFor="preferredContact">Preferência de contato</label>
                <select id="preferredContact" {...form.register('preferredContact')}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                </select>
              </Field>
            </FieldGroup>

            <GroupTitle>Dados do evento</GroupTitle>
            <FieldGroup>
              <Field $spanAll={!isCustomEventType}>
                <label htmlFor="eventType">Tipo de evento</label>
                <select id="eventType" required {...form.register('eventType')}>
                  <option value="">Selecione</option>
                  <option value="casamento">Casamento</option>
                  <option value="aniversario">Aniversário</option>
                  <option value="corporativo">Corporativo</option>
                  <option value="confraternizacao">Confraternização</option>
                  <option value="churrasco">Churrasco</option>
                  <option value="reuniao">Reunião</option>
                  <option value="coffee-break">Coffee break</option>
                  <option value="brunch">Brunch</option>
                  <option value="outro">Outro</option>
                </select>
                <ErrorText>{form.formState.errors.eventType?.message}</ErrorText>
              </Field>
              {isCustomEventType ? (
                <Field>
                  <label htmlFor="eventTypeOther">Outro tipo de evento</label>
                  <input id="eventTypeOther" {...form.register('eventTypeOther')} />
                  <ErrorText>{form.formState.errors.eventTypeOther?.message}</ErrorText>
                </Field>
              ) : null}
            </FieldGroup>

            <FieldGroup>
              <Field>
                <label htmlFor="eventDate">Data prevista</label>
                <input id="eventDate" type="date" {...form.register('eventDate')} />
              </Field>
              <Field>
                <label htmlFor="eventTime">Horário previsto</label>
                <input id="eventTime" type="time" required {...form.register('eventTime')} />
                <ErrorText>{form.formState.errors.eventTime?.message}</ErrorText>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <label htmlFor="guestCount">Quantidade estimada de convidados</label>
                <input id="guestCount" type="number" min="1" inputMode="numeric" required {...form.register('guestCount')} />
                <ErrorText>{form.formState.errors.guestCount?.message}</ErrorText>
              </Field>
              <Field>
                <label htmlFor="location">Localidade do evento</label>
                <input id="location" placeholder="Brasília/DF, entorno ou local a definir" {...form.register('location')} />
              </Field>
            </FieldGroup>

            <GroupTitle>Preferências</GroupTitle>
            <CheckboxGroup>
              <legend>Interesses de cardápio</legend>
              {menuPreferenceValues.map((value) => (
                <label key={value}>
                  <input type="checkbox" value={value} {...form.register('menuPreferences')} />
                  {formatOption(value)}
                </label>
              ))}
            </CheckboxGroup>

            <CheckboxGroup>
              <legend>Estrutura desejada</legend>
              {serviceNeedValues.map((value) => (
                <label key={value}>
                  <input type="checkbox" value={value} {...form.register('serviceNeeds')} />
                  {formatOption(value)}
                </label>
              ))}
            </CheckboxGroup>

            <GroupTitle>Observações e consentimento</GroupTitle>
            <Field>
              <label htmlFor="dietaryRestrictions">Restrições alimentares</label>
              <textarea id="dietaryRestrictions" rows={3} {...form.register('dietaryRestrictions')} />
            </Field>

            <Field>
              <label htmlFor="message">Observações</label>
              <textarea id="message" rows={5} {...form.register('message')} />
            </Field>

            <Consent>
              <input id="acceptedPrivacy" type="checkbox" {...form.register('acceptedPrivacy')} />
              <label htmlFor="acceptedPrivacy">
                Li e aceito a <Link to="/privacidade">política de privacidade</Link>.
              </label>
            </Consent>
            <ErrorText>{form.formState.errors.acceptedPrivacy?.message}</ErrorText>

            {error ? <SubmitError role="alert">{error}</SubmitError> : null}
            {success ? (
              <Success role="status">
                <CheckCircle2 size={20} />
                Solicitação recebida. O atendimento será feito pelos canais oficiais informados.
              </Success>
            ) : null}

            <SubmitButton type="submit" disabled={!acceptedPrivacy || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
            </SubmitButton>
          </FormPanel>
        </ContentGrid>
      </Main>
    </PublicLayout>
  );
}

function formatOption(value: string) {
  const labels: Record<string, string> = {
    jantar: 'Jantar',
    churrasco: 'Churrasco',
    'coffee-break': 'Coffee break',
    brunch: 'Brunch',
    sobremesas: 'Sobremesas',
    garcons: 'Garçons',
    loucas: 'Louças',
    montagem: 'Montagem',
    bebidas: 'Bebidas'
  };

  return labels[value] ?? value;
}

const Main = styled.main`
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(7rem, 12vw, 10rem) 0 ${({ theme }) => theme.spacing.section};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: min(100% - 1.25rem, 1180px);
    padding: 5.1rem 0 3.25rem;
  }
`;

const Intro = styled.header`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 2rem;

  span {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 900;
    text-transform: uppercase;
  }

  h1 {
    max-width: 14ch;
    margin: 0;
    color: ${({ theme }) => theme.colors.textStrong};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.7rem, 6vw, 5rem);
    line-height: 1;
  }

  p {
    max-width: 44rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.75;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.5rem;
    margin-bottom: 1.2rem;

    span {
      font-size: 0.68rem;
    }

    h1 {
      max-width: 13ch;
      font-size: clamp(2rem, 10vw, 2.55rem);
      line-height: 0.98;
    }

    p {
      font-size: 0.92rem;
      line-height: 1.5;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(14rem, 0.38fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.9rem;
  }
`;

const Aside = styled.aside`
  display: grid;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.65rem;
  }
`;

const AsideItem = styled.article`
  display: flex;
  gap: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  padding: 1rem;

  svg {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.accent};
  }

  strong {
    color: ${({ theme }) => theme.colors.textStrong};
  }

  p {
    margin: 0.35rem 0 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.92rem;
    line-height: 1.55;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.6rem;
    padding: 0.75rem;

    svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    strong {
      font-size: 0.9rem;
    }

    p {
      margin-top: 0.2rem;
      font-size: 0.82rem;
      line-height: 1.35;
    }
  }
`;

const FormPanel = styled.form`
  position: relative;
  display: grid;
  gap: 1.1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  padding: clamp(1rem, 3vw, 2rem);
  box-shadow: ${({ theme }) => theme.shadows.panel};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.8rem;
    padding: 0.9rem;
  }
`;

const GroupTitle = styled.h2`
  margin: 0.45rem 0 -0.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 0.82rem;
  font-weight: 900;
  padding-top: 1rem;
  text-transform: uppercase;

  &:first-of-type {
    margin-top: 0;
    border-top: 0;
    padding-top: 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin: 0.25rem 0 -0.2rem;
    font-size: 0.72rem;
    padding-top: 0.75rem;
  }
`;

const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.75rem;
  }
`;

const Field = styled.div<{ $spanAll?: boolean }>`
  display: grid;
  grid-column: ${({ $spanAll }) => ($spanAll ? '1 / -1' : 'auto')};
  align-content: start;
  gap: 0.4rem;
  min-width: 0;

  label {
    color: ${({ theme }) => theme.colors.textStrong};
    font-weight: 900;
  }

  input,
  select,
  textarea {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.elevated};
    color: ${({ theme }) => theme.colors.text};
    font: inherit;
    font-size: 0.98rem;
    line-height: 1.35;
    padding: 0 0.9rem;
  }

  input,
  select {
    height: 3.2rem;
    min-height: 3.2rem;
  }

  select {
    appearance: none;
    background-image:
      linear-gradient(45deg, transparent 50%, ${({ theme }) => theme.colors.textMuted} 50%),
      linear-gradient(135deg, ${({ theme }) => theme.colors.textMuted} 50%, transparent 50%);
    background-position:
      calc(100% - 1.1rem) 50%,
      calc(100% - 0.82rem) 50%;
    background-repeat: no-repeat;
    background-size:
      0.32rem 0.32rem,
      0.32rem 0.32rem;
    padding-right: 2.25rem;
  }

  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    border-color: ${({ theme }) => theme.colors.focus};
  }

  textarea {
    min-height: 7.6rem;
    padding-block: 0.85rem;
    resize: vertical;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.28rem;

    label {
      font-size: 0.88rem;
    }

    input,
    select,
    textarea {
      font-size: 0.92rem;
      padding-inline: 0.75rem;
    }

    input,
    select {
      height: 2.85rem;
      min-height: 2.85rem;
    }

    textarea {
      min-height: 6.2rem;
      padding-block: 0.7rem;
    }
  }
`;

const SubmitButton = styled(Button)`
  &:disabled {
    background: ${({ theme }) => theme.colors.surfaceAlt};
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: not-allowed;
    filter: none;
    opacity: 1;
    transform: none;
  }
`;

const CheckboxGroup = styled.fieldset`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  border: 0;
  margin: 0;
  padding: 0;

  legend {
    width: 100%;
    color: ${({ theme }) => theme.colors.textStrong};
    font-weight: 900;
    margin-bottom: 0.25rem;
  }

  label {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.pill};
    background: ${({ theme }) => theme.colors.elevated};
    color: ${({ theme }) => theme.colors.textStrong};
    padding: 0.6rem 0.75rem;
  }

  input {
    accent-color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.45rem;

    legend {
      font-size: 0.88rem;
      margin-bottom: 0.1rem;
    }

    label {
      gap: 0.34rem;
      font-size: 0.82rem;
      line-height: 1.2;
      padding: 0.48rem 0.58rem;
    }
  }
`;

const Consent = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  color: ${({ theme }) => theme.colors.textMuted};

  a {
    color: ${({ theme }) => theme.colors.textStrong};
    font-weight: 900;
  }

  input {
    margin-top: 0.2rem;
    accent-color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 0.45rem;
    font-size: 0.86rem;
    line-height: 1.35;
  }
`;

const ErrorText = styled.p`
  min-height: 1.1rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.88rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-height: 0.95rem;
    font-size: 0.78rem;
  }
`;

const SubmitError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.86rem;
    line-height: 1.35;
  }
`;

const Success = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.textStrong};
  font-weight: 900;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    align-items: flex-start;
    font-size: 0.86rem;
    line-height: 1.35;
  }
`;

const Honeypot = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;
