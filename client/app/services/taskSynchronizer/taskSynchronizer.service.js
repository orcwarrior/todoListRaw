'use strict';

function taskSynchronizerService(taskService, api, $q) {
  var prevRequestFailed, synchronizingTasks;

  function init() {
    taskService.on('taskService:errorRequest', function (config) {
      prevRequestFailed = true;
      _checkTasksListRefresh(config);
    });
    taskService.on('taskService:successRequest', function (config) {
      runSynchronization(config)
        .then(function () {
          if (!synchronizingTasks) {
            _checkTasksListRefresh(config);
          }
        });
      prevRequestFailed = false;
    })
    _forceSynchronization();
  } init();

  function _forceSynchronization() {
    prevRequestFailed = true;
    runSynchronization({refreshList: true})
      .then(function () {
        if (!synchronizingTasks) {
          _checkTasksListRefresh({refreshList: true});
        }
      });
    prevRequestFailed = false;
  }

  function _checkTasksListRefresh(config) {
    if (config && config.refreshList) {
      taskService.list();
    }
  }

  function runSynchronization(config) {
    if (!prevRequestFailed || synchronizingTasks)
      return $q.resolve(); // break from sync

    var deffered = $q.defer();
    synchronizingTasks = true;
    taskService.listUnsynchronized()
      .then(function (unsynchronizedTasksList) {
        var synchronizationActions = [];
        _.each(unsynchronizedTasksList, function (unsyncTask) {
          var action = unsyncTask._unsyncAction;
          synchronizationActions.push(taskService[action](unsyncTask));
        })
        $q.all(synchronizationActions).then(function () {
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
    isDesynchronized: function () { return prevRequestFailed; }
  }
}
angular.module('todoListApp')
  .service('taskSynchronizer', taskSynchronizerService);
