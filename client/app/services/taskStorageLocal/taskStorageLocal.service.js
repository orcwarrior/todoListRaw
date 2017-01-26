'use strict';

function taskStorageLocalService(localStorageService, promiseFromValue) {
  var evtEmitter = new EventEmitter();

  function _getUserTasksKey() {
    return 'user.tasks';
  }

  function _getTasksObj() {
    return localStorageService.get(_getUserTasksKey()) || {};
  }

  function _setTaskInTaskObjAtLocalStorage(task, tasksObj) {
    var pre = _.keys(tasksObj).length;
    tasksObj[task._id || task._unsyncId] = task;
    evtEmitter.emit('taskStorage:listUpdate', tasksObj);
    localStorageService.set(_getUserTasksKey(), tasksObj);
  }

  function createTask(task) {
    var tasksObj = _getTasksObj();
    _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    return promiseFromValue(task);
  }

  function readTask(taskId) {
    var tasksObj = _getTasksObj();
    if (tasksObj && tasksObj[taskId]) return promiseFromValue(tasksObj[taskId]);
  }

  function updateTask(task) {
    var tasksObj = _getTasksObj();
    _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    return promiseFromValue(task);
  }

  function deleteTask(task) {
    var tasksObj = _getTasksObj();
    delete tasksObj[task._id];
    console.log('LS:Delete:%d', _.keys(tasksObj).length);
    localStorageService.set(_getUserTasksKey(), tasksObj);
    return task;
  }

  function listTasks(filters) {
    var tasksObj = _getTasksObj();
    var tasksFiltered = _.pickBy(tasksObj, _.identity(filters));
    return promiseFromValue(tasksFiltered);
  }

  function synchronizeList(outterSrcList) {
    if (_.isArray(outterSrcList)) // map task._id as keys:
      outterSrcList = _.keyBy(outterSrcList, '_id');
    console.log('LS:Synchronize:%d', _.keys(outterSrcList).length);
    evtEmitter.emit('taskStorage:listUpdate', outterSrcList);
    localStorageService.set(_getUserTasksKey(), outterSrcList);
  }

  return _.extend(evtEmitter, {
    create: createTask,
    read: readTask,
    update: updateTask,
    delete: deleteTask,
    list: listTasks,
    synchronizeList: synchronizeList
  });
}
angular.module('todoListApp')
  .service('taskStorageLocal', taskStorageLocalService);
