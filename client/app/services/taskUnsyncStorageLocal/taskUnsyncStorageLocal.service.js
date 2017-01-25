'use strict';

function taskUnsyncStorageLocalService(promiseFromValue, taskStorageLocal, localStorageService) {
  const UNSYNC_ACTION = { CREATE: 'create', UPDATE: 'update', DELETE: 'delete' }
  function _getUserTasksKey(userId) { if (!userId) console.error('undef userID!!!'); return 'user' + userId + '.tasks'; }
  function _getTasksObjFromLocalStorage(userId) {
    return localStorageService.get(_getUserTasksKey(userId)) || {};
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
    task._unsyncAction = UNSYNC_ACTION.DELETE;
    return taskStorageLocal.update(task);
  }
  function listUnsynchronizedTasks(userId, filters) {
    var tasksObj = _getTasksObjFromLocalStorage(userId);
    return _.chain(tasksObj)
      .pickBy(function (v) {return v._unsyncAction;})
      .pickBy(_.identity(filters))
      .tap(function(list) { list = promiseFromValue(list); }).value();
  }
  function clearUnsynchronizedEntries(userId) {
    var tasksObj = _getTasksObjFromLocalStorage(userId);
    var clearedTasksObj = _.pickBy(tasksObj, function (task) {
      return !task._unsyncAction;
    });
    console.log("After clearUnsynchronizedEntries: %s => %s",_.keys(tasksObj).length, _.keys(clearedTasksObj).length);
    console.log(_.keys(clearedTasksObj));
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
