import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { api, apiError } from "../lib/api";
import { useToast } from "../components/Toast";
import { Layout } from "../components/Layout";
import { Spinner } from "../components/Spinner";
import { formatBytes, toGB, periodoLabel } from "../lib/format";
import type { ConsumoMes, ConsumoResponse } from "../types";

export function Consumo() {
  const toast = useToast();
  const [meses, setMeses] = useState<ConsumoMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<ConsumoResponse>("/consumo");
        setMeses(data.meses);
      } catch (err) {
        toast("error", apiError(err, "Não foi possível carregar o consumo."));
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const chartData = useMemo(
    () =>
      meses.map((m) => ({
        mes: periodoLabel(m.periodo),
        Download: toGB(m.download),
        Upload: toGB(m.upload),
      })),
    [meses],
  );

  const ultimo = meses[meses.length - 1];
  const totalDownload = meses.reduce((acc, m) => acc + m.download, 0);
  const totalUpload = meses.reduce((acc, m) => acc + m.upload, 0);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Consumo de internet</h1>
        <p className="mt-1 text-sm text-slate-500">
          Acompanhe o quanto sua conexão Gurupi entregou nos últimos meses.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gurupi-500">
          <Spinner className="h-8 w-8" />
        </div>
      ) : meses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
          Ainda não há dados de consumo disponíveis.
        </div>
      ) : (
        <>
          {/* Cards de destaque */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-gurupi-600 to-gurupi-700 p-5 text-white shadow-card">
              <p className="text-sm text-gurupi-100">
                Download em {ultimo ? periodoLabel(ultimo.periodo) : "—"}
              </p>
              <p className="mt-1 text-3xl font-extrabold">
                {ultimo ? formatBytes(ultimo.download) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <p className="text-sm text-slate-500">
                Upload em {ultimo ? periodoLabel(ultimo.periodo) : "—"}
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-800">
                {ultimo ? formatBytes(ultimo.upload) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <p className="text-sm text-slate-500">Total no período</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-800">
                {formatBytes(totalDownload + totalUpload)}
              </p>
            </div>
          </div>

          {/* Gráfico de barras: download x upload por mês */}
          <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Download x Upload por mês</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(v) => `${v} GB`}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} GB`, ""] as [string, string]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="Download" fill="#0f9d58" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Upload" fill="#5ccf92" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de área: evolução do download */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Evolução do download</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f9d58" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0f9d58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(v) => `${v} GB`}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v) => [`${v} GB`, "Download"] as [string, string]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Download"
                    stroke="#0f9d58"
                    strokeWidth={2}
                    fill="url(#gradDown)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
