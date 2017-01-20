'use strict';

function mainController(api, userService, taskStorageDB) {
  var vm = this;

  vm.otherUser = userService.getUser();
  console.log(vm.otherUser);
  setTimeout(function () {
    console.log(vm.otherUser);
  }, 600);

  userService.getUser()
    .then(function (createdUser) {
      vm.user = createdUser;
      return taskStorageDB.create({
        name: 'test-task-1',
        _userId: vm.user._id
      });
    })
    .then(function () {
      return taskStorageDB.create({
        name: 'test-task-2',
        _userId: vm.user._id
      });
    })
    .then(function () {
      return taskStorageDB.create({
        name: 'test-task-3',
        _userId: vm.user._id
      });
    })
    .then(function (savedTask) {
      return taskStorageDB.update({
        id: savedTask._id,
        name: 'test-task-3-modified',
        completed: true,
        _userId: vm.user._id
      });
    })
    .then(function () {
      return taskStorageDB.list(vm.user._id);
    })
    .then(function (tasks) {
      vm.userTasks = tasks;
    });
}

angular.module('todoListApp')
  .controller('MainController', mainController);
