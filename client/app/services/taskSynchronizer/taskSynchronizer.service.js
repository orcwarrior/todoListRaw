'use strict';

function taskSynchronizerService(taskService, api, $q) {
  var prevRequestFailed, synchronizingTasks, forcingSynchronize;
  var service = {
    synchronize: trySynchronize,
    isDesynchronized: function () { return prevRequestFailed; }
  };
  function trySynchronize(lookupInLSOnError) {
    return api.ping.get().$promise
      .then(function fulfilment() {
        _forceSynchronization();
      })
      .catch(function (err) {
        if (lookupInLSOnError) {
          console.warn("LS:Synch error: %s; serve atleast LS.", err);
          taskService.list();
        }
        return err;
      });
  }

  function init() {
    taskService.on('taskService:errorRequest', function (config, err) {
      console.log("taskSync: handle: taskService:errorRequest");
      prevRequestFailed = true;
      _checkTasksListRefresh(config);
    });
    taskService.on('taskService:successRequest', function (config) {
      console.log("taskSync: handle: taskService:successRequest -> runsync");
      runSynchronization(config)
        .then(_postSyncTaskListRefresh())
    });
    service.synchronize(true); // to commit unsync tasks and fetch tasks list at the init.
  }
  init();

  function _forceSynchronization() {
    console.log("taskSync: forceSync: init");
    forcingSynchronize = true;
    runSynchronization({refreshList: true})
      .then(_postSyncTaskListRefresh());
    forcingSynchronize = false;
  }

  function _checkTasksListRefresh(config) {
    if (config && config.refreshList) {
      taskService.list();
    }
  }
  function _postSyncTaskListRefresh() {
    return function (config) {
      console.log("taskSync: _postSyncTaskListRefresh");
      if (!synchronizingTasks) {
        console.log("taskSync: forceSync: taskListrefresh(%s)...", config && config.refreshList);
        _checkTasksListRefresh(config);
      }
    }
  }
  function _tryToSynchronizeUnsyncTasks() {
    return function (unsynchronizedTasksList) {
      console.log("taskSync: unsychronized tasks: %s", unsynchronizedTasksList && unsynchronizedTasksList.length);
      var syncPromises = _.map(unsynchronizedTasksList, _syncSingleTask);
      return $q.all(syncPromises).then(function (all) {
        console.log("taskSync: _tryToSynchronizeUnsyncTasks");
          return all;
      });
    }
  }
  function _syncSingleTask(unsyncTask) {
    var action = unsyncTask._unsyncAction;
    var actionPromise = taskService[action](unsyncTask);
    console.log("taskSync: re-doing action: %s (%s)", action, unsyncTask._id);
    return actionPromise;
  }
  function _allSyncsDone() {
    console.log("taskSync: [begin] _allSyncsDone");
    return taskService.clearUnsynchronized()
      .then(function () {
        console.log("taskSync: _allSyncsDone");
        synchronizingTasks = false;
        return true;
      })
  }

  function runSynchronization(config) {
    if ((!prevRequestFailed || synchronizingTasks) && !forcingSynchronize) {
      console.log("taskSync: !prevRequestFailed || synchronizingTasks: true (and no forcingSynchronize); breaking!");
      return $q.resolve(config); // break from sync
    }

    var promise = $q.defer();
    synchronizingTasks = true;
    promise = taskService.listUnsynchronized()
      .then(_tryToSynchronizeUnsyncTasks())
      .then(_allSyncsDone)
      .then(function (last) {
        console.log("taskSync: !!! resolving final promise !!!");
        console.log(last);
        return config; });
    return promise;
  }

  return service;
}
angular.module('todoListApp')
  .service('taskSynchronizer', taskSynchronizerService);
