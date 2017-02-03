self.importScripts('./serviceWorker/serviceWorkerEvents.js');

self.addEventListener('install', events.install);
self.addEventListener('activate', events.activate);
self.addEventListener('fetch', events.fetch);
