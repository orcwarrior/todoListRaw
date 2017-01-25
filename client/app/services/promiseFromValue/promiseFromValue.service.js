'use strict';

function promiseFromValueService($q) {
  return function promiseFromValue(val) {
    var phPromise = $q.when(val);
    phPromise.then(function (val) {
      phPromise = _.extend(phPromise, val);
      return val;
    });
    return phPromise;
  }
}

angular.module('todoListApp')
  .service('promiseFromValue', promiseFromValueService);
