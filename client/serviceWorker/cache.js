/**
 * Created by Dariusz on 2017-02-02.
 */

var CACHE_NAME = "todoapp-cache-v1";
var cacheEvts = {};
var precacheFiles =
[
  '/',
  'manifest.webmanifest',
  'sw.js',
  '/serviceWorker/generic.js',
  '/serviceWorker/cache.js',
  '/serviceWorker/notifications.js',
  '/serviceWorker/store.js',
];
function createSync() {
  var serviceWorkerRegistration = self.registration;
  console.log('Register testSync...');
  return serviceWorkerRegistration.sync.register('testSync');

}
cacheEvts.activate = function (event) {
  console.log("SW: Activated!");
  event.waitUntil(cache_preCache().then(createSync).then(function () {
    return self.clients.claim();
  }));
};
function cache_preCache() {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

// Dynamic cache
Promise.resolveFulfilled = function (promise) {
  return new Promise(function (resolve) {
    promise.then(function (fulfilment) {
      if (fulfilment) { // DK: Bugfix where fetch error was resolved anyways.
        resolve(fulfilment);
      }
    });
  }, function (reject) {
  });
};

cacheEvts.fetch = function (event) {
  const url = new URL(event.request.url);
  const filename = cache_getFilenameFromRequest(event.request);
  console.info("[%s] fetch... ", event.request.url);
  if (cache_isCacheableUrl(url)) {
    console.info("[%s] isCacheable ", filename);
    var cached = Promise.resolveFulfilled(cache_getFromCache(event.request));
    var fetched = Promise.resolveFulfilled(cache_fetchAndCache(event.request));
    var both = Promise.all([fetched, cached]);
    var any = Promise.race([fetched, cached]);

    event.waitUntil(both);
    event.respondWith(any);
  }
};

function cache_getFromCache(request) {
  const filename = cache_getFilenameFromRequest(request);
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(request);
  }).then(function (matching) {
    if (matching) {
       console.info("[%s]1. Cache matching: " + matching, filename);
      return matching;
    } // Elsewhere, don't resolve so Race will wait for fetch.
  })
}
function cache_getFilenameFromRequest(request) {
  return request.url.substring(request.url.lastIndexOf('/') + 1);
}

function handleFetchErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
function cache_fetchAndCache(request) {
  var fetchedResponse;
  const filename = cache_getFilenameFromRequest(request);
  return fetch(request)
    .then(handleFetchErrors)
    .then(function (response) {
      fetchedResponse = response;
      // console.log("[%s]2. Fetched response from server", filename);
      return caches.open(CACHE_NAME);
    }).then(function (cache) {
      // console.log("[%s]3. setting up in cache...", filename);
      return cache.put(request, fetchedResponse.clone());
    }).then(function () {
      // console.info("[%s]4. Returning fetched response", filename);
      return fetchedResponse;
    }).catch(function (err) {
      console.warn("[%s] Fetch error: " + err, filename);
    });
}

// Dynamic caching pattern matcher:
var cache_matcherConfig = {
  allow: ['^\/$', '\.*.html', '\.*.css', '\.*.js', '\.*.woff', '\.*.ttf', '\/assets\/.*'],
  deny: ['^\/api\/.*',]
}

function cache_buildPathMatcher(path) {
  return function regexTester(regexStr) {
    var regex = new RegExp(regexStr);
    return regex.test(path);
  }
}

function cache_isCacheableUrl(url) {
  if (url.origin !== location.origin) return false;

  var path = url.pathname;
  return (cache_matcherConfig.allow.some(cache_buildPathMatcher(path))
  && !cache_matcherConfig.deny.some(cache_buildPathMatcher(path)));
}
events.cache = cacheEvts;
