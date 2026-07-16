// =====================================================================
// Service Worker — GN Gelo · Site de Pedidos do Cliente
// Offline básico: guarda o app shell e serve do cache quando sem rede.
// Suba a versão (v1 -> v2 ...) ao publicar mudanças importantes.
// =====================================================================
const CACHE = "gngelo-cliente-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./logo-gngelo.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // NÃO intercepta chamadas externas (Supabase, ViaCEP, LocationIQ, Nominatim, CDN).
  // Deixa o navegador tratá-las — evita quebrar o envio do pedido offline/online.
  if (url.origin !== self.location.origin) return;

  // HTML / navegação: network-first (sempre pega a versão nova; usa cache se offline).
  const isHTML = req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");
  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // Demais arquivos locais: cache-first com atualização em segundo plano.
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
