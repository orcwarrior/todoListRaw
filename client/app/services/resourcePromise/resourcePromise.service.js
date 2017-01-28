'use strict';

function resourcePromiseService($q) {
  return function resourcePromise(val) {
    var phPromise = $q.when(val);
    phPromise.then(function (val) {
      phPromise = _.extend(phPromise, val);
      return val;
    });
    return phPromise;
  }
}

angular.module('todoListApp')
  .service('resourcePromise', resourcePromiseService);
