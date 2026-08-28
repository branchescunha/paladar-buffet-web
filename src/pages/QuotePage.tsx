import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@/components/Button';
import { quoteRequestFormSchema, type QuoteRequestFormData } from '@/features/quote/quote.schemas';
import { PublicLayout } from '@/layouts/PublicLayout';
import { getApiErrorMessage } from '@/services/api';
import { submitQuoteRequest } from '@/services/quote-request.service';

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

  async function onSubmit(data: QuoteRequestFormData) {
    setError('');
    setSuccess(false);
    try {
      await submitQuoteRequest(data);
      setSuccess(true);
      form.reset();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  return (
    <PublicLayout>
      <Main>
        <Intro>
          <span>Orcamento</span>
          <h1>Solicite um orcamento personalizado</h1>
          <p>
            Envie as informacoes principais do evento. O contato comercial acontece pelos canais oficiais do Paladar
            Buffet, sem cadastro publico e sem area de cliente.
          </p>
        </Intro>

        <FormPanel onSubmit={form.handleSubmit(onSubmit)}>
          <Honeypot aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" {...form.register('website')} />
          </Honeypot>

          <FieldGroup>
            <Field>
              <label htmlFor="fullName">Nome completo</label>
              <input id="fullName" autoComplete="name" {...form.register('fullName')} />
              <ErrorText>{form.formState.errors.fullName?.message}</ErrorText>
            </Field>
            <Field>
              <label htmlFor="phone">WhatsApp ou telefone</label>
              <input id="phone" autoComplete="tel" inputMode="tel" {...form.register('phone')} />
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
              <label htmlFor="preferredContact">Preferencia de contato</label>
              <select id="preferredContact" {...form.register('preferredContact')}>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone</option>
              </select>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <label htmlFor="eventType">Tipo de evento</label>
              <select id="eventType" {...form.register('eventType')}>
                <option value="">Selecione</option>
                <option value="casamento">Casamento</option>
                <option value="aniversario">Aniversario</option>
                <option value="corporativo">Corporativo</option>
                <option value="confraternizacao">Confraternizacao</option>
                <option value="churrasco">Churrasco</option>
                <option value="reuniao">Reuniao</option>
                <option value="coffee-break">Coffee break</option>
                <option value="brunch">Brunch</option>
                <option value="outro">Outro</option>
              </select>
              <ErrorText>{form.formState.errors.eventType?.message}</ErrorText>
            </Field>
            <Field>
              <label htmlFor="eventTypeOther">Outro tipo de evento</label>
              <input id="eventTypeOther" {...form.register('eventTypeOther')} />
              <ErrorText>{form.formState.errors.eventTypeOther?.message}</ErrorText>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <label htmlFor="eventDate">Data prevista</label>
              <input id="eventDate" type="date" {...form.register('eventDate')} />
            </Field>
            <Field>
              <label htmlFor="guestCount">Quantidade estimada de convidados</label>
              <input id="guestCount" type="number" min="1" inputMode="numeric" {...form.register('guestCount')} />
              <ErrorText>{form.formState.errors.guestCount?.message}</ErrorText>
            </Field>
          </FieldGroup>

          <Field>
            <label htmlFor="location">Localidade do evento</label>
            <input id="location" placeholder="Brasilia-DF, entorno ou local a definir" {...form.register('location')} />
          </Field>

          <CheckboxGroup>
            <legend>Interesses de cardapio</legend>
            {['jantar', 'churrasco', 'coffee-break', 'brunch', 'sobremesas'].map((value) => (
              <label key={value}>
                <input type="checkbox" value={value} {...form.register('menuPreferences')} />
                {formatOption(value)}
              </label>
            ))}
          </CheckboxGroup>

          <CheckboxGroup>
            <legend>Estrutura desejada</legend>
            {['garcons', 'loucas', 'montagem', 'bebidas'].map((value) => (
              <label key={value}>
                <input type="checkbox" value={value} {...form.register('serviceNeeds')} />
                {formatOption(value)}
              </label>
            ))}
          </CheckboxGroup>

          <Field>
            <label htmlFor="dietaryRestrictions">Restricoes alimentares</label>
            <textarea id="dietaryRestrictions" rows={3} {...form.register('dietaryRestrictions')} />
          </Field>

          <Field>
            <label htmlFor="message">Observacoes</label>
            <textarea id="message" rows={5} {...form.register('message')} />
          </Field>

          <Consent>
            <input id="acceptedPrivacy" type="checkbox" {...form.register('acceptedPrivacy')} />
            <label htmlFor="acceptedPrivacy">
              Li e aceito a <Link to="/privacidade">politica de privacidade</Link>.
            </label>
          </Consent>
          <ErrorText>{form.formState.errors.acceptedPrivacy?.message}</ErrorText>

          {error ? <SubmitError role="alert">{error}</SubmitError> : null}
          {success ? (
            <Success role="status">
              <CheckCircle2 size={20} />
              Solicitacao recebida. O atendimento sera feito pelos canais oficiais informados.
            </Success>
          ) : null}

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar solicitacao'}
          </Button>
        </FormPanel>
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
    garcons: 'Garcons',
    loucas: 'Loucas',
    montagem: 'Montagem',
    bebidas: 'Bebidas'
  };

  return labels[value] ?? value;
}

const Main = styled.main`
  display: grid;
  width: min(980px, calc(100% - 2rem));
  gap: 2rem;
  margin: 0 auto;
  padding: clamp(3rem, 8vw, 6rem) 0;
`;

const Intro = styled.header`
  display: grid;
  gap: 0.75rem;

  span {
    color: ${({ theme }) => theme.colors.paladarOrange};
    font-weight: 900;
    text-transform: uppercase;
  }

  h1 {
    max-width: 12ch;
    margin: 0;
    color: ${({ theme }) => theme.colors.deepGreen};
    font-family: ${({ theme }) => theme.typography.headingFamily};
    font-size: clamp(2.8rem, 8vw, 5.5rem);
    line-height: 0.98;
  }

  p {
    max-width: 42rem;
    margin: 0;
    line-height: 1.75;
  }
`;

const FormPanel = styled.form`
  display: grid;
  gap: 1.1rem;
  border: 1px solid rgba(19, 36, 21, 0.12);
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  padding: clamp(1rem, 3vw, 2rem);
  box-shadow: ${({ theme }) => theme.shadows.panel};
`;

const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 0.4rem;

  label {
    color: ${({ theme }) => theme.colors.deepGreen};
    font-weight: 900;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid rgba(19, 36, 21, 0.18);
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.colors.warmWhite};
    color: ${({ theme }) => theme.colors.neutralText};
    padding: 0.85rem 0.9rem;
  }

  textarea {
    resize: vertical;
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
    color: ${({ theme }) => theme.colors.deepGreen};
    font-weight: 900;
    margin-bottom: 0.25rem;
  }

  label {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    border: 1px solid rgba(19, 36, 21, 0.14);
    border-radius: ${({ theme }) => theme.radius.sm};
    padding: 0.6rem 0.75rem;
  }
`;

const Consent = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;

  a {
    color: ${({ theme }) => theme.colors.deepGreen};
    font-weight: 900;
  }
`;

const ErrorText = styled.p`
  min-height: 1.1rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.88rem;
`;

const SubmitError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
`;

const Success = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.deepGreen};
  font-weight: 900;
`;

const Honeypot = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;
