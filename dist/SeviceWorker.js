// Service Worker para mejorar rendimiento y experiencia offline
const CACHE_NAME = "bcommerce-cache-v1";

// Recursos estáticos para cachear en instalación
const STATIC_ASSETS = [
	"/",
	"/index.html",
	"/static/css/main.css",
	"/static/js/main.js",
	"/favicon.ico",
	"/logo192.png",
	"/manifest.json",
	// Añadir otros recursos estáticos importantes
];

// URLs de API que deben cachearse
const API_ROUTES = [
	"/api/categories",
	// Otros endpoints de API que se repitan frecuentemente
];

// Instalar service worker
self.addEventListener("install", (event) => {
	console.log("[ServiceWorker] Instalando");

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("[ServiceWorker] Cacheando recursos estáticos");
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => self.skipWaiting())
	);
});

// Activar service worker (limpiar cachés antiguas)
self.addEventListener("activate", (event) => {
	console.log("[ServiceWorker] Activando");

	const cacheWhitelist = [CACHE_NAME];

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheWhitelist.indexOf(cacheName) === -1) {
							console.log(
								"[ServiceWorker] Eliminando caché antigua:",
								cacheName
							);
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => {
				console.log("[ServiceWorker] Reclamando clientes");
				return self.clients.claim();
			})
	);
});

// Estrategia de caché: Cache, falling back to network
self.addEventListener("fetch", (event) => {
	// Solo interceptar peticiones GET
	if (event.request.method !== "GET") return;

	const url = new URL(event.request.url);

	// Ignorar solicitudes de análisis, etc.
	if (url.pathname.startsWith("/analytics")) return;

	// Estrategia para recursos estáticos
	if (STATIC_ASSETS.some((asset) => url.pathname.endsWith(asset))) {
		event.respondWith(cacheFirst(event.request));
		return;
	}

	// Estrategia para API
	if (API_ROUTES.some((route) => url.pathname.includes(route))) {
		event.respondWith(networkFirstWithCache(event.request, 30 * 60)); // 30 minutos de caché
		return;
	}

	// Estrategia predeterminada para todo lo demás
	event.respondWith(networkFirst(event.request));
});

// Estrategia: Primero caché, luego red como respaldo
async function cacheFirst(request) {
	const cachedResponse = await caches.match(request);
	return cachedResponse || fetchAndCache(request);
}

// Estrategia: Primero red, luego caché como respaldo
async function networkFirst(request) {
	try {
		return await fetchAndCache(request);
	} catch (error) {
		const cachedResponse = await caches.match(request);

		if (cachedResponse) {
			return cachedResponse;
		}

		// Si no hay caché disponible, mostrar página offline o lanzar error
		throw error;
	}
}

// Estrategia: Red con almacenamiento en caché (con tiempo de vida)
async function networkFirstWithCache(request, maxAgeSeconds = 60) {
	const cacheKey = request.url;

	try {
		// Intentar obtener una respuesta fresca
		const networkResponse = await fetch(request);
		const cache = await caches.open(CACHE_NAME);

		// Crear respuesta con metadatos para control de caché
		const clonedResponse = networkResponse.clone();
		const responseToCache = new Response(await clonedResponse.blob(), {
			headers: {
				...Object.fromEntries(clonedResponse.headers.entries()),
				"x-cached-at": Date.now().toString(),
				"x-max-age": maxAgeSeconds.toString(),
			},
		});

		// Guardar en caché
		cache.put(cacheKey, responseToCache);

		return networkResponse;
	} catch (error) {
		// Si falla la red, intentar usar caché
		const cachedResponse = await caches.match(cacheKey);

		if (cachedResponse) {
			// Verificar si la caché está vigente
			const cachedAt = Number(cachedResponse.headers.get("x-cached-at") || "0");
			const maxAge = Number(cachedResponse.headers.get("x-max-age") || "60");

			if ((Date.now() - cachedAt) / 1000 < maxAge) {
				return cachedResponse;
			}
		}

		// Si no hay caché válida, reenviar el error
		throw error;
	}
}

// Función auxiliar para obtener y cachear
async function fetchAndCache(request) {
	const response = await fetch(request);

	// Solo cachear respuestas válidas
	if (response.ok) {
		const cache = await caches.open(CACHE_NAME);
		cache.put(request, response.clone());
	}

	return response;
}

// Evento de mensajes (para comunicación con la aplicación)
self.addEventListener("message", (event) => {
	if (event.data.action === "skipWaiting") {
		self.skipWaiting();
	}
});
