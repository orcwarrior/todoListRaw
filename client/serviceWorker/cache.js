/**
 * Created by Dariusz on 2017-02-02.
 */

var CACHE_NAME = "todoapp-cache-v1";
var cacheEvts = {};
var precacheFiles = [
  '/',
  'manifest.webmanifest',
  'sw.js',
  '/serviceWorker/generic.js',
  '/serviceWorker/cache.js',
];


cacheEvts.activate = function () {
  console.log("SW: Activated!");
  preCache();
  clients.claim();
};

function preCache() {
  caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

cacheEvts.fetch = function (event) {
  const url = new URL(event.request.url);
  if (isCacheableUrl(url)) {
    event.respondWith(getFromCache(event.request));
    event.waitUntil(fetchAndCache(event.request)); // Found in cache, but still update by fetch.
  }
}
function getFromCache(request) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request);
  }).then(function (matching) {
    if (matching)
      return matching;
    else return Promise.reject('no-match');
  });
}
function fetchAndCache(request) {
  var fetchedResponse, copiedResponse;
  return fetch(request).then(function (response) {
    fetchedResponse = response;
    return caches.open(CACHE_NAME);
  }, function (err) {
    return Promise.reject("Fetch error: "+err);
  }).then(function (cache) {
    console.log("setting up in cache...");
    return cache.put(request, fetchedResponse);
  })
}

var cacheConfig = {
  allow: ['\.*.html', '\.*.css', '\.*.js', '\.*.woff', '\.*.ttf', '\/assets\/.*'],
  deny: ['^\/api\/.*',]
}
function buildPathMatcher(path) {
  return function (regexStr) {
    var regex = new RegExp(regexStr);
    return regex.test(path);
  }
}
function isCacheableUrl(url) {
  if (url.origin === location.origin) {
    return (precacheFiles.indexOf(url.pathname) !== -1
    || (cacheConfig.allow.some(buildPathMatcher(url.pathname))
    && !cacheConfig.deny.some(buildPathMatcher(url.pathname))));
  } else return false;
}

events.cache = cacheEvts;
