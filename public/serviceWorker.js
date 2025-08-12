// Service Worker para mejorar rendimiento y experiencia offline
const CACHE_NAME = "comersia-cache-v2";

// Recursos estáticos para cachear en instalación
const STATIC_ASSETS = [
	"/",
	"/index.html",
	"/static/css/main.css",
	"/static/js/main.js",
	"/favicon.svg",
	"/logo192.png",
	"/manifest.json",
];

// URLs de API que deben cachearse
const API_ROUTES = [
	"/api/categories",
];

// ✅ LISTA COMPLETA DE DOMINIOS/RUTAS QUE NO DEBEN SER INTERCEPTADOS
const BYPASS_PATTERNS = [
	// Google domains
	'accounts.google.com',
	'www.google.com',
	'google.com',
	'googleapis.com',
	'gstatic.com',
	// Google scripts específicos
	'/gsi/',
	'/oauth/',
	'/auth/',
	// Rutas de autenticación que no deben ser cacheadas
	'/reset-password',
	'/forgot-password',
	'/verify-email',
	'/login',
	'/register',
	// Otros servicios externos que podrías usar
	'facebook.com',
	'twitter.com',
	'linkedin.com',
	// Analytics
	'analytics',
	'gtag'
];

// ✅ FUNCIÓN PARA VERIFICAR SI UNA URL DEBE SER IGNORADA
function shouldBypass(url) {
	const urlString = url.toString().toLowerCase();
	
	return BYPASS_PATTERNS.some(pattern => {
		return urlString.includes(pattern.toLowerCase());
	});
}

// Instalar service worker
self.addEventListener("install", (event) => {
	// ServiceWorker installing

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				// Caching static resources
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => self.skipWaiting())
	);
});

// Activar service worker (limpiar cachés antiguas)
self.addEventListener("activate", (event) => {
	// ServiceWorker activating

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
				// Claiming clients
				return self.clients.claim();
			})
	);
});

// ✅ EVENTO FETCH MEJORADO - MÚLTIPLES VERIFICACIONES
self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);
	
	// ✅ VERIFICACIÓN 1: Solo GET requests
	if (event.request.method !== "GET") {
		// Ignoring non-GET request
		return;
	}

	// ✅ VERIFICACIÓN 2: Verificar si debe ser ignorado
	if (shouldBypass(url)) {
		// Bypassing external URL
		return; // ← IMPORTANTE: No interceptar
	}

	// ✅ VERIFICACIÓN 3: Solo nuestro origen
	if (url.origin !== self.location.origin) {
		// Ignoring external origin
		return;
	}

	// ✅ VERIFICACIÓN 4: Ignorar análisis
	if (url.pathname.startsWith("/analytics")) {
		return;
	}

	// ServiceWorker intercepting request

	// Estrategia para recursos estáticos
	if (STATIC_ASSETS.some((asset) => url.pathname.endsWith(asset))) {
		event.respondWith(cacheFirst(event.request));
		return;
	}

	// Estrategia para API
	if (API_ROUTES.some((route) => url.pathname.includes(route))) {
		event.respondWith(networkFirstWithCache(event.request, 30 * 60));
		return;
	}

	// Estrategia predeterminada para todo lo demás
	event.respondWith(networkFirst(event.request));
});

// Estrategia: Primero caché, luego red como respaldo
async function cacheFirst(request) {
	try {
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			console.log(`[SW] Cache hit: ${request.url}`);
			return cachedResponse;
		}
		
		console.log(`[SW] Cache miss, fetching: ${request.url}`);
		return await fetchAndCache(request);
	} catch (error) {
		console.error(`[SW] Error in cacheFirst: ${error}`);
		throw error;
	}
}

// Estrategia: Primero red, luego caché como respaldo
async function networkFirst(request) {
	try {
		console.log(`[SW] Network first: ${request.url}`);
		return await fetchAndCache(request);
	} catch (error) {
		console.log(`[SW] Network failed, trying cache: ${request.url}`);
		const cachedResponse = await caches.match(request);

		if (cachedResponse) {
			console.log(`[SW] Cache fallback hit: ${request.url}`);
			return cachedResponse;
		}

		console.error(`[SW] No cache fallback available: ${request.url}`);
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
	try {
		const response = await fetch(request);

		// Solo cachear respuestas válidas
		if (response.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, response.clone());
		}

		return response;
	} catch (error) {
		console.error(`[SW] Fetch error: ${request.url}`, error);
		throw error;
	}
}

// Evento de mensajes (para comunicación con la aplicación)
self.addEventListener("message", (event) => {
	if (event.data.action === "skipWaiting") {
		self.skipWaiting();
	}
});