'use strict';

function taskSynchronizerService(taskService, $q) {
  var lastRequestWasError = true; // So it will try to sync at begining.
  var synchronizingTasks;

  function init() {
    taskService.on('taskService:errorRequest', function (err) {
      console.log("TaskSynchronizer: taskService:errorRequest handler called!");
      lastRequestWasError = true;
    });
    taskService.on('taskService:successRequest', function (config) {
      console.log("TaskSynchronizer: taskService:successRequest handler called!");
      if (lastRequestWasError) tryToSynchronize(config);
      else _checkTasksListRefresh(config);
      lastRequestWasError = false;
    })
  }  init();

  function _checkTasksListRefresh(config) {
    console.log("TaskSynchronizer: Synchronization end!");
    synchronizingTasks = false;
    if (config && config.refreshList) {
      console.log("TaskSynchronizer: Synchronization required list re-load!");
      taskService.list();
    }
  }
  function tryToSynchronize(config) {
    console.log("TaskSynchronizer: trySync by: %s", config);
    // if (lastRequestWasError) return console.info('Synchronization aborted: last request was error.')
    if (synchronizingTasks) return console.info('Synchronization aborted: synchronization in process.')

    synchronizingTasks = true;
    taskService.listUnsynchronized()
      .then(function (unsynchronizedTasksList) {
        if (_.isEmpty(unsynchronizedTasksList)) {
          return console.log("TaskSynchronizer: No tasks to synchronize!");
        }
        var synchronizationActions = [];
        _.each(unsynchronizedTasksList, function (unsyncTask) {
          var action = unsyncTask._unsyncAction;
          console.log("TaskSynchronizer: Synchronizing task: (%s); action: %s", unsyncTask._id ||unsyncTask._unsyncId, unsyncTask._unsyncAction)
          synchronizationActions.push(taskService[action](unsyncTask));
        })
        $q.all(synchronizationActions).then(function () {
          console.log("TaskSynchronizer: All synchronization tasks (%d) done!", synchronizationActions.length);
          taskService.clearUnsynchronized()
            .then(function () {
              _checkTasksListRefresh(config);
            })
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
