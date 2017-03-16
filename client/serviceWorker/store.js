/**
 * Created by Dariusz on 2017-03-16.
 */

var storeEvt = {};
storeEvt.sync = function (event) {
  if (event.tag === 'testSync') {
    console.log('testSync inited...')
    event.waitUntil(fetch('/api/ping')
      .then(function (response) {
        console.log("SYNC DONE:");
        console.log(response.json());
      }))
  }
}
storeEvt.fetch = function (event) {

}
events.store = storeEvt;
