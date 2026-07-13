const CACHE_NAME = 'race-v15';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  //'./tasks.js', read from googlesheet
  './config.js',
  './manifest.json',
  './jspdf.umd.min.js',
  './images/icon.png',
  // --- MISSION IMAGES (Numbered 01-20) ---
  './imgsci/01-reflection.png',
  './imgsci/02-viewtwist.png',
  './imgsci/03-giantchair.png',
  './imgsci/04-mirrormaze.jpg,
  './imgsci/05-bodyblueprint.png',
  './imgsci/06-sundial.png',
  './imgsci/07-metalblock.png',
  './imgsci/08-oscillatingbeam.png',
  './imgsci/09-echotube.png'
  // ------------------------------------
];

// 1. SAFE ALL-SETTLED ASYNC INSTALLATION
self.addEventListener('install', e => {
    self.skipWaiting();
    
    e.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log("Service Worker: Caching assets sequentially...");
            
            // Map urls into an explicit array of individual fetch promises
            const cachePromises = ASSETS.map(async (url) => {
                try {
                    await cache.add(url);
                    console.log(`Cached successfully: ${url}`);
                } catch (err) {
                    console.error(`❌ FAILED to cache resource: ${url}`, err);
                }
            });

            // Forces e.waitUntil to wait until ALL promises resolve out completely
            await Promise.allSettled(cachePromises);
            console.log("Service Worker: Asset caching loop concluded.");
        })
    );
});

// 2. CLEAN UP OLD CACHE REFERENCES
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(k => {
                if (k !== CACHE_NAME) {
                    console.log(`Service Worker: Decomposing legacy cache structure: ${k}`);
                    return caches.delete(k);
                }
            })
        ))
    );
});

// 3. OFFLINE FALLBACK NETWORK PROXY INTERCEPTOR
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => {
            // Return cached resource, or fetch dynamically from web connection
            return res || fetch(e.request).catch(() => {
                console.warn(`Resource missing offline: ${e.request.url}`);
            });
        })
    );
});
