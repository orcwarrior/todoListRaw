events = {};

importScripts('./serviceWorker/generic.js');
importScripts('./serviceWorker/cache.js');
importScripts('./serviceWorker/notifications.js');

self.addEventListener('install', events.generic.install);
self.addEventListener('activate', events.cache.activate);
self.addEventListener('fetch', events.cache.fetch);

self.addEventListener('push', events.notifyEvt.push);
self.addEventListener('notificationclick', events.notifyEvt.notificationclick);
