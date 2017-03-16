'use strict';

function mainController(taskService) {
  var vm = this;
  // vm.synchronizer = taskSynchronizer;
  vm.currentTimeBetween = currentTimeBetween;
  vm.setTab = setTab;
  vm._tasksLoading = true;

  getTasksList();
  taskService.on('taskService:tasksChanged', function () {
    getTasksList();
  });
  function getTasksList() {
    taskService.list().then(function (tasksList) {
      vm.userTasks = _.sortBy(tasksList, 'date');
      vm.filteredTasks = _filterTasks(vm.userTasks);
      vm._tasksLoading = false;
    });
  }
  function currentTimeBetween(task, nextTask) {
    if (!nextTask) return false;
    return moment().isBetween(task.date, nextTask.date, 'second');
  }

  function setTab(tab) {
    if (tab === 'todo')
      vm.tasksFilter = false;
    else if (tab === 'done')
      vm.tasksFilter = true;
    else
      delete vm.tasksFilter;
    vm.filteredTasks = _filterTasks(vm.userTasks);
  }

  function _filterTasks(tasks) {
    if (_.isUndefined(vm.tasksFilter)) return tasks;
    else
      return _.filter(tasks, ['completed', vm.tasksFilter]);
  }

}

angular.module('todoListApp')
  .controller('MainController', mainController);
