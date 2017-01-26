'use strict';

function mainController(taskService, taskStorageLocal) {
  var vm = this;

  taskService.list();
  taskService.on('taskService:tasksReloaded', function (tasksList) {
    vm.userTasks = tasksList;
  })
}

angular.module('todoListApp')
  .controller('MainController', mainController);
