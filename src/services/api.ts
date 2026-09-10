import axios from 'axios';
import { env } from '@/config/env';

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const csrfToken = readCookie('paladar_csrf');
  if (csrfToken) {
    config.headers.set('x-csrf-token', csrfToken);
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message;
    return typeof message === 'string' ? message : 'Não foi possível concluir a operação.';
  }

  if (isApiErrorLike(error)) {
    return error.response.data.error.message;
  }

  return 'Não foi possível concluir a operação.';
}

function isApiErrorLike(error: unknown): error is { response: { data: { error: { message: string } } } } {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { response?: { data?: { error?: { message?: unknown } } } };
  return typeof maybeError.response?.data?.error?.message === 'string';
}

function readCookie(name: string): string | null {
  const value = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`))
    ?.split('=')[1];

  return value ? decodeURIComponent(value) : null;
}
