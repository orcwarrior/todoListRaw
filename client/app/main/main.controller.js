'use strict';

function mainController(taskService, taskStorageLocal) {
  var vm = this;
  vm.userTasks = taskService.list();

  taskService.on('storageDB:refreshList', function () {
    taskService.list()
      .then(function (dbAndLocalTasksList) {
        vm.userTasks = dbAndLocalTasksList;
        taskStorageLocal.synchronizeList(dbAndLocalTasksList); // synchronize with both DB and LS tasks.
      })
  });
}

angular.module('todoListApp')
  .controller('MainController', mainController);
