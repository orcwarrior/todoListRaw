'use strict';

function taskStorageLocalService(localStorageService, promiseFromValue) {
  function _getUserTasksKey(userId) {
    if (!userId) console.error('undef userID!!!');
    return 'user' + userId + '.tasks';
  }

  function _getTasksObj(userId) {
    return localStorageService.get(_getUserTasksKey(userId)) || {};
  }

  function _setTaskInTaskObjAtLocalStorage(task, tasksObj) {
    tasksObj[task._id || task._unsyncId] = task;
    localStorageService.set(_getUserTasksKey(task._userId), tasksObj);
  }

  function createTask(task) {
    var tasksObj = _getTasksObj(task._userId);
    _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    return promiseFromValue(task);
  }

  function readTask(taskId) {
    // All stored users keys need to bee lookedup
    var userKeys = localStorageService.keys();
    _.each(userKeys, function (key) {
      if (key && key[taskId]) return promiseFromValue(key[taskId]);
    });
  }

  function updateTask(task) {
    var tasksObj = _getTasksObj(task._userId);
    _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    return promiseFromValue(task);
  }

  function deleteTask(task) {
    var tasksObj = _getTasksObj(task._userId);
    delete tasksObj[task._id];
    localStorageService.set(_getUserTasksKey(task), tasksObj);
    return task;
  }

  function listTasks(userId, filters) {
    var tasksObj = _getTasksObj(userId);
    return _.chain(tasksObj)
      .pickBy(_.identity(filters))
      .tap(function(list) { list = promiseFromValue(list); }).value();
  }

  function synchronizeList(outterSrcList) {
    var userId = (_.find(outterSrcList, '_userId')._userId);
    if (_.isArray(outterSrcList)) // map task._id as keys:
      outterSrcList = _.keyBy(outterSrcList, '_id');
    console.log("... => %s",_.keys(outterSrcList).length);
    localStorageService.set(_getUserTasksKey(userId), outterSrcList);
  }

  return {
    create: createTask,
    read: readTask,
    update: updateTask,
    delete: deleteTask,
    list: listTasks,
    synchronizeList: synchronizeList
  }
}
angular.module('todoListApp')
  .service('taskStorageLocal', taskStorageLocalService);
