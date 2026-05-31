import { useEffect, useState } from "react";
import { api, apiError } from "../lib/api";
import { useToast } from "../components/Toast";
import { Layout } from "../components/Layout";
import { Spinner } from "../components/Spinner";
import { FaturaCard } from "../components/FaturaCard";
import type { Fatura, FaturaStatus, FaturasResponse } from "../types";

type Filtro = "todas" | FaturaStatus;

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "vencido", label: "Vencidas" },
  { key: "a_vencer", label: "A vencer" },
  { key: "pago", label: "Pagas" },
];

export function Faturas() {
  const toast = useToast();

  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  useEffect(() => {
    (async () => {
      try {
        // Histórico completo, mais recentes primeiro
        const { data } = await api.get<FaturasResponse>("/faturas");
        setFaturas(data.faturas);
      } catch (err) {
        toast("error", apiError(err, "Não foi possível carregar suas faturas."));
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const visiveis = filtro === "todas" ? faturas : faturas.filter((f) => f.status === filtro);

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Todas as faturas</h1>
          <p className="mt-1 text-sm text-slate-500">{visiveis.length} fatura(s)</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                filtro === f.key
                  ? "bg-gurupi-500 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gurupi-500">
          <Spinner className="h-8 w-8" />
        </div>
      ) : visiveis.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
          Nenhuma fatura nesta categoria.
        </div>
      ) : (
        <div className="space-y-4">
          {visiveis.map((f) => (
            <FaturaCard key={f.id} fatura={f} />
          ))}
        </div>
      )}
    </Layout>
  );
}
