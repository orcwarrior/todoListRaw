'use strict';

function taskStorageLocalService(localStorageService, resourcePromise) {
  function _getUserTasksKey() { return 'user.tasks'; }

  function _getTasksObj() {
    return localStorageService.get(_getUserTasksKey()) || {};
  }

  function _setTaskInTaskObjAtLocalStorage(task, tasksObj) {
    var pre = _.keys(tasksObj).length;
    tasksObj[task._id || task._unsyncId] = task;
    localStorageService.set(_getUserTasksKey(), tasksObj);
  }

  function createTask(task) {
    var tasksObj = _getTasksObj();
    _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    return resourcePromise(task);
  }

  function readTask(taskId) {
    var tasksObj = _getTasksObj();
    if (tasksObj && tasksObj[taskId]) return resourcePromise(tasksObj[taskId]);
  }

  function updateTask(task) {
    var tasksObj = _getTasksObj();
    _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    return resourcePromise(task);
  }

  function deleteTask(task) {
    var tasksObj = _getTasksObj();
    delete tasksObj[task._id];
    localStorageService.set(_getUserTasksKey(), tasksObj);
    return task;
  }

  function listTasks(filters) {
    var tasksObj = _getTasksObj();
    var tasksFiltered = _.pickBy(tasksObj, _.identity(filters));
    return resourcePromise(tasksFiltered);
  }

  function synchronizeList(outterSrcList) {
    if (_.isArray(outterSrcList)) // map task._id as keys:
      outterSrcList = _.keyBy(outterSrcList, '_id');
    localStorageService.set(_getUserTasksKey(), outterSrcList);
  }

  return {
    create: createTask,
    read: readTask,
    update: updateTask,
    delete: deleteTask,
    list: listTasks,
    synchronizeList: synchronizeList
  };
}
angular.module('todoListApp')
  .service('taskStorageLocal', taskStorageLocalService);
