import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiError } from "../lib/api";
import { maskCpfCnpj, onlyDigits } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Logo } from "../components/Logo";
import { Spinner } from "../components/Spinner";
import type { LoginResponse } from "../types";

type Step = "cpf" | "otp";

export function Login() {
  const navigate = useNavigate();
  const { refresh, setCustomer } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState<Step>("cpf");
  const [cpf, setCpf] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCpf(e: React.FormEvent) {
    e.preventDefault();
    if (onlyDigits(cpf).length < 11) {
      toast("error", "Informe um CPF/CNPJ válido.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        cpf_cnpj: onlyDigits(cpf),
      });

      if (data.otp_required) {
        setChallengeId(data.challenge_id ?? "");
        setMaskedEmail(data.email ?? "");
        setStep("otp");
        toast("info", "Enviamos um código para o seu e-mail.");
      } else {
        if (data.customer) setCustomer(data.customer);
        await refresh();
        navigate("/");
      }
    } catch (err) {
      toast("error", apiError(err, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast("error", "Digite o código recebido.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>("/auth/verify-otp", {
        challenge_id: challengeId,
        code: code.trim(),
      });
      if (data.customer) setCustomer(data.customer);
      await refresh();
      navigate("/");
    } catch (err) {
      toast("error", apiError(err, "Código inválido."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full">
      {/* Lado da marca */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-gurupi-700 via-gurupi-600 to-gurupi-800 lg:flex">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-white/5" />
        <div className="relative z-10 max-w-md px-10 text-white">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-gurupi-100">
            Bem-vindo à
          </h1>
          <h2 className="mt-2 text-5xl font-extrabold leading-tight">
            CENTRAL
            <br />
            DO CLIENTE <span className="text-gurupi-200">;)</span>
          </h2>
          <p className="mt-6 text-gurupi-100">
            Acompanhe suas faturas, pague com PIX em segundos e fique sempre conectado na
            velocidade da sua imaginação.
          </p>
        </div>
      </div>

      {/* Lado do formulário */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Logo className="h-14" />
          </div>

          {step === "cpf" ? (
            <form onSubmit={handleCpf} className="space-y-5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800">Acesse sua conta</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Informe seu CPF ou CNPJ para continuar
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">CPF / CNPJ</label>
                <input
                  autoFocus
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) => setCpf(maskCpfCnpj(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-gurupi-500 focus:ring-2 focus:ring-gurupi-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gurupi-500 py-3 font-semibold text-white transition hover:bg-gurupi-600 disabled:opacity-60"
              >
                {loading ? <Spinner /> : "Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-5">
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800">Verificação</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Digite o código enviado para
                  <br />
                  <span className="font-semibold text-slate-700">{maskedEmail}</span>
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Código de verificação
                </label>
                <input
                  autoFocus
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-slate-800 outline-none transition focus:border-gurupi-500 focus:ring-2 focus:ring-gurupi-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gurupi-500 py-3 font-semibold text-white transition hover:bg-gurupi-600 disabled:opacity-60"
              >
                {loading ? <Spinner /> : "Validar e entrar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("cpf");
                  setCode("");
                }}
                className="w-full text-center text-sm font-medium text-slate-500 hover:text-gurupi-600"
              >
                ← Voltar
              </button>
            </form>
          )}

          <p className="mt-10 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Gurupi Telecom · Na velocidade da sua imaginação
          </p>
        </div>
      </div>
    </div>
  );
}
