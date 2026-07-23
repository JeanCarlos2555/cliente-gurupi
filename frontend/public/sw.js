/* Service worker do Portal Gurupi Telecom.
 *
 * Estratégias:
 *  - navegação (HTML): network-first com fallback para o app shell em cache,
 *    para o app abrir mesmo sem internet;
 *  - /assets/* (arquivos com hash no nome, gerados pelo Vite): cache-first;
 *  - demais GETs same-origin (ícones, imagens): stale-while-revalidate.
 *
 * Requisições para a API são cross-origin e nunca passam pelo cache.
 */

const VERSION = "v1";
const SHELL_CACHE = `gurupi-shell-${VERSION}`;
const ASSETS_CACHE = `gurupi-assets-${VERSION}`;
const CACHES_ATUAIS = [SHELL_CACHE, ASSETS_CACHE];

// Arquivos fixos que garantem a abertura offline.
const SHELL = [
  "/",
  "/manifest.webmanifest",
  "/pwa-192.png",
  "/pwa-512.png",
  "/apple-touch-icon.png",
  "/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((chave) => chave.startsWith("gurupi-") && !CACHES_ATUAIS.includes(chave))
            .map((chave) => caches.delete(chave)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Permite que a página peça a ativação imediata de uma nova versão.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // API e terceiros: direto na rede
  if (url.pathname.startsWith("/api")) return;

  // Navegação: rede primeiro, cache como rede de segurança.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put("/", copia));
          return resposta;
        })
        .catch(async () => (await caches.match("/")) ?? Response.error()),
    );
    return;
  }

  // Assets com hash: imutáveis, cache primeiro.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then(
        (emCache) =>
          emCache ??
          fetch(request).then((resposta) => {
            if (resposta.ok) {
              const copia = resposta.clone();
              caches.open(ASSETS_CACHE).then((cache) => cache.put(request, copia));
            }
            return resposta;
          }),
      ),
    );
    return;
  }

  // Demais estáticos: entrega o cache e atualiza em segundo plano.
  event.respondWith(
    caches.match(request).then((emCache) => {
      const naRede = fetch(request)
        .then((resposta) => {
          if (resposta.ok) {
            const copia = resposta.clone();
            caches.open(ASSETS_CACHE).then((cache) => cache.put(request, copia));
          }
          return resposta;
        })
        .catch(() => emCache ?? Response.error());
      return emCache ?? naRede;
    }),
  );
});
