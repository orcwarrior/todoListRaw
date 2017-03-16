events = {};

importScripts('./serviceWorker/generic.js');
importScripts('./serviceWorker/cache.js');
importScripts('./serviceWorker/notifications.js');
importScripts('./serviceWorker/store.js');

self.addEventListener('install', events.generic.install);
self.addEventListener('activate', events.cache.activate);
self.addEventListener('fetch', function(event) {
  events.cache.fetch(event);
  events.store.fetch(event);
});

self.addEventListener('push', events.notify.push);
self.addEventListener('notificationclick', events.notify.notificationclick);

self.addEventListener('sync', events.store.sync);
