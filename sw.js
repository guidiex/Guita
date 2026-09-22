const CACHE_NAME = "gastos-ia-v01";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/app.js",
  "./js/parser.js",
  "./js/storage.js",
  "./js/categories.js",
  "./manifest.json"
];


// INSTALAR
self.addEventListener(
  "install",
  event => {

    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(cache =>
          cache.addAll(ARCHIVOS)
        )
    );

    self.skipWaiting();
  }
);


// ACTIVAR
self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(keys =>
          Promise.all(
            keys
              .filter(
                key =>
                  key !== CACHE_NAME
              )
              .map(
                key =>
                  caches.delete(key)
              )
          )
        )

    );

    self.clients.claim();
  }
);


// FETCH
self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !== "GET"
    ) {
      return;
    }

    event.respondWith(

      fetch(event.request)
        .then(response => {

          const copia =
            response.clone();

          caches
            .open(CACHE_NAME)
            .then(cache =>
              cache.put(
                event.request,
                copia
              )
            );

          return response;

        })
        .catch(() =>
          caches.match(
            event.request
          )
        )

    );

  }
);