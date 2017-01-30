'use strict';

function taskService(taskStorageDB, userService) {
  var evtEmitter = new EventEmitter();
  var service = _.extend(evtEmitter, {
    create: function (task) {
      return userService.getUser().then(function (user) {
        task._userId = user._id;
        return taskStorageDB.create(task);
      }).then(function (createdTask) {
          evtEmitter.emit('taskService:tasksChanged');
          return createdTask;
        });
    },
    read: function (taskId) {
      return taskStorageDB.read(taskId);
    },
    update: function (task) {
      return taskStorageDB.update(task).then(function (updatedTask) {
        evtEmitter.emit('taskService:tasksChanged');
        return updatedTask;
      });
    },
    delete: function (task) {
      return taskStorageDB.delete(task).then(function (deletedTask) {
        evtEmitter.emit('taskService:tasksChanged');
        return null;
      });
    },
    list: function (filters) {
      return userService.getUser().then(function (user) {
        return taskStorageDB.list(user._id, filters);
      });
    }
  });
  return service;
}
angular.module('todoListApp')
  .service('taskService', taskService);
