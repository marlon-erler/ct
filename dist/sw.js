const CACHE_VERSION = "3";

self.addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
    const response = await getFromCache(event);
    if (response) {
        fetchAndCache(event); // Call this but don't await, allowing the cache to update in the background
        return response;
    }
    return fetchAndCache(event);
}

async function getFromCache(event) {
    const request = event.request;
    const cache = await caches.open(CACHE_VERSION);
    const response = await cache.match(request);
    return response;
}

async function fetchAndCache(event) {
    const request = event.request;
    const response = await fetch(request, { cache: "no-cache" });
    if (response.status === 200) {
        // Only cache successful responses
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, response.clone());
    }
    return response;
}
