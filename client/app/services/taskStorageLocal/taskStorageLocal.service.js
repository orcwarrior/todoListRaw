'use strict';

function taskStorageLocalService($q, localStorageService) {
  function _getTasksKey(task) { return 'user' + userId + 'tasks'; }
  function _getTasksObjFromLocalStorage(userId) {
    return localStorageService.get(_getTasksKey(userId)) || {};
  }
  function _setTaskInTaskObjAtLocalStorage(task, tasksObj) {
    tasksObj[task._id || task._unsyncId] = task;
    localStorageService.set(_getTasksKey(task), tasksObj);
  }
  function _promiseFromValue(val) {
    var phPromise = $q.when(val);
    phPromise.then(function (val) {
      phPromise = _.extend(phPromise, val);
      return val;
    });
    return phPromise;
  }

  function createTask(task) {
    var tasksObj = _getTasksObjFromLocalStorage(task._userId);
    _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    return _promiseFromValue(task);
  }
  function readTask(taskId) {
    // All stored users keys need to bee lookedup
    var userKeys = localStorageService.keys();
    _.each(userKeys, function (key) {
      if (key && key[taskId]) return _promiseFromValue(key[taskId]);
    });
  }
  function updateTask(task) {
    var tasksObj = _getTasksObjFromLocalStorage(task._userId);
    _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    return _promiseFromValue(task);
  }
  function deleteTask(task) {
    var tasksObj = _getTasksObjFromLocalStorage(task._userId);
    delete tasksObj[task._id];
    localStorageService.set(_getTasksKey(task), tasksObj);
    return task;
  }
  function listTasks(userId, filters) {
    var tasksObj = _getTasksObjFromLocalStorage(task._userId);
    return _.chain(taskObj)
      .filter(filters).toArray()
      .thru(function (o) { return _promiseFromValue(o); })
      .value();
  }
  return {
    create: createTask,
    read: readTask,
    update: updateTask,
    delete: deleteTask,
    list: listTasks,
  }
}

angular.module('todoListApp')
  .service('taskStorageLocal', taskStorageLocalService);
