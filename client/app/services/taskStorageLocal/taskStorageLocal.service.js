'use strict';

function taskStorageLocalService($localForage, resourcePromise) {
  function _getUserTasksKey() { return 'user.tasks'; }

  function _getTasksObj() {
    return $localForage.getItem(_getUserTasksKey())
        .catch(function (err) {
        console.log("Local forge err: "+err);
        return {};
      });
  }

  function _setTaskInTaskObjAtLocalStorage(task, tasksObj) {
    var pre = _.keys(tasksObj).length;
    tasksObj[task._id || task._unsyncId] = task;
    return $localForage.setItem(_getUserTasksKey(), tasksObj);
  }

  function createTask(task) {
    var tasksObj = _getTasksObj();
    return _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    // return resourcePromise(task);
  }

  function readTask(taskId) {
    return _getTasksObj().then(function (tasksObj) {
        if (tasksObj && tasksObj[taskId])
          return resourcePromise(tasksObj[taskId]);
      })
  }

  function updateTask(task) {
    var tasksObj = _getTasksObj();
    return _setTaskInTaskObjAtLocalStorage(task, tasksObj);
    // return resourcePromise(task);
  }

  function deleteTask(task) {
    var tasksObj = _getTasksObj();
    delete tasksObj[task._id];
    return $localForage.setItem(_getUserTasksKey(), tasksObj);
    // return task;
  }

  function listTasks(filters) {
    return _getTasksObj().then(function (tasksObj) {
      var tasksFiltered = _.pickBy(tasksObj, _.identity(filters));
      return resourcePromise(tasksFiltered);
    });
  }

  function synchronizeList(outterSrcList) {
    if (_.isArray(outterSrcList)) // map task._id as keys:
      outterSrcList = _.keyBy(outterSrcList, '_id');
    console.log('synchronizeList->prepromise');
    return $localForage.setItem(_getUserTasksKey(), outterSrcList);
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
