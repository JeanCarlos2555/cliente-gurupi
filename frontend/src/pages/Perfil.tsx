import { useEffect, useState } from "react";
import { api, apiError } from "../lib/api";
import { useToast } from "../components/Toast";
import { Layout } from "../components/Layout";
import { Spinner } from "../components/Spinner";
import { maskCpfCnpj } from "../lib/format";
import type { Perfil as PerfilData } from "../types";

// Linha de dado somente-leitura (rótulo + valor).
function Campo({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 break-all text-base font-medium text-slate-800">
        {value ? value : <span className="font-normal text-slate-400">Não informado</span>}
      </dd>
    </div>
  );
}

export function Perfil() {
  const toast = useToast();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<PerfilData>("/cliente/perfil");
        setPerfil(data);
      } catch (err) {
        toast("error", apiError(err, "Não foi possível carregar seus dados."));
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const cpfCnpj = perfil?.cpf_cnpj ? maskCpfCnpj(perfil.cpf_cnpj) : null;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Meus dados</h1>
        <p className="mt-1 text-sm text-slate-500">Informações do seu cadastro</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gurupi-500">
          <Spinner className="h-8 w-8" />
        </div>
      ) : !perfil ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
          Não foi possível carregar seus dados.
        </div>
      ) : (
        <div className="mx-auto max-w-xl">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gurupi-50 text-gurupi-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                <path
                  d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-center text-lg font-bold text-slate-800">
              {perfil.name ?? "Cliente"}
            </p>

            <dl className="mt-2 w-full">
              <Campo label="Nome" value={perfil.name} />
              <Campo label="E-mail" value={perfil.email} />
              <Campo label="CPF / CNPJ" value={cpfCnpj} />
            </dl>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Para alterar seus dados, entre em contato com a Gurupi Telecom.
          </p>
        </div>
      )}
    </Layout>
  );
}
