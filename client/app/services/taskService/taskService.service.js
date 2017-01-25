'use strict';

function taskService(taskStorageLocal, taskUnsyncStorageLocal, taskStorageDB, userService, promiseFromValue, $q) {
  var fetchedUser = userService.getUser();

  function _getUserPromise(paramUserId) {
    var user = (paramUserId) ? {_id: paramUserId} : fetchedUser;
    return $q.when(user)
  }

  function serviceActionChainBuilder(method, task) {
    var promise = taskStorageDB[method](task)
      .then(function fulfilment(task) {
        if (method !== 'read')
          evtEmitter.emitEvent('storageDB:refreshList', task);
        evtEmitter.emitEvent('storageDB:success', {method: method, task: task._id});
        taskStorageLocal[method](task);
        return task;
      }, function rejection(err) {
        if (method !== 'read')
          evtEmitter.emitEvent('storageDB:refreshList', task);
        evtEmitter.emitEvent('storageDB:error', err);
        return taskUnsyncStorageLocal[method](task);
      });
    return promiseFromValue(promise);
  }

  var evtEmitter = new EventEmitter();
  var service = _.extend(evtEmitter, {
    create: function (task) {
      return serviceActionChainBuilder('create', task);
    },
    read: function (taskId) {
      return serviceActionChainBuilder('read', taskId);
    },
    update: function (task) {
      return serviceActionChainBuilder('update', task);
    },
    delete: function (task) {
      return serviceActionChainBuilder('delete', task);
    },
    list: function (userId, filters) {
      // Firstly read from localStorage:
      console.log('taskService.list: called');
      var localList, curUser,
        promiseChain = _getUserPromise(userId)
          .then(function (user) {
            curUser = user;
            return taskStorageLocal.list(user._id, filters);
          })
          .then(function (localStorageList) {
            localList = localStorageList;
            return taskStorageDB.list(curUser._id, filters);
          })
          .then(function fulfilment(dbList) {
            var dbKeysById = _.keyBy(dbList, '_id');
            evtEmitter.emitEvent('storageDB:success', {method: 'list'});
            return _.extend(localList, dbKeysById); // database has higher prior
          }, function rejection(err) {
            evtEmitter.emitEvent('storageDB:error', err);
            return localList; // return only local tasks
          });
      return promiseFromValue(promiseChain);
    },
    listUnsynchronized: function (userId, filters) {
      return _getUserPromise(userId)
        .then(function (user) {
          return taskUnsyncStorageLocal.list(user._id, filters);
        });
    },
    clearUnsynchronized: function () {
      return _getUserPromise()
        .then(function (user) {
          taskUnsyncStorageLocal.clearUnsynchronizedEntries(user._id);
        });
    }
  });
  return service;
}
angular.module('todoListApp')
  .service('taskService', taskService);
