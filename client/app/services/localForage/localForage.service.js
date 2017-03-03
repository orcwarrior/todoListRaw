'use strict';

function localForageService() {
  // AngularJS will instantiate a singleton by calling "new" on this function
  localforage.config({
    driver: localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
    name: 'todo_list',
    version: 1.0,
    storeName: 'keyvaluepairs', // Should be alphanumeric, with underscores.
  });
  var dbInstance = localforage.createInstance({name: 'todoList'});
  return dbInstance;
}

angular.module('todoListApp')
  .service('localForage', localForageService);
