const VERSION = "2610 Beta 7.2"

function processUrl(event) {
    const url = event.request.url;
    const fileName = url.split("/").pop();
    return {url, fileName};
}

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("fetch", async (event) => {
    console.log(VERSION);
    const {url, fileName}=processUrl(event);
    event.respondWith(handleRequest(event, url, fileName));
});

async function handleRequest(event, url, fileName) {
    switch (fileName) {
	case "version":
	    const response = new Response(VERSION);
	    return response;
	case "latestVersion":
	    return await fetch("/version.txt", {cache: "no-cache"})
    }
    const response = await getFromCache(event);

    if (response) {
	fetchAndCache(event, fileName); // Call this but don't await, allowing the cache to update in the background
	return response;
    }
    return fetchAndCache(event, fileName);
}

async function getFromCache(event) {
    const request = event.request;
    const cache = await caches.open(VERSION);
    const response = await cache.match(request);
    return response;
}

async function fetchAndCache(event, fileName) {
    const request = event.request;

    const response = await fetch(request, { cache: "no-cache" });
    if (response.status === 200) {
	// Only cache successful responses
	const cache = await caches.open(VERSION);
	await cache.put(request, response.clone());
    }
    return response;
}
