const CACHE_NAME = 'practice-generator-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/actions.js',
    '/config.js',
    '/composition.jsx',
    '/data.js',
    '/dom.js',
    '/fretboard-viz.js',
    '/fretboard.js',
    '/gif-exporter.jsx',
    '/piano-viz.js',
    '/slideshow.js',
    '/state.js',
    '/summary.js',
    '/ui.js',
    '/utils.js',
    // CDN URLs from importmap
    'https://esm.sh/react@18.3.1?dev',
    'https://esm.sh/react-dom@18.3.1?dev',
    'https://esm.sh/react-dom@18.3.1/client?dev',
    'https://esm.sh/react@18.3.1/jsx-runtime?dev',
    'https://esm.sh/react@18.3.1/jsx-dev-runtime?dev',
    'https://esm.sh/remotion@4.0.350?external=react,react-dom&dev',
    'https://esm.sh/@remotion/player@4.0.350?external=react,react-dom&dev',
    'https://esm.sh/@remotion/gif@4.0.350?external=react,react-dom,remotion&dev',
    'https://esm.sh/@remotion/transitions@4.0.350?external=react,react-dom,remotion&dev',
    'https://esm.websim.com/@websim/remotion/player'
];

self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request because it's a stream and can only be consumed once.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                            return response;
                        }

                        // Clone the response because it's also a stream.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});