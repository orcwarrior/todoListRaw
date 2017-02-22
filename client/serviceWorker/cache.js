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


cacheEvts.activate = function (event) {
  console.log("SW: Activated!");
  event.waitUntil(preCache().then(function() {
    return self.clients.claim();
  });
};

function preCache() {
  caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

cacheEvts.fetch = function (event) {
  const url = new URL(event.request.url);
  const filename = event.request.url.substring(event.request.url.lastIndexOf('/')+1);
  if (isCacheableUrl(url)) {
    event.respondWith(getFromCache(event.request)
      .catch(function (err) {
        console.warn("[%s]1. Getting from cache rejected: " + err, filename);
        return fetchAndCache(event.request);
      }));
    return;
  }
}
function getFromCache(request) {
  const filename = request.url.substring(request.url.lastIndexOf('/')+1);
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
  const filename = request.url.substring(request.url.lastIndexOf('/')+1);
  return fetch(request).then(function (response) {
    fetchedResponse = response;
    copiedResponse = response.clone();
    console.info("[%s]2. Fetched response from server", filename);
    return caches.open(CACHE_NAME);
  }).then(function (cache) {
    console.log("[%s]3. setting up in cache...", filename);
    return cache.put(request, fetchedResponse);
  }).then(function () {
    console.log("[%s]4. Returning fetched response", filename);
    return copiedResponse;
  }).catch(function (err) {
    console.error("[%s]5. Fetch error: " + err, filename);
    return Promise.reject("Fetch error: " + err);
  });
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
