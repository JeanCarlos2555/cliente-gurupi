// Logo oficial da Gurupi Telecom (wordmark horizontal).
// Arquivo em frontend/public/logo-gurupi.png
export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <img
      src="/logo-gurupi.png"
      alt="Gurupi Telecom"
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
