'use strict';

function taskService(taskStorageLocal, taskUnsyncStorageLocal, taskStorageDB, userService, resourcePromise, $q) {
  var combinedUserTasks, dbUserTasks;

  function _pickTaskWithId(task1, task2) {
    return (task1._id) ? task1 : task2;
  }
  function _genTaskConfig(method) {
    return {refreshList: method !== 'read'};
  }

  function serviceActionChainBuilder(method, task) {
    var dbRequestSucceed;
    var promise = taskStorageDB[method](task)
      .then(function fulfilment(resTask) {
        var taskWithId = _pickTaskWithId(resTask, task);
        dbRequestSucceed = true;
        return taskStorageLocal[method](taskWithId);
      }, function rejection(err) {
        dbRequestSucceed = false;
        return taskUnsyncStorageLocal[method](task);
      }).then(function (taskLS) {
        if (dbRequestSucceed)
          evtEmitter.emit('taskService:successRequest', _genTaskConfig(method));
        else
          evtEmitter.emit('taskService:errorRequest', _genTaskConfig(method));
      })

    return resourcePromise(promise);
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
    list: function (filters) {
      var localList, curUser,
        promiseChain = taskStorageLocal.list(filters)
          .then(function (localStorageList) {
            localList = localStorageList;
            return userService.getUser();
          })
          .then(function (user) {
            curUser = user;
            return taskStorageDB.list(curUser._id, filters);
          })
          .then(function fulfilment(dbList) {
            dbUserTasks = _.keyBy(dbList, '_id');
            combinedUserTasks = _.extend(localList, dbUserTasks); // database has higher prior
            evtEmitter.emit('taskService:successRequest');
            evtEmitter.emit('taskService:tasksReloaded', combinedUserTasks);
            return combinedUserTasks;
          }, function rejection(err) {
            combinedUserTasks = localList;
            evtEmitter.emit('taskService:tasksReloaded', combinedUserTasks);
            evtEmitter.emit('taskService:errorRequest', err);
            return combinedUserTasks;
          });
      return resourcePromise(promiseChain);
    },
    listUnsynchronized: function (filters) {
      return taskUnsyncStorageLocal.list(filters);
    },
    clearUnsynchronized: function () {
      return $q.when(taskUnsyncStorageLocal.clearUnsynchronizedEntries());
    }
  });
  return service;
}
angular.module('todoListApp')
  .service('taskService', taskService);
