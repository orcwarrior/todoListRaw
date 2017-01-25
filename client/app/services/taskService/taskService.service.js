'use strict';

function taskService(taskStorageLocal, taskStorageDB, userService) {

  var currentUser = userService.getUser();

  function _requestChainBuilder(method, arg) {
    return taskStorageDB[method](arg)
      .then(function fulfilment(task) {
        evtEmitter.emit('storageDB:success', arg);
        taskStorageLocal[method](task);
        return task;
      }, function rejection(err) {
        evtEmitter.emit('storageDB:error', err);
        return taskStorageLocal.unsync[method](arg);
      });
  }

  var evtEmitter = new EventEmitter();
  var service = _.extend(evtEmitter, {
    create: function (task) {
      return _requestChainBuilder('create', task);
    },
    read: function (taskId) {
      return _requestChainBuilder('read', taskId);
    },
    update: function (task) {
      return _requestChainBuilder('update', task);
    },
    delete: function (task) {
      return _requestChainBuilder('delete', task);
    },
    list: function (userId, filters) {
      // Firstly read from localStorage:
      userId = userId || currentUser;
      var taskList = taskStorageLocal.list(userId, filters)
        .then(function fulfilment(localList) {
          taskList = taskStorageDB.list(userId, filters)
            .then(function fulfilment(dbList) {
              evtEmitter.emit('storageDB:success', dbList);
              return dbList;
            }, function rejection(err) {
              evtEmitter.emit('storageDB:error', err);
              return localList;
            });
          return localList;
        });

      return taskList;
    },
    listUnsynchronized: function (userId) {
      userId = userId || currentUser;
      return taskStorageLocal.unsync.list(userId, filters);
    }
  });
  return service;
}
angular.module('todoListApp')
  .service('taskService', taskService);
