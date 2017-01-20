'use strict';

function taskSynchronizerService(taskService) {
  var lastEventWasError;
  function init() {
    taskService.on('storageDB:error', function (err) {
      lastEventWasError = true;
    });
    taskService.on('storageDB:success', function (res) {
      lastEventWasError = false;
      var unsyncTasks = taskService.listUnsynchronized();
      _.each(unsyncTasks, _tryToSynchronize)
    })
    console.log("Task Synchronizer inited!");
  } init();

  function _tryToSynchronize(unsyncTask) {
    taskService[unsyncTask._unsyncAction](unsyncTask);
  }

  return {
    isDesynchronized: function () {
      return lastEventWasError;
    }
  }
}
angular.module('todoListApp')
  .service('taskSynchronizer', taskSynchronizerService);
