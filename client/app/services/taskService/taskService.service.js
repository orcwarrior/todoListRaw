'use strict';

function taskService(taskStorageLocal, taskUnsyncStorageLocal, taskStorageDB, userService, promiseFromValue, $q) {
  var combinedUserTasks, dbUserTasks;

  function _getUserPromise(paramUserId) {
    var user = (paramUserId) ? {_id: paramUserId} : userService.getUser();
    return $q.when(user)
  }

  // taskStorageLocal.on('taskStorage:listUpdate', function (newList) {
  //   combinedUserTasks = newList; // List going to be overriden by further list() request
  // })
  function _pickTaskWithId(task1, task2) {
    return (task1._id) ? task1 : task2;
  }

  function _genTaskConfig(method) {
    return {refreshList: method !== 'read'};
  }

  function serviceActionChainBuilder(method, task) {
    console.trace('taskService(%s:%s)', method, task);
    var dbRequestSucceed;
    var promise = taskStorageDB[method](task)
      .then(function fulfilment(res) {
        console.info('taskService(%s:%s):fulfilment', method, task);
        var taskWithId = _pickTaskWithId(res, task);
        // TODO: Przenieść re-listowanie na po-synchronizacji!!!
        // if (method !== 'read')
        //   evtEmitter.emitEvent('storageDB:refreshList', taskWithId);
        dbRequestSucceed = true;
        return taskStorageLocal[method](taskWithId);
      }, function rejection(err) {
        console.info('taskService(%s:%s):rejection', method, task)
        // if (method !== 'read')
        //   evtEmitter.emitEvent('storageDB:refreshList', [task]);
        dbRequestSucceed = false;
        return taskUnsyncStorageLocal[method](task);
      }).then(function (taskLS) {
        if (dbRequestSucceed)
          evtEmitter.emit('taskService:successRequest', _genTaskConfig(method));
        else
          evtEmitter.emit('taskService:errorRequest', _genTaskConfig(method));
      })

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
    list: function (filters) {
      // Firstly read from localStorage:
      console.log('taskService(list)');
      var localList, curUser,
        promiseChain = taskStorageLocal.list(filters)
          .then(function (localStorageList) {
            localList = localStorageList;
            console.log('taskService(list):local:%d', _.keys(localList).length);
            return _getUserPromise();
          })
          .then(function (user) {
            curUser = user;
            return taskStorageDB.list(curUser._id, filters);
          })
          .then(function fulfilment(dbList) {
            console.log('taskService((list):db:fulfilment:%d', dbList.length);
            dbUserTasks = _.keyBy(dbList, '_id');
            combinedUserTasks = _.extend(localList, dbUserTasks); // database has higher prior
            evtEmitter.emit('taskService:successRequest');
            evtEmitter.emit('taskService:tasksReloaded', combinedUserTasks);
            return combinedUserTasks;
          }, function rejection(err) {
            console.log('taskService((list):db:error');
            combinedUserTasks = localList;
            evtEmitter.emit('taskService:tasksReloaded', combinedUserTasks);
            evtEmitter.emit('taskService:errorRequest', err);
            return combinedUserTasks; // return only local tasks
          });
      return promiseFromValue(promiseChain);
    },
    listUnsynchronized: function (userId, filters) {
      return taskUnsyncStorageLocal.list(filters);
    },
    clearUnsynchronized: function () {
      return $q.when(taskUnsyncStorageLocal.clearUnsynchronizedEntries());
    },
    getCachedTasks: function () {
      return combinedUserTasks;
    }
  });
  return service;
}
angular.module('todoListApp')
  .service('taskService', taskService);
