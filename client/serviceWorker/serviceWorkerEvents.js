/**
 * Created by Dariusz on 2017-02-02.
 */

var CACHE_NAME = "todoapp-cache-v1";
events = {};
events.install = function(event) {
  console.log("SW: Installing...");
  //event.waitUntil()
}

events.activate = function() {
  console.log("SW: Activated!");
  clients.claim();
}

events.fetch = function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log("SW:Fetch: response with cached res");
          return response;
        }
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const url = new URL(event.request.url);
            if (!isCacheableUrl(url)) return response;

            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
};


var cacheConfig = {
  allow: ['\.*.html', '\.*.css','\.*.woff', '\/assets\/.*'],
  deny: ['\/api\/.*', ]
}
function buildPathMatcher(path) {
  return function (regexStr) {
    var regex = new RegExp(regexStr);
    return regex.test(path);
  }
}
function isCacheableUrl(url) {
  if (url.origin === location.origin) {
    return (_.some(cacheConfig.allow, buildFilePathMatcher(url.pathname))
    &&     !_.some(cacheConfig.deny, buildFilePathMatcher(url.pathname)));
  } else return false;
}
