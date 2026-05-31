import type { FaturaStatus } from "../types";

const MAP: Record<FaturaStatus, { label: string; className: string }> = {
  pago: { label: "Pago", className: "bg-gurupi-100 text-gurupi-700" },
  vencido: { label: "Vencido", className: "bg-red-100 text-red-700" },
  a_vencer: { label: "A vencer", className: "bg-amber-100 text-amber-700" },
};

export function StatusBadge({ status }: { status: FaturaStatus }) {
  const { label, className } = MAP[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
