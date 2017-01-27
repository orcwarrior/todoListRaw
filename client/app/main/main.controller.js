'use strict';

function mainController(taskService, taskSynchronizer) {
  var vm = this;
  vm.synchronizer = taskSynchronizer;
  vm.currentTimeBetween = currentTimeBetween;

  taskService.on('taskService:tasksReloaded', function (tasksList) {
    // indexes after angular sort arent mutated so sort will happen here:
    vm.userTasks = _.sortBy(tasksList, 'date');
  })
  function currentTimeBetween(task, nextTask) {
    if (!nextTask) return false;
    return moment().isBetween(task.date, nextTask.date, 'second');
  }
}

angular.module('todoListApp')
  .controller('MainController', mainController);
