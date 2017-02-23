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
  preCache();
  event.waitUntil(self.clients.claim());
};

function preCache() {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}
Promise.resolveFullfiled = function (promise) {
  return new Promise(function (resolve) {
    promise.then(function (fulfilment) {
      if (fulfilment) {
        console.info("Truely fulfiled: " + fulfilment);
        resolve(fulfilment);
      }
    });
  }, function (reject) {
  });
};
cacheEvts.fetch = function (event) {
  const url = new URL(event.request.url);
  const filename = event.request.url.substring(event.request.url.lastIndexOf('/') + 1);
  if (isCacheableUrl(url)) {
    var cached = Promise.resolveFullfiled(getFromCache(event.request));
    var fetched = Promise.resolveFullfiled(fetchAndCache(event.request));
    var both = Promise.all([fetched, cached]);
    var any = Promise.race([fetched, cached]).then(function (raced) {
      console.info("[%s] Promise race resolved!: " + raced, filename);
      return Promise.resolve(raced);
    });

    event.waitUntil(both);
    event.respondWith(any);
  }
}
function getFromCache(request) {
  const filename = request.url.substring(request.url.lastIndexOf('/') + 1);
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request);
  }).then(function (matching) {
    if (matching) {
      console.info("[%s]1. Cache matching: " + matching, filename);
      return matching;
    } // Elsewhere, don't resolve so Race will wait for fetch.
  })
}

function handleFetchErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
function fetchAndCache(request) {
  var fetchedResponse;
  const filename = request.url.substring(request.url.lastIndexOf('/') + 1);
  return fetch(request)
    .then(handleFetchErrors)
    .then(function (response) {
      fetchedResponse = response;
      console.log("[%s]2. Fetched response from server", filename);
      return caches.open(CACHE_NAME);
    }).then(function (cache) {
      console.log("[%s]3. setting up in cache...", filename);
      return cache.put(request, fetchedResponse.clone());
    }).then(function () {
      console.info("[%s]4. Returning fetched response", filename);
      return fetchedResponse;
    }).catch(function (err) {
      console.warn("[%s] Fetch error: " + err, filename);
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
