'use strict';

function taskService(taskStorageDB, userService, resourcePromise) {
  var userTasks;

  function preprocessTask(task) {
    task.deadlineTimeLocalized = moment(task.date).format('H:mm');
    return task;
  }

  function emitTaskChangeEvent(task) {
    evtEmitter.emit('taskService:tasksChanged', task);
    return task;
  }
  function emitTasksReloadedEvent(tasks) {
    evtEmitter.emit('taskService:tasksReloaded', tasks);
    return tasks;
  }

  var evtEmitter = new EventEmitter();
  var service = _.extend(evtEmitter, {
    create: function (task) {
      task = preprocessTask(task);
      return userService.getUser().then(function (user) {
        task._userId = user._id;
        return taskStorageDB.create(task);
      }).then(emitTaskChangeEvent);
    },
    read: function (taskId) {
      return taskStorageDB.read(taskId);
    },
    update: function (task) {
      return taskStorageDB.update(task).then(emitTaskChangeEvent);
    },
    delete: function (task) {
      return taskStorageDB.delete(task).then(emitTaskChangeEvent);
    },
    list: function (filters) {
      return userService.getUser().then(function (user) {
        return taskStorageDB.list(user._id, filters)
          .then(emitTasksReloadedEvent);
      });
    }
  });
  return service;
}
angular.module('todoListApp')
  .service('taskService', taskService);
