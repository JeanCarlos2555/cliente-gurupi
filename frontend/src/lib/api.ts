import axios from "axios";

// Cliente HTTP do portal. Fala SOMENTE com o nosso backend porteiro,
// nunca com a API do provedor. withCredentials envia o cookie httpOnly de sessão.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3030/api",
  withCredentials: true,
});

// Mensagem de erro amigável a partir da resposta do backend
export function apiError(err: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { erro?: string })?.erro ?? fallback;
  }
  return fallback;
}
