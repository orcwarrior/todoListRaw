'use strict';

function taskSynchronizerService(taskService, $q) {
  var lastRequestWasError;
  var synchronizingTasks;

  function init() {
    taskService.on('storageDB:error', function (err) {
      console.log("TaskSynchronizer: storageDB:error handler called!");
      lastRequestWasError = true;
    });
    taskService.on('storageDB:success', function (req) {
      console.log("TaskSynchronizer: storageDB:success handler called!");
      lastRequestWasError = false;
      _tryToSynchronize(req);
    })
  }  init();

  function _tryToSynchronize(req) {
    if (lastRequestWasError) return console.info('Synchronization aborted: last request was error.')
    if (synchronizingTasks) return console.info('Synchronization aborted: synchronization in process.')
    console.log(req);

    synchronizingTasks = true;
    taskService.listUnsynchronized()
      .then(function (unsynchronizedTasksList) {
        var synchronizationActions = [];
        _.each(unsynchronizedTasksList, function (unsyncTask) {
          var action = unsyncTask._unsyncAction;
          console.log("Synchronizing task: (%s/%s); action: %s", unsyncTask._id, unsyncTask._unsyncId, unsyncTask._unsyncAction)
          synchronizationActions.push(taskService[action](unsyncTask));
        })
        $q.all(synchronizationActions).then(function () {
          console.log("All synchronization tasks (%d) done!", synchronizationActions.length);
          taskService.clearUnsynchronized()
            .then(function () {
              console.log("Synchronize tasks unset!");
              synchronizingTasks = false; })
        });
      })
  }

  return {
    isDesynchronized: function () {
      return lastRequestWasError;
    }
  }
}
angular.module('todoListApp')
  .service('taskSynchronizer', taskSynchronizerService);
