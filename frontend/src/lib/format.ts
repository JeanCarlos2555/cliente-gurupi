// Helpers de formatação (pt-BR)

export function formatBRL(value: string | number | null | undefined): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// "2026-05-15" -> "15/05/2026"
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

// dias de atraso (positivo = vencida há X dias)
export function diasAtraso(due: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(due.slice(0, 10) + "T00:00:00");
  return Math.round((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24));
}

// CPF/CNPJ: máscara visual conforme tamanho
export function maskCpfCnpj(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 14);
  if (v.length <= 11) {
    return v
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return v
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

// Bytes -> "298.34 GB" / "1.60 TB" (base binária, igual ao provedor)
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 GB";
  const gb = bytes / 1024 ** 3;
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`;
  return `${gb.toFixed(2)} GB`;
}

// Bytes -> número em GB (para os eixos/valores dos gráficos)
export function toGB(bytes: number): number {
  return Number((bytes / 1024 ** 3).toFixed(2));
}

// "03/26" -> "Mar/26"
export function periodoLabel(periodo: string): string {
  const [mes, ano] = periodo.split("/");
  const nomes = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const idx = Number(mes) - 1;
  return `${nomes[idx] ?? mes}/${ano}`;
}
