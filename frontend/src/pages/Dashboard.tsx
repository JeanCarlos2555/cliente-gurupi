import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import { api, apiError } from "../lib/api";
import { useToast } from "../components/Toast";
import { Layout } from "../components/Layout";
import { Spinner } from "../components/Spinner";
import { FaturaCard } from "../components/FaturaCard";
import { formatBRL, formatBytes, toGB, periodoLabel } from "../lib/format";
import type { Fatura, FaturasResponse, ConsumoMes, ConsumoResponse } from "../types";

export function Dashboard() {
  const toast = useToast();

  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [meses, setMeses] = useState<ConsumoMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Resumo de cobranças (vencidas/a vencer) + consumo, em paralelo
        const [fat, cons] = await Promise.all([
          api.get<FaturasResponse>("/faturas/resumo"),
          api.get<ConsumoResponse>("/consumo"),
        ]);
        setFaturas(fat.data.faturas);
        setMeses(cons.data.meses);
      } catch (err) {
        toast("error", apiError(err, "Não foi possível carregar seus dados."));
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const emAberto = faturas.filter((f) => f.status !== "pago");
  const totalAberto = emAberto.reduce((acc, f) => acc + Number(f.value), 0);

  const ultimo = meses[meses.length - 1];
  const miniChart = useMemo(
    () =>
      meses.map((m, i) => ({
        mes: periodoLabel(m.periodo),
        gb: toGB(m.download),
        ultimo: i === meses.length - 1,
      })),
    [meses],
  );

  return (
    <Layout>
      {/* Cards de resumo */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-gurupi-600 to-gurupi-700 p-5 text-white shadow-card">
          <p className="text-sm text-gurupi-100">Total em aberto</p>
          <p className="mt-1 text-3xl font-extrabold">{formatBRL(totalAberto)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Faturas em aberto</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-800">{emAberto.length}</p>
        </div>

        {/* Resumo de consumo do último mês com mini-gráfico */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Consumo em {ultimo ? periodoLabel(ultimo.periodo) : "—"}
              </p>
              <p className="mt-1 text-3xl font-extrabold text-gurupi-600">
                {ultimo ? formatBytes(ultimo.download) : "—"}
              </p>
              <p className="text-xs text-slate-400">de download</p>
            </div>
            {miniChart.length > 0 && (
              <div className="h-16 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={miniChart}>
                    <XAxis dataKey="mes" hide />
                    <Bar dataKey="gb" radius={[3, 3, 0, 0]}>
                      {miniChart.map((d, i) => (
                        <Cell key={i} fill={d.ultimo ? "#0f9d58" : "#c9f0db"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <Link
            to="/consumo"
            className="mt-2 inline-block text-sm font-semibold text-gurupi-600 transition hover:text-gurupi-700"
          >
            Ver consumo →
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h2 className="text-lg font-bold text-slate-800">Cobranças vencidas ou a vencer</h2>
        <Link
          to="/faturas"
          className="shrink-0 whitespace-nowrap text-sm font-semibold text-gurupi-600 transition hover:text-gurupi-700"
        >
          Ver todas as faturas →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gurupi-500">
          <Spinner className="h-8 w-8" />
        </div>
      ) : faturas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
          Nenhuma cobrança em aberto. 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {faturas.map((f) => (
            <FaturaCard key={f.id} fatura={f} />
          ))}
        </div>
      )}
    </Layout>
  );
}
