import { useState } from "react";
import type { Fatura } from "../types";
import { formatBRL, formatDate, diasAtraso } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { useToast } from "./Toast";

export function FaturaCard({ fatura }: { fatura: Fatura }) {
  const toast = useToast();
  const [showPix, setShowPix] = useState(false);

  const atraso = fatura.status === "vencido" ? diasAtraso(fatura.due_date) : 0;

  async function copy(text: string | null, label: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast("success", `${label} copiado!`);
    } catch {
      toast("error", "Não foi possível copiar.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500">{fatura.description}</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-800">{formatBRL(fatura.value)}</p>
        </div>
        <StatusBadge status={fatura.status} />
      </div>

      <div className="mt-2 text-sm text-slate-500">
        Vence em <span className="font-semibold">{formatDate(fatura.due_date)}</span>
        {atraso > 0 && (
          <span className="ml-1 font-semibold text-red-600">· há {atraso} dia(s)</span>
        )}
        {fatura.status === "pago" && fatura.date_payment && (
          <span className="ml-1 text-gurupi-700">· Pago em {formatDate(fatura.date_payment)}</span>
        )}
      </div>

      {fatura.status !== "pago" && (
        <>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {fatura.pix_copia_cola && (
              <button
                onClick={() => setShowPix((v) => !v)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gurupi-500 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-gurupi-600 sm:w-auto sm:py-2"
              >
                {showPix ? "Ocultar PIX" : "Pagar com PIX"}
              </button>
            )}
            {fatura.barcode && (
              <button
                onClick={() => copy(fatura.barcode, "Código de barras")}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:py-2"
              >
                Copiar cód. de barras
              </button>
            )}
            {fatura.link && (
              <a
                href={fatura.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:py-2"
              >
                Abrir boleto
              </a>
            )}
          </div>

          {showPix && fatura.pix_copia_cola && (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-gurupi-50 p-4 sm:flex-row sm:items-center">
              {fatura.pix_qr_code_img && (
                <img
                  src={fatura.pix_qr_code_img}
                  alt="QR Code PIX"
                  className="h-40 w-40 rounded-lg bg-white p-2 shadow-sm"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gurupi-700">PIX copia e cola</p>
                <p className="mt-1 break-all rounded-lg bg-white p-2 text-xs text-slate-600">
                  {fatura.pix_copia_cola}
                </p>
                <button
                  onClick={() => copy(fatura.pix_copia_cola, "Código PIX")}
                  className="mt-2 w-full rounded-lg bg-gurupi-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gurupi-600 sm:w-auto"
                >
                  Copiar código PIX
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
