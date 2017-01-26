'use strict';

function mainController(taskService, taskSynchronizer) {
  var vm = this;
  vm.synchronizer = taskSynchronizer;
  taskService.list();
  taskService.on('taskService:tasksReloaded', function (tasksList) {
    vm.userTasks = tasksList;
  })
}

angular.module('todoListApp')
  .controller('MainController', mainController);
