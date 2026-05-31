import { useState, type ReactNode } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import { Footer } from "./Footer";

const NAV = [
  { to: "/", label: "Início", end: true },
  { to: "/faturas", label: "Faturas", end: false },
  { to: "/consumo", label: "Consumo", end: false },
];

// Casca comum das telas autenticadas: header com navegação + conteúdo + footer.
export function Layout({ children }: { children: ReactNode }) {
  const { customer, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const primeiroNome = customer?.name?.split(" ")[0] ?? "Cliente";

  const navItem = "rounded-lg px-3 py-1.5 text-sm font-semibold transition";
  const navActive = "bg-gurupi-50 text-gurupi-700";
  const navIdle = "text-slate-600 hover:bg-slate-50";

  // Fecha o menu ao trocar de rota
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
          {/* Esquerda: hambúrguer (mobile) + logo */}
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-50 sm:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                {menuOpen ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>

            <Link to="/" aria-label="Ir para a tela inicial" onClick={closeMenu}>
              <Logo className="h-8 transition hover:opacity-80 sm:h-10" />
            </Link>

            {/* Navegação inline (desktop) */}
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `${navItem} ${isActive ? navActive : navIdle}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Direita: usuário + sair (desktop) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/perfil"
              onClick={closeMenu}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gurupi-50 text-gurupi-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="hidden sm:inline">
                Olá, <span className="font-semibold text-slate-800">{primeiroNome}</span>
              </span>
            </Link>
            <button
              onClick={logout}
              className="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:block"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Menu mobile (abre com o hambúrguer) */}
        {menuOpen && (
          <nav className="border-t border-slate-100 px-4 py-3 sm:hidden">
            <p className="px-3 pb-2 text-sm text-slate-500">
              Olá, <span className="font-semibold text-slate-800">{primeiroNome}</span>
            </p>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block ${navItem} ${isActive ? navActive : navIdle}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/perfil"
              onClick={closeMenu}
              className={({ isActive }) => `block ${navItem} ${isActive ? navActive : navIdle}`}
            >
              Meus dados
            </NavLink>
            <button
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Sair
            </button>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-8 pt-6 sm:py-8">{children}</main>

      <Footer />
    </div>
  );
}
