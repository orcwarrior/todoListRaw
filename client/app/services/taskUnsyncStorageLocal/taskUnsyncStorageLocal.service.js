'use strict';

function taskUnsyncStorageLocalService(promiseFromValue, taskStorageLocal, localStorageService) {
  const UNSYNC_ACTION = { CREATE: 'create', UPDATE: 'update', DELETE: 'delete' }
  function _getUserTasksKey() {
    return 'user.tasks';
  }
  function _getTasksObj() {
    return localStorageService.get(_getUserTasksKey()) || {};
  }
  function _generateUnsyncId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16).substring(1);
    }
    return 'u' + s4() + s4() + s4() + s4() + s4() + s4();
  }

  function createUnsynchronizedTask(task) {
    task._unsyncId = _generateUnsyncId();
    task._unsyncAction = UNSYNC_ACTION.CREATE;
    return taskStorageLocal.create(task);
  }
  function updateUnsynchronizedTask(task) {
    if (task._unsyncAction !== UNSYNC_ACTION.CREATE)
      task._unsyncAction = UNSYNC_ACTION.UPDATE;
    return taskStorageLocal.update(task);
  }
  function deleteUnsynchronizedTask(task) {
    if (task._unsyncAction === UNSYNC_ACTION.CREATE)
      return taskStorageLocal.delete(task);
    task._unsyncAction = UNSYNC_ACTION.DELETE;
    return taskStorageLocal.update(task);
  }
  function listUnsynchronizedTasks(filters) {
    var tasksObj = _getTasksObj();
    return promiseFromValue(_.chain(tasksObj)
      .pickBy(function (v) {return v._unsyncAction;})
      .pickBy(_.identity(filters)).value());
  }
  function clearUnsynchronizedEntries() {
    var tasksObj = _getTasksObj();
    var clearedTasksObj = _.pickBy(tasksObj, function (task) {
      return !task._unsyncAction;
    });
    console.log('UN-LS:clearUnsync:%d=>%d', _.keys(tasksObj).length, _.keys(clearedTasksObj).length);
    return taskStorageLocal.synchronizeList(clearedTasksObj);
  }
  return {
    create: createUnsynchronizedTask,
    // read: readTask,
    update: updateUnsynchronizedTask,
    delete: deleteUnsynchronizedTask,
    list: listUnsynchronizedTasks,
    clearUnsynchronizedEntries: clearUnsynchronizedEntries
  };
}

angular.module('todoListApp')
  .service('taskUnsyncStorageLocal', taskUnsyncStorageLocalService);
