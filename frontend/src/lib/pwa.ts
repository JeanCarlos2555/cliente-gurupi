// Registro do service worker que torna o portal instalável (PWA).
// Em desenvolvimento o SW fica desligado para não servir arquivos em cache.
export function registrarServiceWorker() {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((erro) => {
      console.warn("Falha ao registrar o service worker:", erro);
    });
  });
}
