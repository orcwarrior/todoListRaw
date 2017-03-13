'use strict';

function taskService(taskStorageLocal, taskUnsyncStorageLocal, taskStorageDB, userService, resourcePromise, $q) {
  var combinedUserTasks, dbUserTasks;

  function _pickTaskWithId(task1, task2) {
    return (task1._id) ? task1 : task2;
  }
  function _commitToLocalStorage(task, method) {
    return function (dbTask) {
      var taskWithId = _pickTaskWithId(dbTask, task);
      return taskStorageLocal[method](taskWithId);
    }
  }

  function _isInternetConnected(err) {
    return err && err.status !== -1;
  }
  function _commitToUnsyncStorage(task, method) {
    return function rejection(err) {
      if (_isInternetConnected(err)) return $q.reject(err);
      else return taskUnsyncStorageLocal[method](task);
    }
  }

  function _taskIsUnsynchronized(task) {
    return task && task._unsyncAction;
  }
  function _emitPostRequestEvent(method) {
    return function (resultTask) {
      if (_taskIsUnsynchronized(resultTask))
        evtEmitter.emit('taskService:errorRequest', {refreshList: method !== 'read'});
      else
        evtEmitter.emit('taskService:successRequest', {refreshList: method !== 'read'});
    }
  }

  function serviceActionChainBuilder(method, task) {
    var promise = taskStorageDB[method](task)
      .then(_commitToLocalStorage(task, method),
     /*err*/ _commitToUnsyncStorage(task, method))
      .then(_emitPostRequestEvent(method));
    return resourcePromise(promise);
  }
  function preprocessTask(task) {
    task.deadlineTimeLocalized = moment(task.date).format('H:mm');
    return task;
  }

  var evtEmitter = new EventEmitter();
  var service = _.extend(evtEmitter, {
    create: function (task) {
      return userService.getUser().then(function (user) {
        task = preprocessTask(task);
        task._userId = user._id;
        return serviceActionChainBuilder('create', task);
      });
    },
    read: function (taskId) {
      return serviceActionChainBuilder('read', taskId);
    },
    update: function (task) {
      task = preprocessTask(task);
      return serviceActionChainBuilder('update', task);
    },
    delete: function (task) {
      return serviceActionChainBuilder('delete', task);
    },
    list: function (filters) {
      var localList,
        promiseChain = taskStorageLocal.list(filters)
          .then(function (localStorageList) {
           localList = localStorageList;
           return userService.getUser();
          })
          .then(function (user) {
            return taskStorageDB.list(user._id, filters);
          })
          .then(function fulfilment(dbList) {
            dbUserTasks = _.keyBy(dbList, '_id');
            combinedUserTasks = _.extend(localList, dbUserTasks); // database has higher prior
            evtEmitter.emit('taskService:tasksReloaded', combinedUserTasks);
            evtEmitter.emit('taskService:successRequest');
            taskStorageLocal.synchronizeList(combinedUserTasks);
            return dbUserTasks; //combinedUserTasks;
          }, function rejection(err) {
            combinedUserTasks = localList;
            evtEmitter.emit('taskService:tasksReloaded', combinedUserTasks);
            evtEmitter.emit('taskService:errorRequest', null, err);
            return combinedUserTasks;
          });
      return resourcePromise(promiseChain);
    },
    listUnsynchronized: function (filters) {
      return taskUnsyncStorageLocal.list(filters);
    },
    clearUnsynchronized: function () {
      return taskUnsyncStorageLocal.clearUnsynchronizedEntries();
    }
  });
  return service;
}
angular.module('todoListApp')
  .service('taskService', taskService);
