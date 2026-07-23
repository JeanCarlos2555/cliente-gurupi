import { useEffect, useState } from "react";

// Evento disparado pelo Chrome/Edge/Android quando o app pode ser instalado.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "gurupi:pwa-dispensado";

const estaInstalado = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // Safari no iOS usa esta propriedade não padronizada
  (navigator as { standalone?: boolean }).standalone === true;

const ehIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  // iPadOS moderno se identifica como Mac com tela sensível ao toque
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Convite para instalar o portal como aplicativo.
// No Android/desktop usa o prompt nativo; no iOS explica o caminho manual.
export function InstallPWA() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visivel, setVisivel] = useState(false);
  const [mostrarPassosIOS, setMostrarPassosIOS] = useState(false);

  useEffect(() => {
    if (estaInstalado() || localStorage.getItem(DISMISS_KEY)) return;

    const aoPoderInstalar = (evento: Event) => {
      evento.preventDefault(); // impede o banner padrão do navegador
      setPrompt(evento as BeforeInstallPromptEvent);
      setVisivel(true);
    };

    const aoInstalar = () => {
      setVisivel(false);
      setPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    window.addEventListener("appinstalled", aoInstalar);

    // O iOS não dispara beforeinstallprompt: mostramos o convite mesmo assim.
    if (ehIOS()) setVisivel(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  if (!visivel) return null;

  const dispensar = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisivel(false);
  };

  const instalar = async () => {
    if (!prompt) {
      setMostrarPassosIOS(true);
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "dismissed") localStorage.setItem(DISMISS_KEY, "1");
    setPrompt(null);
    setVisivel(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-14 z-50 px-4 pb-2"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-card">
        <img src="/pwa-192.png" alt="" className="h-10 w-10 shrink-0" />

        <div className="min-w-0 flex-1">
          {mostrarPassosIOS ? (
            <p className="text-xs text-slate-500">
              No iPhone: toque em <span className="font-semibold">Compartilhar</span> e
              depois em <span className="font-semibold">Adicionar à Tela de Início</span>.
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-800">
                Instale o app da Gurupi Telecom
              </p>
              <p className="truncate text-xs text-slate-500">
                Acesso rápido às suas faturas direto na tela inicial.
              </p>
            </>
          )}
        </div>

        {!mostrarPassosIOS && (
          <button
            onClick={instalar}
            className="shrink-0 rounded-lg bg-gurupi-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gurupi-600"
          >
            Instalar
          </button>
        )}

        <button
          onClick={dispensar}
          aria-label="Dispensar convite de instalação"
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
