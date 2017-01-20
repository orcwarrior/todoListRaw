'use strict';

function taskUnsyncStorageLocalService($q, taskStorageLocal) {
  const UNSYNC_ACTION = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete'
  }
  function _generateUnsyncId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16).substring(1);
    }
    return 'u' + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
  }
  function _promiseFromValue(val) {
    var phPromise = $q.when(val);
    phPromise.then(function (val) {
      phPromise = _.extend(phPromise, val);
      return val;
    });
    return phPromise;
  }

  function createUnsynchronizedTask(task) {
    task._unsyncId = _generateUnsyncId();
    task._unsyncAction = UNSYNC_ACTION.CREATE;
    return taskStorageLocal.createTask(task)
  }
  function updateUnsynchronizedTask(task) {
    if (task._unsyncAction !== UNSYNC_ACTION.CREATE)
      task._unsyncAction = UNSYNC_ACTION.UPDATE;
    return taskStorageLocal.updateTask(task);
  }
  function deleteUnsynchronizedTask(task) {
    task._unsyncAction = UNSYNC_ACTION.DELETE;
    return taskStorageLocal.updateTask(task);
  }
  function listUnsynchronizedTasks(userId, filters) {
    var tasksObj = _getTasksObjFromLocalStorage(task._userId);
    return _.chain(taskObj)
      .filter(filters)
      .filter(function (val) {return val._unsyncAction;})
      .thru(function (o) { return _promiseFromValue(o); })
      .value();
  }

  return {
    create: createUnsynchronizedTask,
    read: readTask,
    update: updateTask,
    delete: deleteTask,
    list: listUnsynchronizedTasks,
  };
}

angular.module('todoListApp')
  .service('taskUnsyncStorageLocal', taskUnsyncStorageLocalService);
