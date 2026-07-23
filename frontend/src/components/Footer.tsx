import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

const WHATSAPP_URL = "https://wa.me/558688168574";
const EMAIL = "gurupitelecomltda@gmail.com";

// Rodapé com os dados de contato da Gurupi Telecom.
// Mostra uma barra compacta fixa na base da tela enquanto o usuário rola e,
// quando ele chega no rodapé completo, a barra some para dar lugar a ele.
export function Footer() {
  const fullRef = useRef<HTMLElement>(null);
  const [fullVisible, setFullVisible] = useState(false);

  useEffect(() => {
    const el = fullRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFullVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -8px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Rodapé completo: aparece no fim real da página. */}
      <footer ref={fullRef} className="mt-8 border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 text-center sm:grid-cols-2 sm:py-10 sm:text-left lg:grid-cols-4">
          <div className="flex flex-col items-center sm:items-start">
            <Logo className="h-10" />
            <p className="mt-3 text-xs text-slate-400">
              Na velocidade da sua imaginação
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gurupi-700">
              Endereço
            </h4>
            <p className="mt-2 text-sm text-slate-500">
              Rua Irlanda, 808
              <br />
              Gurupi · Teresina/PI
              <br />
              CEP 64090-420
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gurupi-700">
              Telefone
            </h4>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-sm text-slate-500 transition hover:text-gurupi-600"
            >
              (86) 9 8816-8574
            </a>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gurupi-700">
              E-mail
            </h4>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-2 block break-all text-sm text-slate-500 transition hover:text-gurupi-600"
            >
              {EMAIL}
            </a>
          </div>
        </div>

        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Gurupi Telecom · Todos os direitos
          reservados
        </div>
      </footer>

      {/* Barra compacta fixa: visível enquanto o rodapé completo não está em tela. */}
      <div
        aria-hidden={fullVisible}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur transition-all duration-300 ${
          fullVisible
            ? "pointer-events-none translate-y-full opacity-0"
            : "translate-y-0 opacity-100 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
          <span className="text-xs text-slate-400">
            © {new Date().getFullYear()} Gurupi Telecom
          </span>
          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-gurupi-50 px-3 py-1.5 text-xs font-semibold text-gurupi-700 transition hover:bg-gurupi-100"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              E-mail
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
