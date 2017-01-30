'use strict';

function mainController(taskService) {
  var vm = this;

  getTasksList();
  taskService.on('taskService:tasksChanged', function () {
    getTasksList();
  });

  function getTasksList() {
    taskService.list().then(function (tasksList) {
      vm.userTasks = _.sortBy(tasksList, 'date');
    });
  }
}

angular.module('todoListApp')
  .controller('MainController', mainController);
