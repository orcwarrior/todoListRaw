'use strict';

function taskSynchronizerService(taskService, api, $q) {
  var previousRequestFailed;
  var synchronizingTasks;

  function init() {
    taskService.on('taskService:errorRequest', function (config) {
      console.log("TaskSynchronizer: taskService:errorRequest handler called!");
      previousRequestFailed = true;
      _checkTasksListRefresh(config);
    });
    taskService.on('taskService:successRequest', function (config) {
      console.log("TaskSynchronizer: taskService:successRequest handler called!");

      runSynchronization(config)
        .then(function () {
          if (!synchronizingTasks) {
            _checkTasksListRefresh(config);
          }
        });
      previousRequestFailed = false;
    })
    _forceSynchronization();
  }

  init();
  function _forceSynchronization() {
    previousRequestFailed = true;
    runSynchronization({refreshList: true})
     .then(function () {
       if (!synchronizingTasks) {
         _checkTasksListRefresh({refreshList: true});
       }
     });
    previousRequestFailed = false;
  }
  function _checkTasksListRefresh(config) {
    console.log("TaskSynchronizer: _checkTasksListRefresh!");
    if (config && config.refreshList) {
      console.log("TaskSynchronizer: Synchronization required list re-load!");
      taskService.list();
    }
  }

  function runSynchronization(config) {
    var deffered = $q.defer();
    if (!previousRequestFailed) {
      console.info('Synchronization aborted: last request was fine, so there\'s nothing to synchronize. .')
      return $q.resolve();
    }
    if (synchronizingTasks) {
      console.info('Synchronization aborted: synchronization in process.');
      return $q.resolve();
    }

    synchronizingTasks = true;
    taskService.listUnsynchronized()
      .then(function (unsynchronizedTasksList) {
        // if (_.isEmpty(unsynchronizedTasksList)) {
        //   synchronizingTasks = false;
        //   return console.log("TaskSynchronizer: No tasks to synchronize!");
        // }
        var synchronizationActions = [];
        _.each(unsynchronizedTasksList, function (unsyncTask) {
          var action = unsyncTask._unsyncAction;
          console.log("TaskSynchronizer: Synchronizing task: (%s); action: %s", unsyncTask._id || unsyncTask._unsyncId, unsyncTask._unsyncAction)
          synchronizationActions.push(taskService[action](unsyncTask));
        })
        $q.all(synchronizationActions).then(function () {
          console.log("TaskSynchronizer: All synchronization tasks (%d) done!", synchronizationActions.length);
          taskService.clearUnsynchronized()
            .then(function () {
              synchronizingTasks = false;
              deffered.resolve();
            })
        });
      })
    return deffered.promise;
  }

  return {
    synchronize: function () {
      return api.ping.get().$promise
        .then(function fulfilment() {
          _forceSynchronization();
        });
    },
    isDesynchronized: function () {
      return previousRequestFailed;
    }
  }
}
angular.module('todoListApp')
  .service('taskSynchronizer', taskSynchronizerService);
