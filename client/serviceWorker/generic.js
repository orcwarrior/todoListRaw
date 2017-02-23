/**
 * Created by Dariusz on 2017-02-17.
 */

var genericEvts = {};
genericEvts.install = function (event) {
  console.log("SW: Installing...");
  event.waitUntil(self.skipWaiting());
}

events.generic = genericEvts;
